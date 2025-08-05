// src/pages/RequestDetailsPage.jsx - FIXED VERSION
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Building2,
  ArrowLeft,
  Calendar,
  Mail,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Download,
  Eye,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Status configuration
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

export default function RequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!user || !id) {
        setError("Invalid request");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching request details for ID:", id);

        // ✅ FIXED: Fetch request data WITHOUT join to avoid relationship error
        const { data: requestData, error: requestError } = await supabase
          .from("company_requests")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id) // Security: Only allow user's own requests
          .single();

        if (requestError) {
          console.error("Request fetch error:", requestError);
          throw new Error("Request not found");
        }

        if (!requestData) {
          throw new Error("Request not found");
        }

        console.log("Request data fetched:", requestData);
        setRequest(requestData);

        // ✅ FIXED: Fetch profile separately to avoid relationship issues
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError) {
            console.warn("Profile fetch error (may not exist):", profileError);
            // Continue without profile data
          } else {
            console.log("Profile data fetched:", profileData);
            setUserProfile(profileData);
          }
        } catch (profileFetchError) {
          console.warn("Profile fetch failed:", profileFetchError);
          // Continue without profile data
        }
      } catch (err) {
        console.error("Error fetching request details:", err);
        setError(err.message || "Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchRequestDetails();

    // ✅ Real-time subscription for status updates
    const channel = supabase
      .channel(`company_request_${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "company_requests",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          console.log("Real-time update received:", payload);
          setRequest(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Request
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
              <Button asChild>
                <Link to="/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Request Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The requested company formation details could not be found.
            </p>
            <Button asChild>
              <Link to="/dashboard">Back to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = statusConfig[request.status] || statusConfig.pending_payment;
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate("/dashboard")}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {request.company_name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Request ID: {request.id.slice(0, 8)}</span>
                  <span>•</span>
                  <span>
                    Created: {new Date(request.created_at).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>{request.package_name}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={`${status.color} border text-sm px-3 py-1`}>
                  <StatusIcon className="mr-2 h-4 w-4" />
                  {status.label}
                </Badge>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StatusIcon className="h-5 w-5" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{status.description}</p>

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{status.progress}%</span>
                      </div>
                      <Progress value={status.progress} className="h-3" />
                    </div>

                    {request.status === "completed" && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-semibold text-green-800 mb-2">
                          🎉 Company Formation Complete!
                        </h4>
                        <p className="text-green-700 text-sm">
                          Your company has been successfully registered with
                          Companies House. You should receive your incorporation
                          documents shortly.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Company Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Company Name
                      </label>
                      <p className="text-gray-900">{request.company_name}</p>
                    </div>

                    {request.company_address && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Address
                        </label>
                        <p className="text-gray-900">
                          {request.company_address}
                        </p>
                      </div>
                    )}

                    {request.nature_of_business && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          Nature of Business
                        </label>
                        <p className="text-gray-900">
                          {request.nature_of_business}
                        </p>
                      </div>
                    )}

                    {request.sic_code && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">
                          SIC Code
                        </label>
                        <p className="text-gray-900">{request.sic_code}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Contact Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {request.contact_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Email
                          </label>
                          <p className="text-gray-900">
                            {request.contact_email}
                          </p>
                        </div>
                      </div>
                    )}

                    {request.contact_phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <div>
                          <label className="text-sm font-medium text-gray-500">
                            Phone
                          </label>
                          <p className="text-gray-900">
                            {request.contact_phone}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Package Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Package Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Package
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {request.package_name}
                    </p>
                  </div>

                  {request.package_price && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Price
                      </label>
                      <p className="text-gray-900 font-semibold">
                        £{parseFloat(request.package_price).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Payment Status
                    </label>
                    <p className="text-gray-900">
                      {request.status === "pending_payment"
                        ? "Pending"
                        : "Completed"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div>
                        <p className="text-sm font-medium">Request Created</p>
                        <p className="text-xs text-gray-500">
                          {new Date(request.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {request.updated_at &&
                      request.updated_at !== request.created_at && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium">Last Updated</p>
                            <p className="text-xs text-gray-500">
                              {new Date(request.updated_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {request.status === "pending_payment" && (
                    <Button className="w-full">
                      <CreditCard className="mr-2 h-4 w-4" />
                      Complete Payment
                    </Button>
                  )}

                  <Button variant="outline" className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>

                  {request.status === "completed" && (
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Documents
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
