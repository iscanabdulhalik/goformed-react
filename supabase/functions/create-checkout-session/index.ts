// supabase/functions/create-checkout-session/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?dts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface CartLine {
  merchandiseId: string;
  quantity: number;
}

interface CartAttribute {
  key: string;
  value: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    console.log("=== SHOPIFY CHECKOUT SESSION START ===");

    const { variantId, productId, requestId } = await req.json();
    console.log("Request payload:", { variantId, productId, requestId });

    // Validate input
    if (!variantId || !requestId) {
      throw new Error("variantId ve requestId gerekli");
    }

    // Environment variables check
    const SHOPIFY_STORE_DOMAIN =
      Deno.env.get("VITE_SHOPIFY_STORE_URL") ||
      Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_ACCESS_TOKEN =
      Deno.env.get("VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN") ||
      Deno.env.get("SHOPIFY_STOREFRONT_ACCESS_TOKEN");

    console.log("Environment check:", {
      domain: SHOPIFY_STORE_DOMAIN ? "✓" : "✗",
      token: SHOPIFY_ACCESS_TOKEN ? "✓" : "✗",
    });

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
      console.error("Missing environment variables:", {
        SHOPIFY_STORE_DOMAIN: !!SHOPIFY_STORE_DOMAIN,
        SHOPIFY_ACCESS_TOKEN: !!SHOPIFY_ACCESS_TOKEN,
      });
      throw new Error("Shopify yapılandırması eksik");
    }

    // Initialize Supabase Admin Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase yapılandırması eksik");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization header gerekli");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: authError } =
      await supabaseAdmin.auth.getUser(token);

    if (authError || !userData.user) {
      console.error("Auth error:", authError);
      throw new Error("Geçersiz authentication");
    }

    const user = userData.user;
    console.log("User authenticated:", user.email);

    // Verify request ownership
    const { data: request, error: requestError } = await supabaseAdmin
      .from("company_requests")
      .select("*")
      .eq("id", requestId)
      .eq("user_id", user.id)
      .single();

    if (requestError || !request) {
      console.error("Request verification failed:", requestError);
      throw new Error("Request bulunamadı veya yetki yok");
    }

    console.log("Request verified:", {
      id: request.id,
      company_name: request.company_name,
      status: request.status,
    });

    // Shopify GraphQL endpoint
    const shopifyEndpoint = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-01/graphql.json`;

    // Create cart mutation
    const cartMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            totalQuantity
            estimatedCost {
              totalAmount {
                amount
                currencyCode
              }
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `;

    const cartInput = {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity: 1,
          },
        ] as CartLine[],
        attributes: [
          { key: "company_request_id", value: requestId.toString() },
          { key: "user_email", value: user.email || "" },
          { key: "company_name", value: request.company_name || "" },
          { key: "package_name", value: request.package_name || "" },
        ] as CartAttribute[],
        buyerIdentity: {
          email: user.email,
        },
      },
    };

    console.log(
      "Creating cart with input:",
      JSON.stringify(cartInput, null, 2)
    );

    // Make GraphQL request to Shopify
    const shopifyResponse = await fetch(shopifyEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_ACCESS_TOKEN,
      },
      body: JSON.stringify({
        query: cartMutation,
        variables: cartInput,
      }),
    });

    if (!shopifyResponse.ok) {
      const errorText = await shopifyResponse.text();
      console.error("Shopify API error:", {
        status: shopifyResponse.status,
        statusText: shopifyResponse.statusText,
        body: errorText,
      });
      throw new Error(
        `Shopify API hatası: ${shopifyResponse.status} - ${shopifyResponse.statusText}`
      );
    }

    const shopifyResult = await shopifyResponse.json();
    console.log("Shopify response:", JSON.stringify(shopifyResult, null, 2));

    // Check for GraphQL errors
    if (shopifyResult.errors && shopifyResult.errors.length > 0) {
      console.error("GraphQL errors:", shopifyResult.errors);
      throw new Error(`GraphQL hatası: ${shopifyResult.errors[0].message}`);
    }

    // Check for user errors
    const userErrors = shopifyResult.data?.cartCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      console.error("Cart creation errors:", userErrors);
      throw new Error(`Cart oluşturma hatası: ${userErrors[0].message}`);
    }

    // Extract checkout URL
    const cart = shopifyResult.data?.cartCreate?.cart;
    if (!cart || !cart.checkoutUrl) {
      console.error("Invalid cart response:", shopifyResult.data?.cartCreate);
      throw new Error("Checkout URL alınamadı");
    }

    console.log("Cart created successfully:", {
      cartId: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
    });

    // Update request status to indicate payment is being processed
    const { error: updateError } = await supabaseAdmin
      .from("company_requests")
      .update({
        status: "pending_payment",
        updated_at: new Date().toISOString(),
      })
      .eq("id", requestId);

    if (updateError) {
      console.error("Failed to update request status:", updateError);
      // Don't throw here, as the checkout URL is still valid
    }

    console.log("=== SHOPIFY CHECKOUT SESSION SUCCESS ===");

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: cart.checkoutUrl,
        cartId: cart.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("=== SHOPIFY CHECKOUT SESSION ERROR ===");
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });

      return new Response(
        JSON.stringify({
          success: false,
          error: error.message,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } else {
      console.error("Unknown error:", error);

      return new Response(
        JSON.stringify({
          success: false,
          error: "An unknown error occurred",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }
});
