// src/pages/OrdersPage.jsx - Production Ready with Real Data
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/ui/Loader";
import {
  FaBuilding,
  FaShoppingBag,
  FaEye,
  FaCalendar,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSpinner,
  FaPlus,
  FaDownload,
  FaFileAlt,
} from "react-icons/fa";
import {
  Building2,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
  FileText,
  Package,
} from "lucide-react";

// Status configurations
const companyStatusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    label: "Pending Payment",
    description: "Payment required to proceed",
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaCheckCircle,
    label: "Payment Completed",
    description: "Payment received, processing started",
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaSpinner,
    label: "In Review",
    description: "Application under review",
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: FaExclamationTriangle,
    label: "Documents Required",
    description: "Additional documents needed",
  },
  processing: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: FaSpinner,
    label: "Processing",
    description: "Being processed with Companies House",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    label: "Completed",
    description: "Successfully completed",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    label: "Rejected",
    description: "Application rejected",
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: FaTimesCircle,
    label: "Cancelled",
    description: "Request cancelled",
  },
};

const serviceStatusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    label: "Pending",
    description: "Order received, processing soon",
  },
  confirmed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaCheckCircle,
    label: "Confirmed",
    description: "Order confirmed and assigned",
  },
  in_progress: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: FaSpinner,
    label: "In Progress",
    description: "Work in progress",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    label: "Completed",
    description: "Service completed successfully",
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    label: "Cancelled",
    description: "Order cancelled",
  },
  refunded: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: FaTimesCircle,
    label: "Refunded",
    description: "Payment refunded",
  },
};

// Company Request Row Component
const CompanyRequestRow = ({ request }) => {
  const status =
    companyStatusConfig[request.status] || companyStatusConfig.pending_payment;
  const StatusIcon = status.icon;

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FaBuilding className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {request.company_name}
            </div>
            <div className="text-sm text-gray-500">{request.package_name}</div>
            {request.package_price && (
              <div className="text-xs text-gray-400">
                £{parseFloat(request.package_price).toFixed(2)}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge className={`${status.color} border`}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {new Date(request.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/dashboard/request/${request.id}`}>
              <FaEye className="mr-2 h-3 w-3" />
              Details
            </Link>
          </Button>
          {request.status === "completed" && (
            <Button variant="ghost" size="sm" className="text-green-600">
              <FaDownload className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

// Service Order Row Component
const ServiceOrderRow = ({ order }) => {
  const status =
    serviceStatusConfig[order.status] || serviceStatusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <FaShoppingBag className="h-4 w-4 text-green-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {order.service_title}
            </div>
            <div className="text-sm text-gray-500">
              {order.service_category}
            </div>
            {order.delivery_time && (
              <div className="text-xs text-gray-400">
                Expected: {order.delivery_time}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-semibold text-gray-900">
          £{parseFloat(order.price_amount).toFixed(2)}
        </div>
        <div className="text-xs text-gray-500">{order.currency || "GBP"}</div>
      </TableCell>
      <TableCell>
        <Badge className={`${status.color} border`}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {new Date(order.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/dashboard/orders/${order.id}`}>
              <FaEye className="mr-2 h-3 w-3" />
              Details
            </Link>
          </Button>
          {order.status === "completed" && (
            <Button variant="ghost" size="sm" className="text-green-600">
              <FaDownload className="h-3 w-3" />
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};

// Empty State Component
const EmptyState = ({ type, onAction }) => {
  const config =
    type === "company"
      ? {
          icon: FaBuilding,
          title: "No Company Requests Yet",
          description: "Start your UK company formation journey today",
          actionText: "Browse Services",
          actionPath: "/dashboard/marketplace",
          bgColor: "bg-blue-100",
          iconColor: "text-blue-600",
        }
      : {
          icon: FaShoppingBag,
          title: "No Service Orders Yet",
          description:
            "Explore our marketplace for additional business services",
          actionText: "Browse Marketplace",
          actionPath: "/dashboard/marketplace",
          bgColor: "bg-green-100",
          iconColor: "text-green-600",
        };

  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12"
    >
      <div
        className={`w-16 h-16 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
      >
        <Icon className={`h-8 w-8 ${config.iconColor}`} />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {config.description}
      </p>
      <Button
        onClick={() => onAction(config.actionPath)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        <ShoppingCart className="mr-2 h-4 w-4" />
        {config.actionText}
      </Button>
    </motion.div>
  );
};

// Main Orders Component
export default function OrdersPage() {
  const [companyRequests, setCompanyRequests] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

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

    // Real-time subscriptions
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

  const handleNavigation = (path) => {
    navigate(path);
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

  // Calculate total spent
  const totalSpent = [
    ...companyRequests.map((req) => parseFloat(req.package_price || 0)),
    ...serviceOrders.map((order) => parseFloat(order.price_amount || 0)),
  ].reduce((sum, amount) => sum + amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Orders</h1>
          <p className="text-gray-600 mt-2">
            Track and manage your company requests and service orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleNavigation("/dashboard/marketplace")}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Browse Services
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalCompleted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FaClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {pendingOrders}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{totalSpent.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Orders Tables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center gap-2">
              <FaBuilding className="h-4 w-4" />
              Companies ({companyRequests.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="flex items-center gap-2">
              <FaShoppingBag className="h-4 w-4" />
              Services ({serviceOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FaCalendar className="h-5 w-5 text-blue-600" />
                    Recent Orders
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {totalOrders === 0 ? (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No orders yet</p>
                      <p className="text-sm text-gray-400">
                        Start by browsing our services
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Show recent company requests */}
                      {companyRequests.slice(0, 3).map((request) => {
                        const status = companyStatusConfig[request.status];
                        const StatusIcon = status.icon;
                        return (
                          <div
                            key={request.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <FaBuilding className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">
                                {request.company_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {request.package_name}
                              </p>
                              {request.package_price && (
                                <p className="text-xs text-gray-400">
                                  £
                                  {parseFloat(request.package_price).toFixed(2)}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <Badge className={`${status.color} text-xs`}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {status.label}
                              </Badge>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  request.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {/* Show recent service orders */}
                      {serviceOrders.slice(0, 2).map((order) => {
                        const status = serviceStatusConfig[order.status];
                        const StatusIcon = status.icon;
                        return (
                          <div
                            key={order.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="p-2 bg-green-100 rounded-lg">
                              <FaShoppingBag className="h-4 w-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm text-gray-900">
                                {order.service_title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.service_category}
                              </p>
                              <p className="text-xs text-gray-400">
                                £{parseFloat(order.price_amount).toFixed(2)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={`${status.color} text-xs`}>
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {status.label}
                              </Badge>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  order.created_at
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        );
                      })}

                      {totalOrders > 5 && (
                        <div className="text-center pt-4">
                          <Button variant="outline" size="sm">
                            View All Orders
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      onClick={() => handleNavigation("/dashboard/marketplace")}
                      className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    >
                      <FaShoppingBag className="mr-3 h-4 w-4" />
                      Browse Additional Services
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
                          <FaBuilding className="mr-3 h-4 w-4" />
                          View Latest Company Request
                        </Link>
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      className="w-full justify-start hover:bg-green-50"
                      onClick={() => setActiveTab("services")}
                    >
                      <FaShoppingBag className="mr-3 h-4 w-4" />
                      View Service Orders
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="companies" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaBuilding className="h-5 w-5" />
                  Company Formation Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companyRequests.length === 0 ? (
                  <EmptyState type="company" onAction={handleNavigation} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Company / Package</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companyRequests.map((request) => (
                        <CompanyRequestRow key={request.id} request={request} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="services" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FaShoppingBag className="h-5 w-5" />
                  Service Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {serviceOrders.length === 0 ? (
                  <EmptyState type="service" onAction={handleNavigation} />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {serviceOrders.map((order) => (
                        <ServiceOrderRow key={order.id} order={order} />
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Help Section */}
      {totalOrders > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <FileText className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Need Help?</h3>
                    <p className="text-sm text-gray-600">
                      Have questions about your orders? Our support team is here
                      to help.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Contact Support
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    View FAQ
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
