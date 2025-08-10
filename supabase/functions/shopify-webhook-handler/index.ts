// supabase/functions/shopify-webhook-handler/index.ts - Enhanced with payment protection
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
    console.log(
      "💵 Total Price:",
      payload.total_price,
      typeof payload.total_price
    );

    // Enhanced payment validation
    const isPaid = payload.financial_status === "paid" || payload.test === true;
    const totalPrice = parseFloat(payload.total_price || "0");
    const hasAmount = totalPrice > 0;

    console.log("💳 Payment validation:", {
      financial_status: payload.financial_status,
      isTestOrder: payload.test,
      isConsideredPaid: isPaid,
      totalPrice,
      hasAmount,
    });

    if (!isPaid || !hasAmount) {
      const message = `Payment not considered complete (isPaid: ${isPaid}, hasAmount: ${hasAmount}). No action taken.`;
      console.log(`⚠️ ${message}`);
      return new Response(message, { status: 200, headers: corsHeaders });
    }

    // Extract Request ID from various sources
    const noteAttributes = payload.note_attributes || [];
    const customAttributes = payload.custom_attributes || [];
    const lineItemProperties =
      payload.line_items?.flatMap(
        (item: { properties: any }) => item.properties || []
      ) || [];

    // Also check cart attributes from the order note
    let cartAttributesFromNote = [];
    if (payload.note && payload.note.includes("Request ID:")) {
      const noteMatch = payload.note.match(/Request ID:\s*([a-f0-9-]+)/i);
      if (noteMatch) {
        cartAttributesFromNote.push({
          name: "company_request_id",
          value: noteMatch[1],
        });
      }
    }

    const allAttributes = [
      ...noteAttributes,
      ...customAttributes,
      ...lineItemProperties,
      ...cartAttributesFromNote,
    ];

    console.log("🔍 All attributes found:", allAttributes);

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
        "⚠️ No request ID found in webhook payload. Searching by email..."
      );

      // Fallback: Try to find by customer email and recent timestamp
      if (payload.email) {
        const { data: recentRequests, error: searchError } = await supabaseAdmin
          .from("company_requests")
          .select("id, user_id, created_at")
          .gte(
            "created_at",
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          ) // Last 24 hours
          .order("created_at", { ascending: false })
          .limit(10);

        if (!searchError && recentRequests) {
          // Get user by email
          const { data: users } = await supabaseAdmin.auth.admin.listUsers();
          const user = users?.users?.find((u) => u.email === payload.email);

          if (user) {
            const userRequest = recentRequests.find(
              (req) => req.user_id === user.id
            );
            if (userRequest) {
              requestId = userRequest.id;
              console.log("✅ Found request by email fallback:", requestId);
            }
          }
        }
      }

      if (!requestId) {
        console.warn("⚠️ Could not find request ID. Acknowledging webhook.");
        return new Response("Request ID not found, but webhook acknowledged.", {
          status: 200,
          headers: corsHeaders,
        });
      }
    }

    console.log("🎯 Processing request ID:", requestId);

    // Fetch the existing request
    const { data: existingRequest, error: fetchError } = await supabaseAdmin
      .from("company_requests")
      .select("id, status, company_name, user_id, payment_data, cart_data")
      .eq("id", requestId)
      .single();

    if (fetchError || !existingRequest) {
      console.error(
        "❌ Error fetching request or request not found:",
        fetchError?.message
      );
      return new Response("Request not found, but webhook acknowledged.", {
        status: 200,
        headers: corsHeaders,
      });
    }

    console.log("📋 Found request:", {
      id: existingRequest.id,
      current_status: existingRequest.status,
      company_name: existingRequest.company_name,
      has_existing_payment: !!existingRequest.payment_data,
    });

    // ✅ ENHANCED: Check if payment already exists to prevent duplicates
    if (existingRequest.payment_data && existingRequest.payment_data.order_id) {
      console.log("⚠️ Payment data already exists for this request:", {
        existing_order_id: existingRequest.payment_data.order_id,
        new_order_id: payload.id?.toString(),
      });

      // If it's the same order, just acknowledge
      if (existingRequest.payment_data.order_id === payload.id?.toString()) {
        console.log("✅ Same order ID, webhook already processed");
        return new Response("Payment already processed for this order", {
          status: 200,
          headers: corsHeaders,
        });
      }

      // Different order for same request - this shouldn't happen
      console.warn(
        "⚠️ Different order for same request - potential duplicate payment"
      );
    }

    // Build comprehensive payment data with proper number conversion
    const paymentData = {
      order_id: payload.id?.toString(),
      order_name: payload.name,
      order_number: payload.order_number?.toString(),
      total_price: totalPrice, // Already converted to number
      total_price_string: payload.total_price, // Keep original for reference
      currency: payload.currency || "GBP",
      financial_status: payload.financial_status,
      paid_at: new Date().toISOString(),
      customer_email: payload.email,
      payment_gateway_names: payload.payment_gateway_names,
      webhook_processed_at: new Date().toISOString(),
      is_test_order: payload.test === true,
      processed_successfully: true,
      // ✅ ENHANCED: Add duplicate prevention
      shopify_order_id: payload.id?.toString(),
      processed_by_webhook: true,
    };

    console.log("💰 Payment data prepared:", paymentData);

    // ✅ ENHANCED: Update request with payment data, status, and cart completion
    const updateData = {
      payment_data: paymentData,
      updated_at: new Date().toISOString(),
      // ✅ ENHANCED: Mark cart as completed to prevent further payment attempts
      cart_data: {
        ...existingRequest.cart_data,
        checkout_completed: true,
        payment_completed_at: new Date().toISOString(),
        webhook_order_id: payload.id?.toString(),
      },
    };

    console.log("🔄 Updating request with data:", updateData);

    const { data: updateResult, error: updateError } = await supabaseAdmin
      .from("company_requests")
      .update(updateData)
      .eq("id", requestId)
      .select("*")
      .single();

    if (updateError) {
      console.error("❌ Database update error:", updateError);
      return new Response(`Update failed: ${updateError.message}`, {
        status: 500,
        headers: corsHeaders,
      });
    }

    console.log("✅ Successfully updated request:", updateResult.id);

    // ✅ ENHANCED: Create activity log with more details
    try {
      await supabaseAdmin.from("activity_logs").insert({
        request_id: requestId,
        user_id: existingRequest.user_id,
        action: "payment_completed_webhook",
        description: `Payment completed via webhook. Order: ${payload.name} (${
          payload.test ? "Test" : "Live"
        }) - Status: ${payload.financial_status} - Amount: ${
          paymentData.currency
        } ${paymentData.total_price}. Company formation will begin processing.`,
        metadata: {
          order_id: payload.id,
          order_name: payload.name,
          financial_status: payload.financial_status,
          total_price: paymentData.total_price,
          currency: paymentData.currency,
          is_test_order: payload.test,
          webhook_source: "shopify",
          payment_gateway: payload.payment_gateway_names?.[0] || "unknown",
          customer_email: payload.email,
          processed_at: new Date().toISOString(),
        },
      });
      console.log("📝 Activity log created");
    } catch (logError) {
      console.warn("⚠️ Failed to create activity log:", logError);
    }

    // ✅ ENHANCED: Create a communication record for the payment
    try {
      await supabaseAdmin.from("order_communications").insert({
        company_request_id: requestId,
        sender_type: "system",
        sender_id: null,
        message: `🎉 Payment received successfully! 

Order Details:
• Order ID: ${payload.name}
• Amount: ${paymentData.currency} ${paymentData.total_price}
• Status: ${payload.financial_status}${payload.test ? " (Test Order)" : ""}

Your company formation request is now being reviewed by our team. We'll keep you updated on the progress.

Thank you for choosing GoFormed!`,
        created_at: new Date().toISOString(),
        metadata: {
          type: "payment_confirmation",
          order_id: payload.id,
          amount: paymentData.total_price,
          currency: paymentData.currency,
        },
      });
      console.log("📨 Payment communication created");
    } catch (commError) {
      console.warn("⚠️ Failed to create communication:", commError);
    }

    // ✅ ENHANCED: Log the webhook processing with more details
    try {
      await supabaseAdmin.from("webhook_logs").insert({
        webhook_type: "shopify_order_paid",
        payload_id: payload.id?.toString(),
        request_id: requestId,
        status: "processed",
        payload_data: {
          order_id: payload.id,
          order_name: payload.name,
          total_price: paymentData.total_price,
          currency: paymentData.currency,
          financial_status: payload.financial_status,
          customer_email: payload.email,
          is_test_order: payload.test,
          payment_gateway: payload.payment_gateway_names?.[0] || "unknown",
        },
        processed_at: new Date().toISOString(),
        metadata: {
          duplicate_prevention: "checkout_completed_flag_set",
          cart_completion_status: "completed",
          existing_payment_data: !!existingRequest.payment_data,
        },
      });
      console.log("📝 Webhook log created");
    } catch (logError) {
      console.warn("⚠️ Failed to create webhook log:", logError);
    }

    // ✅ ENHANCED: Send email notification (optional)
    try {
      await supabaseAdmin.functions.invoke("send-email", {
        body: {
          recipient: payload.email,
          templateName: "paymentConfirmation",
          templateData: {
            order_name: payload.name,
            amount: paymentData.total_price,
            currency: paymentData.currency,
            company_name: existingRequest.company_name,
            is_test: payload.test,
          },
          subject: `Payment Received - ${payload.name}`,
        },
      });
      console.log("📧 Payment confirmation email sent");
    } catch (emailError) {
      console.warn("⚠️ Failed to send payment confirmation email:", emailError);
    }

    console.log("🎉 Webhook processed successfully with payment protection");
    return new Response(
      JSON.stringify({
        success: true,
        message: "Webhook processed successfully",
        request_id: requestId,
        order_id: payload.id,
        checkout_completed: true,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("💥 Webhook processing error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    // ✅ ENHANCED: More detailed error response
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
        webhook_type: "shopify_order_paid",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
