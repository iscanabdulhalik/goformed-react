import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { companyName, apiKey } = await req.json();

    if (!companyName || !apiKey) {
      throw new Error("Company name and API key are required");
    }

    console.log("Checking company name:", companyName);

    const response = await fetch(
      `https://api.company-information.service.gov.uk/search/companies?q=${encodeURIComponent(
        companyName
      )}&items_per_page=100`,
      {
        headers: {
          Authorization: `Basic ${btoa(apiKey + ":")}`,
        },
      }
    );

    if (!response.ok) {
      console.error(
        "Companies House API error:",
        response.status,
        response.statusText
      );
      throw new Error(`Companies House API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Companies House response:", data);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
