// src/utils/debug.js - Debug ve test araçları
import { supabase } from "@/supabase";

export class ShopifyDebugger {
  static async testConnection() {
    console.log("🔍 Testing Shopify Configuration...");

    const storeUrl = import.meta.env.VITE_SHOPIFY_STORE_URL;
    const accessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    console.log("Environment Variables:", {
      storeUrl: storeUrl ? "✅ Set" : "❌ Missing",
      accessToken: accessToken ? "✅ Set" : "❌ Missing",
    });

    if (!storeUrl || !accessToken) {
      console.error("❌ Shopify configuration incomplete");
      return false;
    }

    try {
      const testQuery = `query { shop { name url currencyCode } }`;
      const response = await fetch(
        `https://${storeUrl}/api/2024-01/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": accessToken,
          },
          body: JSON.stringify({ query: testQuery }),
        }
      );

      const result = await response.json();
      if (result.errors) {
        console.error("❌ Shopify API Errors:", result.errors);
        return false;
      }

      console.log("✅ Shopify Connection Successful:", result.data.shop);
      return true;
    } catch (error) {
      console.error("❌ Connection Test Failed:", error);
      return false;
    }
  }

  static async testCartCreation(variantId) {
    if (!variantId) {
      console.error("❌ Please provide a variant ID");
      return false;
    }

    console.log("🛒 Testing cart creation for variant:", variantId);

    const storeUrl = import.meta.env.VITE_SHOPIFY_STORE_URL;
    const accessToken = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

    const cartMutation = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart { id checkoutUrl }
          userErrors { field message code }
        }
      }
    `;
    const variables = {
      input: {
        lines: [{ merchandiseId: variantId, quantity: 1 }],
        attributes: [{ key: "test_cart", value: "true" }],
      },
    };

    try {
      const response = await fetch(
        `https://${storeUrl}/api/2024-01/graphql.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": accessToken,
          },
          body: JSON.stringify({ query: cartMutation, variables }),
        }
      );

      const result = await response.json();
      if (result.errors || result.data.cartCreate.userErrors.length > 0) {
        console.error(
          "❌ Cart creation failed:",
          result.errors || result.data.cartCreate.userErrors
        );
        return false;
      }

      const cart = result.data.cartCreate.cart;
      console.log("✅ Cart created successfully:", cart);
      return cart;
    } catch (error) {
      console.error("❌ Cart creation failed:", error);
      return false;
    }
  }
}

export class SupabaseDebugger {
  static async testDatabase() {
    console.log("🗄️ Testing Database Connection...");
    try {
      const { data, error } = await supabase
        .from("company_requests")
        .select("count")
        .limit(1);
      if (error) {
        console.error("❌ Database Error:", error);
        return false;
      }
      console.log("✅ Database Connection Successful");
      return true;
    } catch (error) {
      console.error("❌ Database Test Failed:", error);
      return false;
    }
  }

  static async testAuth() {
    console.log("🔐 Testing Authentication...");
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("❌ Auth Error:", error);
        return false;
      }
      if (session) {
        console.log("✅ User Authenticated:", session.user.email);
        return session;
      } else {
        console.log("ℹ️ No Active Session");
        return null;
      }
    } catch (error) {
      console.error("❌ Auth Test Failed:", error);
      return false;
    }
  }

  static async testEdgeFunction(functionName, payload = {}) {
    console.log(`🔧 Testing Edge Function: ${functionName}...`);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload,
        headers: session
          ? { Authorization: `Bearer ${session.access_token}` }
          : {},
      });
      if (error) {
        console.error(`❌ ${functionName} Error:`, error);
        return false;
      }
      console.log(`✅ ${functionName} Success:`, data);
      return data;
    } catch (error) {
      console.error(`❌ ${functionName} Test Failed:`, error);
      return false;
    }
  }
}

if (typeof window !== "undefined" && import.meta.env.DEV) {
  window.goformedDebug = {
    shopify: ShopifyDebugger,
    supabase: SupabaseDebugger,
    async runAllTests() {
      console.log("🚀 Running All Tests...\n");
      await ShopifyDebugger.testConnection();
      await SupabaseDebugger.testDatabase();
      await SupabaseDebugger.testAuth();
      console.log("\n✅ All tests completed!");
    },
    showConfig() {
      console.log("⚙️ Current Configuration:", {
        environment: import.meta.env.MODE,
        shopifyStore: import.meta.env.VITE_SHOPIFY_STORE_URL,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
        hasShopifyToken: !!import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        hasSupabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
      });
    },
  };
  console.log("🛠️ Debug tools loaded! Try: goformedDebug.runAllTests()");
}
