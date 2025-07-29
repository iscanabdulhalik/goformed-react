// src/pages/DashboardPage.jsx - Shopify Product ID'leri ile
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Loader from "@/components/ui/Loader";
import { FaPlus, FaSpinner, FaEye } from "react-icons/fa";
import { ukPackages, globalPackages } from "@/lib/packages";

// Package name'den Shopify bilgilerini al
const getShopifyInfo = (packageName) => {
  const allPackages = [...ukPackages, ...globalPackages];
  return allPackages.find((pkg) => pkg.name === packageName);
};

const statusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    label: "Pending Payment",
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-200",
    label: "In Review",
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-200",
    label: "Documents Requested",
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-200",
    label: "Completed",
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-200",
    label: "Rejected",
  },
};

const PaymentButton = ({ request }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      const shopifyInfo = getShopifyInfo(request.package_name);
      if (!shopifyInfo?.variantId) {
        throw new Error(
          `No Shopify variant ID found for package: ${request.package_name}`
        );
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("Please login to continue");
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
      console.error("Payment initiation failed:", error);
      alert(`Payment could not be initiated: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      onClick={handlePayment}
      disabled={isProcessing}
      size="sm"
      className="bg-blue-600 hover:bg-blue-700 text-white"
    >
      {isProcessing ? (
        <>
          <FaSpinner className="animate-spin mr-2 h-3 w-3" />
          Processing...
        </>
      ) : (
        "Pay Now"
      )}
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
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("Please login to view your requests.");
          return;
        }

        const { data, error } = await supabase
          .from("company_requests")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setRequests(data || []);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load your requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();

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

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-4">{error}</div>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaPlus className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Ready to Start Your Business?
          </h2>
          <p className="text-gray-600 mb-8">
            You don't have any active company formation requests yet.
          </p>
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <a href="/#packages">
              <FaPlus className="mr-2 h-4 w-4" />
              Explore Packages
            </a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900">
            Company Requests
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage your company formation requests.
          </p>
        </div>
        <Button asChild className="bg-blue-600 hover:bg-blue-700">
          <a href="/#packages">
            <FaPlus className="mr-2 h-4 w-4" />
            New Request
          </a>
        </Button>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <CardTitle className="text-lg font-medium text-gray-900">
            Your Requests
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-medium text-gray-900">
                  Company Name
                </TableHead>
                <TableHead className="font-medium text-gray-900">
                  Package
                </TableHead>
                <TableHead className="font-medium text-gray-900">
                  Status
                </TableHead>
                <TableHead className="font-medium text-gray-900">
                  Created
                </TableHead>
                <TableHead className="text-right font-medium text-gray-900">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req) => (
                <TableRow
                  key={req.id}
                  className="border-b border-gray-50 hover:bg-gray-50"
                >
                  <TableCell className="font-medium text-gray-900">
                    {req.company_name}
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {req.package_name}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`
                      inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                      ${
                        statusConfig[req.status]?.color ||
                        "bg-gray-100 text-gray-800 border-gray-200"
                      }
                    `}
                    >
                      {statusConfig[req.status]?.label ||
                        req.status.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">
                    {new Date(req.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {req.status === "pending_payment" && (
                        <PaymentButton request={req} />
                      )}
                      {[
                        "in_review",
                        "documents_requested",
                        "completed",
                        "rejected",
                      ].includes(req.status) && (
                        <Button asChild variant="outline" size="sm">
                          <Link to={`/dashboard/request/${req.id}`}>
                            <FaEye className="mr-2 h-3 w-3" />
                            View Details
                          </Link>
                        </Button>
                      )}
                    </div>
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
