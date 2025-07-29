// supabase/functions/shopify-webhook-handler/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// HMAC doğrulaması için - doğru import
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";

serve(async (req) => {
  const SHOPIFY_WEBHOOK_SECRET = Deno.env.get("SHOPIFY_WEBHOOK_SECRET")!;
  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const requestBodyText = await req.text();
    const hmacHeader = req.headers.get("X-Shopify-Hmac-Sha256");

    if (!hmacHeader) {
      throw new Error("Missing Shopify HMAC signature.");
    }

    // Güvenlik: Webhook'un gerçekten Shopify'dan geldiğini doğrula
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SHOPIFY_WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(requestBodyText),
    );

    const computedHmac = btoa(
      String.fromCharCode(...new Uint8Array(signature)),
    );

    if (computedHmac !== hmacHeader) {
      return new Response("Invalid HMAC signature.", { status: 401 });
    }

    // Güvenlik kontrolünü geçti, şimdi veriyi işleyebiliriz
    const payload = JSON.parse(requestBodyText);

    // Order/paid eventi için custom_attributes'i bul
    const customAttributes = payload.custom_attributes;
    if (!customAttributes || customAttributes.length === 0) {
      console.warn("Webhook received without custom attributes. Skipping.");
      return new Response("OK, but no attributes found.", { status: 200 });
    }

    const requestIdAttribute = customAttributes.find(
      (attr: { key: string }) => attr.key === "company_request_id",
    );

    if (!requestIdAttribute) {
      throw new Error("company_request_id not found in webhook payload.");
    }

    const requestId = requestIdAttribute.value;

    // Veritabanında ilgili talebin durumunu güncelle
    const { error: updateError } = await supabaseAdmin
      .from("company_requests")
      .update({ status: "in_review" })
      .eq("id", requestId)
      .eq("status", "pending_payment"); // Sadece hala ödeme bekleyenleri güncelle

    if (updateError) {
      throw new Error(`DB Update Error: ${updateError.message}`);
    }

    console.log(`Successfully updated request ${requestId} to 'in_review'.`);
    return new Response("Webhook processed successfully.", { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Webhook Handler Error:", error.message);
    } else {
      console.error("Webhook Handler Error:", error);
    }
    return new Response(
      `Webhook Error: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 400 },
    );
  }
});
