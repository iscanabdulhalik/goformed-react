// src/pages/DashboardPage.jsx - Yeni tasarım
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
} from "react-icons/fa";
import { Check, Crown, Sparkles, Star } from "lucide-react";

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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="group"
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
          <div
            className={`${getBadgeColor(
              plan.badge
            )} text-white px-3 py-1 text-xs font-semibold rounded-full shadow-sm flex items-center gap-1`}
          >
            {getBadgeIcon(plan.badge)}
            {plan.badge}
          </div>
        </div>

        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold text-gray-900 mb-3">
            {plan.name}
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-lg text-gray-400 line-through font-medium">
                {plan.oldPrice}
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {plan.price}
              </span>
            </div>
            <p className="text-xs text-gray-500">{plan.feeText}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>

          <div className="pt-4">
            <Button
              onClick={() => onSelect(plan)}
              className={`w-full font-semibold transition-all duration-300 ${
                isPopular
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  : "bg-gray-900 hover:bg-gray-800"
              }`}
            >
              Paketi Seç
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
    label: "Ödeme Bekliyor",
    description: "Paketi almak için ödeme yapmanız gerekiyor",
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaEye,
    label: "İnceleniyor",
    description: "Talebiniz uzmanlarımız tarafından inceleniyor",
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: FaExclamationTriangle,
    label: "Belge Gerekli",
    description: "Eksik belgelerinizi tamamlamanız gerekiyor",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaCheckCircle,
    label: "Tamamlandı",
    description: "Şirketiniz başarıyla kuruldu",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
    label: "Reddedildi",
    description: "Talebiniz reddedildi, detaylar için iletişime geçin",
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
          `Bu paket için ödeme bilgisi bulunamadı: ${request.package_name}`
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Oturum açmanız gerekiyor");
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
        throw new Error("Ödeme sayfası URL'si alınamadı");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(`Ödeme başlatılamadı: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6"
    >
      {isProcessing ? (
        <>
          <FaSpinner className="animate-spin mr-2 h-4 w-4" />
          İşleniyor...
        </>
      ) : (
        <>
          <FaShoppingBag className="mr-2 h-4 w-4" />
          Ödeme Yap
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                {request.company_name}
              </CardTitle>
              <p className="text-sm text-gray-600">{request.package_name}</p>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}
              >
                <StatusIcon className="mr-1 h-3 w-3" />
                {status.label}
              </span>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(request.created_at).toLocaleDateString("tr-TR")}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-gray-600 mb-4">{status.description}</p>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Durum: {status.label}</span>
              <span>•</span>
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
                    Detaylar
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
        if (!user) throw new Error("Kullanıcı bulunamadı");

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
      alert("Lütfen şirket adını girin");
      return;
    }

    const normalizedName = companyName.trim().toUpperCase();
    if (
      !normalizedName.endsWith("LTD") &&
      !normalizedName.endsWith("LIMITED")
    ) {
      alert("Şirket adı 'LTD' veya 'LIMITED' ile bitmelidir");
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı bulunamadı");

      // Check for duplicates
      const { data: existingRequests } = await supabase
        .from("company_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("company_name", normalizedName);

      if (existingRequests && existingRequests.length > 0) {
        alert("Bu şirket adı için zaten bir talebiniz var");
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
      setActiveTab("requests");
    } catch (error) {
      alert(`Hata: ${error.message}`);
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Şirket kurulum sürecinizi takip edin
          </p>
        </div>
        <Button
          onClick={() => setActiveTab("packages")}
          className="bg-blue-600 hover:bg-blue-700 font-semibold"
        >
          <FaPlus className="mr-2 h-4 w-4" />
          Yeni Şirket Kur
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaBuilding className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Toplam Şirket
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {requests.length}
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
                  {completedRequests}
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
                  {pendingRequests}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="packages">Paket Seç</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {requests.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FaBuilding className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Henüz şirket talebiniz yok
                </h3>
                <p className="text-gray-600 mb-6">
                  İlk şirketinizi kurmak için bir paket seçin
                </p>
                <Button
                  onClick={() => setActiveTab("packages")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Paket Seç
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Şirket Talepleriniz
              </h2>
              {requests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="packages" className="mt-6">
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Paket Seçin
              </h2>
              <p className="text-gray-600">
                İhtiyacınıza uygun paketi seçerek şirket kurma sürecini başlatın
              </p>
            </div>

            <Tabs defaultValue="uk" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="uk">UK Residents</TabsTrigger>
                <TabsTrigger value="global">Non-UK Residents</TabsTrigger>
              </TabsList>

              <TabsContent value="uk">
                <div className="grid md:grid-cols-2 gap-6">
                  {ukPackages.map((plan) => (
                    <PackageCard
                      key={plan.name}
                      plan={plan}
                      onSelect={handlePackageSelect}
                      isPopular={plan.badge === "Popular"}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="global">
                <div className="grid md:grid-cols-2 gap-6">
                  {globalPackages.map((plan) => (
                    <PackageCard
                      key={plan.name}
                      plan={plan}
                      onSelect={handlePackageSelect}
                      isPopular={plan.badge === "Elite"}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </TabsContent>
      </Tabs>

      {/* Package Selection Modal */}
      {showPackageModal && selectedPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl max-w-md w-full"
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Şirket Adını Girin
              </h3>
              <p className="text-gray-600 mb-4">
                <strong>{selectedPackage.name}</strong> paketi için şirket adını
                belirleyin.
                <br />
                <span className="text-sm">
                  Ad "LTD" veya "LIMITED" ile bitmelidir.
                </span>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şirket Adı
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) =>
                      setCompanyName(e.target.value.toUpperCase())
                    }
                    placeholder="ÖRN: MYCOMPANY LTD"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowPackageModal(false);
                      setCompanyName("");
                      setSelectedPackage(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleCreateRequest}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    Oluştur
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
