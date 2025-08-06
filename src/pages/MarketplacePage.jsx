// src/pages/MarketplacePage.jsx - Updated with Real Service Structure
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FaFileAlt,
  FaPalette,
  FaCalculator,
  FaShieldAlt,
  FaShoppingCart,
  FaLaptop,
  FaSpinner,
  FaCheck,
  FaCrown,
  FaStar,
  FaGift,
} from "react-icons/fa";
import {
  Building2,
  FileText,
  Palette,
  ShoppingBag,
  Monitor,
  Package,
} from "lucide-react";

// Service Categories with proper structure
const SERVICE_CATEGORIES = [
  {
    id: "individual",
    name: "Individual Services",
    icon: <Building2 className="w-4 h-4" />,
  },
  {
    id: "bundles",
    name: "Service Bundles",
    icon: <Package className="w-4 h-4" />,
  },
];

// Individual Services organized by category
const INDIVIDUAL_SERVICES = {
  tax_compliance: {
    title: "🧾 Tax & Compliance Add-Ons",
    services: [
      {
        id: "vat-registration",
        title: "VAT Registration (HMRC)",
        description:
          "Professional VAT registration service with HMRC for your UK company.",
        price: 50.0,
        currency: "GBP",
        icon: <FaCalculator className="w-6 h-6" />,
        deliveryTime: "3-5 business days",
        features: [
          "HMRC VAT registration",
          "VAT number allocation",
          "Compliance guidance",
        ],
        isPopular: true,
      },
      {
        id: "paye-registration",
        title: "PAYE Registration for Directors",
        description:
          "Register for PAYE if you plan to take a salary from your company.",
        price: 40.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "3-5 business days",
        features: [
          "PAYE scheme setup",
          "HMRC registration",
          "Payroll guidance",
        ],
        isPopular: false,
      },
      {
        id: "confirmation-statement",
        title: "Confirmation Statement Filing",
        description:
          "Annual confirmation statement filing service with Companies House.",
        price: 35.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "2-3 business days",
        features: [
          "Annual filing service",
          "Companies House submission",
          "Compliance check",
        ],
        isPopular: false,
      },
      {
        id: "annual-accounts",
        title: "Annual Accounts Filing (Dormant Company)",
        description:
          "Professional annual accounts filing for dormant companies.",
        price: 90.0,
        currency: "GBP",
        icon: <FaCalculator className="w-6 h-6" />,
        deliveryTime: "5-7 business days",
        features: [
          "Dormant company accounts",
          "Companies House filing",
          "Professional review",
        ],
        isPopular: false,
      },
      {
        id: "virtual-office-renewal",
        title: "Virtual Office Address Renewal (1 Year)",
        description:
          "Renew your London registered office address for another year.",
        price: 60.0,
        currency: "GBP",
        icon: <Building2 className="w-6 h-6" />,
        deliveryTime: "1 business day",
        features: [
          "1 year address service",
          "Mail forwarding",
          "Professional address",
        ],
        isPopular: false,
      },
    ],
  },
  branding: {
    title: "🎨 Branding Add-Ons",
    services: [
      {
        id: "logo-design",
        title: "Logo Design (1 Concept + Revisions)",
        description:
          "Professional logo design with unlimited revisions until perfect.",
        price: 40.0,
        currency: "GBP",
        icon: <FaPalette className="w-6 h-6" />,
        deliveryTime: "2-3 business days",
        features: [
          "1 custom logo concept",
          "Unlimited revisions",
          "Multiple file formats",
        ],
        isPopular: true,
      },
      {
        id: "brand-kit",
        title: "Full Brand Kit (Logo, Fonts, Colors)",
        description:
          "Complete brand identity package with style guide and assets.",
        price: 85.0,
        currency: "GBP",
        icon: <FaPalette className="w-6 h-6" />,
        deliveryTime: "3-5 business days",
        features: [
          "Logo design",
          "Color palette",
          "Font selection",
          "Brand guidelines",
        ],
        isPopular: false,
      },
      {
        id: "business-cards",
        title: "Business Card Design (Print-ready)",
        description: "Professional business card design ready for printing.",
        price: 25.0,
        currency: "GBP",
        icon: <FaPalette className="w-6 h-6" />,
        deliveryTime: "1-2 business days",
        features: [
          "Print-ready design",
          "Multiple formats",
          "Professional layout",
        ],
        isPopular: false,
      },
      {
        id: "email-signature",
        title: "Email Signature Design",
        description:
          "Professional email signature design for your business communications.",
        price: 20.0,
        currency: "GBP",
        icon: <FaPalette className="w-6 h-6" />,
        deliveryTime: "1 business day",
        features: [
          "Custom design",
          "Multiple email clients",
          "Contact info integration",
        ],
        isPopular: false,
      },
      {
        id: "social-banners",
        title: "Social Media Banner Design (Facebook/LinkedIn)",
        description:
          "Professional social media banners for your business profiles.",
        price: 30.0,
        currency: "GBP",
        icon: <FaPalette className="w-6 h-6" />,
        deliveryTime: "1-2 business days",
        features: [
          "Facebook & LinkedIn banners",
          "Professional design",
          "Brand consistent",
        ],
        isPopular: false,
      },
    ],
  },
  documentation: {
    title: "📄 Documentation Add-Ons",
    services: [
      {
        id: "shareholder-agreement",
        title: "Shareholder Agreement Template",
        description:
          "Legal shareholder agreement template customized for UK companies.",
        price: 25.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "1 business day",
        features: ["UK legal template", "Editable format", "Legal compliance"],
        isPopular: false,
      },
      {
        id: "business-plan",
        title: "Editable Business Plan Template (UK Focused)",
        description:
          "Comprehensive business plan template tailored for UK market.",
        price: 35.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "1 business day",
        features: [
          "UK market focused",
          "Editable template",
          "Financial projections",
        ],
        isPopular: false,
      },
      {
        id: "nda-template",
        title: "Non-Disclosure Agreement (NDA)",
        description:
          "Professional NDA template for protecting your business information.",
        price: 20.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "1 business day",
        features: ["Legal template", "Customizable", "UK law compliant"],
        isPopular: false,
      },
      {
        id: "compliance-docs",
        title: "Stripe/Shopify Compliance Docs Pack",
        description:
          "Essential compliance documents for Stripe and Shopify setup.",
        price: 30.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "1-2 business days",
        features: [
          "Compliance documents",
          "Stripe requirements",
          "Shopify setup docs",
        ],
        isPopular: true,
      },
      {
        id: "gdpr-generator",
        title: "GDPR Privacy Policy & Terms Generator",
        description:
          "Generate GDPR-compliant privacy policy and terms for your business.",
        price: 40.0,
        currency: "GBP",
        icon: <FaShieldAlt className="w-6 h-6" />,
        deliveryTime: "1-2 business days",
        features: [
          "GDPR compliant",
          "Customizable generator",
          "Terms & conditions",
        ],
        isPopular: false,
      },
    ],
  },
  ecommerce: {
    title: "🛒 E-commerce Add-Ons",
    services: [
      {
        id: "shopify-setup",
        title: "Shopify Store Setup (Basic Configuration)",
        description:
          "Complete Shopify store setup and basic configuration service.",
        price: 90.0,
        currency: "GBP",
        icon: <FaShoppingCart className="w-6 h-6" />,
        deliveryTime: "3-5 business days",
        features: ["Store configuration", "Theme setup", "Basic customization"],
        isPopular: true,
      },
      {
        id: "payment-integration",
        title: "Stripe & PayPal Integration",
        description:
          "Professional setup of Stripe and PayPal payment processing.",
        price: 40.0,
        currency: "GBP",
        icon: <FaShoppingCart className="w-6 h-6" />,
        deliveryTime: "2-3 business days",
        features: ["Stripe setup", "PayPal integration", "Payment testing"],
        isPopular: true,
      },
      {
        id: "product-sourcing",
        title: "UK Product Sourcing Assistance",
        description: "Help finding and connecting with UK product suppliers.",
        price: 50.0,
        currency: "GBP",
        icon: <FaShoppingCart className="w-6 h-6" />,
        deliveryTime: "5-7 business days",
        features: ["Supplier research", "UK sourcing", "Connection assistance"],
        isPopular: false,
      },
      {
        id: "invoice-setup",
        title: "Branded Invoice Setup for Shopify",
        description: "Custom branded invoice templates for your Shopify store.",
        price: 35.0,
        currency: "GBP",
        icon: <FaShoppingCart className="w-6 h-6" />,
        deliveryTime: "2-3 business days",
        features: [
          "Branded invoices",
          "Shopify integration",
          "Professional templates",
        ],
        isPopular: false,
      },
      {
        id: "domain-email",
        title: "Domain Setup + Business Email (Zoho/Google)",
        description: "Professional domain and business email setup service.",
        price: 45.0,
        currency: "GBP",
        icon: <FaLaptop className="w-6 h-6" />,
        deliveryTime: "2-3 business days",
        features: [
          "Domain registration",
          "Email setup",
          "Professional addresses",
        ],
        isPopular: false,
      },
    ],
  },
  digital_tools: {
    title: "💻 Digital Tools & Extras",
    services: [
      {
        id: "notion-dashboard",
        title: "Business Dashboard in Notion (Custom Template)",
        description:
          "Custom Notion template for managing your business operations.",
        price: 25.0,
        currency: "GBP",
        icon: <FaLaptop className="w-6 h-6" />,
        deliveryTime: "1-2 business days",
        features: [
          "Custom Notion template",
          "Business management",
          "Organized workspace",
        ],
        isPopular: false,
      },
      {
        id: "stripe-atlas-guide",
        title: "Stripe Atlas Alternative Guide (Downloadable PDF)",
        description:
          "Comprehensive guide as an alternative to Stripe Atlas for UK companies.",
        price: 10.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "Instant download",
        features: [
          "Downloadable PDF",
          "Step-by-step guide",
          "Atlas alternative",
        ],
        isPopular: false,
      },
      {
        id: "vpn-guide",
        title: "Secure VPN Setup Guide (Access Stripe from Anywhere)",
        description:
          "Guide to securely access Stripe and other services from anywhere.",
        price: 15.0,
        currency: "GBP",
        icon: <FaShieldAlt className="w-6 h-6" />,
        deliveryTime: "Instant download",
        features: ["VPN setup guide", "Security tips", "Global access"],
        isPopular: false,
      },
      {
        id: "invoice-generator",
        title: "UK Invoice Generator Tool Access",
        description: "Access to professional UK invoice generator tool.",
        price: 20.0,
        currency: "GBP",
        icon: <FaFileAlt className="w-6 h-6" />,
        deliveryTime: "Instant access",
        features: [
          "Invoice generator",
          "UK compliant",
          "Professional templates",
        ],
        isPopular: false,
      },
      {
        id: "email-setup-support",
        title: "Business Email Setup Support (Zoho, Google Workspace)",
        description:
          "Professional assistance with business email setup and configuration.",
        price: 30.0,
        currency: "GBP",
        icon: <FaLaptop className="w-6 h-6" />,
        deliveryTime: "1-2 business days",
        features: [
          "Email setup",
          "Configuration support",
          "Professional guidance",
        ],
        isPopular: false,
      },
    ],
  },
};

// Service Bundles
const SERVICE_BUNDLES = [
  {
    id: "starter-bundle",
    title: "🟩 Starter Bundle",
    subtitle: "For users who need the essentials to launch",
    price: 99.0,
    originalPrice: 185.0,
    currency: "GBP",
    icon: <FaStar className="w-8 h-8" />,
    deliveryTime: "5-7 business days",
    savings: "Save £86",
    isPopular: true,
    features: [
      "VAT Registration",
      "Logo Design",
      "Shareholder Agreement Template",
      "Stripe & PayPal Integration",
      "Business Email Setup",
    ],
    included_services: [
      "vat-registration",
      "logo-design",
      "shareholder-agreement",
      "payment-integration",
      "email-setup-support",
    ],
  },
  {
    id: "pro-bundle",
    title: "🟦 Pro Bundle",
    subtitle: "For users who want branding + compliance done right",
    price: 199.0,
    originalPrice: 354.0,
    currency: "GBP",
    icon: <FaCrown className="w-8 h-8" />,
    deliveryTime: "7-10 business days",
    savings: "Save £155",
    isPopular: false,
    features: [
      "Everything in Starter",
      "Confirmation Statement Filing",
      "Full Brand Kit",
      "GDPR Terms & Privacy Policy Generator",
      "Shopify Store Setup",
      "Notion Business Dashboard Template",
    ],
    included_services: [
      "vat-registration",
      "logo-design",
      "shareholder-agreement",
      "payment-integration",
      "email-setup-support",
      "confirmation-statement",
      "brand-kit",
      "gdpr-generator",
      "shopify-setup",
      "notion-dashboard",
    ],
  },
  {
    id: "all-in-one-bundle",
    title: "🟧 All-In-One Bundle",
    subtitle: "Complete launch + compliance + scaling package",
    price: 349.0,
    originalPrice: 584.0,
    currency: "GBP",
    icon: <FaGift className="w-8 h-8" />,
    deliveryTime: "10-14 business days",
    savings: "Save £235",
    isPopular: false,
    features: [
      "Everything in Pro",
      "Annual Accounts Filing (Dormant)",
      "Virtual Office Address Renewal (1 Year)",
      "Editable UK Business Plan",
      "UK Product Sourcing Help",
      "Branded Invoice Setup for Shopify",
    ],
    included_services: [
      "vat-registration",
      "logo-design",
      "shareholder-agreement",
      "payment-integration",
      "email-setup-support",
      "confirmation-statement",
      "brand-kit",
      "gdpr-generator",
      "shopify-setup",
      "notion-dashboard",
      "annual-accounts",
      "virtual-office-renewal",
      "business-plan",
      "product-sourcing",
      "invoice-setup",
    ],
  },
];

// Service Card Component
const ServiceCard = ({ service, onOrder, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
    transition={{ duration: 0.3 }}
    className="h-full"
  >
    <Card
      className={`h-full flex flex-col transition-all duration-300 hover:shadow-lg ${
        service.isPopular
          ? "border-2 border-blue-500 shadow-md"
          : "border hover:border-gray-300"
      }`}
    >
      {service.isPopular && (
        <div className="absolute -top-3 left-4 z-10">
          <Badge className="bg-blue-600 text-white px-3 py-1 text-xs font-semibold">
            Popular
          </Badge>
        </div>
      )}

      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
            <div className="text-blue-600">{service.icon}</div>
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-bold text-gray-900 mb-2">
              {service.title}
            </CardTitle>
            <p className="text-sm text-gray-600 leading-relaxed">
              {service.description}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="mb-4">
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-bold text-gray-900">
              £{service.price.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">Total</span>
          </div>
          <p className="text-xs text-gray-500">
            Delivery: {service.deliveryTime}
          </p>
        </div>

        <div className="mb-6 flex-1">
          <ul className="space-y-2">
            {service.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <FaCheck className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
            {service.features.length > 3 && (
              <li className="text-xs text-gray-500 pl-5">
                +{service.features.length - 3} more features
              </li>
            )}
          </ul>
        </div>

        <Button
          onClick={() => onOrder(service)}
          disabled={isLoading}
          className={`w-full font-semibold transition-all duration-300 ${
            service.isPopular
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-gray-900 hover:bg-gray-800"
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2 h-4 w-4" />
              Processing...
            </>
          ) : (
            "Order Service"
          )}
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

// Bundle Card Component
const BundleCard = ({ bundle, onOrder, isLoading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    transition={{ duration: 0.3 }}
    className="h-full"
  >
    <Card
      className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl ${
        bundle.isPopular
          ? "border-2 border-green-500 shadow-lg"
          : "border-2 border-gray-200"
      }`}
    >
      {bundle.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-green-600 text-white px-4 py-2 text-sm font-bold rounded-full">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl">
            <div className="text-blue-600">{bundle.icon}</div>
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
          {bundle.title}
        </CardTitle>
        <p className="text-gray-600 font-medium">{bundle.subtitle}</p>
        <div className="mt-4">
          <Badge className="bg-red-100 text-red-800 font-semibold">
            {bundle.savings}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-4xl font-bold text-gray-900">
              £{bundle.price.toFixed(2)}
            </span>
            {bundle.originalPrice && (
              <span className="text-xl text-gray-400 line-through">
                £{bundle.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Delivery: {bundle.deliveryTime}
          </p>
        </div>

        <div className="mb-8 flex-1">
          <h4 className="font-semibold text-gray-900 mb-4">Includes:</h4>
          <ul className="space-y-3">
            {bundle.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm">
                <FaCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <Button
          onClick={() => onOrder(bundle)}
          disabled={isLoading}
          className={`w-full font-bold py-3 text-lg transition-all duration-300 ${
            bundle.isPopular
              ? "bg-green-600 hover:bg-green-700 shadow-lg"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin mr-2 h-5 w-5" />
              Processing...
            </>
          ) : (
            `Choose ${bundle.title.split(" ")[1]} Bundle`
          )}
        </Button>
      </CardContent>
    </Card>
  </motion.div>
);

// Main Marketplace Component
export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("individual");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderLoading, setOrderLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);
      } catch (error) {
        console.error("Error getting user:", error);
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, []);

  const handleServiceOrder = async (service) => {
    if (!user) {
      alert("Please log in to order services.");
      window.location.href = "/login";
      return;
    }

    setOrderLoading(true);
    try {
      const isBundle = !!service.included_services;

      await supabase.rpc("log_activity", {
        p_user_id: user.id,
        p_action: isBundle
          ? "bundle_order_initiated"
          : "service_order_initiated",
        p_description: `User initiated order for ${service.title}`,
        p_metadata: {
          service_id: service.id,
          service_title: service.title,
          is_bundle: isBundle,
          price: service.price,
        },
      });

      const orderData = {
        user_id: user.id,
        service_id: service.id,
        service_title: service.title,
        service_category: isBundle ? "bundle" : "individual",
        service_description: service.description || service.subtitle,
        price_amount: service.price,
        currency: service.currency,
        delivery_time: service.deliveryTime,
        order_details: {
          features: service.features,
          original_price: service.originalPrice,
          is_bundle: isBundle,
          included_services: service.included_services || [],
          savings: service.savings,
        },
        status: "pending",
      };

      const { data: order, error } = await supabase
        .from("service_orders")
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      await supabase.rpc("log_activity", {
        p_user_id: user.id,
        p_action: isBundle ? "bundle_order_created" : "service_order_created",
        p_description: `${isBundle ? "Bundle" : "Service"} order created for ${
          service.title
        }`,
        p_service_order_id: order.id,
        p_metadata: {
          order_id: order.id,
          amount: service.price,
          currency: service.currency,
          is_bundle: isBundle,
        },
      });

      alert(`Order created successfully! Order ID: ${order.id.slice(0, 8)}`);
      window.location.href = `/dashboard/orders`;
    } catch (error) {
      console.error("Order creation error:", error);
      alert("Failed to create order. Please try again.");

      if (user) {
        await supabase.rpc("log_activity", {
          p_user_id: user.id,
          p_action: "service_order_failed",
          p_description: `Failed to create order for ${service.title}: ${error.message}`,
          p_metadata: { service_id: service.id, error: error.message },
        });
      }
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderIndividualServices = () => (
    <div className="space-y-12">
      {Object.values(INDIVIDUAL_SERVICES).map((category, categoryIndex) => (
        <motion.div
          key={categoryIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="bg-white rounded-2xl p-8 shadow-sm"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            {category.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {category.services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onOrder={handleServiceOrder}
                isLoading={orderLoading}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderServiceBundles = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {SERVICE_BUNDLES.map((bundle, index) => (
        <BundleCard
          key={bundle.id}
          bundle={bundle}
          onOrder={handleServiceOrder}
          isLoading={orderLoading}
        />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Building2 className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">Marketplace</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Expand your business with our additional services. From VAT
            registration to professional branding, we've got you covered.
          </p>

          {/* Included Services Banner */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-8 max-w-4xl mx-auto border border-green-200">
            <h3 className="text-lg font-bold text-green-800 mb-3">
              ✅ Included in Every Company Formation Package
            </h3>
            <p className="text-sm text-green-700 mb-4">
              These services come by default with all UK company packages:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-green-600">
              <div className="flex items-center gap-2">
                <FaCheck className="w-3 h-3" />
                <span>UK Company Formation</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="w-3 h-3" />
                <span>London Registered Office Address (1 Year)</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="w-3 h-3" />
                <span>Payoneer UK Business Account Setup</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="w-3 h-3" />
                <span>Stripe & Shopify Setup Guide</span>
              </div>
              <div className="flex items-center gap-2">
                <FaCheck className="w-3 h-3" />
                <span>Basic Support (Chat & Email)</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Service Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1 max-w-md mx-auto">
            <TabsTrigger value="individual" className="py-3 px-6">
              <Building2 className="w-4 h-4 mr-2" />
              Individual Services
            </TabsTrigger>
            <TabsTrigger value="bundles" className="py-3 px-6">
              <Package className="w-4 h-4 mr-2" />
              Service Bundles
            </TabsTrigger>
          </TabsList>

          <TabsContent value="individual">
            {renderIndividualServices()}
          </TabsContent>

          <TabsContent value="bundles">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                📦 Service Bundles
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Save money with our carefully curated service bundles designed
                for different business needs.
              </p>
            </div>
            {renderServiceBundles()}
          </TabsContent>
        </Tabs>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need Something Custom?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Don't see what you're looking for? We offer custom solutions
            tailored to your specific business needs. Get in touch and let's
            discuss how we can help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="flex items-center gap-2 px-6 py-3"
              onClick={() =>
                window.open("mailto:info@goformed.co.uk", "_blank")
              }
            >
              <FaLaptop className="w-4 h-4" />
              Email Us
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 px-6 py-3"
              onClick={() =>
                window.open("https://calendly.com/goformed", "_blank")
              }
            >
              <FaShoppingCart className="w-4 h-4" />
              Schedule a Call
            </Button>
          </div>
        </motion.div>

        {/* Bundle Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-8 text-center border-b">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Bundle Comparison
            </h2>
            <p className="text-gray-600">
              Compare what's included in each bundle to find the perfect fit
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Service
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-green-700">
                    🟩 Starter
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-700">
                    🟦 Pro
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-orange-700">
                    🟧 All-In-One
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {[
                  "VAT Registration",
                  "Logo Design",
                  "Shareholder Agreement",
                  "Payment Integration",
                  "Business Email Setup",
                  "Confirmation Statement",
                  "Full Brand Kit",
                  "GDPR Generator",
                  "Shopify Setup",
                  "Notion Dashboard",
                  "Annual Accounts",
                  "Virtual Office Renewal",
                  "Business Plan Template",
                  "Product Sourcing",
                  "Invoice Setup",
                ].map((service, index) => {
                  const inStarter = index < 5;
                  const inPro = index < 10;
                  const inAllInOne = true;

                  return (
                    <tr key={service} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {service}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inStarter ? (
                          <FaCheck className="w-4 h-4 text-green-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inPro ? (
                          <FaCheck className="w-4 h-4 text-blue-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inAllInOne ? (
                          <FaCheck className="w-4 h-4 text-orange-600 mx-auto" />
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50 text-center border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">£99</div>
                <div className="text-sm text-gray-500">Save £86</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-700">£199</div>
                <div className="text-sm text-gray-500">Save £155</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-700">£349</div>
                <div className="text-sm text-gray-500">Save £235</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
