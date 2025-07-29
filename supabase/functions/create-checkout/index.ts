// supabase/functions/create-checkout-session/index.ts

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Bu bilgiler Supabase Proje Ayarlarından gelecek
const SHOPIFY_STORE_DOMAIN = Deno.env.get("SHOPIFY_STORE_DOMAIN")!; // Örn: 'hkrmqm-1h.myshopify.com'
const SHOPIFY_STOREFRONT_API_TOKEN = Deno.env.get(
  "SHOPIFY_STOREFRONT_API_TOKEN",
)!;
const SHOPIFY_API_URL =
  `https://${SHOPIFY_STORE_DOMAIN}/api/2023-10/graphql.json`;

serve(async (req) => {
  // CORS ayarları
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const { variantId, requestId } = await req.json();

    if (!variantId || !requestId) {
      throw new Error("Product Variant ID and Request ID are required.");
    }

    const query = `
      mutation checkoutCreate($input: CheckoutCreateInput!) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
          }
          checkoutUserErrors {
            code
            field
            message
          }
        }
      }`;

    const variables = {
      input: {
        lineItems: [{ variantId: variantId, quantity: 1 }],
        customAttributes: [
          // Bu en önemli kısım. Kendi veritabanı ID'mizi Shopify'a gönderiyoruz.
          { key: "company_request_id", value: requestId },
        ],
      },
    };

    const response = await fetch(SHOPIFY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_API_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const result = await response.json();

    if (result.data.checkoutCreate.checkoutUserErrors.length > 0) {
      throw new Error(result.data.checkoutCreate.checkoutUserErrors[0].message);
    }

    const checkoutUrl = result.data.checkoutCreate.checkout.webUrl;

    return new Response(JSON.stringify({ checkoutUrl }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      status: 200,
    });
  } catch (error) {
    console.error("Checkout creation error:", error);
    const errorMessage = error instanceof Error
      ? error.message
      : "Unknown error occurred";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
