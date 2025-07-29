// src/lib/packages.jsx - Gerçek Shopify ID'leri ile
export const ukPackages = [
  {
    name: "Entrepreneur (UK)",
    shopifyProductId: "gid://shopify/Product/8617843818634",
    variantId: "gid://shopify/ProductVariant/46490494861450",
    oldPrice: "£449",
    price: "£149",
    feeText: "+ £50 Companies House fee included",
    features: [
      "UK Company Formation",
      "Payoneer UK Business Account",
      "Stripe & Shopify Setup Guide",
      "London Registered Office",
      "Basic Support",
    ],
    badge: "Popular",
    badgeClass: "bg-green-600",
  },
  {
    name: "Pro Builder (UK)",
    shopifyProductId: "gid://shopify/Product/8618145808522",
    variantId: "gid://shopify/ProductVariant/46491584004234",
    oldPrice: "£599",
    price: "£249",
    feeText: "+ £50 Companies House fee included",
    features: [
      "Everything in Entrepreneur",
      "VAT Registration",
      "Printed Documents",
      "PAYE Registration",
      "Priority Support",
    ],
    badge: "Premium",
    badgeClass: "bg-purple-600",
  },
];

export const globalPackages = [
  {
    name: "Global Starter",
    shopifyProductId: "gid://shopify/Product/8618145939594",
    variantId: "gid://shopify/ProductVariant/46491584921738",
    oldPrice: "£549",
    price: "£199",
    feeText: "+ £50 Companies House fee included",
    features: [
      "Everything in Entrepreneur",
      "Extra ID verification support",
      "Document assistance",
      "International address proof setup",
    ],
    badge: "International",
    badgeClass: "bg-blue-600",
  },
  {
    name: "Global Premium",
    shopifyProductId: "gid://shopify/Product/8618146168970",
    variantId: "gid://shopify/ProductVariant/46491586822282",
    oldPrice: "£649",
    price: "£249",
    feeText: "+ £50 Companies House fee included",
    features: [
      "Everything in Global Starter",
      "VAT & PAYE Registration",
      "Printed Documents",
      "Shopify Store Support",
      "Business Email & Hosting",
    ],
    badge: "Elite",
    badgeClass: "bg-gray-800",
  },
];

// Shopify product ID'lerini almak için bu fonksiyonu kullanın
export const getShopifyProductInfo = (packageName) => {
  const allPackages = [...ukPackages, ...globalPackages];
  return allPackages.find((pkg) => pkg.name === packageName);
};

// Package name'den variant ID al
export const getVariantIdByPackageName = (packageName) => {
  const packageInfo = getShopifyProductInfo(packageName);
  return packageInfo?.variantId;
};

// Debug için product mapping'i konsola yazdır
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  console.log("🛍️ Shopify Package Mapping:", {
    ukPackages: ukPackages.map((p) => ({
      name: p.name,
      productId: p.shopifyProductId,
      variantId: p.variantId,
      price: p.price,
    })),
    globalPackages: globalPackages.map((p) => ({
      name: p.name,
      productId: p.shopifyProductId,
      variantId: p.variantId,
      price: p.price,
    })),
  });

  // Test için global fonksiyon
  window.testPackageCheckout = async (packageName) => {
    const packageInfo = getShopifyProductInfo(packageName);
    if (!packageInfo) {
      console.error("❌ Package not found:", packageName);
      return;
    }

    console.log("🧪 Testing checkout for:", packageName);
    console.log("📦 Package info:", packageInfo);

    // Test cart creation
    if (window.testShopify?.cart) {
      return await window.testShopify.cart(packageInfo.variantId);
    } else {
      console.log("⚠️ Import shopify-debug.js to test cart creation");
      return packageInfo;
    }
  };

  console.log(
    '🧪 Test packages with: testPackageCheckout("Entrepreneur (UK)")'
  );
}
