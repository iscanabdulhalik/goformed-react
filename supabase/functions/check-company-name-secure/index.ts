import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🚀 Function started");
    console.log("📥 Request method:", req.method);
    console.log(
      "📥 Request headers:",
      Object.fromEntries(req.headers.entries())
    );

    // ✅ FIXED: Better JSON parsing with error handling
    let body;
    let companyName;

    try {
      const requestText = await req.text();
      console.log("📝 Raw request body:", requestText);

      if (!requestText || requestText.trim() === "") {
        throw new Error("Empty request body");
      }

      body = JSON.parse(requestText);
      console.log("📝 Parsed request body:", body);

      companyName = body.companyName;
    } catch (parseError) {
      console.error("❌ JSON parsing error:", parseError);
      return new Response(
        JSON.stringify({
          error:
            "Invalid request format. Expected JSON with companyName field.",
          debug: {
            parseError:
              parseError instanceof Error
                ? parseError.message
                : "Unknown error",
            requestMethod: req.method,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Input validation
    if (!companyName || typeof companyName !== "string") {
      return new Response(
        JSON.stringify({
          error: "Valid company name is required",
          debug: {
            receivedCompanyName: companyName,
            typeOfCompanyName: typeof companyName,
          },
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ DEBUG: Check environment variables
    const apiKey = Deno.env.get("COMPANIES_HOUSE_API_KEY");
    console.log("🔑 API Key exists:", !!apiKey);
    console.log("🔑 API Key length:", apiKey?.length || 0);

    if (!apiKey) {
      console.error("❌ COMPANIES_HOUSE_API_KEY not found in environment");
      return new Response(
        JSON.stringify({
          error: "Service configuration error - API key not found",
          debug: {
            hasApiKey: false,
            availableEnvVars: Object.keys(Deno.env.toObject()).filter(
              (key) => key.includes("COMPANIES") || key.includes("API")
            ),
          },
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Sanitize input
    const sanitizedName = companyName.trim().toUpperCase();
    if (sanitizedName.length < 3 || sanitizedName.length > 160) {
      return new Response(
        JSON.stringify({
          error: "Company name must be between 3 and 160 characters",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ✅ Check if ends with LTD/LIMITED
    if (!sanitizedName.endsWith("LTD") && !sanitizedName.endsWith("LIMITED")) {
      return new Response(
        JSON.stringify({
          error: "Company name must end with LTD or LIMITED",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Input validation passed for:", sanitizedName);

    // ✅ Companies House API call
    console.log("🌐 Making API call to Companies House...");

    const apiUrl = `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(
      sanitizedName
    )}&items_per_page=20`;
    console.log("📡 API URL:", apiUrl);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Basic ${btoa(apiKey + ":")}`,
        "User-Agent": "GoFormed-App/1.0",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("📥 API Response status:", response.status);

    if (!response.ok) {
      console.error(
        "❌ Companies House API error:",
        response.status,
        response.statusText
      );

      if (response.status === 401) {
        return new Response(
          JSON.stringify({
            error:
              "Invalid API key - please check Companies House API configuration",
            debug: {
              status: response.status,
              statusText: response.statusText,
            },
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else if (response.status >= 500) {
        return new Response(
          JSON.stringify({
            error: "Companies House service temporarily unavailable",
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      } else {
        return new Response(
          JSON.stringify({
            error: `Companies House API error: ${response.status}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    const data = await response.json();
    console.log(
      "✅ API call successful, items found:",
      data.items?.length || 0
    );

    // ✅ Validate and sanitize response
    if (!data || typeof data !== "object") {
      return new Response(
        JSON.stringify({
          error: "Invalid response from Companies House",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const sanitizedResponse = {
      items: (data.items || [])
        .map((item: any) => ({
          title: item.title || "",
          company_number: item.company_number || "",
          company_status: item.company_status || "",
          date_of_creation: item.date_of_creation || null,
        }))
        .slice(0, 10),
      total_results: Math.min(data.total_results || 0, 10),
    };

    console.log("✅ Function completed successfully");

    return new Response(JSON.stringify(sanitizedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("💥 Function error:", error);
    if (error instanceof Error) {
      console.error("💥 Error name:", error.name);
      console.error("💥 Error message:", error.message);
    } else {
      console.error("💥 Unknown error:", error);
    }

    let publicError = "Unable to verify company name";
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        publicError = "Request timeout. Please try again.";
      } else {
        publicError = error.message || "Unable to verify company name";
      }
    }

    return new Response(
      JSON.stringify({
        error: publicError,
        items: [],
        debug: {
          errorName: error instanceof Error ? error.name : "Unknown",
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
