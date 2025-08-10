import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CustomTabs, CustomTabContent } from "@/components/ui/CustomTabs";
import { ukPackages, globalPackages } from "@/lib/packages";
import { useAuth } from "@/contexts/AuthContext";
import {
  Building2,
  ShoppingCart,
  TrendingUp,
  Package,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  Star,
  Zap,
  Crown,
  Globe,
  ArrowRight,
  Users,
  Award,
  Target,
  Sparkles,
  Check,
  FileText,
  PlusCircle,
  Loader2,
  Heart,
  Shield,
  MapPin,
  Trash2,
  AlertTriangle,
} from "lucide-react";

// ✅ PRODUCTION READY: Real status configurations
const statusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    label: "Pending Payment",
    description: "Payment required to proceed",
    progress: 10,
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: CheckCircle,
    label: "Payment Completed",
    description: "Payment received successfully",
    progress: 25,
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Clock,
    label: "In Review",
    description: "Application under review",
    progress: 50,
  },
  processing: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Building2,
    label: "Processing",
    description: "Being processed with Companies House",
    progress: 75,
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    label: "Completed",
    description: "Successfully completed",
    progress: 100,
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: AlertCircle,
    label: "Rejected",
    description: "Application rejected",
    progress: 0,
    canDelete: true,
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: AlertTriangle,
    label: "Cancelled",
    description: "Request cancelled",
    progress: 0,
    canDelete: true,
  },
};

// Updated PackageCard Component with balanced, clean design
const PackageCard = ({ packageData, onOrder, isLoading }) => {
  const isPopular = packageData.badge === "Popular";
  const isPremium =
    packageData.badge === "Premium" || packageData.badge === "Elite";

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col transition-all duration-300 relative overflow-hidden ${
          isPopular || isPremium
            ? "border-2 border-blue-200 shadow-lg bg-gradient-to-br from-white to-blue-50/30"
            : "border border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg bg-white"
        }`}
      >
        {/* Top accent line */}
        <div
          className={`absolute top-0 left-0 w-full h-1 ${
            isPopular || isPremium
              ? "bg-gradient-to-r from-blue-500 to-purple-500"
              : "bg-gray-300"
          }`}
        />

        {/* Badge */}
        {packageData.badge && (
          <div className="absolute -top-3 right-4 z-10">
            {/* <Badge
              className={`${packageData.badgeClass} text-white px-3 py-1 text-xs font-semibold shadow-md rounded-full`}
            >
              <div className="flex items-center gap-1">
                {packageData.badge === "Popular" && <Star className="h-3 w-3" />}
                {(packageData.badge === "Premium" || packageData.badge === "Elite") && <Crown className="h-3 w-3" />}
                {packageData.badge}
              </div>
            </Badge> */}
          </div>
        )}

        <CardHeader className="pb-4 pt-6">
          <div className="text-center">
            {/* Package Icon */}
            <div
              className={`w-12 h-12 mx-auto mb-3 rounded-lg flex items-center justify-center ${
                isPopular || isPremium
                  ? "bg-gradient-to-br from-blue-500 to-purple-600"
                  : "bg-gray-100"
              }`}
            >
              <Building2
                className={`h-6 w-6 ${
                  isPopular || isPremium ? "text-white" : "text-gray-600"
                }`}
              />
            </div>

            <CardTitle className="text-xl font-bold text-gray-900 mb-3">
              {packageData.name}
            </CardTitle>

            {/* Price section */}
            <div className="mb-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-base text-gray-400 line-through">
                  {packageData.oldPrice}
                </span>
                <span
                  className={`text-3xl font-bold ${
                    isPopular || isPremium ? "text-blue-600" : "text-gray-900"
                  }`}
                >
                  {packageData.price}
                </span>
              </div>
              <p className="text-sm text-gray-500">{packageData.feeText}</p>
            </div>

            {/* Save amount */}
            {packageData.oldPrice && (
              <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                Save £
                {parseInt(packageData.oldPrice.replace(/[£,]/g, "")) -
                  parseInt(packageData.price.replace(/[£,]/g, ""))}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col px-6 pb-6">
          {/* Features list */}
          <div className="flex-1 mb-6">
            <h4 className="font-medium text-gray-800 mb-3 text-sm">
              What's Included:
            </h4>
            <ul className="space-y-2">
              {packageData.features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <div className="p-0.5 bg-green-500 rounded-full flex-shrink-0 mt-1">
                    <Check className="h-2.5 w-2.5 text-white" />
                  </div>
                  <span className="leading-relaxed">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA Button with balanced design */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="space-y-3"
          >
            <Button
              onClick={() => onOrder(packageData)}
              disabled={isLoading}
              className={`w-full h-12 font-semibold text-base transition-all duration-300 relative overflow-hidden group ${
                isPopular || isPremium
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl border-0"
                  : "bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg border-0"
              } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {/* Subtle shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

              <div className="relative z-10 flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Choose This Package</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </>
                )}
              </div>
            </Button>

            {/* Secondary buttons */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add learn more functionality
                }}
              >
                <FileText className="h-3 w-3 mr-1" />
                Details
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add compare functionality
                }}
              >
                <Target className="h-3 w-3 mr-1" />
                Compare
              </Button>
            </div>
          </motion.div>

          {/* Trust indicators */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              <span>24-48h</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>Support</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ✅ PRODUCTION READY: Company Request Card with real data
const CompanyRequestCard = ({ request, onViewDetails, onDelete }) => {
  // Remove status config - no longer needed
  // const status = statusConfig[request.status] || statusConfig.pending_payment;
  // const StatusIcon = status.icon;
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();

    if (
      !confirm(
        `Are you sure you want to delete "${request.company_name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await onDelete(request.id);
    } catch (error) {
      alert("Failed to delete request. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-gray-900 mb-1">
                  {request.company_name}
                </CardTitle>
                <p className="text-sm text-gray-600">{request.package_name}</p>
                {request.package_price && (
                  <p className="text-xs text-gray-500">
                    £{parseFloat(request.package_price).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              {/* ✅ REMOVED: Status badge completely removed */}
              <p className="text-xs text-gray-500">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Delete button for cancelled/rejected only */}
            {(request.status === "cancelled" ||
              request.status === "rejected") && (
              <Button
                onClick={handleDelete}
                disabled={deleting}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* ✅ REMOVED: Status description and progress bar */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>ID: {request.id.slice(0, 8)}</span>
            </div>

            <Button
              onClick={() => onViewDetails(request)}
              variant="outline"
              size="sm"
            >
              <FileText className="mr-2 h-3 w-3" />
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Dashboard Component
export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [companyRequests, setCompanyRequests] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackageType, setSelectedPackageType] = useState("uk");
  const [orderLoading, setOrderLoading] = useState(false);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalOrders: 0,
  });

  const { user } = useAuth();
  const navigate = useNavigate();

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
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  // ✅ PRODUCTION READY: Fetch real user data

  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch company requests
        const { data: companyData, error: companyError } = await supabase
          .from("company_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (companyError) {
          console.error("Error fetching company requests:", companyError);
        }

        // Fetch service orders
        const { data: serviceData, error: serviceError } = await supabase
          .from("service_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (serviceError) {
          console.error("Error fetching service orders:", serviceError);
        }

        const companies = companyData || [];
        const services = serviceData || [];

        setCompanyRequests(companies);
        setServiceOrders(services);

        // ✅ SIMPLIFIED: Basic stats calculation (no payment tracking)
        const totalOrders = companies.length + services.length;
        const completedOrders = [
          ...companies.filter((req) => req.status === "completed"),
          ...services.filter((order) => order.status === "completed"),
        ].length;
        const pendingOrders = totalOrders - completedOrders;

        setStats({
          totalSpent: 0, // Disabled - always 0
          pendingOrders,
          completedOrders,
          totalOrders,
        });

        console.log("📊 Simplified stats:", {
          totalOrders,
          completedOrders,
          pendingOrders,
        });

        // Log activity (optional)
        try {
          await supabase.rpc("log_activity", {
            p_user_id: user.id,
            p_action: "dashboard_viewed",
            p_description: "User viewed dashboard",
            p_metadata: {
              total_orders: totalOrders,
            },
          });
        } catch (logError) {
          console.error("Error logging activity:", logError);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // ✅ DISABLED: Real-time subscriptions temporarily disabled
    /*
    const companyChannel = supabase
      .channel("user_company_requests")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "company_requests",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("🔄 Real-time company update received:", payload);

          if (payload.eventType === "UPDATE") {
            const isPaymentUpdate =
              payload.new.payment_data && !payload.old?.payment_data;
            const isStatusUpdate = payload.new.status !== payload.old?.status;

            if (isPaymentUpdate || isStatusUpdate) {
              console.log(
                "💰 Payment or status update detected, forcing full refresh..."
              );
              setTimeout(() => {
                fetchUserData();
              }, 2000);
            }

            setCompanyRequests((current) =>
              current.map((req) =>
                req.id === payload.new.id ? payload.new : req
              )
            );
          } else if (payload.eventType === "INSERT") {
            setCompanyRequests((current) => [payload.new, ...current]);
          }
        }
      )
      .subscribe((status) => {
        console.log("📡 Company subscription status:", status);
      });

    const serviceChannel = supabase
      .channel("user_service_orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_orders",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === "UPDATE") {
            setServiceOrders((current) =>
              current.map((order) =>
                order.id === payload.new.id ? payload.new : order
              )
            );
          } else if (payload.eventType === "INSERT") {
            setServiceOrders((current) => [payload.new, ...current]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(companyChannel);
      supabase.removeChannel(serviceChannel);
    };
    */

    // ✅ FIXED: No cleanup needed when real-time is disabled
    return () => {
      console.log("🧹 Dashboard cleanup completed");
    };
  }, [user]);

  // ✅ FIXED: Handle package order with proper error handling
  const handlePackageOrder = async (packageData) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setOrderLoading(true);

    try {
      // ✅ FIXED: Removed .catch() chain and used try/catch instead
      try {
        await supabase.rpc("log_activity", {
          p_user_id: user.id,
          p_action: "package_order_initiated",
          p_description: `User initiated order for ${packageData.name}`,
          p_metadata: {
            package_name: packageData.name,
            package_price: packageData.price,
          },
        });
      } catch (logError) {
        console.error("Activity logging failed:", logError);
        // Continue with order process even if logging fails
      }

      // Navigate to company formation flow with selected package
      navigate("/dashboard/company-formation", {
        state: { selectedPackage: packageData },
      });
    } catch (error) {
      console.error("Package order error:", error);
      alert("Failed to start order. Please try again.");
    } finally {
      setOrderLoading(false);
    }
  };

  const handleViewDetails = (request) => {
    navigate(`/dashboard/request/${request.id}`);
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from("company_requests")
        .delete()
        .eq("id", requestId)
        .eq("user_id", user.id); // Security: only delete own requests

      if (error) throw error;

      // Update local state
      setCompanyRequests((prev) => prev.filter((req) => req.id !== requestId));

      // Update stats
      setStats((prev) => ({
        ...prev,
        totalOrders: prev.totalOrders - 1,
      }));

      // Log activity
      try {
        await supabase.rpc("log_activity", {
          p_user_id: user.id,
          p_action: "company_request_deleted",
          p_description: "User deleted a company request",
          p_metadata: { request_id: requestId },
        });
      } catch (logError) {
        console.error("Activity logging failed:", logError);
      }
    } catch (error) {
      console.error("Error deleting request:", error);
      throw error;
    }
  };

  const tabs = [
    {
      value: "overview",
      label: "Overview",
      icon: TrendingUp,
    },
    {
      value: "packages",
      label: "Start Company",
      icon: PlusCircle,
    },
    {
      value: "companies",
      label: `My Companies (${companyRequests.length})`,
      icon: Building2,
    },
    {
      value: "services",
      label: `Services (${serviceOrders.length})`,
      icon: Package,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const packagesToShow =
    selectedPackageType === "uk" ? ukPackages : globalPackages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* ✅ MAIN CONTENT */}
      <main className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              {[
                {
                  title: "Total Orders",
                  value: stats.totalOrders,
                  icon: Package,
                  color: "bg-blue-500",
                  bgColor: "bg-blue-100",
                  textColor: "text-blue-600",
                  description: "All your orders",
                },
                {
                  title: "Completed",
                  value: stats.completedOrders,
                  icon: CheckCircle,
                  color: "green",
                  bgColor: "bg-green-100",
                  textColor: "text-green-600",
                  description: "Successfully completed",
                },
                // {
                //   title: "In Progress",
                //   value: stats.pendingOrders,
                //   icon: Clock,
                //   color: "yellow",
                //   bgColor: "bg-yellow-100",
                //   textColor: "text-yellow-600",
                //   description: "Currently processing",
                // },
                // {
                //   title: "Total Invested",
                //   value: `£${stats.totalSpent.toFixed(0)}`,
                //   icon: DollarSign,
                //   color: "purple",
                //   bgColor: "bg-purple-100",
                //   textColor: "text-purple-600",
                //   description: "Your business investment",
                // },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  whileHover={{ scale: 1.02, y: -2 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                          <stat.icon className={`h-5 w-5 ${stat.textColor}`} />
                        </div>
                        <div className="ml-4 flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">
                            {stat.title}
                          </p>
                          <motion.p
                            className="text-xl font-bold text-gray-900"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{
                              delay: index * 0.1 + 0.7,
                              type: "spring",
                            }}
                          >
                            {stat.value}
                          </motion.p>
                          <p className="text-xs text-gray-500">
                            {stat.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>

            {/* Custom Tabs */}
            <motion.div variants={itemVariants}>
              <CustomTabs
                tabs={tabs}
                defaultValue="overview"
                onChange={setActiveTab}
              >
                {/* Overview Tab */}
                <CustomTabContent value="overview" activeValue={activeTab}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Quick Start Guide */}
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          Quick Start Guide
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <span className="text-blue-600 font-bold text-sm">
                                1
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Choose Your Package
                              </h4>
                              <p className="text-xs text-gray-600">
                                Select the perfect package for your business
                                needs
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="p-2 bg-green-100 rounded-lg">
                              <span className="text-green-600 font-bold text-sm">
                                2
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Complete Formation
                              </h4>
                              <p className="text-xs text-gray-600">
                                We handle all the paperwork and registrations
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <span className="text-purple-600 font-bold text-sm">
                                3
                              </span>
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Start Trading
                              </h4>
                              <p className="text-xs text-gray-600">
                                Access banking, payment processing, and more
                              </p>
                            </div>
                          </div>

                          <Button
                            onClick={() => setActiveTab("packages")}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Start Your Company Now
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Recent Activity */}
                    <Card className="border-0 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <Award className="h-5 w-5 text-green-600" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {[
                            ...companyRequests.slice(0, 4), // ✅ FIXED: Show last 4 companies instead of 2
                            ...serviceOrders.slice(0, 1),
                          ].length === 0 ? (
                            <div className="text-center py-8">
                              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                              <p className="text-gray-500">
                                No recent activity
                              </p>
                              <Button
                                onClick={() => setActiveTab("packages")}
                                variant="outline"
                                size="sm"
                                className="mt-2"
                              >
                                Start Your First Order
                              </Button>
                            </div>
                          ) : (
                            <>
                              {companyRequests.slice(0, 4).map(
                                (
                                  request // ✅ FIXED: Show last 4 companies
                                ) => (
                                  <div
                                    key={request.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                    onClick={() => handleViewDetails(request)}
                                  >
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                      <Building2 className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm text-gray-900">
                                        {request.company_name}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {request.package_name} •{" "}
                                        {new Date(
                                          request.created_at
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                )
                              )}

                              {serviceOrders.slice(0, 1).map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                >
                                  <div className="p-2 bg-green-100 rounded-lg">
                                    <Package className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">
                                      {order.service_title}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      £
                                      {parseFloat(order.price_amount).toFixed(
                                        2
                                      )}{" "}
                                      •{" "}
                                      {new Date(
                                        order.created_at
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <Badge className="bg-green-100 text-green-800">
                                    Service
                                  </Badge>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CustomTabContent>
                {/* Packages Tab */}
                <CustomTabContent value="packages" activeValue={activeTab}>
                  <div className="space-y-8">
                    {/* Hero Section */}
                    <motion.div
                      className="text-center relative"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-3xl -z-10" />
                      <div className="relative bg-white/50 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                        >
                          <Building2 className="h-10 w-10 text-white" />
                        </motion.div>

                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent mb-4">
                          Start Your UK Company Today
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                          Join thousands of entrepreneurs who chose our expert
                          service to launch their business dreams.
                          <span className="font-semibold text-blue-600">
                            {" "}
                            Fast, secure, and fully compliant.
                          </span>
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-8 mt-6 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-gray-600">
                              2,000+ Companies Formed
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-gray-600">
                              4.9/5 Customer Rating
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-gray-600">
                              24-48 Hour Setup
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                    {/* Package Type Selector */}
                    <motion.div
                      className="flex justify-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <div className="inline-flex rounded-2xl border-2 border-gray-200 p-2 bg-white shadow-lg backdrop-blur-sm">
                        <Button
                          variant={
                            selectedPackageType === "uk" ? "default" : "ghost"
                          }
                          onClick={() => setSelectedPackageType("uk")}
                          className={`rounded-xl font-semibold px-6 py-3 transition-all duration-300 ${
                            selectedPackageType === "uk"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          UK Residents
                          {selectedPackageType === "uk" && (
                            <Badge className="ml-2 bg-white/20 text-white border-white/30">
                              Popular
                            </Badge>
                          )}
                        </Button>
                        <Button
                          variant={
                            selectedPackageType === "global"
                              ? "default"
                              : "ghost"
                          }
                          onClick={() => setSelectedPackageType("global")}
                          className={`rounded-xl font-semibold px-6 py-3 transition-all duration-300 ${
                            selectedPackageType === "global"
                              ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md"
                              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                          }`}
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          Non-UK Residents
                        </Button>
                      </div>
                    </motion.div>

                    {/* Package Description */}
                    <motion.div
                      className="text-center max-w-3xl mx-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div
                        className={`p-6 rounded-2xl border-2 transition-all duration-500 ${
                          selectedPackageType === "uk"
                            ? "bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200"
                            : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                        }`}
                      >
                        <h2 className="text-xl font-bold text-gray-900 mb-3">
                          {selectedPackageType === "uk"
                            ? "🇬🇧 Exclusive UK Resident Packages"
                            : "🌍 International Entrepreneur Packages"}
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                          {selectedPackageType === "uk"
                            ? "Take advantage of special pricing and local support services designed specifically for UK residents. Includes priority processing and dedicated UK-based customer service."
                            : "Comprehensive formation packages for international entrepreneurs. Includes additional documentation support, compliance assistance, and guidance for non-UK residents establishing their UK presence."}
                        </p>

                        {/* Special offer badge */}
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border shadow-sm">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-semibold text-gray-800">
                            Limited Time: Save up to £200 on all packages
                          </span>
                        </div>
                      </div>
                    </motion.div>

                    {/* Package Cards */}
                    <motion.div
                      className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {packagesToShow.map((packageData, index) => (
                        <motion.div
                          key={packageData.name}
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 + index * 0.1 }}
                        >
                          <PackageCard
                            packageData={packageData}
                            onOrder={handlePackageOrder}
                            isLoading={orderLoading}
                          />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Trust Section */}
                    <motion.div
                      className="bg-gradient-to-br from-gray-50 via-white to-blue-50 rounded-3xl p-8 max-w-5xl mx-auto border border-gray-200 shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                          Why Choose Our Service?
                        </h3>
                        <p className="text-gray-600">
                          Join the thousands of successful entrepreneurs who
                          trusted us with their business formation
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          {
                            icon: Shield,
                            title: "100% Secure & Compliant",
                            description:
                              "Fully regulated service with Companies House compliance",
                            color: "blue",
                          },
                          {
                            icon: Zap,
                            title: "Lightning Fast Setup",
                            description:
                              "Company formed and ready in just 24-48 hours",
                            color: "green",
                          },
                          {
                            icon: Users,
                            title: "Expert Support Team",
                            description:
                              "Dedicated specialists available throughout the process",
                            color: "purple",
                          },
                        ].map((feature, index) => (
                          <motion.div
                            key={feature.title}
                            whileHover={{ y: -5, scale: 1.02 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg border border-gray-100"
                          >
                            <div
                              className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-500 to-${feature.color}-600 rounded-xl flex items-center justify-center mb-4 shadow-lg`}
                            >
                              <feature.icon className="h-7 w-7 text-white" />
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2">
                              {feature.title}
                            </h4>
                            <p className="text-gray-600 text-sm leading-relaxed">
                              {feature.description}
                            </p>
                          </motion.div>
                        ))}
                      </div>

                      {/* Money back guarantee */}
                      {/* <div className="mt-8 text-center p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Award className="h-5 w-5 text-green-600" />
                          <span className="font-bold text-green-800">
                            100% Money-Back Guarantee
                          </span>
                        </div>
                        <p className="text-green-700 text-sm">
                          If we can't form your company for any reason, we'll
                          refund every penny. No questions asked.
                        </p>
                      </div> */}
                    </motion.div>
                  </div>
                </CustomTabContent>
                {/* Companies Tab */}
                <CustomTabContent value="companies" activeValue={activeTab}>
                  {companyRequests.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="text-center py-12">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Building2 className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Ready to Start Your Business?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Get your UK company formed with our expert service.
                          Choose from our carefully designed packages.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                          <Button
                            onClick={() => setActiveTab("packages")}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Start Company Formation
                          </Button>
                          <Button asChild variant="outline">
                            <Link to="/dashboard/marketplace">
                              <ShoppingCart className="mr-2 h-4 w-4" />
                              Browse Services
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Your Company Requests ({companyRequests.length})
                        </h2>
                        <Button
                          onClick={() => setActiveTab("packages")}
                          variant="outline"
                          size="sm"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add New Company
                        </Button>
                      </div>
                      {companyRequests.map((request) => (
                        <CompanyRequestCard
                          key={request.id}
                          request={request}
                          onViewDetails={handleViewDetails}
                          onDelete={handleDeleteRequest}
                        />
                      ))}
                    </div>
                  )}
                </CustomTabContent>
                {/* Services Tab */}
                <CustomTabContent value="services" activeValue={activeTab}>
                  {serviceOrders.length === 0 ? (
                    <Card className="border-0 shadow-lg">
                      <CardContent className="text-center py-12">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Package className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Explore Our Services
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          Discover additional services to grow your business
                          including VAT registration, banking assistance, and
                          more.
                        </p>
                        <Button
                          asChild
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Link to="/dashboard/marketplace">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Browse Marketplace
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Your Service Orders ({serviceOrders.length})
                        </h2>
                        <Button asChild variant="outline" size="sm">
                          <Link to="/dashboard/marketplace">
                            <Package className="mr-2 h-4 w-4" />
                            Browse More Services
                          </Link>
                        </Button>
                      </div>
                      {serviceOrders.map((order) => (
                        <Card
                          key={order.id}
                          className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500"
                        >
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <Package className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <CardTitle className="text-base font-bold text-gray-900 mb-1">
                                    {order.service_title}
                                  </CardTitle>
                                  <p className="text-sm text-gray-600">
                                    {order.service_category}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    £{parseFloat(order.price_amount).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <Badge className="bg-green-100 text-green-800 border border-green-300">
                                  {order.status}
                                </Badge>
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <p className="text-sm text-gray-600 mb-3">
                              {order.service_description}
                            </p>
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/dashboard/orders/${order.id}`}>
                                <FileText className="mr-2 h-3 w-3" />
                                View Details
                              </Link>
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CustomTabContent>
              </CustomTabs>
            </motion.div>
          </motion.div>
        </div>
      </main>

      {/* ✅ BEAUTIFUL FOOTER */}
      <footer className="bg-white/80 backdrop-blur-xl border-t border-gray-200/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <span>© 2025 GoFormed Ltd.</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>All Systems Operational</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 text-xs text-gray-500 font-normal">
              Welcome back, {user?.email?.split("@")[0]} 👋
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
