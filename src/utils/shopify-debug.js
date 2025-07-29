// src/utils/shopify-debug.js - Shopify bağlantısını test etmek için
export async function testShopifyConnection() {
  console.log("🔍 Testing Shopify Storefront API...");

  const STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL;
  const ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

  if (!STORE_URL || !ACCESS_TOKEN) {
    console.error("❌ Missing Shopify credentials in .env");
    console.log("Required variables:");
    console.log("- VITE_SHOPIFY_STORE_URL");
    console.log("- VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN");
    return false;
  }

  console.log("✅ Environment variables found:", {
    store: STORE_URL,
    hasToken: !!ACCESS_TOKEN,
  });

  // Test 1: Shop info
  const shopQuery = `
    query getShop {
      shop {
        name
        url
        currencyCode
        description
      }
    }
  `;

  try {
    console.log("📡 Testing shop connection...");
    const shopResponse = await fetch(
      `https://${STORE_URL}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: shopQuery }),
      }
    );

    const shopResult = await shopResponse.json();

    if (shopResult.errors) {
      console.error("❌ Shop query failed:", shopResult.errors);
      return false;
    }

    console.log("✅ Shop info:", shopResult.data.shop);
  } catch (error) {
    console.error("❌ Shop connection failed:", error);
    return false;
  }

  // Test 2: Products
  const productsQuery = `
    query getProducts {
      products(first: 5) {
        edges {
          node {
            id
            title
            handle
            availableForSale
            variants(first: 3) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    console.log("📦 Testing products query...");
    const productsResponse = await fetch(
      `https://${STORE_URL}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: productsQuery }),
      }
    );

    const productsResult = await productsResponse.json();

    if (productsResult.errors) {
      console.error("❌ Products query failed:", productsResult.errors);
      return false;
    }

    const products = productsResult.data.products.edges;
    console.log(`✅ Found ${products.length} products`);

    // Product ve variant ID'lerini göster
    console.log("\n📋 Available Products:");
    products.forEach(({ node: product }) => {
      console.log(`\n🏷️ ${product.title}`);
      console.log(`   Product ID: ${product.id}`);
      console.log(`   Handle: ${product.handle}`);
      console.log(`   Available: ${product.availableForSale}`);

      if (product.variants.edges.length > 0) {
        console.log("   Variants:");
        product.variants.edges.forEach(({ node: variant }) => {
          console.log(`     - ${variant.title}: ${variant.id}`);
          console.log(
            `       Price: ${variant.price.amount} ${variant.price.currencyCode}`
          );
          console.log(`       Available: ${variant.availableForSale}`);
        });
      }
    });

    return true;
  } catch (error) {
    console.error("❌ Products query failed:", error);
    return false;
  }
}

// Test cart creation
export async function testCartCreation(variantId) {
  if (!variantId) {
    console.error("❌ Please provide a variant ID");
    return false;
  }

  console.log("🛒 Testing cart creation for variant:", variantId);

  const STORE_URL = import.meta.env.VITE_SHOPIFY_STORE_URL;
  const ACCESS_TOKEN = import.meta.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

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

  const variables = {
    input: {
      lines: [
        {
          merchandiseId: variantId,
          quantity: 1,
        },
      ],
      attributes: [
        { key: "test_cart", value: "true" },
        { key: "created_at", value: new Date().toISOString() },
      ],
    },
  };

  try {
    const response = await fetch(
      `https://${STORE_URL}/api/2024-01/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Storefront-Access-Token": ACCESS_TOKEN,
        },
        body: JSON.stringify({ query: cartMutation, variables }),
      }
    );

    const result = await response.json();

    if (result.errors) {
      console.error("❌ Cart creation GraphQL errors:", result.errors);
      return false;
    }

    if (result.data.cartCreate.userErrors.length > 0) {
      console.error(
        "❌ Cart creation user errors:",
        result.data.cartCreate.userErrors
      );
      return false;
    }

    const cart = result.data.cartCreate.cart;
    console.log("✅ Cart created successfully:", {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalQuantity: cart.totalQuantity,
      estimatedCost: cart.estimatedCost.totalAmount,
    });

    return cart;
  } catch (error) {
    console.error("❌ Cart creation failed:", error);
    return false;
  }
}

// Global olarak kullanılabilir hale getir
if (typeof window !== "undefined") {
  window.testShopify = {
    connection: testShopifyConnection,
    cart: testCartCreation,
  };
}
