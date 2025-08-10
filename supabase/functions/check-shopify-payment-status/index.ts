// supabase/functions/check-shopify-payment-status/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    console.log("🔍 Starting Shopify payment status check...");

    const { requestId, cartId, checkoutUrl } = await req.json();

    if (!requestId) {
      throw new Error("Request ID is required");
    }

    // Get current request data
    const { data: currentRequest, error: requestError } = await supabaseAdmin
      .from("company_requests")
      .select("*")
      .eq("id", requestId)
      .single();

    if (requestError || !currentRequest) {
      throw new Error("Request not found");
    }

    console.log("📋 Checking payment for request:", {
      id: requestId,
      company: currentRequest.company_name,
      hasPaymentData: !!currentRequest.payment_data,
    });

    // If already has payment data, return that
    if (currentRequest.payment_data) {
      console.log("✅ Payment data already exists in database");
      return new Response(
        JSON.stringify({
          success: true,
          hasPayment: true,
          alreadyInDatabase: true,
          orderStatus: currentRequest.payment_data.financial_status,
          orderName: currentRequest.payment_data.order_name,
          totalPrice: currentRequest.payment_data.total_price,
          currency: currentRequest.payment_data.currency,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Get Shopify credentials
    const SHOPIFY_STORE_DOMAIN =
      Deno.env.get("VITE_SHOPIFY_STORE_URL") ||
      Deno.env.get("SHOPIFY_STORE_URL");
    const SHOPIFY_ACCESS_TOKEN = Deno.env.get("SHOPIFY_ADMIN_ACCESS_TOKEN");

    if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_ACCESS_TOKEN) {
      console.error("❌ Missing Shopify configuration");
      throw new Error("Shopify configuration missing");
    }

    // Check recent orders (last 48 hours for test orders)
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    const shopifyApiUrl = `https://${SHOPIFY_STORE_DOMAIN}/admin/api/2024-01/orders.json?status=any&created_at_min=${since}&limit=250`;

    console.log(
      "🌐 Calling Shopify API:",
      shopifyApiUrl.replace(SHOPIFY_ACCESS_TOKEN, "xxx")
    );

    const response = await fetch(shopifyApiUrl, {
      headers: {
        "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Shopify API error:", response.status, errorText);
      throw new Error(
        `Shopify API error: ${response.status} ${response.statusText}`
      );
    }

    const shopifyData = await response.json();
    console.log(`📦 Found ${shopifyData.orders?.length || 0} recent orders`);

    if (!shopifyData.orders || shopifyData.orders.length === 0) {
      console.log("❌ No recent orders found");
      return new Response(
        JSON.stringify({
          success: true,
          hasPayment: false,
          message: "No recent orders found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Find orders that match this request
    const matchingOrders = shopifyData.orders.filter(
      (order: {
        name: any;
        id: any;
        financial_status: any;
        test: any;
        note: string;
        line_items: any[];
        checkout_token: string;
        note_attributes: any[];
        billing_address: { company: any };
        shipping_address: { company: any };
      }) => {
        console.log(`🔍 Checking order ${order.name} (${order.id}):`, {
          financial_status: order.financial_status,
          test: order.test,
          note: order.note?.substring(0, 100),
          line_items_count: order.line_items?.length || 0,
        });

        // Check request ID in order note
        if (order.note && order.note.includes(requestId)) {
          console.log("✅ Found request ID in order note");
          return true;
        }

        // Check cart ID match (if available)
        if (cartId && order.checkout_token) {
          const cartIdFromOrder = order.checkout_token.split("/").pop();
          const requestCartId = cartId.split("/").pop();
          if (cartIdFromOrder === requestCartId) {
            console.log("✅ Found cart ID match");
            return true;
          }
        }

        // Check request ID in line item properties
        const hasRequestIdInLineItems = order.line_items?.some(
          (item: { properties: any[] }) =>
            item.properties?.some(
              (prop: { name: string; value: any }) =>
                (prop.name === "company_request_id" ||
                  prop.name === "request_id") &&
                prop.value === requestId
            )
        );
        if (hasRequestIdInLineItems) {
          console.log("✅ Found request ID in line item properties");
          return true;
        }

        // Check request ID in note attributes
        const hasRequestIdInNotes = order.note_attributes?.some(
          (attr: { name: string; value: any }) =>
            (attr.name === "company_request_id" ||
              attr.name === "request_id") &&
            attr.value === requestId
        );
        if (hasRequestIdInNotes) {
          console.log("✅ Found request ID in note attributes");
          return true;
        }

        // Check company name match (fuzzy)
        if (order.billing_address?.company || order.shipping_address?.company) {
          const orderCompany = (
            order.billing_address?.company ||
            order.shipping_address?.company ||
            ""
          ).toLowerCase();
          const requestCompany = currentRequest.company_name.toLowerCase();
          if (
            orderCompany.includes(requestCompany) ||
            requestCompany.includes(orderCompany)
          ) {
            console.log("✅ Found company name match");
            return true;
          }
        }

        return false;
      }
    );

    console.log(`🎯 Found ${matchingOrders.length} matching orders`);

    if (matchingOrders.length === 0) {
      console.log("❌ No matching orders found for this request");
      return new Response(
        JSON.stringify({
          success: true,
          hasPayment: false,
          message: "No matching orders found",
          searchedOrders: shopifyData.orders.length,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Find the most relevant order
    let relevantOrder = null;

    // Priority 1: Paid orders
    relevantOrder = matchingOrders.find(
      (order: { financial_status: string }) =>
        order.financial_status === "paid" ||
        order.financial_status === "partially_paid"
    );

    // Priority 2: Test orders (for development)
    if (!relevantOrder) {
      relevantOrder = matchingOrders.find(
        (order: { test: boolean }) => order.test === true
      );
    }

    // Priority 3: Any pending/authorized order
    if (!relevantOrder) {
      relevantOrder = matchingOrders.find(
        (order: { financial_status: string }) =>
          order.financial_status === "pending" ||
          order.financial_status === "authorized"
      );
    }

    // Priority 4: Most recent order
    if (!relevantOrder) {
      relevantOrder = matchingOrders.sort(
        (
          a: { created_at: string | number | Date },
          b: { created_at: string | number | Date }
        ) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0];
    }

    if (!relevantOrder) {
      console.log("❌ No relevant order found");
      return new Response(
        JSON.stringify({
          success: true,
          hasPayment: false,
          message: "No relevant order found",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    console.log(`✅ Found relevant order:`, {
      name: relevantOrder.name,
      id: relevantOrder.id,
      financial_status: relevantOrder.financial_status,
      test: relevantOrder.test,
      total_price: relevantOrder.total_price,
    });

    // ✅ ENHANCED: Consider test orders as paid for development
    const isPaid =
      relevantOrder.financial_status === "paid" ||
      relevantOrder.financial_status === "partially_paid" ||
      (relevantOrder.test === true &&
        parseFloat(relevantOrder.total_price) > 0);

    if (isPaid) {
      console.log("💰 Order is considered paid, updating database...");

      const paymentData = {
        order_id: relevantOrder.id.toString(),
        order_name: relevantOrder.name,
        total_price: parseFloat(relevantOrder.total_price),
        currency: relevantOrder.currency,
        financial_status: relevantOrder.financial_status,
        paid_at: new Date().toISOString(),
        discovered_via: "status_check",
        shopify_created_at: relevantOrder.created_at,
        is_test_order: relevantOrder.test === true,
        processed_successfully: true,
      };

      const { error: updateError } = await supabaseAdmin
        .from("company_requests")
        .update({
          payment_data: paymentData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (updateError) {
        console.error("❌ Failed to update request:", updateError);
        throw updateError;
      }

      // Add activity log
      try {
        await supabaseAdmin.from("activity_logs").insert({
          request_id: requestId,
          user_id: currentRequest.user_id,
          action: "payment_discovered",
          description: `Payment discovered through status check. Order: ${
            relevantOrder.name
          } (${relevantOrder.test ? "Test" : "Live"}) - Status: ${
            relevantOrder.financial_status
          } - Amount: ${relevantOrder.currency} ${relevantOrder.total_price}`,
          metadata: {
            order_id: relevantOrder.id,
            discovery_method: "status_check",
            is_test_order: relevantOrder.test,
            financial_status: relevantOrder.financial_status,
          },
        });
        console.log("📝 Activity log created");
      } catch (logError) {
        console.warn("⚠️ Failed to create activity log:", logError);
      }

      console.log("✅ Payment data updated successfully");

      return new Response(
        JSON.stringify({
          success: true,
          hasPayment: true,
          orderStatus: relevantOrder.financial_status,
          orderName: relevantOrder.name,
          totalPrice: relevantOrder.total_price,
          currency: relevantOrder.currency,
          isTestOrder: relevantOrder.test,
          updatedDatabase: true,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      console.log(
        `⏳ Order found but not paid yet: ${relevantOrder.financial_status}`
      );

      return new Response(
        JSON.stringify({
          success: true,
          hasPayment: false,
          orderFound: true,
          orderStatus: relevantOrder.financial_status,
          orderName: relevantOrder.name,
          message: `Order found but payment status is: ${relevantOrder.financial_status}`,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("💥 Payment status check error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
