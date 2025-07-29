// src/lib/packages.jsx - Shopify Product ID'leri ile
export const ukPackages = [
  {
    name: "Entrepreneur (UK)",
    shopifyProductId: "8617843818634",
    variantId: "gid://shopify/ProductVariant/8617843818634", // Mevcut variant
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
    shopifyProductId: "1753748583850",
    variantId: "gid://shopify/ProductVariant/8618145808522", // Yeni variant ID gerekecek
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
    shopifyProductId: "1753748557215",
    variantId: "gid://shopify/ProductVariant/8618145939594", // Yeni variant ID gerekecek
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
    shopifyProductId: "1753748521459",
    variantId: "gid://shopify/ProductVariant/8618146168970", // Yeni variant ID gerekecek
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
