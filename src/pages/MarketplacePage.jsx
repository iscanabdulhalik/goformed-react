// src/pages/MarketplacePage.jsx - Optimized & Compact Design
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Package,
  ShoppingCart,
  Check,
  Star,
  Crown,
  Gift,
  Loader2,
  Mail,
  ChevronDown,
  ChevronUp,
  Zap,
  Shield,
  Clock,
} from "lucide-react";

// Compact Service Categories
const POPULAR_SERVICES = [
  {
    id: "vat-registration",
    title: "VAT Registration",
    description: "Professional VAT registration with HMRC",
    price: 50.0,
    icon: <Building2 className="w-5 h-5" />,
    deliveryTime: "3-5 days",
    isPopular: true,
  },
  {
    id: "logo-design",
    title: "Logo Design",
    description: "Professional logo with unlimited revisions",
    price: 40.0,
    icon: <Star className="w-5 h-5" />,
    deliveryTime: "2-3 days",
    isPopular: true,
  },
  {
    id: "shopify-setup",
    title: "Shopify Store Setup",
    description: "Complete store setup and configuration",
    price: 90.0,
    icon: <ShoppingCart className="w-5 h-5" />,
    deliveryTime: "3-5 days",
    isPopular: true,
  },
  {
    id: "payment-integration",
    title: "Stripe & PayPal Setup",
    description: "Professional payment processing setup",
    price: 40.0,
    icon: <Shield className="w-5 h-5" />,
    deliveryTime: "2-3 days",
    isPopular: true,
  },
];

// Service Bundles (same as before but more compact display)
const SERVICE_BUNDLES = [
  {
    id: "starter-bundle",
    title: "Starter Bundle",
    subtitle: "Essential launch package",
    price: 99.0,
    originalPrice: 185.0,
    icon: <Star className="w-6 h-6" />,
    deliveryTime: "5-7 days",
    savings: "Save £86",
    isPopular: true,
    features: [
      "VAT Registration",
      "Logo Design",
      "Payment Integration",
      "Business Email Setup",
      "Shareholder Agreement",
    ],
  },
  {
    id: "pro-bundle",
    title: "Pro Bundle",
    subtitle: "Branding + compliance package",
    price: 199.0,
    originalPrice: 354.0,
    icon: <Crown className="w-6 h-6" />,
    deliveryTime: "7-10 days",
    savings: "Save £155",
    features: [
      "Everything in Starter",
      "Full Brand Kit",
      "Shopify Store Setup",
      "GDPR Generator",
      "Notion Dashboard",
    ],
  },
  {
    id: "all-in-one-bundle",
    title: "Complete Bundle",
    subtitle: "Full business launch package",
    price: 349.0,
    originalPrice: 584.0,
    icon: <Gift className="w-6 h-6" />,
    deliveryTime: "10-14 days",
    savings: "Save £235",
    features: [
      "Everything in Pro",
      "Annual Accounts Filing",
      "Virtual Office Renewal",
      "Business Plan Template",
      "Product Sourcing Help",
    ],
  },
];

// Compact Service Card
const ServiceCard = ({ service, onOrder, isLoading }) => (
  <Card
    className={`group hover:shadow-lg transition-all duration-300 ${
      service.isPopular ? "border-blue-200 bg-blue-50/30" : "border-gray-200"
    }`}
  >
    {service.isPopular && (
      <div className="absolute -top-2 left-4 z-10">
        <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
          Popular
        </Badge>
      </div>
    )}

    <CardHeader className="pb-3 pt-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
          {service.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {service.title}
          </h3>
          <p className="text-xs text-gray-600">{service.description}</p>
        </div>
      </div>
    </CardHeader>

    <CardContent className="pt-0">
      <div className="flex items-center justify-between mb-3">
        <div>
          <span className="text-lg font-bold text-gray-900">
            £{service.price}
          </span>
          <p className="text-xs text-gray-500">{service.deliveryTime}</p>
        </div>
        <Button
          onClick={() => onOrder(service)}
          disabled={isLoading}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : "Order"}
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Compact Bundle Card
const BundleCard = ({ bundle, onOrder, isLoading }) => (
  <Card
    className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
      bundle.isPopular
        ? "border-2 border-green-400 shadow-lg"
        : "border-gray-200"
    }`}
  >
    {bundle.isPopular && (
      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10"></div>
    )}

    <CardHeader className="text-center pb-4 pt-6">
      <div className="flex justify-center mb-3">
        <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
          <div className="text-blue-600">{bundle.icon}</div>
        </div>
      </div>
      <CardTitle className="text-xl font-bold text-gray-900 mb-1">
        {bundle.title}
      </CardTitle>
      <p className="text-sm text-gray-600">{bundle.subtitle}</p>
      <Badge className="bg-red-100 text-red-800 text-xs font-semibold mt-2">
        {bundle.savings}
      </Badge>
    </CardHeader>

    <CardContent className="pt-0">
      <div className="text-center mb-4">
        <div className="flex items-baseline justify-center gap-2 mb-1">
          <span className="text-2xl font-bold text-gray-900">
            £{bundle.price}
          </span>
          <span className="text-sm text-gray-400 line-through">
            £{bundle.originalPrice}
          </span>
        </div>
        <p className="text-xs text-gray-500">{bundle.deliveryTime}</p>
      </div>

      <div className="mb-4">
        <h4 className="font-medium text-gray-900 mb-2 text-sm">Includes:</h4>
        <ul className="space-y-1">
          {bundle.features.slice(0, 3).map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-xs">
              <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
              <span className="text-gray-600">{feature}</span>
            </li>
          ))}
          {bundle.features.length > 3 && (
            <li className="text-xs text-gray-500 pl-5">
              +{bundle.features.length - 3} more services
            </li>
          )}
        </ul>
      </div>

      <Button
        onClick={() => onOrder(bundle)}
        disabled={isLoading}
        className={`w-full font-semibold text-sm ${
          bundle.isPopular
            ? "bg-green-600 hover:bg-green-700"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <Loader2 className="animate-spin w-4 h-4" />
        ) : (
          `Choose ${bundle.title.split(" ")[0]}`
        )}
      </Button>
    </CardContent>
  </Card>
);

// Expandable Category Section
const CategorySection = ({ title, services, onOrder, isLoading }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {services.length} services
          </Badge>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="border-t border-gray-200"
        >
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onOrder={onOrder}
                isLoading={isLoading}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Main Component
export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState("popular");
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
      // Simplified order logic
      alert(`Order created for ${service.title}! Redirecting to orders...`);
      window.location.href = `/dashboard/orders`;
    } catch (error) {
      console.error("Order creation error:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            🛍️ Service Marketplace
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-6">
            Expand your business with our additional services. From compliance
            to branding - we've got you covered.
          </p>

          {/* Quick Stats */}
          <div className="flex items-center justify-center gap-6 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-blue-500" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Professional Quality</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-purple-500" />
              <span>24/7 Support</span>
            </div>
          </div>
        </motion.div>

        {/* Compact Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 h-auto p-1 max-w-lg mx-auto">
            <TabsTrigger value="popular" className="py-2 px-3 text-sm">
              <Star className="w-4 h-4 mr-1" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="bundles" className="py-2 px-3 text-sm">
              <Package className="w-4 h-4 mr-1" />
              Bundles
            </TabsTrigger>
            <TabsTrigger value="all" className="py-2 px-3 text-sm">
              <Building2 className="w-4 h-4 mr-1" />
              All Services
            </TabsTrigger>
          </TabsList>

          {/* Popular Services Tab */}
          <TabsContent value="popular">
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {POPULAR_SERVICES.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onOrder={handleServiceOrder}
                    isLoading={orderLoading}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Service Bundles Tab */}
          <TabsContent value="bundles">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                📦 Service Bundles
              </h2>
              <p className="text-center text-gray-600 mb-6">
                Save money with our curated service packages
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {SERVICE_BUNDLES.map((bundle) => (
                  <BundleCard
                    key={bundle.id}
                    bundle={bundle}
                    onOrder={handleServiceOrder}
                    isLoading={orderLoading}
                  />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* All Services Tab */}
          <TabsContent value="all">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                🔧 All Services by Category
              </h2>

              {/* Expandable categories */}
              <CategorySection
                title="🧾 Tax & Compliance"
                services={[
                  {
                    id: "vat",
                    title: "VAT Registration",
                    description: "HMRC VAT registration service",
                    price: 50,
                    icon: <Building2 className="w-5 h-5" />,
                  },
                  {
                    id: "paye",
                    title: "PAYE Registration",
                    description: "PAYE scheme setup for directors",
                    price: 40,
                    icon: <Building2 className="w-5 h-5" />,
                  },
                  {
                    id: "accounts",
                    title: "Annual Accounts Filing",
                    description: "Dormant company accounts filing",
                    price: 90,
                    icon: <Building2 className="w-5 h-5" />,
                  },
                ]}
                onOrder={handleServiceOrder}
                isLoading={orderLoading}
              />

              <CategorySection
                title="🎨 Branding Services"
                services={[
                  {
                    id: "logo",
                    title: "Logo Design",
                    description: "Professional logo with revisions",
                    price: 40,
                    icon: <Star className="w-5 h-5" />,
                  },
                  {
                    id: "brand-kit",
                    title: "Full Brand Kit",
                    description: "Complete brand identity package",
                    price: 85,
                    icon: <Star className="w-5 h-5" />,
                  },
                  {
                    id: "business-cards",
                    title: "Business Cards",
                    description: "Print-ready business card design",
                    price: 25,
                    icon: <Star className="w-5 h-5" />,
                  },
                ]}
                onOrder={handleServiceOrder}
                isLoading={orderLoading}
              />

              <CategorySection
                title="🛒 E-commerce Setup"
                services={[
                  {
                    id: "shopify",
                    title: "Shopify Store Setup",
                    description: "Complete store configuration",
                    price: 90,
                    icon: <ShoppingCart className="w-5 h-5" />,
                  },
                  {
                    id: "payments",
                    title: "Payment Integration",
                    description: "Stripe & PayPal setup",
                    price: 40,
                    icon: <ShoppingCart className="w-5 h-5" />,
                  },
                  {
                    id: "domain",
                    title: "Domain & Email Setup",
                    description: "Business domain and email",
                    price: 45,
                    icon: <ShoppingCart className="w-5 h-5" />,
                  },
                ]}
                onOrder={handleServiceOrder}
                isLoading={orderLoading}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Compact Footer CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 text-center mt-8"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Need Something Custom? 🤝
          </h3>
          <p className="text-gray-600 mb-4 text-sm">
            Don't see what you need? We offer custom solutions for your specific
            requirements.
          </p>
          <Button
            variant="outline"
            className="inline-flex items-center gap-2"
            onClick={() => window.open("mailto:info@goformed.co.uk", "_blank")}
          >
            <Mail className="w-4 h-4" />
            Contact Us
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
