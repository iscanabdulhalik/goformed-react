// src/pages/MarketplacePage.jsx - Production Ready with Real Data
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FaFileAlt,
  FaPalette,
  FaIdCard,
  FaMapMarkerAlt,
  FaCalculator,
  FaShieldAlt,
  FaGlobe,
  FaEnvelope,
  FaPhoneAlt,
  FaSpinner,
  FaCheck,
} from "react-icons/fa";
import {
  Building2,
  CreditCard,
  FileText,
  MapPin,
  ShoppingCart,
} from "lucide-react";

// Real services data - This would typically come from a database
const AVAILABLE_SERVICES = [
  {
    id: "vat-registration",
    title: "VAT Registration",
    description:
      "Get your company registered for VAT with HMRC. Essential for businesses with turnover over £85,000.",
    longDescription:
      "Complete VAT registration service including application submission, communication with HMRC, and guidance on VAT compliance requirements. Our experts will handle the entire process and provide ongoing support.",
    price: 129.0,
    originalPrice: 199.0,
    currency: "GBP",
    icon: <FaCalculator className="w-6 h-6" />,
    category: "Tax & Compliance",
    deliveryTime: "3-5 business days",
    features: [
      "VAT registration application",
      "HMRC communication handling",
      "VAT compliance guidance",
      "Ongoing support for 30 days",
      "Digital VAT certificate",
    ],
    isPopular: false,
    isNew: true,
    isActive: true,
  },
  {
    id: "logo-design",
    title: "Professional Logo Design",
    description:
      "Get 3 original, custom-made logos tailored to your business style and preferences — 100% unique.",
    longDescription:
      "Professional logo design service with unlimited revisions until you're completely satisfied. Includes multiple file formats, brand guidelines, and commercial use rights.",
    price: 50.0,
    originalPrice: 99.0,
    currency: "GBP",
    icon: <FaPalette className="w-6 h-6" />,
    category: "Branding",
    deliveryTime: "2-3 business days",
    features: [
      "3 unique logo concepts",
      "Unlimited revisions",
      "Multiple file formats (PNG, SVG, EPS)",
      "Brand color palette",
      "Commercial use rights",
      "Source files included",
    ],
    isPopular: true,
    isNew: false,
    isActive: true,
  },
  {
    id: "ein-number",
    title: "US EIN Number",
    description:
      "Get your EIN in just 2-5 business days as a non-US resident. Essential for US business operations.",
    longDescription:
      "Fast EIN (Employer Identification Number) application service for international entrepreneurs looking to do business in the US. Includes IRS communication and setup guidance.",
    price: 60.0,
    originalPrice: 120.0,
    currency: "GBP",
    icon: <FaIdCard className="w-6 h-6" />,
    category: "US Business",
    deliveryTime: "2-5 business days",
    features: [
      "EIN application & submission",
      "IRS communication handling",
      "Digital EIN certificate",
      "Tax ID setup guidance",
      "Bank account opening support",
    ],
    isPopular: false,
    isNew: false,
    isActive: true,
  },
  {
    id: "uk-address-proof",
    title: "UK Proof of Address",
    description:
      "Obtain a UK proof of address accepted by Stripe and UK online banking services.",
    longDescription:
      "Official UK address verification document that satisfies KYC requirements for major financial platforms and banking services. Accepted by all major UK banks and payment processors.",
    price: 129.0,
    originalPrice: 200.0,
    currency: "GBP",
    icon: <FaMapMarkerAlt className="w-6 h-6" />,
    category: "Documentation",
    deliveryTime: "5-7 business days",
    features: [
      "Official address verification",
      "Stripe & bank accepted format",
      "Digital & physical copies",
      "Ongoing address service",
      "Utility bill format",
    ],
    isPopular: false,
    isNew: false,
    isActive: true,
  },
  {
    id: "business-insurance",
    title: "Business Insurance",
    description:
      "Protect your business with comprehensive insurance coverage tailored for UK companies.",
    longDescription:
      "Professional indemnity and public liability insurance options designed specifically for international entrepreneurs operating UK companies. Competitive rates and instant certificates.",
    price: 89.0,
    originalPrice: 150.0,
    currency: "GBP",
    icon: <FaShieldAlt className="w-6 h-6" />,
    category: "Protection",
    deliveryTime: "1-2 business days",
    features: [
      "Professional indemnity cover",
      "Public liability insurance",
      "Instant digital certificates",
      "Competitive rates",
      "Annual coverage",
    ],
    isPopular: false,
    isNew: true,
    isActive: true,
  },
  {
    id: "website-setup",
    title: "Professional Website",
    description:
      "Get a professional business website with hosting, domain, and SSL certificate included.",
    longDescription:
      "Complete website solution including modern design, mobile optimization, and business email setup to establish your online presence. SEO optimized and fully responsive.",
    price: 199.0,
    originalPrice: 399.0,
    currency: "GBP",
    icon: <FaGlobe className="w-6 h-6" />,
    category: "Digital Presence",
    deliveryTime: "5-7 business days",
    features: [
      "Modern responsive design",
      "Free domain & hosting (1 year)",
      "SSL certificate included",
      "Business email setup",
      "SEO optimization",
      "Content management system",
    ],
    isPopular: true,
    isNew: false,
    isActive: true,
  },
];

// Categories configuration
const CATEGORIES = [
  { id: "all", name: "All Services", icon: <Building2 className="w-4 h-4" /> },
  {
    id: "Tax & Compliance",
    name: "Tax & Compliance",
    icon: <FileText className="w-4 h-4" />,
  },
  { id: "Branding", name: "Branding", icon: <FaPalette className="w-4 h-4" /> },
  {
    id: "Documentation",
    name: "Documentation",
    icon: <FaFileAlt className="w-4 h-4" />,
  },
  {
    id: "US Business",
    name: "US Business",
    icon: <FaIdCard className="w-4 h-4" />,
  },
  {
    id: "Digital Presence",
    name: "Digital",
    icon: <FaGlobe className="w-4 h-4" />,
  },
  {
    id: "Protection",
    name: "Protection",
    icon: <FaShieldAlt className="w-4 h-4" />,
  },
];

// Service Card Component
const ServiceCard = ({ service, onOrder }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOrder = async () => {
    setIsLoading(true);
    try {
      await onOrder(service);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
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
        {/* Header with badges */}
        <div className="relative">
          {service.isPopular && (
            <div className="absolute -top-3 left-4 z-10">
              <Badge className="bg-blue-600 text-white px-3 py-1 text-xs font-semibold">
                Popular
              </Badge>
            </div>
          )}
          {service.isNew && (
            <div className="absolute -top-3 right-4 z-10">
              <Badge className="bg-green-600 text-white px-3 py-1 text-xs font-semibold">
                New
              </Badge>
            </div>
          )}
        </div>

        <CardHeader className="pb-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-600">{service.icon}</div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                {service.title}
              </CardTitle>
              <Badge variant="outline" className="text-xs mb-2">
                {service.category}
              </Badge>
              <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
                {service.description}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                £{service.price.toFixed(2)}
              </span>
              {service.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  £{service.originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-xs text-gray-500">
              Delivery: {service.deliveryTime}
            </p>
          </div>

          {/* Features Preview */}
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

          {/* Order Button */}
          <Button
            onClick={handleOrder}
            disabled={isLoading || !service.isActive}
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
            ) : !service.isActive ? (
              "Currently Unavailable"
            ) : (
              "Order Service"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Marketplace Component
export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const filteredServices =
    selectedCategory === "all"
      ? AVAILABLE_SERVICES.filter((service) => service.isActive)
      : AVAILABLE_SERVICES.filter(
          (service) => service.category === selectedCategory && service.isActive
        );

  const handleServiceOrder = async (service) => {
    if (!user) {
      alert("Please log in to order services.");
      window.location.href = "/login";
      return;
    }

    try {
      // Log activity
      await supabase.rpc("log_activity", {
        p_user_id: user.id,
        p_action: "service_order_initiated",
        p_description: `User initiated order for ${service.title}`,
        p_metadata: { service_id: service.id, service_title: service.title },
      });

      // Create service order record
      const { data: order, error } = await supabase
        .from("service_orders")
        .insert({
          user_id: user.id,
          service_id: service.id,
          service_title: service.title,
          service_category: service.category,
          service_description: service.description,
          price_amount: service.price,
          currency: service.currency,
          delivery_time: service.deliveryTime,
          order_details: {
            features: service.features,
            original_price: service.originalPrice,
          },
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;

      // Log successful order creation
      await supabase.rpc("log_activity", {
        p_user_id: user.id,
        p_action: "service_order_created",
        p_description: `Service order created for ${service.title}`,
        p_service_order_id: order.id,
        p_metadata: {
          order_id: order.id,
          amount: service.price,
          currency: service.currency,
        },
      });

      // Show success message and redirect to orders
      alert(`Order created successfully! Order ID: ${order.id.slice(0, 8)}`);
      window.location.href = `/dashboard/orders`;
    } catch (error) {
      console.error("Order creation error:", error);
      alert("Failed to create order. Please try again.");

      // Log error
      if (user) {
        await supabase.rpc("log_activity", {
          p_user_id: user.id,
          p_action: "service_order_failed",
          p_description: `Failed to create order for ${service.title}: ${error.message}`,
          p_metadata: { service_id: service.id, error: error.message },
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Expand your business with our additional services. From VAT
            registration to professional branding, we've got you covered.
          </p>
        </motion.div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((category) => (
            <Button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className="flex items-center gap-2"
            >
              {category.icon}
              {category.name}
            </Button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <ServiceCard service={service} onOrder={handleServiceOrder} />
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No services found
            </h3>
            <p className="text-gray-600">
              Try selecting a different category or check back later for new
              services.
            </p>
          </div>
        )}

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
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
            <Button variant="outline" className="flex items-center gap-2">
              <FaEnvelope className="w-4 h-4" />
              Email Us
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <FaPhoneAlt className="w-4 h-4" />
              Schedule a Call
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
