// supabase/functions/shopify-webhook-handler/index.ts - UPDATED & ENHANCED
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-shopify-hmac-sha256, x-shopify-shop-domain, x-shopify-topic",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

serve(async (req) => {
  console.log("🚀 Webhook handler started:", new Date().toISOString());
  console.log("📥 Request method:", req.method);
  console.log("📥 Request URL:", req.url);

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight handled");
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    // Log all headers for debugging
    const headers = Object.fromEntries(req.headers.entries());
    console.log("📋 Request headers:", headers);

    // Get request body
    const body = await req.text();
    console.log("📦 Request body length:", body.length);
    console.log("📦 Request body preview:", body.substring(0, 200) + "...");

    // Get HMAC header
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256");
    const shopDomain = req.headers.get("X-Shopify-Shop-Domain");
    const topic = req.headers.get("X-Shopify-Topic");

    console.log("🔐 HMAC Header:", hmacHeader ? "Present" : "Missing");
    console.log("🏪 Shop Domain:", shopDomain);
    console.log("📝 Topic:", topic);

    if (!hmacHeader) {
      console.error("❌ Missing HMAC signature");
      return new Response("Missing HMAC signature", {
        status: 401,
        headers: corsHeaders,
      });
    }

    // Get webhook secret
    const webhookSecret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
    console.log("🔑 Webhook secret:", webhookSecret ? "Present" : "Missing");

    if (!webhookSecret) {
      console.error("❌ Missing webhook secret in environment");
      return new Response("Webhook secret not configured", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // HMAC verification with enhanced logging
    console.log("🔍 Starting HMAC verification...");

    try {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );

      const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(body)
      );

      const computedHmac = btoa(
        String.fromCharCode(...new Uint8Array(signature))
      );

      console.log("🔐 Computed HMAC:", computedHmac.substring(0, 20) + "...");
      console.log("🔐 Received HMAC:", hmacHeader.substring(0, 20) + "...");

      if (computedHmac !== hmacHeader) {
        console.error("❌ HMAC verification failed");
        console.log("Expected:", computedHmac);
        console.log("Received:", hmacHeader);
        return new Response("Invalid HMAC signature", {
          status: 401,
          headers: corsHeaders,
        });
      }

      console.log("✅ HMAC verification passed");
    } catch (hmacError) {
      console.error("💥 HMAC verification error:", hmacError);
      return new Response("HMAC verification error", {
        status: 500,
        headers: corsHeaders,
      });
    }

    // Parse payload
    let payload;
    try {
      payload = JSON.parse(body);
      console.log("📦 Parsed payload keys:", Object.keys(payload));
      console.log("🆔 Order ID:", payload.id);
      console.log("📛 Order Name:", payload.name);
      console.log("💰 Financial Status:", payload.financial_status);
      console.log("💵 Total Price:", payload.total_price);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError);
      return new Response("Invalid JSON payload", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // Enhanced request ID extraction
    console.log("🔍 Searching for request ID in order attributes...");

    const noteAttributes = payload.note_attributes || [];
    const customAttributes = payload.custom_attributes || [];
    const lineItemProperties =
      payload.line_items?.flatMap(
        (item: { properties: any }) => item.properties || []
      ) || [];

    console.log("📝 Note attributes:", noteAttributes);
    console.log("🎯 Custom attributes:", customAttributes);
    console.log("🛍️ Line item properties:", lineItemProperties);

    // Search for request ID in all possible locations
    const allAttributes = [
      ...noteAttributes,
      ...customAttributes,
      ...lineItemProperties,
    ];

    console.log("🔍 All attributes to search:", allAttributes);

    let requestId = null;
    const requestIdKeys = ["company_request_id", "request_id", "requestId"];

    for (const attr of allAttributes) {
      const attrName = attr.name || attr.key;
      const attrValue = attr.value;

      console.log(`🔎 Checking attribute: ${attrName} = ${attrValue}`);

      if (requestIdKeys.includes(attrName) && attrValue) {
        requestId = attrValue;
        console.log("✅ Found request ID:", requestId);
        break;
      }
    }

    // Also check in cart attributes if available
    if (!requestId && payload.cart_token && payload.cart_attributes) {
      console.log("🛒 Checking cart attributes:", payload.cart_attributes);
      for (const [key, value] of Object.entries(
        payload.cart_attributes || {}
      )) {
        if (requestIdKeys.includes(key) && value) {
          requestId = value;
          console.log("✅ Found request ID in cart attributes:", requestId);
          break;
        }
      }
    }

    if (!requestId) {
      console.warn("⚠️ No request ID found in webhook payload");
      console.log("Available attributes:", {
        noteAttributes,
        customAttributes,
        lineItemProperties,
      });

      // Still return success to prevent Shopify retries
      return new Response("No request ID found - webhook processed", {
        status: 200,
        headers: corsHeaders,
      });
    }

    console.log("🎯 Processing request ID:", requestId);

    // Enhanced payment validation
    const isPaid = payload.financial_status === "paid";
    const hasAmount = parseFloat(payload.total_price || 0) > 0;
    const isValidCurrency = ["GBP", "USD", "EUR"].includes(
      payload.currency || "GBP"
    );

    console.log("💳 Payment validation:", {
      financial_status: payload.financial_status,
      isPaid,
      total_price: payload.total_price,
      hasAmount,
      currency: payload.currency,
      isValidCurrency,
    });

    if (!isPaid || !hasAmount) {
      console.log("⚠️ Payment not completed:", {
        financial_status: payload.financial_status,
        total_price: payload.total_price,
      });
      return new Response("Payment not completed", {
        status: 200,
        headers: corsHeaders,
      });
    }

    // Check if request exists and is in correct status
    console.log("🔍 Looking up company request:", requestId);

    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from("company_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (fetchError) {
      console.error("❌ Error fetching request:", fetchError);
      return new Response(`Database error: ${fetchError.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    if (!existingRequest) {
      console.error("❌ Request not found:", requestId);
      return new Response("Request not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    console.log("📋 Found request:", {
      id: existingRequest.id,
      company_name: existingRequest.company_name,
      status: existingRequest.status,
      user_id: existingRequest.user_id,
    });

    // Build comprehensive payment data
    const paymentData = {
      order_id: payload.id,
      order_name: payload.name,
      order_number: payload.order_number,
      total_price: payload.total_price,
      currency: payload.currency || "GBP",
      financial_status: payload.financial_status,
      paid_at: new Date().toISOString(),
      created_at: payload.created_at,
      updated_at: payload.updated_at,
      customer_email: payload.email,
      payment_gateway_names: payload.payment_gateway_names,
      webhook_processed_at: new Date().toISOString(),
    };

    console.log("💾 Payment data to store:", paymentData);

    // Update request with enhanced data
    const updateData = {
      status: "in_review",
      payment_data: paymentData,
      updated_at: new Date().toISOString(),
    };

    console.log("🔄 Updating request with data:", updateData);

    const { error: updateError } = await supabaseAdmin
      .from("company_requests")
      .update(updateData)
      .eq("id", requestId);

    if (updateError) {
      console.error("❌ Database update error:", updateError);
      return new Response(`Update failed: ${updateError.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log(`✅ Successfully updated request ${requestId} to 'in_review'`);

    // Log the webhook processing for debugging
    try {
      await supabaseAdmin.from("webhook_logs").insert({
        webhook_type: "shopify_order_paid",
        payload_id: payload.id,
        request_id: requestId,
        status: "processed",
        payload_data: payload,
        processed_at: new Date().toISOString(),
      });
      console.log("📝 Webhook log created");
    } catch (logError) {
      console.warn("⚠️ Failed to create webhook log:", logError);
      // Don't fail the webhook for logging issues
    }

    console.log("🎉 Webhook processed successfully");
    return new Response("Webhook processed successfully", {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("💥 Webhook processing error:", error);

    if (error instanceof Error) {
      console.error("Stack trace:", error.stack);

      return new Response(`Webhook error: ${error.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    return new Response("Unknown error occurred", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
