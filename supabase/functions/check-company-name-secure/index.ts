// supabase/functions/check-company-name-secure/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Rate limiting store (in-memory, consider Redis for production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = {
  MAX_REQUESTS: 10, // Max 10 requests
  WINDOW_MS: 60 * 1000, // Per minute
};

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);

  if (!clientData || now > clientData.resetTime) {
    // Reset or first request
    rateLimitStore.set(clientIP, {
      count: 1,
      resetTime: now + RATE_LIMIT.WINDOW_MS,
    });
    return true;
  }

  if (clientData.count >= RATE_LIMIT.MAX_REQUESTS) {
    return false; // Rate limit exceeded
  }

  // Increment count
  clientData.count++;
  return true;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ✅ Rate limiting
    const clientIP =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({
          error: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Input validation
    const body = await req.json();
    const { companyName } = body;

    if (!companyName || typeof companyName !== "string") {
      throw new Error("Valid company name is required");
    }

    // ✅ Sanitize input
    const sanitizedName = companyName.trim().toUpperCase();
    if (sanitizedName.length < 3 || sanitizedName.length > 160) {
      throw new Error("Company name must be between 3 and 160 characters");
    }

    // ✅ Check if ends with LTD/LIMITED
    if (!sanitizedName.endsWith("LTD") && !sanitizedName.endsWith("LIMITED")) {
      throw new Error("Company name must end with LTD or LIMITED");
    }

    // ✅ GÜVENLİ: API key server environment'da
    const apiKey = Deno.env.get("COMPANIES_HOUSE_API_KEY");
    if (!apiKey) {
      console.error("Companies House API key not configured");
      throw new Error("Service temporarily unavailable");
    }

    console.log("Checking company name:", sanitizedName);

    // ✅ Companies House API call with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const response = await fetch(
      `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(
        sanitizedName
      )}&items_per_page=20`, // Limit results
      {
        headers: {
          Authorization: `Basic ${btoa(apiKey + ":")}`,
          "User-Agent": "GoFormed-App/1.0", // Identify your app
        },
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(
        "Companies House API error:",
        response.status,
        response.statusText
      );

      // Don't expose internal errors to client
      if (response.status === 401) {
        throw new Error("Service authentication error");
      } else if (response.status >= 500) {
        throw new Error("Companies House service temporarily unavailable");
      } else {
        throw new Error("Unable to verify company name");
      }
    }

    const data = await response.json();

    // ✅ Validate response structure
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response from Companies House");
    }

    // ✅ Sanitize response (only return necessary data)
    const sanitizedResponse = {
      items: (data.items || [])
        .map(
          (item: {
            title?: string;
            company_number?: string;
            company_status?: string;
            date_of_creation?: string | null;
          }) => ({
            title: item.title || "",
            company_number: item.company_number || "",
            company_status: item.company_status || "",
            date_of_creation: item.date_of_creation || null,
          })
        )
        .slice(0, 10), // Limit to 10 results
      total_results: Math.min(data.total_results || 0, 10),
    };

    console.log("Successfully checked company name");

    return new Response(JSON.stringify(sanitizedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Company name check error:", error);

    // ✅ Don't expose sensitive error details
    let publicError = "Unable to verify company name";
    if (error instanceof Error) {
      publicError =
        error.name === "AbortError"
          ? "Request timeout. Please try again."
          : error.message || "Unable to verify company name";
    }

    return new Response(
      JSON.stringify({
        error: publicError,
        items: [],
        status:
          error instanceof Error && error.message.includes("Rate limit")
            ? 429
            : 500,
      }),
      {
        status:
          error instanceof Error && error.message.includes("Rate limit")
            ? 429
            : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
