// src/pages/DashboardPage.jsx - Improved with animations and better spacing
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Loader from "@/components/ui/Loader";
import { ukPackages, globalPackages } from "@/lib/packages";
import {
  FaPlus,
  FaSpinner,
  FaEye,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle,
  FaShoppingBag,
  FaBuilding,
  FaChartLine,
  FaStar,
  FaArrowRight,
  FaGlobe,
  FaUsers,
  FaChartBar,
} from "react-icons/fa";
import { Check, Crown, Sparkles, Star, Building2, Zap } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const cardHoverVariants = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -5,
    transition: {
      duration: 0.2,
      ease: "easeOut",
    },
  },
};

// Package Card Component
const PackageCard = ({ plan, onSelect, isPopular = false }) => {
  const getBadgeIcon = (badge) => {
    switch (badge) {
      case "Premium":
        return <Crown className="w-3 h-3" />;
      case "Elite":
        return <Sparkles className="w-3 h-3" />;
      default:
        return <Star className="w-3 h-3" />;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Premium":
        return "bg-purple-600";
      case "Elite":
        return "bg-gray-800";
      default:
        return "bg-green-600";
    }
  };

  return (
    <motion.div
      variants={cardHoverVariants}
      initial="rest"
      whileHover="hover"
      className="group h-full"
    >
      <Card
        className={`relative h-full transition-all duration-300 hover:shadow-xl ${
          isPopular
            ? "border-2 border-blue-500 shadow-lg"
            : "border hover:border-gray-300"
        }`}
      >
        {/* Badge */}
        <div className="absolute -top-3 right-4 z-10">
          <motion.div
            className={`${getBadgeColor(
              plan.badge
            )} text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1`}
            whileHover={{ scale: 1.05 }}
          >
            {getBadgeIcon(plan.badge)}
            {plan.badge}
          </motion.div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-gray-900 mb-2 pr-16">
            {plan.name}
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-sm text-gray-400 line-through font-medium">
                {plan.oldPrice}
              </span>
              <span className="text-2xl font-bold text-gray-900">
                {plan.price}
              </span>
            </div>
            <p className="text-xs text-gray-500">{plan.feeText}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col">
          <ul className="space-y-2 flex-1">
            {plan.features.slice(0, 3).map((feature) => (
              <li key={feature} className="flex items-start gap-2">
                <Check className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600 leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
            {plan.features.length > 3 && (
              <li className="text-xs text-gray-500 pl-5">
                +{plan.features.length - 3} more features
              </li>
            )}
          </ul>

          <div className="pt-3">
            <Button
              onClick={() => onSelect(plan)}
              className={`w-full font-semibold text-sm transition-all duration-300 transform group-hover:scale-105 ${
                isPopular
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              Select Package
              <FaArrowRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Status configuration
const statusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    label: "Pending Payment",
    description: "Complete payment to start your company formation",
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaEye,
    label: "In Review",
    description: "Our team is reviewing your application",
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: FaExclamationTriangle,
    label: "Documents Required",
    description: "Please upload the requested documents",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    label: "Completed",
    description: "Your company has been successfully formed",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    label: "Rejected",
    description: "Please contact support for assistance",
  },
};

// Payment Button Component
const PaymentButton = ({ request }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const shopifyInfo = [...ukPackages, ...globalPackages].find(
        (pkg) => pkg.name === request.package_name
      );

      if (!shopifyInfo?.variantId) {
        throw new Error(
          `Payment info not found for package: ${request.package_name}`
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please log in to continue");
      }

      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            variantId: shopifyInfo.variantId,
            productId: shopifyInfo.shopifyProductId,
            requestId: request.id,
          },
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) throw error;

      if (data?.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error("Checkout URL not received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(`Payment could not be initiated: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 text-sm"
    >
      {isProcessing ? (
        <>
          <FaSpinner className="animate-spin mr-2 h-3 w-3" />
          Processing...
        </>
      ) : (
        <>
          <FaShoppingBag className="mr-2 h-3 w-3" />
          Pay Now
        </>
      )}
    </Button>
  );
};

// Request Card Component
const RequestCard = ({ request }) => {
  const status = statusConfig[request.status] || statusConfig.pending_payment;
  const StatusIcon = status.icon;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-base font-bold text-gray-900 mb-1">
                {request.company_name}
              </CardTitle>
              <p className="text-sm text-gray-600">{request.package_name}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${status.color}`}
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(request.created_at).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">{status.description}</p>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>ID: {request.id.slice(0, 8)}</span>
            </div>

            <div className="flex gap-2">
              {request.status === "pending_payment" && (
                <PaymentButton request={request} />
              )}

              {[
                "in_review",
                "documents_requested",
                "completed",
                "rejected",
              ].includes(request.status) && (
                <Button asChild variant="outline" size="sm">
                  <Link to={`/dashboard/request/${request.id}`}>
                    <FaEye className="mr-2 h-3 w-3" />
                    View Details
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Dashboard Component
export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [showPackageModal, setShowPackageModal] = useState(false);

  // Fetch user requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("User not found");

        const { data, error } = await supabase
          .from("company_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

    // Real-time subscription
    const channel = supabase
      .channel("company_requests_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "company_requests",
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setRequests((currentRequests) =>
              currentRequests.map((req) =>
                req.id === payload.new.id ? payload.new : req
              )
            );
          } else if (payload.eventType === "INSERT") {
            setRequests((currentRequests) => [payload.new, ...currentRequests]);
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handlePackageSelect = async (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageModal(true);
  };

  const handleCreateRequest = async () => {
    if (!companyName.trim()) {
      alert("Please enter a company name");
      return;
    }

    const normalizedName = companyName.trim().toUpperCase();
    if (
      !normalizedName.endsWith("LTD") &&
      !normalizedName.endsWith("LIMITED")
    ) {
      alert("Company name must end with 'LTD' or 'LIMITED'");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      // Check for duplicates
      const { data: existingRequests } = await supabase
        .from("company_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("company_name", normalizedName);

      if (existingRequests && existingRequests.length > 0) {
        alert("You already have a request for this company name");
        return;
      }

      const { error } = await supabase.from("company_requests").insert({
        user_id: user.id,
        company_name: normalizedName,
        package_name: selectedPackage.name,
        status: "pending_payment",
      });

      if (error) throw error;

      setShowPackageModal(false);
      setCompanyName("");
      setSelectedPackage(null);
      setActiveTab("overview");
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  if (loading) return <Loader />;

  const completedRequests = requests.filter(
    (r) => r.status === "completed"
  ).length;
  const pendingRequests = requests.filter(
    (r) => r.status !== "completed"
  ).length;

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome Back!</h1>
          <p className="text-gray-600 mt-1">
            Track and manage your company formation journey
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("packages")}
          className="bg-blue-600 hover:bg-blue-700 font-semibold flex items-center gap-2"
        >
          <FaPlus className="h-4 w-4" />
          Start New Company
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaBuilding className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Total Companies
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {requests.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FaCheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-xl font-bold text-gray-900">
                    {completedRequests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FaClock className="h-5 w-5 text-yellow-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-xl font-bold text-gray-900">
                    {pendingRequests}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }}>
          <Card className="hover:shadow-md transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FaChartBar className="h-5 w-5 text-purple-600" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Success Rate
                  </p>
                  <p className="text-xl font-bold text-gray-900">98%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="packages">Choose Package</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <AnimatePresence>
              {requests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Ready to Start Your Business?
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Choose a package and begin your entrepreneurial journey
                        with us
                      </p>
                      <Button
                        onClick={() => setActiveTab("packages")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Choose Package
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  className="space-y-4"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <h2 className="text-xl font-semibold text-gray-900">
                    Your Company Requests
                  </h2>
                  {requests.map((request) => (
                    <RequestCard key={request.id} request={request} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </TabsContent>

          <TabsContent value="packages" className="mt-6">
            <motion.div
              className="space-y-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.div variants={itemVariants} className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Choose Your Perfect Package
                </h2>
                <p className="text-gray-600">
                  Select the right package for your business needs and get
                  started today
                </p>
              </motion.div>

              <Tabs defaultValue="uk" className="w-full">
                <motion.div variants={itemVariants}>
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="uk" className="flex items-center gap-2">
                      <FaBuilding className="h-4 w-4" />
                      UK Residents
                    </TabsTrigger>
                    <TabsTrigger
                      value="global"
                      className="flex items-center gap-2"
                    >
                      <FaGlobe className="h-4 w-4" />
                      International
                    </TabsTrigger>
                  </TabsList>
                </motion.div>

                <TabsContent value="uk">
                  <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {ukPackages.map((plan, index) => (
                      <motion.div key={plan.name} variants={itemVariants}>
                        <PackageCard
                          plan={plan}
                          onSelect={handlePackageSelect}
                          isPopular={plan.badge === "Popular"}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>

                <TabsContent value="global">
                  <motion.div
                    className="grid md:grid-cols-2 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {globalPackages.map((plan, index) => (
                      <motion.div key={plan.name} variants={itemVariants}>
                        <PackageCard
                          plan={plan}
                          onSelect={handlePackageSelect}
                          isPopular={plan.badge === "Elite"}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Package Selection Modal */}
      <AnimatePresence>
        {showPackageModal && selectedPackage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Company Formation
                    </h3>
                    <p className="text-sm text-gray-600">
                      {selectedPackage.name}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Package Details:
                    </h4>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span className="text-lg text-gray-400 line-through">
                        {selectedPackage.oldPrice}
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {selectedPackage.price}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {selectedPackage.feeText}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) =>
                        setCompanyName(e.target.value.toUpperCase())
                      }
                      placeholder="e.g., MYCOMPANY LTD"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Must end with "LTD" or "LIMITED"
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => {
                        setShowPackageModal(false);
                        setCompanyName("");
                        setSelectedPackage(null);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateRequest}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      Create Request
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
