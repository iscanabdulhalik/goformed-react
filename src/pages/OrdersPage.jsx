// src/pages/OrdersPage.jsx - Company ve Service orders birlikte
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link } from "react-router-dom";
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
} from "react-icons/fa";

// Status configurations
const companyStatusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    label: "Ödeme Bekliyor",
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaSpinner,
    label: "İnceleniyor",
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: FaExclamationTriangle,
    label: "Belge Gerekli",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    label: "Tamamlandı",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    label: "Reddedildi",
  },
};

const serviceStatusConfig = {
  pending: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
    label: "Beklemede",
  },
  confirmed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaCheckCircle,
    label: "Onaylandı",
  },
  in_progress: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: FaSpinner,
    label: "İşlemde",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    label: "Tamamlandı",
  },
  cancelled: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    label: "İptal Edildi",
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
        {new Date(request.created_at).toLocaleDateString("tr-TR")}
      </TableCell>
      <TableCell>
        <Button asChild variant="outline" size="sm">
          <Link to={`/dashboard/request/${request.id}`}>
            <FaEye className="mr-2 h-3 w-3" />
            Detaylar
          </Link>
        </Button>
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
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="font-semibold text-gray-900">{order.price_amount}</div>
      </TableCell>
      <TableCell>
        <Badge className={`${status.color} border`}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="text-sm text-gray-600">
        {new Date(order.created_at).toLocaleDateString("tr-TR")}
      </TableCell>
      <TableCell>
        <Button asChild variant="outline" size="sm">
          <Link to={`/dashboard/order/${order.id}`}>
            <FaEye className="mr-2 h-3 w-3" />
            Detaylar
          </Link>
        </Button>
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
          title: "Henüz şirket talebiniz yok",
          description: "İlk şirketinizi kurmak için dashboard'dan başlayın",
          actionText: "Şirket Kur",
          actionPath: "/dashboard",
        }
      : {
          icon: FaShoppingBag,
          title: "Henüz hizmet siparişiniz yok",
          description:
            "Ek hizmetlerimizi keşfetmek için marketplace'i ziyaret edin",
          actionText: "Marketplace'e Git",
          actionPath: "/dashboard/marketplace",
        };

  const Icon = config.icon;

  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {config.title}
      </h3>
      <p className="text-gray-600 mb-6">{config.description}</p>
      <Button
        onClick={() => onAction(config.actionPath)}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {config.actionText}
      </Button>
    </div>
  );
};

// Main Component
export default function OrdersPage() {
  const [companyRequests, setCompanyRequests] = useState([]);
  const [serviceOrders, setServiceOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("company");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) throw new Error("Kullanıcı bulunamadı");

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

        if (serviceError && serviceError.code !== "PGRST116") {
          // Table doesn't exist yet
          throw serviceError;
        }

        setCompanyRequests(companyData || []);
        setServiceOrders(serviceData || []);
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
      .channel("service_orders_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "service_orders",
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
  }, []);

  const handleNavigation = (path) => {
    window.location.href = path;
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Tekrar Dene
          </Button>
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600 mt-2">
            Şirket kuruluş taleplerinizi ve hizmet siparişlerinizi yönetin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleNavigation("/dashboard")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <FaBuilding className="h-4 w-4" />
            Şirket Kur
          </Button>
          <Button
            onClick={() => handleNavigation("/dashboard/marketplace")}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <FaShoppingBag className="h-4 w-4" />
            Marketplace
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaCalendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Sipariş
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
                <p className="text-sm font-medium text-gray-600">Tamamlanan</p>
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
                <p className="text-sm font-medium text-gray-600">Devam Eden</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalOrders - totalCompleted}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Tables */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <FaBuilding className="h-4 w-4" />
            Şirket Talepleri ({companyRequests.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <FaShoppingBag className="h-4 w-4" />
            Hizmet Siparişleri ({serviceOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FaBuilding className="h-5 w-5" />
                Şirket Kuruluş Talepleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {companyRequests.length === 0 ? (
                <EmptyState type="company" onAction={handleNavigation} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Şirket / Paket</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
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
                Hizmet Siparişleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {serviceOrders.length === 0 ? (
                <EmptyState type="service" onAction={handleNavigation} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hizmet</TableHead>
                      <TableHead>Fiyat</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
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
    </div>
  );
}
