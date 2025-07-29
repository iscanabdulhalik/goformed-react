// src/pages/MarketplacePage.jsx - Ek Hizmetler Marketplace
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Building2, CreditCard, FileText, MapPin } from "lucide-react";

// Ek hizmetler data
const additionalServices = [
  {
    id: "vat-registration",
    title: "VAT Registration",
    description:
      "Get your company registered for VAT with HMRC. Essential for businesses with turnover over £85,000.",
    longDescription:
      "Complete VAT registration service including application submission, communication with HMRC, and guidance on VAT compliance requirements.",
    price: "$129",
    originalPrice: "$199",
    currency: "USD",
    icon: <FaCalculator className="w-6 h-6" />,
    category: "Tax & Compliance",
    deliveryTime: "3-5 business days",
    features: [
      "VAT registration application",
      "HMRC communication handling",
      "VAT compliance guidance",
      "Ongoing support for 30 days",
    ],
    isPopular: false,
    isNew: true,
  },
  {
    id: "logo-design",
    title: "Logo Design",
    description:
      "Get 3 original, custom-made logos tailored to your business style and preferences — 100% unique.",
    longDescription:
      "Professional logo design service with unlimited revisions until you're completely satisfied. Includes multiple file formats and brand guidelines.",
    price: "$50",
    originalPrice: "$99",
    currency: "USD",
    icon: <FaPalette className="w-6 h-6" />,
    category: "Branding",
    deliveryTime: "2-3 business days",
    features: [
      "3 unique logo concepts",
      "Unlimited revisions",
      "Multiple file formats (PNG, SVG, EPS)",
      "Brand color palette",
      "Commercial use rights",
    ],
    isPopular: true,
    isNew: false,
  },
  {
    id: "ein-number",
    title: "EIN Number",
    description:
      "Get your EIN in just 2-5 business days as a non-US resident. Essential for US business operations.",
    longDescription:
      "Fast EIN (Employer Identification Number) application service for international entrepreneurs looking to do business in the US.",
    price: "$60",
    originalPrice: "$120",
    currency: "USD",
    icon: <FaIdCard className="w-6 h-6" />,
    category: "US Business",
    deliveryTime: "2-5 business days",
    features: [
      "EIN application & submission",
      "IRS communication handling",
      "Digital EIN certificate",
      "Tax ID setup guidance",
    ],
    isPopular: false,
    isNew: false,
  },
  {
    id: "uk-address-proof",
    title: "UK Proof of Address",
    description:
      "Obtain a UK proof of address accepted by Stripe and UK online banking services.",
    longDescription:
      "Official UK address verification document that satisfies KYC requirements for major financial platforms and banking services.",
    price: "$129",
    originalPrice: "$200",
    currency: "USD",
    icon: <FaMapMarkerAlt className="w-6 h-6" />,
    category: "Documentation",
    deliveryTime: "5-7 business days",
    features: [
      "Official address verification",
      "Stripe & bank accepted format",
      "Digital & physical copies",
      "Ongoing address service",
    ],
    isPopular: false,
    isNew: false,
  },
  {
    id: "business-insurance",
    title: "Business Insurance",
    description:
      "Protect your business with comprehensive insurance coverage tailored for UK companies.",
    longDescription:
      "Professional indemnity and public liability insurance options designed specifically for international entrepreneurs operating UK companies.",
    price: "$89",
    originalPrice: "$150",
    currency: "USD",
    icon: <FaShieldAlt className="w-6 h-6" />,
    category: "Protection",
    deliveryTime: "1-2 business days",
    features: [
      "Professional indemnity cover",
      "Public liability insurance",
      "Instant digital certificates",
      "Competitive rates",
    ],
    isPopular: false,
    isNew: true,
  },
  {
    id: "website-setup",
    title: "Professional Website",
    description:
      "Get a professional business website with hosting, domain, and SSL certificate included.",
    longDescription:
      "Complete website solution including modern design, mobile optimization, and business email setup to establish your online presence.",
    price: "$199",
    originalPrice: "$399",
    currency: "USD",
    icon: <FaGlobe className="w-6 h-6" />,
    category: "Digital Presence",
    deliveryTime: "5-7 business days",
    features: [
      "Modern responsive design",
      "Free domain & hosting (1 year)",
      "SSL certificate included",
      "Business email setup",
      "SEO optimization",
    ],
    isPopular: true,
    isNew: false,
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
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                {service.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-bold text-gray-900">
                {service.price}
              </span>
              {service.originalPrice && (
                <span className="text-lg text-gray-400 line-through">
                  {service.originalPrice}
                </span>
              )}
              <span className="text-sm text-gray-500">Total amount</span>
            </div>
            <p className="text-xs text-gray-500">
              Delivery: {service.deliveryTime}
            </p>
          </div>

          {/* Features */}
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
              "Order"
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Service Detail Modal
const ServiceDetailModal = ({ service, isOpen, onClose, onOrder }) => {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !service) return null;

  const handleOrder = async () => {
    setIsLoading(true);
    try {
      await onOrder(service);
      onClose();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-blue-600 text-xl">{service.icon}</div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {service.title}
                </h2>
                <Badge variant="outline" className="text-sm">
                  {service.category}
                </Badge>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          {/* Description */}
          <div className="mb-6">
            <p className="text-gray-700 leading-relaxed">
              {service.longDescription}
            </p>
          </div>

          {/* Price and Delivery */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-3xl font-bold text-gray-900">
                    {service.price}
                  </span>
                  {service.originalPrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {service.originalPrice}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">Total amount</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {service.deliveryTime}
                </p>
                <p className="text-xs text-gray-500">Delivery time</p>
              </div>
            </div>
          </div>

          {/* All Features */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              What's Included:
            </h3>
            <div className="grid gap-3">
              {service.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                >
                  <FaCheck className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Order Button */}
          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">
              Close
            </Button>
            <Button
              onClick={handleOrder}
              disabled={isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                  Processing...
                </>
              ) : (
                `Order ${service.price}`
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Categories
const categories = [
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

// Main Component
export default function MarketplacePage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const filteredServices =
    selectedCategory === "all"
      ? additionalServices
      : additionalServices.filter(
          (service) => service.category === selectedCategory
        );

  const handleServiceOrder = async (service) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Hizmet siparişi vermek için giriş yapmanız gerekiyor.");
        return;
      }

      // Burada gerçek sipariş işlemi yapılabilir
      // Örneğin: Stripe checkout, database'e sipariş kaydetme vs.
      console.log("Ordering service:", service.id, "for user:", user.email);

      // Demo için alert gösterelim
      alert(
        `${service.title} hizmeti için sipariş alındı! Size en kısa sürede dönüş yapılacak.`
      );
    } catch (error) {
      console.error("Order error:", error);
      alert("Sipariş sırasında hata oluştu. Lütfen tekrar deneyin.");
    }
  };

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
          {categories.map((category) => (
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
              onClick={() => {
                setSelectedService(service);
                setShowModal(true);
              }}
              className="cursor-pointer"
            >
              <ServiceCard
                service={service}
                onOrder={(service) => {
                  setSelectedService(service);
                  setShowModal(true);
                }}
              />
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

      {/* Service Detail Modal */}
      <ServiceDetailModal
        service={selectedService}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedService(null);
        }}
        onOrder={handleServiceOrder}
      />
    </div>
  );
}
