// src/pages/DashboardPage.jsx - Production ready version with real data
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
} from "lucide-react";

// ✅ PRODUCTION READY: Real status configurations
const statusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    label: "Pending Payment",
    description: "Complete payment to start your company formation",
    progress: 10,
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: CheckCircle,
    label: "Payment Completed",
    description: "Payment received, starting review process",
    progress: 25,
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Clock,
    label: "In Review",
    description: "Our team is reviewing your application",
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
    description: "Application rejected - contact support",
    progress: 0,
  },
};

// Package Card Component
const PackageCard = ({ packageData, onOrder, isLoading }) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card
        className={`h-full flex flex-col transition-all duration-300 hover:shadow-xl relative overflow-hidden ${
          packageData.badge === "Popular" ||
          packageData.badge === "Premium" ||
          packageData.badge === "Elite"
            ? "border-2 border-blue-500 shadow-lg"
            : "border hover:border-gray-300"
        }`}
      >
        {/* Gradient background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

        {/* Badge */}
        {packageData.badge && (
          <div className="absolute -top-3 right-4 z-10">
            <Badge
              className={`${packageData.badgeClass} text-white px-3 py-1 text-xs font-bold shadow-lg`}
            >
              {packageData.badge}
            </Badge>
          </div>
        )}

        <CardHeader className="pb-4 pt-6">
          <div className="text-center">
            <CardTitle className="text-xl font-bold text-gray-900 mb-2">
              {packageData.name}
            </CardTitle>

            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg text-gray-400 line-through">
                {packageData.oldPrice}
              </span>
              <span className="text-3xl font-bold text-blue-600">
                {packageData.price}
              </span>
            </div>

            <p className="text-xs text-gray-500">{packageData.feeText}</p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <ul className="space-y-3 text-sm text-gray-600 flex-1 mb-6">
            {packageData.features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>{feature}</span>
              </motion.li>
            ))}
          </ul>

          <Button
            onClick={() => onOrder(packageData)}
            disabled={isLoading}
            className={`w-full font-semibold transition-all duration-300 ${
              packageData.badge === "Popular" ||
              packageData.badge === "Premium" ||
              packageData.badge === "Elite"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gray-900 hover:bg-gray-800 text-white"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Choose This Package
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ✅ PRODUCTION READY: Company Request Card with real data
const CompanyRequestCard = ({ request, onViewDetails }) => {
  const status = statusConfig[request.status] || statusConfig.pending_payment;
  const StatusIcon = status.icon;

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
              <Badge className={`${status.color} border text-xs`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(request.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">{status.description}</p>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>

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
          // Continue with empty array instead of failing
        }

        // Fetch service orders
        const { data: serviceData, error: serviceError } = await supabase
          .from("service_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (serviceError) {
          console.error("Error fetching service orders:", serviceError);
          // Continue with empty array instead of failing
        }

        const companies = companyData || [];
        const services = serviceData || [];

        setCompanyRequests(companies);
        setServiceOrders(services);

        // ✅ PRODUCTION READY: Calculate real stats
        const totalSpent = [
          ...companies.map((req) => parseFloat(req.package_price || 0)),
          ...services.map((order) => parseFloat(order.price_amount || 0)),
        ].reduce((sum, amount) => sum + amount, 0);

        const totalOrders = companies.length + services.length;

        const completedOrders = [
          ...companies.filter((req) => req.status === "completed"),
          ...services.filter((order) => order.status === "completed"),
        ].length;

        const pendingOrders = totalOrders - completedOrders;

        setStats({
          totalSpent,
          pendingOrders,
          completedOrders,
          totalOrders,
        });

        // ✅ PRODUCTION READY: Log activity
        await supabase
          .rpc("log_activity", {
            p_user_id: user.id,
            p_action: "dashboard_viewed",
            p_description: "User viewed dashboard",
            p_metadata: {
              total_orders: totalOrders,
              total_spent: totalSpent,
            },
          })
          .catch(() => {
            // Fail silently if activity logging fails
          });
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // ✅ PRODUCTION READY: Real-time subscriptions for live updates
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
          if (payload.eventType === "UPDATE") {
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
      .subscribe();

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
  }, [user]);

  // ✅ PRODUCTION READY: Handle package order with proper error handling
  const handlePackageOrder = async (packageData) => {
    if (!user) {
      navigate("/login");
      return;
    }

    setOrderLoading(true);

    try {
      // Log activity
      await supabase
        .rpc("log_activity", {
          p_user_id: user.id,
          p_action: "package_order_initiated",
          p_description: `User initiated order for ${packageData.name}`,
          p_metadata: {
            package_name: packageData.name,
            package_price: packageData.price,
          },
        })
        .catch(() => {
          // Fail silently if activity logging fails
        });

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
      <div className="flex items-center justify-center py-12">
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
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ✅ PRODUCTION READY: Enhanced Stats Cards with real data */}
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
          {
            title: "In Progress",
            value: stats.pendingOrders,
            icon: Clock,
            color: "yellow",
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-600",
            description: "Currently processing",
          },
          {
            title: "Total Invested",
            value: `£${stats.totalSpent.toFixed(0)}`,
            icon: DollarSign,
            color: "purple",
            bgColor: "bg-purple-100",
            textColor: "text-purple-600",
            description: "Your business investment",
          },
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
                      transition={{ delay: index * 0.1 + 0.7, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Custom Tabs */}
      <motion.div variants={itemVariants}>
        <CustomTabs tabs={tabs} defaultValue="overview" onChange={setActiveTab}>
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
                          Select the perfect package for your business needs
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
                      ...companyRequests.slice(0, 2),
                      ...serviceOrders.slice(0, 1),
                    ].length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-500">No recent activity</p>
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
                        {companyRequests.slice(0, 2).map((request) => (
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
                            <Badge
                              className={
                                statusConfig[request.status]?.color ||
                                statusConfig.pending_payment.color
                              }
                            >
                              {statusConfig[request.status]?.label || "Pending"}
                            </Badge>
                          </div>
                        ))}

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
                                £{parseFloat(order.price_amount).toFixed(2)} •{" "}
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
            <div className="space-y-6">
              {/* Package Type Selector */}
              <div className="flex justify-center">
                <div className="inline-flex rounded-xl border p-1 bg-gray-100">
                  <Button
                    variant={selectedPackageType === "uk" ? "default" : "ghost"}
                    onClick={() => setSelectedPackageType("uk")}
                    className="rounded-lg font-semibold"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    UK Residents
                  </Button>
                  <Button
                    variant={
                      selectedPackageType === "global" ? "default" : "ghost"
                    }
                    onClick={() => setSelectedPackageType("global")}
                    className="rounded-lg font-semibold"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Non-UK Residents
                  </Button>
                </div>
              </div>

              {/* Package Description */}
              <div className="text-center max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Choose Your Perfect Package
                </h2>
                <p className="text-gray-600">
                  {selectedPackageType === "uk"
                    ? "Special packages designed for UK residents with local support and competitive pricing."
                    : "Comprehensive packages for international entrepreneurs looking to establish their UK presence."}
                </p>
              </div>

              {/* Package Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {packagesToShow.map((packageData) => (
                  <PackageCard
                    key={packageData.name}
                    packageData={packageData}
                    onOrder={handlePackageOrder}
                    isLoading={orderLoading}
                  />
                ))}
              </div>

              {/* Additional Features */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 max-w-4xl mx-auto">
                <h3 className="text-lg font-bold text-center text-gray-900 mb-4">
                  What's Included in Every Package
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-sm">Secure & Legal</h4>
                      <p className="text-xs text-gray-600">
                        Fully compliant with UK regulations
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Zap className="h-5 w-5 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-sm">Fast Setup</h4>
                      <p className="text-xs text-gray-600">
                        Company formed in 24-48 hours
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                    <Heart className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-semibold text-sm">
                        Lifetime Support
                      </h4>
                      <p className="text-xs text-gray-600">
                        Ongoing assistance included
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
                    Get your UK company formed with our expert service. Choose
                    from our carefully designed packages.
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
                    Discover additional services to grow your business including
                    VAT registration, banking assistance, and more.
                  </p>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
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
                            {new Date(order.created_at).toLocaleDateString()}
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
  );
}
