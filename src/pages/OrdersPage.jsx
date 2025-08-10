// src/pages/OrdersPage.jsx - Enhanced with Filtering, Search and Better Layout
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Loader from "@/components/ui/Loader";
import {
  Building2,
  ShoppingCart,
  DollarSign,
  Package,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Loader2,
  Plus,
  FileText,
  ArrowUpDown,
  MoreVertical,
  MessageSquare,
} from "lucide-react";

// Status configurations remain the same...
const companyStatusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    label: "Pending Payment",
    description: "Payment required to proceed",
    priority: 1,
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: CheckCircle,
    label: "Payment Completed",
    description: "Payment received, processing started",
    priority: 2,
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Loader2,
    label: "In Review",
    description: "Application under review",
    priority: 3,
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: AlertCircle,
    label: "Documents Required",
    description: "Additional documents needed",
    priority: 1,
  },
  processing: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Loader2,
    label: "Processing",
    description: "Being processed with Companies House",
    priority: 4,
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    label: "Completed",
    description: "Successfully completed",
    priority: 5,
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    label: "Rejected",
    description: "Application rejected",
    priority: 0,
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: XCircle,
    label: "Cancelled",
    description: "Request cancelled",
    priority: 0,
  },
};

const serviceStatusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    label: "Pending",
    description: "Order received, processing soon",
    priority: 1,
  },
  confirmed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: CheckCircle,
    label: "Confirmed",
    description: "Order confirmed and assigned",
    priority: 2,
  },
  // in_progress: {
  //   color: "bg-purple-100 text-purple-800 border-purple-300",
  //   icon: Loader2,
  //   label: "In Progress",
  //   description: "Work in progress",
  //   priority: 3,
  // },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    label: "Completed",
    description: "Service completed successfully",
    priority: 5,
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    label: "Cancelled",
    description: "Order cancelled",
    priority: 0,
  },
  refunded: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: XCircle,
    label: "Refunded",
    description: "Payment refunded",
    priority: 0,
  },
};

// Enhanced Company Request Card Component
const CompanyRequestCard = ({ request, onViewDetails }) => {
  // ✅ REMOVED: Status configuration completely removed

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      className="group"
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-blue-500 relative overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-blue-100 rounded-xl">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                  {request.company_name}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-1">
                  {request.package_name}
                </p>
                {request.package_price && (
                  <p className="text-sm font-semibold text-blue-600">
                    £{parseFloat(request.package_price).toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            <div className="text-right">
              {/* ✅ REMOVED: Status badge completely */}
              <span className="text-xs text-gray-500">
                {new Date(request.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* ✅ REMOVED: Status Badge, Progress Bar, and Description */}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onViewDetails(request)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
            </div>

            {/* Request ID */}
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-400">
                Request ID: {request.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Enhanced Service Order Card Component
const ServiceOrderCard = ({ order }) => {
  const status =
    serviceStatusConfig[order.status] || serviceStatusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
    >
      <Card className="h-full hover:shadow-xl transition-all duration-300 border-l-4 border-l-green-500 relative overflow-hidden">
        {/* Priority indicator */}
        {status.priority <= 2 && (
          <div className="absolute top-2 right-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3 flex-1">
              <div className="p-3 bg-green-100 rounded-xl">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">
                  {order.service_title}
                </CardTitle>
                <p className="text-sm text-gray-600 mb-1">
                  {order.service_category}
                </p>
                <p className="text-sm font-semibold text-green-600">
                  £{parseFloat(order.price_amount).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-4">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <Badge className={`${status.color} border text-xs px-3 py-1`}>
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </Badge>
              <span className="text-xs text-gray-500">
                {new Date(order.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{status.priority * 20}%</span>
              </div>
              <Progress value={status.priority * 20} className="h-2" />
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600">{status.description}</p>

            {/* Delivery Time */}
            {order.delivery_time && (
              <div className="bg-blue-50 p-2 rounded-lg">
                <p className="text-xs text-blue-700">
                  <Calendar className="inline h-3 w-3 mr-1" />
                  Expected: {order.delivery_time}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                asChild
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <Link to={`/dashboard/orders/${order.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </Button>
              {order.status === "completed" && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Order ID */}
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-400">
                Order ID: {order.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color, trend, description }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -2 }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <Card className="hover:shadow-lg transition-all duration-300 border-0 shadow-md">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>
          <div className={`p-4 ${color} rounded-2xl`}>
            <Icon className="h-7 w-7 text-white" />
          </div>
        </div>
        {trend && (
          <div className="mt-4 flex items-center text-sm">
            <span
              className={`${
                trend > 0 ? "text-green-600" : "text-red-600"
              } font-medium`}
            >
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            <span className="text-gray-500 ml-1">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  </motion.div>
);

// Main Orders Component
export default function OrdersPage() {
  const [companyRequests, setCompanyRequests] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const navigate = useNavigate();

  // Filter and search logic
  useEffect(() => {
    let filtered = [...companyRequests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.company_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          request.package_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status === statusFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      } else if (sortBy === "priority") {
        const aStatus =
          companyStatusConfig[a.status] || companyStatusConfig.pending_payment;
        const bStatus =
          companyStatusConfig[b.status] || companyStatusConfig.pending_payment;
        return aStatus.priority - bStatus.priority;
      }
      return 0;
    });

    setFilteredCompanies(filtered);
  }, [companyRequests, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    let filtered = [...serviceOrders];

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.service_title
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          order.service_category
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    filtered.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === "oldest") {
        return new Date(a.created_at) - new Date(b.created_at);
      }
      return 0;
    });

    setFilteredServices(filtered);
  }, [serviceOrders, searchTerm, statusFilter, sortBy]);

  // Rest of the useEffect for fetching data remains the same...
  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;

        if (!user) {
          navigate("/login");
          return;
        }

        setUser(user);

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

        setCompanyRequests(companyData || []);
        setServiceOrders(serviceData || []);

        // Log page visit
        await supabase.rpc("log_activity", {
          p_user_id: user.id,
          p_action: "orders_page_visited",
          p_description: "User visited orders page",
          p_metadata: {
            company_requests: companyData?.length || 0,
            service_orders: serviceData?.length || 0,
          },
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Real-time subscriptions remain the same...
    const companyChannel = supabase
      .channel("user_company_requests_orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "company_requests",
        },
        (payload) => {
          if (payload.new && payload.new.user_id === user?.id) {
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
        }
      )
      .subscribe();

    const serviceChannel = supabase
      .channel("user_service_orders_orders")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_orders",
        },
        (payload) => {
          if (payload.new && payload.new.user_id === user?.id) {
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(companyChannel);
      supabase.removeChannel(serviceChannel);
    };
  }, [navigate, user?.id]);

  const handleViewDetails = (request) => {
    navigate(`/dashboard/request/${request.id}`);
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
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
  const completedCompany = companyRequests.filter(
    (r) => r.status === "completed"
  ).length;
  const completedService = serviceOrders.filter(
    (o) => o.status === "completed"
  ).length;
  const totalCompleted = completedCompany + completedService;
  const pendingOrders = totalOrders - totalCompleted;
  const totalSpentFromCompanies = companyRequests
    .filter(
      (req) =>
        req.payment_data?.financial_status === "paid" ||
        (req.payment_data?.is_test_order === true &&
          req.payment_data?.total_price)
    )
    .reduce((sum, req) => {
      const paidAmount = req.payment_data?.total_price
        ? parseFloat(req.payment_data.total_price)
        : 0;
      return sum + paidAmount;
    }, 0);

  const totalSpentFromServices = serviceOrders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + parseFloat(order.price_amount || 0), 0);

  const totalSpent = totalSpentFromCompanies + totalSpentFromServices;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orders & Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your company formations and service orders
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate("/dashboard/marketplace")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Browse Services
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Start Company
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <StatsCard
          title="Total Orders"
          value={totalOrders}
          icon={Package}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
          description="All time orders"
        />
        <StatsCard
          title="Completed"
          value={totalCompleted}
          icon={CheckCircle}
          color="bg-gradient-to-br from-green-500 to-green-600"
          description="Successfully finished"
        />
        {/* <StatsCard
          title="In Progress"
          value={pendingOrders}
          icon={Clock}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
          description="Currently processing"
        /> */}
        {/* <StatsCard
          title="Total Investment"
          value={`£${totalSpent.toFixed(0)}`}
          icon={DollarSign}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
          description="Business spending"
        /> */}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search orders by name, package, or service..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending_payment">
                    Pending Payment
                  </SelectItem>
                  <SelectItem value="in_review">In Review</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="priority">By Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="all" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              All ({totalOrders})
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Companies ({filteredCompanies.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Services ({filteredServices.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {/* Companies Section */}
              {filteredCompanies.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Company Formations ({filteredCompanies.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredCompanies.map((request) => (
                        <CompanyRequestCard
                          key={request.id}
                          request={request}
                          onViewDetails={handleViewDetails}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Services Section */}
              {filteredServices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Service Orders ({filteredServices.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                      {filteredServices.map((order) => (
                        <ServiceOrderCard key={order.id} order={order} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* Empty State */}
              {totalOrders === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Start your business journey by forming a company or
                      exploring our services
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button
                        onClick={() => navigate("/dashboard")}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Start Company Formation
                      </Button>
                      <Button
                        onClick={() => navigate("/dashboard/marketplace")}
                        variant="outline"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Browse Services
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* No results state */}
              {totalOrders > 0 &&
                filteredCompanies.length === 0 &&
                filteredServices.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        No orders match your search
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Try adjusting your filters or search terms
                      </p>
                      <Button
                        onClick={() => {
                          setSearchTerm("");
                          setStatusFilter("all");
                        }}
                        variant="outline"
                      >
                        Clear Filters
                      </Button>
                    </CardContent>
                  </Card>
                )}
            </div>
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            {filteredCompanies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Building2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {companyRequests.length === 0
                      ? "No company requests yet"
                      : "No matching companies"}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {companyRequests.length === 0
                      ? "Start your UK company formation with our expert service"
                      : "Try adjusting your search or filter criteria"}
                  </p>
                  {companyRequests.length === 0 ? (
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Start Company Formation
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredCompanies.map((request) => (
                    <CompanyRequestCard
                      key={request.id}
                      request={request}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            {filteredServices.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {serviceOrders.length === 0
                      ? "No service orders yet"
                      : "No matching services"}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {serviceOrders.length === 0
                      ? "Explore our marketplace for additional business services"
                      : "Try adjusting your search or filter criteria"}
                  </p>
                  {serviceOrders.length === 0 ? (
                    <Button
                      onClick={() => navigate("/dashboard/marketplace")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      Browse Marketplace
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                      variant="outline"
                    >
                      Clear Filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {filteredServices.map((order) => (
                    <ServiceOrderCard key={order.id} order={order} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Help Section */}
      {totalOrders > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-blue-100 rounded-2xl">
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Need Assistance?
                    </h3>
                    <p className="text-gray-600 max-w-md">
                      Our expert team is here to help with your orders and
                      answer any questions you may have.
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    View FAQ
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
