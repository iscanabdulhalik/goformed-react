// supabase/functions/create-checkout-session/index.ts - Cart API ile
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    console.log("=== CART CREATE REQUEST START ===");

    const { variantId, productId, requestId } = await req.json();
    console.log("Request data:", { variantId, productId, requestId });

    if (!variantId || !requestId) {
      throw new Error("Variant ID and Request ID are required");
    }

    // Environment variables
    const SHOPIFY_STORE_DOMAIN = Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_STOREFRONT_API_TOKEN = Deno.env.get(
      "SHOPIFY_STOREFRONT_API_TOKEN"
    );

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_API_TOKEN) {
      throw new Error("Missing Shopify environment variables");
    }

    const SHOPIFY_API_URL = `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header is required");
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error("Auth error:", authError);
      throw new Error("Invalid authentication");
    }

    console.log("User authenticated:", user.email);

    // Verify request
    const { data: request, error: requestError } = await supabaseAdmin
      .from("company_requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single();

    if (requestError || !request) {
      console.error("Request error:", requestError);
      throw new Error("Request not found or unauthorized");
    }

    console.log("Request verified:", request.company_name);

    // Yeni Cart API kullan
    const cartQuery = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
          }
          userErrors {
            field
            message
          }
        }
      }`;

    const cartVariables = {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: 1,
          },
        ],
        attributes: [
          { key: "company_request_id", value: requestId },
          { key: "user_email", value: user.email },
          { key: "company_name", value: request.company_name },
          { key: "package_name", value: request.package_name },
        ],
        buyerIdentity: {
          email: user.email,
        },
      },
    };

    console.log(
      "Creating cart with variables:",
      JSON.stringify(cartVariables, null, 2)
    );

    const cartResponse = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({ query: cartQuery, variables: cartVariables }),
    });

    if (!cartResponse.ok) {
      const errorText = await cartResponse.text();
      console.error("Shopify Cart API error:", cartResponse.status, errorText);
      throw new Error(`Shopify Cart API error: ${cartResponse.status}`);
    }

    const cartResult = await cartResponse.json();
    console.log("Cart API result:", JSON.stringify(cartResult, null, 2));

    if (cartResult.errors) {
      console.error("GraphQL errors:", cartResult.errors);
      throw new Error(`GraphQL errors: ${JSON.stringify(cartResult.errors)}`);
    }

    if (cartResult.data?.cartCreate?.userErrors?.length > 0) {
      console.error(
        "Cart creation errors:",
        cartResult.data.cartCreate.userErrors
      );
      throw new Error(
        `Cart error: ${cartResult.data.cartCreate.userErrors[0].message}`
      );
    }

    const checkoutUrl = cartResult.data?.cartCreate?.cart?.checkoutUrl;

    if (!checkoutUrl) {
      console.error(
        "No checkout URL in cart response:",
        cartResult.data?.cartCreate
      );
      throw new Error("Checkout URL not received from Shopify Cart API");
    }

    console.log("Cart created successfully:", checkoutUrl);
    console.log("=== CART CREATE REQUEST END ===");

    return new Response(JSON.stringify({ checkoutUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("=== CART CREATE ERROR ===");
    console.error("Error:", error.message);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
