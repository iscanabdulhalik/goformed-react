// src/pages/DashboardPage.jsx - Production Ready with Real Data
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Loader from "@/components/ui/Loader";
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
  FaChartBar,
  FaArrowRight,
  FaGlobe,
} from "react-icons/fa";
import {
  Check,
  Crown,
  Sparkles,
  Star,
  Building2,
  Zap,
  Sunrise,
  Sun,
  Moon,
  Sunset,
  ShoppingCart,
  TrendingUp,
  Package,
  AlertCircle,
  DollarSign,
} from "lucide-react";

// Time-based greeting
const getTimeBasedGreeting = (userName) => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Good Morning, ${userName}!`,
      message: "Ready to build something amazing today?",
      icon: <Sunrise className="w-5 h-5" />,
      gradient: "from-orange-400 via-yellow-400 to-orange-500",
      bgGradient: "from-orange-50 to-yellow-50",
      iconColor: "text-orange-500",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: `Good Afternoon, ${userName}!`,
      message: "Keep up the great work on your business journey",
      icon: <Sun className="w-5 h-5" />,
      gradient: "from-blue-400 via-cyan-400 to-blue-500",
      bgGradient: "from-blue-50 to-cyan-50",
      iconColor: "text-blue-500",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: `Good Evening, ${userName}!`,
      message: "Time to review your progress and plan ahead",
      icon: <Sunset className="w-5 h-5" />,
      gradient: "from-purple-400 via-pink-400 to-red-500",
      bgGradient: "from-purple-50 to-pink-50",
      iconColor: "text-purple-500",
    };
  } else {
    return {
      greeting: `Good Night, ${userName}!`,
      message: "Working late? Your dedication will pay off",
      icon: <Moon className="w-5 h-5" />,
      gradient: "from-indigo-400 via-purple-400 to-indigo-600",
      bgGradient: "from-indigo-50 to-purple-50",
      iconColor: "text-indigo-500",
    };
  }
};

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

// Status configurations
const companyStatusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    label: "Pending Payment",
    description: "Complete payment to start your company formation",
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaCheckCircle,
    label: "Payment Completed",
    description: "Payment received, starting review process",
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaSpinner,
    label: "In Review",
    description: "Our team is reviewing your application",
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: FaExclamationTriangle,
    label: "Documents Required",
    description: "Please upload the requested documents",
  },
  processing: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: FaSpinner,
    label: "Processing",
    description: "Your company is being processed with Companies House",
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

const serviceStatusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    label: "Pending",
    description: "Service order is being processed",
  },
  confirmed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaCheckCircle,
    label: "Confirmed",
    description: "Service order has been confirmed",
  },
  in_progress: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: FaSpinner,
    label: "In Progress",
    description: "Service is being worked on",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    label: "Completed",
    description: "Service has been completed successfully",
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    label: "Cancelled",
    description: "Service order was cancelled",
  },
};

// Company Request Card Component
const CompanyRequestCard = ({ request }) => {
  const status =
    companyStatusConfig[request.status] || companyStatusConfig.pending_payment;
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaBuilding className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-gray-900 mb-1">
                  {request.company_name}
                </CardTitle>
                <p className="text-sm text-gray-600">{request.package_name}</p>
                {request.package_price && (
                  <p className="text-xs text-gray-500">
                    £{request.package_price}
                  </p>
                )}
              </div>
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
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>ID: {request.id.slice(0, 8)}</span>
              {request.assigned_admin_id && (
                <span className="flex items-center gap-1">
                  <FaBuilding className="h-3 w-3" />
                  Assigned
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/dashboard/request/${request.id}`}>
                  <FaEye className="mr-2 h-3 w-3" />
                  View Details
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Service Order Card Component
const ServiceOrderCard = ({ order }) => {
  const status =
    serviceStatusConfig[order.status] || serviceStatusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.01 }}
      className="group"
    >
      <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-green-500">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaShoppingBag className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-gray-900 mb-1">
                  {order.service_title}
                </CardTitle>
                <p className="text-sm text-gray-600">
                  {order.service_category}
                </p>
                <p className="text-xs text-gray-500">£{order.price_amount}</p>
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold border ${status.color}`}
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(order.created_at).toLocaleDateString("en-US")}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 mb-3">{status.description}</p>

          {order.delivery_time && (
            <p className="text-xs text-gray-500 mb-2">
              Expected delivery: {order.delivery_time}
            </p>
          )}

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Order: {order.id.slice(0, 8)}</span>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to={`/dashboard/orders/${order.id}`}>
                  <FaEye className="mr-2 h-3 w-3" />
                  View Order
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Custom Tab Component
const CustomTab = ({ activeTab, setActiveTab, tabs, children }) => {
  return (
    <div className="w-full">
      {/* Tab List */}
      <div className="flex space-x-1 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === tab.value
                ? "bg-blue-600 text-white shadow-lg transform scale-105"
                : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">{children}</div>
    </div>
  );
};

// Main Dashboard Component
export default function DashboardPage() {
  const [companyRequests, setCompanyRequests] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const [timeGreeting, setTimeGreeting] = useState(null);
  const [stats, setStats] = useState({
    totalSpent: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentActivity: [],
  });

  // Get user and set up greeting
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;

        setUser(user);

        if (user) {
          const userName =
            user.user_metadata?.full_name ||
            user.email?.split("@")[0] ||
            "User";
          setTimeGreeting(getTimeBasedGreeting(userName));
        }
      } catch (error) {
        console.error("Error getting user:", error);
        setError("Failed to load user information");
      }
    };
    getUser();
  }, []);

  // Update greeting every minute
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const userName =
        user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
      setTimeGreeting(getTimeBasedGreeting(userName));
    }, 60000);

    return () => clearInterval(interval);
  }, [user]);

  // Fetch user data
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        // Fetch company requests
        const { data: companyData, error: companyError } = await supabase
          .from("company_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (companyError) throw companyError;

        // Fetch service orders
        const { data: serviceData, error: serviceError } = await supabase
          .from("service_orders")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (serviceError) throw serviceError;

        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from("activity_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (activityError) throw activityError;

        setCompanyRequests(companyData || []);
        setServiceOrders(serviceData || []);

        // Calculate stats
        const totalSpent = [
          ...(companyData || []).map((req) =>
            parseFloat(req.package_price || 0)
          ),
          ...(serviceData || []).map((order) =>
            parseFloat(order.price_amount || 0)
          ),
        ].reduce((sum, amount) => sum + amount, 0);

        const pendingOrders = [
          ...(companyData || []).filter((req) =>
            ["pending_payment", "in_review", "processing"].includes(req.status)
          ),
          ...(serviceData || []).filter((order) =>
            ["pending", "confirmed", "in_progress"].includes(order.status)
          ),
        ].length;

        const completedOrders = [
          ...(companyData || []).filter((req) => req.status === "completed"),
          ...(serviceData || []).filter(
            (order) => order.status === "completed"
          ),
        ].length;

        setStats({
          totalSpent,
          pendingOrders,
          completedOrders,
          recentActivity: activityData || [],
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Real-time subscriptions
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

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalOrders = companyRequests.length + serviceOrders.length;

  const tabs = [
    { value: "overview", label: "Overview", icon: FaBuilding },
    {
      value: "companies",
      label: `Companies (${companyRequests.length})`,
      icon: Building2,
    },
    {
      value: "services",
      label: `Services (${serviceOrders.length})`,
      icon: FaShoppingBag,
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Enhanced Header with Time-based Greeting */}
      {timeGreeting && (
        <motion.div
          variants={itemVariants}
          className={`bg-gradient-to-r ${timeGreeting.bgGradient} rounded-xl p-6 relative overflow-hidden`}
        >
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-4 right-4 w-24 h-24 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 left-4 w-16 h-16 bg-white rounded-full animate-pulse delay-1000"></div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <motion.div
                className={`p-3 bg-white rounded-full ${timeGreeting.iconColor}`}
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 3,
                }}
              >
                {timeGreeting.icon}
              </motion.div>
              <div>
                <motion.h1
                  className="text-lg font-bold text-gray-900"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {timeGreeting.greeting}
                </motion.h1>
                <motion.p
                  className="text-gray-700 mt-1 text-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  {timeGreeting.message}
                </motion.p>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                asChild
                className={`bg-gradient-to-r ${timeGreeting.gradient} hover:shadow-lg font-semibold flex items-center gap-2 px-4 py-2 text-sm`}
              >
                <Link to="/dashboard/marketplace">
                  <FaPlus className="h-3 w-3" />
                  Browse Services
                </Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Enhanced Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {[
          {
            title: "Total Orders",
            value: totalOrders,
            icon: Package,
            color: "blue",
            bgColor: "bg-blue-100",
            textColor: "text-blue-600",
          },
          {
            title: "Completed",
            value: stats.completedOrders,
            icon: FaCheckCircle,
            color: "green",
            bgColor: "bg-green-100",
            textColor: "text-green-600",
          },
          {
            title: "In Progress",
            value: stats.pendingOrders,
            icon: FaClock,
            color: "yellow",
            bgColor: "bg-yellow-100",
            textColor: "text-yellow-600",
          },
          {
            title: "Total Spent",
            value: `£${stats.totalSpent.toFixed(2)}`,
            icon: DollarSign,
            color: "purple",
            bgColor: "bg-purple-100",
            textColor: "text-purple-600",
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
                  <div className={`p-2 ${stat.bgColor} rounded-lg`}>
                    <stat.icon className={`h-4 w-4 ${stat.textColor}`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-medium text-gray-600">
                      {stat.title}
                    </p>
                    <motion.p
                      className="text-lg font-bold text-gray-900"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.7, type: "spring" }}
                    >
                      {stat.value}
                    </motion.p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Custom Tabs */}
      <motion.div variants={itemVariants}>
        <CustomTab
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          tabs={tabs}
        >
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <FaClock className="h-4 w-4 text-blue-600" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.recentActivity.length === 0 && totalOrders === 0 ? (
                      <div className="text-center py-8">
                        <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No activity yet</p>
                        <p className="text-sm text-gray-400">
                          Start your first order to see activity here
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Show recent orders if no activity logs */}
                        {stats.recentActivity.length === 0 ? (
                          <>
                            {companyRequests.slice(0, 3).map((request) => (
                              <div
                                key={request.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="p-2 bg-blue-100 rounded-lg">
                                  <FaBuilding className="h-4 w-4 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-gray-900">
                                    Company Request: {request.company_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {request.package_name}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    request.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                            {serviceOrders.slice(0, 2).map((order) => (
                              <div
                                key={order.id}
                                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="p-2 bg-green-100 rounded-lg">
                                  <FaShoppingBag className="h-4 w-4 text-green-600" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-medium text-sm text-gray-900">
                                    Service Order: {order.service_title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    £{order.price_amount}
                                  </p>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                          </>
                        ) : (
                          stats.recentActivity.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <TrendingUp className="h-4 w-4 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">
                                  {activity.action
                                    .replace(/_/g, " ")
                                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {activity.description}
                                </p>
                              </div>
                              <span className="text-xs text-gray-400">
                                {new Date(
                                  activity.created_at
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}

                        {totalOrders > 5 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("companies")}
                            className="w-full"
                          >
                            View All Orders
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Zap className="h-4 w-4 text-purple-600" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        asChild
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      >
                        <Link to="/dashboard/marketplace">
                          <FaShoppingBag className="mr-3 h-4 w-4" />
                          Browse Services
                        </Link>
                      </Button>

                      {companyRequests.length > 0 && (
                        <Button
                          asChild
                          variant="outline"
                          className="w-full justify-start hover:bg-blue-50"
                        >
                          <Link
                            to={`/dashboard/request/${companyRequests[0].id}`}
                          >
                            <FaEye className="mr-3 h-4 w-4" />
                            View Latest Company Request
                          </Link>
                        </Button>
                      )}

                      <Button
                        asChild
                        variant="outline"
                        className="w-full justify-start hover:bg-green-50"
                      >
                        <Link to="/dashboard/orders">
                          <FaEye className="mr-3 h-4 w-4" />
                          View All Orders
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Companies Tab */}
          {activeTab === "companies" && (
            <AnimatePresence>
              {companyRequests.length === 0 ? (
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
                        Get your UK company formed with our expert service
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          asChild
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Link to="/dashboard/marketplace">
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Browse Services
                          </Link>
                        </Button>
                      </div>
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
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Your Company Requests ({companyRequests.length})
                    </h2>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard/marketplace">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Additional Services
                      </Link>
                    </Button>
                  </div>
                  {companyRequests.map((request) => (
                    <CompanyRequestCard key={request.id} request={request} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Services Tab */}
          {activeTab === "services" && (
            <AnimatePresence>
              {serviceOrders.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <Card>
                    <CardContent className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FaShoppingBag className="h-8 w-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        Explore Our Services
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Discover additional services to grow your business
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                          asChild
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Link to="/dashboard/marketplace">
                            <FaShoppingBag className="mr-2 h-4 w-4" />
                            Browse Marketplace
                          </Link>
                        </Button>
                      </div>
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
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Your Service Orders ({serviceOrders.length})
                    </h2>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/dashboard/marketplace">
                        <FaShoppingBag className="mr-2 h-4 w-4" />
                        Browse More Services
                      </Link>
                    </Button>
                  </div>
                  {serviceOrders.map((order) => (
                    <ServiceOrderCard key={order.id} order={order} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </CustomTab>
      </motion.div>
    </motion.div>
  );
}
