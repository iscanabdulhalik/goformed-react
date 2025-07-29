// supabase/functions/shopify-webhook-handler/index.ts - Cart API için
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    const body = await req.text();
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256");

    if (!hmacHeader) {
      throw new Error("Missing HMAC signature");
    }

    // HMAC verification
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(Deno.env.get("SHOPIFY_WEBHOOK_SECRET")!),
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
      return new Response("Invalid HMAC signature", { status: 401 });
    }

    const payload = JSON.parse(body);
    console.log("Webhook received for order:", payload.name || payload.id);

    // Cart API ile gelen attributes'leri kontrol et
    const noteAttributes = payload.note_attributes || [];
    const customAttributes = payload.custom_attributes || [];
    const allAttributes = [...noteAttributes, ...customAttributes];

    let requestId = null;

    // Request ID'yi bul
    const requestIdAttr = allAttributes.find(
      (attr: { name?: string; key?: string }) =>
        attr.name === "company_request_id" || attr.key === "company_request_id"
    );

    if (requestIdAttr) {
      requestId = requestIdAttr.value;
    }

    if (!requestId) {
      console.warn("No request ID found in webhook payload");
      return new Response("No request ID found", { status: 200 });
    }

    // Payment kontrolü
    const isPaid =
      payload.financial_status === "paid" &&
      parseFloat(payload.total_price) > 0;

    if (!isPaid) {
      console.log("Payment not completed for request:", requestId);
      return new Response("Payment not completed", { status: 200 });
    }

    // Database güncelle
    const { error: updateError } = await supabaseAdmin
      .from("company_requests")
      .update({
        status: "in_review",
        payment_data: {
          order_id: payload.id,
          order_name: payload.name,
          total_price: payload.total_price,
          currency: payload.currency,
          paid_at: new Date().toISOString(),
        },
      })
      .eq("id", requestId)
      .eq("status", "pending_payment");

    if (updateError) {
      console.error("Database update error:", updateError);
      throw updateError;
    }

    console.log(`Successfully updated request ${requestId} to 'in_review'`);

    return new Response("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
});
