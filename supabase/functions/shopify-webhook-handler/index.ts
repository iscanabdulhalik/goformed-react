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

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    console.log("✅ CORS preflight handled");
    return new Response("ok", { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.text();
    const headers = Object.fromEntries(req.headers.entries());
    console.log("📋 Request headers:", headers);
    console.log("📦 Request body preview:", body.substring(0, 500) + "...");

    // HMAC verification
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256");
    if (!hmacHeader) {
      console.error("❌ Missing HMAC signature");
      return new Response("Missing HMAC signature", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const webhookSecret = Deno.env.get("SHOPIFY_WEBHOOK_SECRET");
    if (!webhookSecret) {
      console.error("❌ Missing webhook secret in environment");
      return new Response("Webhook secret not configured", {
        status: 500,
        headers: corsHeaders,
      });
    }

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

    if (computedHmac !== hmacHeader) {
      console.error("❌ HMAC verification failed");
      return new Response("Invalid HMAC signature", {
        status: 401,
        headers: corsHeaders,
      });
    }
    console.log("✅ HMAC verification passed");

    // Parse payload
    const payload = JSON.parse(body);
    console.log("📦 Parsed payload keys:", Object.keys(payload));
    console.log("💰 Financial Status:", payload.financial_status);
    console.log("🧪 Test Order:", payload.test);

    // --- ✅ GÜNCELLEME: Test siparişlerini de geçerli saymak için mantığı genişletiyoruz ---
    // Bir sipariş, finansal durumu 'paid' ise VEYA bir test siparişi ise 'ödenmiş' kabul edilir.
    const isPaid = payload.financial_status === "paid" || payload.test === true;
    const hasAmount = parseFloat(payload.total_price || 0) > 0;

    console.log("💳 Payment validation:", {
      financial_status: payload.financial_status,
      isTestOrder: payload.test,
      isConsideredPaid: isPaid,
      hasAmount,
    });

    if (!isPaid || !hasAmount) {
      const message = `Payment not considered complete (isPaid: ${isPaid}, hasAmount: ${hasAmount}). No action taken.`;
      console.log(`⚠️ ${message}`);
      return new Response(message, { status: 200, headers: corsHeaders });
    }

    // Extract Request ID from various attributes
    const noteAttributes = payload.note_attributes || [];
    const customAttributes = payload.custom_attributes || [];
    const lineItemProperties =
      payload.line_items?.flatMap(
        (item: { properties: any }) => item.properties || []
      ) || [];
    const allAttributes = [
      ...noteAttributes,
      ...customAttributes,
      ...lineItemProperties,
    ];

    let requestId = null;
    const requestIdKeys = ["company_request_id", "request_id", "requestId"];
    for (const attr of allAttributes) {
      const attrName = attr.name || attr.key;
      const attrValue = attr.value;
      if (requestIdKeys.includes(attrName) && attrValue) {
        requestId = attrValue;
        break;
      }
    }

    if (!requestId) {
      console.warn(
        "⚠️ No request ID found in webhook payload. Acknowledging to prevent retries."
      );
      return new Response("No request ID found, but webhook acknowledged.", {
        status: 200,
        headers: corsHeaders,
      });
    }

    console.log("🎯 Processing request ID:", requestId);

    // Fetch the existing request to ensure it exists
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from("company_requests")
      .select("id, status, company_name")
      .eq("id", requestId)
      .single();

    if (fetchError || !existingRequest) {
      console.error(
        "❌ Error fetching request or request not found:",
        fetchError?.message
      );
      // Return 200 to prevent Shopify from retrying a non-existent request
      return new Response("Request not found, but webhook acknowledged.", {
        status: 200,
        headers: corsHeaders,
      });
    }

    console.log("📋 Found request:", {
      id: existingRequest.id,
      current_status: existingRequest.status,
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
      customer_email: payload.email,
      payment_gateway_names: payload.payment_gateway_names,
      webhook_processed_at: new Date().toISOString(),
      is_test_order: payload.test === true, // Test siparişi olduğunu belirt
    };

    // Update request with payment data and new status
    const updateData = {
      status: "payment_completed", // Ödeme tamamlandı olarak işaretle
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

    console.log(
      `✅ Successfully updated request ${requestId} to 'payment_completed'`
    );

    // Log the webhook processing for debugging
    try {
      await supabaseAdmin.from("webhook_logs").insert({
        webhook_type: "shopify_order_paid",
        payload_id: payload.id.toString(),
        request_id: requestId,
        status: "processed",
        payload_data: payload,
        processed_at: new Date().toISOString(),
      });
      console.log("📝 Webhook log created");
    } catch (logError) {
      console.warn("⚠️ Failed to create webhook log:", logError);
    }

    console.log("🎉 Webhook processed successfully");
    return new Response("Webhook processed successfully", {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error) {
    console.error("💥 Webhook processing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new Response(`Webhook error: ${errorMessage}`, {
      status: 500,
      headers: corsHeaders,
    });
  }
});
