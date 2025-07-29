// src/pages/DashboardPage.jsx

import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/ui/Loader";
import { FaPlus, FaSpinner } from "react-icons/fa";

const packageToVariantId = {
  "Entrepreneur (UK)": "gid://shopify/ProductVariant/45889240891530", // Örnek ID, kendinizinkiyle değiştirin.
  "Pro Builder (UK)": "gid://shopify/ProductVariant/YENI_URUN_IDSI_1",
  "Global Starter": "gid://shopify/ProductVariant/YENI_URUN_IDSI_2",
  "Global Premium": "gid://shopify/ProductVariant/YENI_URUN_IDSI_3",
};

const statusColors = {
  pending_payment: "bg-yellow-500",
  in_review: "bg-blue-500",
  documents_requested: "bg-orange-500",
  completed: "bg-green-600",
  rejected: "bg-red-600",
};

// Ayrı bir component ile buton durumunu yönetelim
const PaymentButton = ({ request }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const variantId = packageToVariantId[request.package_name];
      if (!variantId) {
        throw new Error(
          `No Shopify variant ID found for package: ${request.package_name}`
        );
      }

      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: { variantId, requestId: request.id },
        }
      );

      if (error) throw error;

      // Kullanıcıyı Shopify ödeme sayfasına yönlendir
      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("Payment initiation failed:", error);
      alert(`Ödeme başlatılamadı: ${error.message}`);
      setIsProcessing(false);
    }
  };

  return (
    <Button onClick={handlePayment} disabled={isProcessing} size="sm">
      {isProcessing ? <FaSpinner className="animate-spin" /> : "Ödeme Yap"}
    </Button>
  );
};

export default function DashboardPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("company_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setError("Taleplerinizi yüklerken bir hata oluştu.");
      } else {
        setRequests(data);
      }
      setLoading(false);
    };
    fetchRequests();

    // Realtime dinleme: Talep durumu değiştiğinde sayfayı yenilemeden güncelle
    const channel = supabase
      .channel("company_requests_changes")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "company_requests" },
        (payload) => {
          // Gelen güncellemeyi mevcut listede bul ve değiştir
          setRequests((currentRequests) =>
            currentRequests.map((req) =>
              req.id === payload.new.id ? payload.new : req
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center pt-12 text-center">
        <h1 className="text-3xl font-bold mb-2">
          Girişiminizi Başlatmaya Hazır Mısınız?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mb-8">
          Henüz aktif bir şirket kurma talebiniz bulunmuyor.
        </p>
        <Button asChild size="lg">
          <a href="/#packages">
            <FaPlus className="mr-2" /> Paketleri İncele ve Başla
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Şirket Taleplerim</h1>
        <Button asChild>
          <a href="/#packages">
            <FaPlus className="mr-2" /> Yeni Talep Oluştur
          </a>
        </Button>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Şirket Adı</TableHead>
                <TableHead>Paket</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow key={req.id}>
                  <TableCell className="font-medium">
                    {req.company_name}
                  </TableCell>
                  <TableCell>{req.package_name}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 text-xs font-semibold text-white rounded-full ${
                        statusColors[req.status]
                      }`}
                    >
                      {req.status.replace("_", " ").toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(req.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {req.status === "pending_payment" && (
                      <PaymentButton request={req} />
                    )}
                    {["in_review", "documents_requested", "completed"].includes(
                      req.status
                    ) && (
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/dashboard/request/${req.id}`}>
                          Detayları Görüntüle
                        </Link>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
