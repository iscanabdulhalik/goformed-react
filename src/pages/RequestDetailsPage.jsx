import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Loader from "@/components/ui/Loader";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSpinner,
  FaPoundSign,
  FaBuilding,
  FaShoppingBag,
} from "react-icons/fa";
import {
  FileText,
  Upload,
  AlertCircle,
  CheckCircle2,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Download,
  Trash2,
  Loader2,
  CreditCard,
  ExternalLink,
  Calendar,
  Package,
  Star,
  Shield,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { usePaymentStatusCheck } from "@/hooks/usePaymentStatusCheck";

// Document types configuration
const documentTypes = {
  identity: {
    label: "Identity Document",
    description: "Passport, driving license, or national ID",
    icon: <User className="w-4 h-4" />,
    required: true,
  },
  address_proof: {
    label: "Proof of Address",
    description: "Utility bill, bank statement (within 3 months)",
    icon: <MapPin className="w-4 h-4" />,
    required: true,
  },
  passport: {
    label: "Passport",
    description: "Full passport scan (all pages)",
    icon: <FileText className="w-4 h-4" />,
    required: false,
  },
  additional: {
    label: "Additional Documents",
    description: "Any other required documents",
    icon: <FileText className="w-4 h-4" />,
    required: false,
  },
};

// ✅ ENHANCED: More robust payment validation functions
const validatePaymentData = (paymentData) => {
  if (!paymentData) return false;

  // Check if payment data exists and has essential fields
  const hasOrderId = !!(paymentData.order_id || paymentData.order_name);
  const hasAmount = !!(
    paymentData.total_price && parseFloat(paymentData.total_price) > 0
  );
  const hasPaymentDate = !!(
    paymentData.paid_at || paymentData.webhook_processed_at
  );

  // Check payment status
  const isValidStatus =
    paymentData.financial_status === "paid" ||
    paymentData.financial_status === "partially_paid" ||
    (paymentData.is_test_order === true && hasAmount);

  console.log("🔍 Payment validation details:", {
    hasOrderId,
    hasAmount,
    hasPaymentDate,
    isValidStatus,
    financial_status: paymentData.financial_status,
    is_test_order: paymentData.is_test_order,
    total_price: paymentData.total_price,
  });

  return hasOrderId && hasAmount && hasPaymentDate && isValidStatus;
};

const isPaymentComplete = (request) => {
  if (!request) return false;

  // Multiple layers of payment validation
  const hasValidPaymentData = validatePaymentData(request.payment_data);

  // Additional checks for request status
  const paymentCompletedStatuses = [
    "payment_completed",
    "in_review",
    "processing",
    "completed",
  ];
  const hasPaymentStatus = paymentCompletedStatuses.includes(request.status);

  // Cart data with checkout completion indicator
  const hasCompletedCheckout = request.cart_data?.checkout_completed === true;

  console.log("💳 Payment completion check:", {
    hasValidPaymentData,
    hasPaymentStatus,
    hasCompletedCheckout,
    currentStatus: request.status,
    paymentDataExists: !!request.payment_data,
  });

  return hasValidPaymentData || hasPaymentStatus || hasCompletedCheckout;
};

const shouldShowPaymentSection = (request, checkingPayment) => {
  if (!request) return false;

  // Don't show if payment is already complete
  if (isPaymentComplete(request)) return false;

  // Don't show if no package price
  if (!request.package_price || parseFloat(request.package_price) <= 0)
    return false;

  // Don't show if currently checking payment status
  if (checkingPayment) return false;

  // Don't show if request is completed or cancelled
  const nonPaymentStatuses = ["completed", "cancelled", "rejected"];
  if (nonPaymentStatuses.includes(request.status)) return false;

  console.log("💰 Should show payment section:", true);
  return true;
};

// ✅ NEW: Auto-update status when payment is received
const updateStatusBasedOnPayment = async (request) => {
  try {
    if (!request) return;

    // If payment is complete but status is still pending_payment, auto-update to in_review
    const hasValidPayment = validatePaymentData(request.payment_data);
    const requiredDocsUploaded = areRequiredDocumentsUploaded();

    if (hasValidPayment && request.status === "pending_payment") {
      console.log("💳 Payment detected, auto-updating status to in_review...");

      const { error } = await supabase
        .from("company_requests")
        .update({
          status: requiredDocsUploaded ? "in_review" : "payment_completed",
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (error) {
        console.error("❌ Failed to auto-update status:", error);
      } else {
        console.log("✅ Status auto-updated successfully");
        // Update local state
        setRequest((prev) => ({
          ...prev,
          status: requiredDocsUploaded ? "in_review" : "payment_completed",
        }));
      }
    }
  } catch (error) {
    console.error("❌ Error in updateStatusBasedOnPayment:", error);
  }
};

export default function RequestDetailsPage() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("identity");
  const [user, setUser] = useState(null);
  const [paying, setPaying] = useState(false);
  const [paymentAttempted, setPaymentAttempted] = useState(false);

  const { checkingPayment, paymentStatus, checkPaymentStatus } =
    usePaymentStatusCheck(request, user);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate("/login");
          return;
        }
        setUser(user);

        // Fetch company request
        const { data: requestData, error: requestError } = await supabase
          .from("company_requests")
          .select("*")
          .eq("id", requestId)
          .eq("user_id", user.id)
          .single();

        if (requestError) {
          throw new Error(
            "Request not found or you do not have permission to view it."
          );
        }
        setRequest(requestData);

        // ✅ ENHANCED: Check if payment was attempted in this session
        const sessionPaymentKey = `payment_attempted_${requestId}`;
        const sessionPaymentAttempted =
          sessionStorage.getItem(sessionPaymentKey);
        if (sessionPaymentAttempted) {
          setPaymentAttempted(true);
          console.log("💳 Payment was attempted in this session");
        }

        // Fetch user profile separately
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            console.warn("Could not fetch user profile:", profileError);
          } else if (profileData) {
            setUserProfile(profileData);
          }
        } catch (profileCatchError) {
          console.warn(
            "An error occurred while fetching the profile:",
            profileCatchError
          );
        }

        // Fetch documents
        const { data: documentsData } = await supabase
          .from("documents")
          .select("*")
          .eq("request_id", requestId)
          .order("created_at", { ascending: false });
        setDocuments(documentsData || []);

        // Fetch communications
        let communicationsData = [];

        try {
          // Option 1: Try to get activity logs for this request
          const { data: activityData, error: activityError } = await supabase
            .from("activity_logs")
            .select("*")
            .eq("request_id", requestId)
            .order("created_at", { ascending: false });

          if (!activityError && activityData) {
            // Convert activity logs to communication format
            communicationsData = activityData.map((log) => ({
              id: log.id,
              sender_type: "system",
              sender_id: null,
              message:
                log.description ||
                `${log.action}: ${log.description || "Activity logged"}`,
              created_at: log.created_at,
              metadata: log.metadata,
              source: "activity_log",
            }));
          }

          // Option 2: Check if there's a company_communications table (future feature)
          try {
            const { data: companyCommData, error: companyCommError } =
              await supabase
                .from("company_communications")
                .select("*")
                .eq("company_request_id", requestId)
                .order("created_at", { ascending: false });

            if (!companyCommError && companyCommData) {
              // Add company communications to the list
              const companyComms = companyCommData.map((comm) => ({
                ...comm,
                source: "company_communication",
              }));
              communicationsData = [...communicationsData, ...companyComms];
            }
          } catch (companyCommTableError) {
            console.log("Company communications table not available yet");
          }

          // Sort all communications by date
          communicationsData.sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        } catch (error) {
          console.warn("Could not fetch communications:", error);
          communicationsData = [];
        }

        setCommunications(communicationsData);

        // ✅ NEW: Auto-update status if payment is detected
        if (requestData) {
          await updateStatusBasedOnPayment(requestData);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchData();
    }

    // Real-time subscription
    const channel = supabase
      .channel(`request_${requestId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "company_requests",
          filter: `id=eq.${requestId}`,
        },
        async (payload) => {
          console.log("🔄 Real-time update received:", payload.new);
          const updatedRequest = { ...payload.new };
          setRequest(updatedRequest);

          // ✅ ENHANCED: Clear payment attempted flag if payment data is received
          if (payload.new.payment_data && !payload.old?.payment_data) {
            console.log(
              "💳 Payment data received, clearing payment attempted flag"
            );
            const sessionPaymentKey = `payment_attempted_${requestId}`;
            sessionStorage.removeItem(sessionPaymentKey);
            setPaymentAttempted(false);

            // ✅ NEW: Auto-update status when payment is received
            await updateStatusBasedOnPayment(updatedRequest);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documents",
          filter: `request_id=eq.${requestId}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            setDocuments((current) => [payload.new, ...current]);

            // ✅ NEW: Check if this document upload should trigger status update
            const currentRequest = await supabase
              .from("company_requests")
              .select("*")
              .eq("id", requestId)
              .single();

            if (currentRequest.data) {
              await updateStatusBasedOnPayment(currentRequest.data);
            }
          } else if (payload.eventType === "UPDATE") {
            setDocuments((current) =>
              current.map((doc) =>
                doc.id === payload.new.id ? payload.new : doc
              )
            );
          } else if (payload.eventType === "DELETE") {
            setDocuments((current) =>
              current.filter((doc) => doc.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [requestId, navigate]);

  // ✅ ENHANCED: Document upload requirements check
  const getRequiredDocuments = () => {
    return Object.entries(documentTypes).filter(
      ([type, config]) => config.required
    );
  };

  const getUploadedRequiredDocuments = () => {
    const requiredTypes = getRequiredDocuments().map(([type]) => type);
    return documents.filter((doc) => requiredTypes.includes(doc.document_type));
  };

  const areRequiredDocumentsUploaded = () => {
    const requiredTypes = getRequiredDocuments().map(([type]) => type);
    const uploadedRequiredTypes = getUploadedRequiredDocuments().map(
      (doc) => doc.document_type
    );
    return requiredTypes.every((type) => uploadedRequiredTypes.includes(type));
  };

  // ✅ ENHANCED: More comprehensive payment section logic
  const getPaymentSectionContent = () => {
    const paymentComplete = isPaymentComplete(request);
    const showPaymentSection = shouldShowPaymentSection(
      request,
      checkingPayment
    );
    const requiredDocsUploaded = areRequiredDocumentsUploaded();
    const missingDocs = getRequiredDocuments().filter(
      ([type]) => !documents.some((doc) => doc.document_type === type)
    );

    // If checking payment status
    if (checkingPayment) {
      return (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-1">
                  Checking Payment Status...
                </h2>
                <p className="text-blue-700">
                  We're verifying if your payment has been processed
                </p>
              </div>
            </div>

            <div className="bg-white border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 text-center">
                This may take a few seconds. Please wait...
              </p>
            </div>
          </CardContent>
        </Card>
      );
    }

    // If payment is complete - show status based on documents and request status
    if (paymentComplete) {
      const paymentData = request.payment_data;

      // Check if request is completed
      if (request.status === "completed") {
        return (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-900 mb-1">
                    ✅ Company Formation Completed!
                  </h2>
                  <p className="text-green-700">
                    Your company has been successfully formed
                  </p>
                </div>
              </div>

              <div className="bg-white border border-green-200 rounded-xl p-6">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Building2 className="h-6 w-6 text-green-600" />
                    <span className="text-xl font-bold text-green-900">
                      {request.company_name}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">
                    Congratulations! Your company formation process is complete.
                  </p>
                  <Badge className="bg-green-100 text-green-800 px-4 py-2">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Formation Complete
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Check if request is in review
      if (request.status === "in_review" || requiredDocsUploaded) {
        return (
          <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-blue-900 mb-1">
                    📋 Application In Review
                  </h2>
                  <p className="text-blue-700">
                    We're processing your company formation request
                  </p>
                </div>
              </div>

              {paymentData && (
                <div className="bg-white border border-blue-200 rounded-xl p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Payment
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600">
                          Confirmed
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Documents
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="font-bold text-green-600">
                          Received
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600 mb-1">
                        Status
                      </p>
                      <div className="flex items-center justify-center gap-1">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-bold text-blue-600">
                          In Review
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      What's happening now?
                    </p>
                    <p className="text-sm text-blue-800">
                      Our team is reviewing your application and submitted
                      documents. You'll receive updates as we progress with your
                      company formation.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
                  <Clock className="h-4 w-4 mr-2" />
                  Estimated processing time: 3-5 business days
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      }

      // Payment complete but documents missing
      return (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-orange-900 mb-1">
                  📄 Documents Required
                </h2>
                <p className="text-orange-700">
                  Upload required documents to proceed with review
                </p>
              </div>
            </div>

            {paymentData && (
              <div className="bg-white border border-orange-200 rounded-xl p-4 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Payment Status
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-bold text-green-600">
                        Confirmed
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      Next Step
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <Upload className="h-4 w-4 text-orange-600" />
                      <span className="font-bold text-orange-600">
                        Upload Documents
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white border border-orange-200 rounded-xl p-6 mb-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="h-5 w-5 text-orange-600" />
                Missing Required Documents:
              </h3>
              <div className="space-y-3">
                {missingDocs.map(([type, config]) => (
                  <div
                    key={type}
                    className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                  >
                    <div className="p-2 bg-orange-100 rounded-lg">
                      {config.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-600">
                        {config.description}
                      </p>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      Required
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-900">
                    Action Required
                  </p>
                  <p className="text-sm text-orange-800">
                    Once you upload all required documents, we'll automatically
                    move your application to review.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // If payment was attempted but not yet confirmed
    if (paymentAttempted) {
      return (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-orange-100 rounded-full">
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-orange-900 mb-1">
                  ⏳ Payment Processing...
                </h2>
                <p className="text-orange-700">
                  We're checking if your payment has been processed
                </p>
              </div>
            </div>

            <div className="bg-white border border-orange-200 rounded-xl p-6 mb-6">
              <div className="text-center">
                <p className="text-gray-700 mb-4">
                  Payment was initiated but we're still waiting for
                  confirmation. This usually takes a few moments.
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>Please wait while we verify your payment...</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={checkPaymentStatus}
                disabled={checkingPayment}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                {checkingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking Payment...
                  </>
                ) : (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Check Payment Status
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  If you did not complete the payment, you can try again by
                  refreshing this page
                </p>
                {/* <Button
                  onClick={() => {
                    const sessionPaymentKey = `payment_attempted_${requestId}`;
                    sessionStorage.removeItem(sessionPaymentKey);
                    setPaymentAttempted(false);
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Reset Payment Status
                </Button> */}
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Show payment button (only if payment is not complete and hasn't been attempted)
    if (showPaymentSection) {
      return (
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-900 mb-1">
                  Complete Your Payment
                </h2>
                <p className="text-blue-700">
                  Secure payment to start your company formation process
                </p>
              </div>
            </div>

            <div className="bg-white border border-blue-200 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {request.package_name}
                  </h3>
                  <p className="text-gray-600">
                    Complete company formation package
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900">
                    £{parseFloat(request.package_price).toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    + £50 Companies House fee
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handlePayment}
                disabled={paying}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 text-lg"
                size="lg"
              >
                {paying ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-3 h-6 w-6" />
                    Pay Securely - £
                    {parseFloat(request.package_price).toFixed(2)}
                    <ExternalLink className="ml-3 h-5 w-5" />
                  </>
                )}
              </Button>

              <Button
                onClick={checkPaymentStatus}
                variant="outline"
                className="w-full"
                disabled={checkingPayment}
              >
                {checkingPayment ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
                    Check Payment Status
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500 mt-3">
              🔒 Secure payment powered by Shopify • SSL encrypted
            </p>
          </CardContent>
        </Card>
      );
    }

    // ✅ ENHANCED: Payment not needed or not available
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-r from-gray-50 to-slate-50">
        <CardContent className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-gray-100 rounded-full">
              <AlertTriangle className="h-8 w-8 text-gray-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Payment Not Required
              </h2>
              <p className="text-gray-700">
                This request doesn't require additional payment
              </p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="text-center">
              <p className="text-gray-600">
                {request.status === "completed"
                  ? "Your company formation has been completed successfully."
                  : "Payment is not available for this request at the moment."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ✅ ENHANCED: Payment handler with session tracking
  const handlePayment = async () => {
    if (!request || !user) {
      alert("Request or user information not available");
      return;
    }

    // ✅ ENHANCED: Check if payment is already complete before proceeding
    if (isPaymentComplete(request)) {
      alert("Payment has already been completed for this request.");
      return;
    }

    try {
      setPaying(true);
      console.log("🚀 Starting payment process...");

      // ✅ ENHANCED: Mark payment as attempted in session storage
      const sessionPaymentKey = `payment_attempted_${requestId}`;
      sessionStorage.setItem(sessionPaymentKey, "true");
      setPaymentAttempted(true);

      let packageInfo;
      try {
        const { getShopifyProductInfo } = await import("@/lib/packages");
        packageInfo = getShopifyProductInfo(request.package_name);
        console.log("📦 Package info:", packageInfo);
      } catch (importError) {
        console.error("❌ Failed to import package info:", importError);
        throw new Error("Could not load package information");
      }

      if (!packageInfo) {
        console.error("❌ Package not found:", request.package_name);
        throw new Error(
          `Package "${request.package_name}" not found in system`
        );
      }

      if (!packageInfo.variantId) {
        console.error("❌ No variant ID:", packageInfo);
        throw new Error("Package variant ID missing");
      }

      console.log("🛒 Creating checkout session...");

      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            variantId: packageInfo.variantId,
            productId: packageInfo.shopifyProductId,
            requestId: request.id,
          },
        }
      );

      console.log("📡 Function response:", { data, error });

      if (error) {
        console.error("❌ Function invocation error:", error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (!data) {
        console.error("❌ No data received from function");
        throw new Error("No response data from checkout function");
      }

      if (data.error) {
        console.error("❌ Function returned error:", data.error);
        throw new Error(`Checkout error: ${data.error}`);
      }

      if (!data.checkoutUrl) {
        console.error("❌ No checkout URL in response:", data);
        throw new Error("Checkout URL not provided by payment service");
      }

      try {
        new URL(data.checkoutUrl);
      } catch (urlError) {
        console.error("❌ Invalid checkout URL:", data.checkoutUrl);
        throw new Error("Invalid checkout URL received");
      }

      console.log("✅ Checkout URL received:", data.checkoutUrl);
      console.log("🔗 Redirecting to payment...");

      // ✅ ENHANCED: Update cart data to mark checkout as initiated
      try {
        await supabase
          .from("company_requests")
          .update({
            cart_data: {
              ...request.cart_data,
              cart_id: data.cartId,
              checkout_url: data.checkoutUrl,
              checkout_initiated_at: new Date().toISOString(),
            },
            updated_at: new Date().toISOString(),
          })
          .eq("id", request.id);
      } catch (updateError) {
        console.warn("⚠️ Could not update cart data:", updateError);
      }

      window.location.href = data.checkoutUrl;
    } catch (error) {
      console.error("💥 Payment error details:", {
        message: error.message,
        stack: error.stack,
        request: request
          ? { id: request.id, package_name: request.package_name }
          : null,
        user: user ? { id: user.id, email: user.email } : null,
      });

      // ✅ ENHANCED: Clear payment attempted flag on error
      const sessionPaymentKey = `payment_attempted_${requestId}`;
      sessionStorage.removeItem(sessionPaymentKey);
      setPaymentAttempted(false);

      let userMessage = "Payment setup failed. ";

      if (
        error.message.includes("Package") &&
        error.message.includes("not found")
      ) {
        userMessage += "Package configuration issue. Please contact support.";
      } else if (error.message.includes("variant ID")) {
        userMessage += "Product configuration issue. Please contact support.";
      } else if (error.message.includes("Function error")) {
        userMessage += "Server error. Please try again or contact support.";
      } else if (error.message.includes("Checkout URL")) {
        userMessage += "Payment service unavailable. Please try again later.";
      } else {
        userMessage +=
          "Please try again or contact support if the problem persists.";
      }

      alert(userMessage);
    } finally {
      setPaying(false);
    }
  };

  // File handling functions
  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        alert("Please upload PDF, JPG, PNG, DOC, or DOCX files only");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      alert("Please select a file first");
      return;
    }
    setUploading(true);
    try {
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}_${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${user.id}/${requestId}/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(filePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      await supabase.from("documents").insert({
        request_id: requestId,
        user_id: user.id,
        file_name: selectedFile.name,
        storage_path: filePath,
        file_size: selectedFile.size,
        mime_type: selectedFile.type,
        document_type: documentType,
        uploaded_by: user.id,
      });

      setSelectedFile(null);
      document.getElementById("file-upload").value = "";

      alert("Document uploaded successfully!");
    } catch (error) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .download(document.storage_path);
      if (error) throw error;
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = document.file_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert(`Download failed: ${error.message}`);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    try {
      const documentToDelete = documents.find((d) => d.id === documentId);
      if (!documentToDelete) return;
      await supabase.storage
        .from("documents")
        .remove([documentToDelete.storage_path]);
      await supabase
        .from("documents")
        .delete()
        .eq("id", documentId)
        .eq("user_id", user.id);
      alert("Document deleted successfully");
    } catch (error) {
      alert(`Delete failed: ${error.message}`);
    }
  };

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Request
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
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
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Request Not Found
            </h3>
            <p className="text-gray-600 mb-4">
              The requested company formation details could not be found.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      {/* ✅ IMPROVED: Modern Header with better spacing */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 border"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-blue-100 rounded-2xl">
              <Building2 className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {request.company_name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Created {new Date(request.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="h-4 w-4" />
                  {request.package_name}
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  ID: {request.id.slice(0, 8)}
                </div>
              </div>
            </div>
          </div>
          <Button
            onClick={() => navigate("/dashboard")}
            size="lg"
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </div>
      </motion.div>

      {/* ✅ ENHANCED: Payment Section with improved logic */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {getPaymentSectionContent()}
      </motion.div>

      {/* ✅ IMPROVED: Modern grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Company Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <Building2 className="h-6 w-6 text-blue-600" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Company Name
                    </Label>
                    <p className="text-lg font-bold text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {request.company_name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Package
                    </Label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {request.package_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {request.package_price && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Package Price
                      </Label>
                      <p className="text-lg font-bold text-blue-600 bg-blue-50 p-3 rounded-lg flex items-center gap-2">
                        <FaPoundSign className="h-4 w-4" />
                        {parseFloat(request.package_price).toFixed(2)}
                      </p>
                    </div>
                  )}
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Created
                    </Label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                      {new Date(request.created_at).toLocaleString("en-GB")}
                    </p>
                  </div>
                </div>
              </div>

              {request.completed_at && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Completed
                  </Label>
                  <p className="text-gray-900 bg-green-50 p-3 rounded-lg">
                    {new Date(request.completed_at).toLocaleString("en-GB")}
                  </p>
                </div>
              )}

              {request.notes && (
                <div>
                  <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Notes
                  </Label>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                    {request.notes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Details */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <User className="h-6 w-6 text-green-600" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile ? (
                <>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Full Name
                    </Label>
                    <p className="bg-gray-50 p-3 rounded-lg">
                      {userProfile.full_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                      Email
                    </Label>
                    <p className="bg-gray-50 p-3 rounded-lg">
                      {userProfile.email || user?.email}
                    </p>
                  </div>
                  {userProfile.phone && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Phone
                      </Label>
                      <p className="bg-gray-50 p-3 rounded-lg">
                        {userProfile.phone}
                      </p>
                    </div>
                  )}
                  {userProfile.country && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Country
                      </Label>
                      <p className="bg-gray-50 p-3 rounded-lg">
                        {userProfile.country}
                      </p>
                    </div>
                  )}
                  {userProfile.address && (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Address
                      </Label>
                      <p className="bg-gray-50 p-3 rounded-lg whitespace-pre-line">
                        {userProfile.address}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <User className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    User profile details could not be loaded.
                  </p>
                  <Button
                    onClick={() => navigate("/dashboard/settings")}
                    variant="outline"
                    size="sm"
                  >
                    Complete Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ✅ IMPROVED: Document Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-xl">
              <Upload className="h-6 w-6 text-purple-600" />
              Document Upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            {request.status === "completed" ? (
              <div className="text-center py-12">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  All Documents Processed
                </h3>
                <p className="text-gray-600">
                  Company formation completed successfully! All required
                  documents have been processed.
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Document Requirements Grid */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Document Requirements
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(documentTypes).map(([type, config]) => {
                      const hasDocument = documents.some(
                        (doc) => doc.document_type === type
                      );
                      return (
                        <div
                          key={type}
                          className={`p-4 border-2 rounded-xl transition-all ${
                            hasDocument
                              ? "bg-green-50 border-green-200 shadow-sm"
                              : "bg-gray-50 border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div
                              className={`p-2 rounded-lg ${
                                hasDocument ? "bg-green-100" : "bg-gray-100"
                              }`}
                            >
                              {config.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">
                                  {config.label}
                                </span>
                                {config.required && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs px-2 py-0"
                                  >
                                    Required
                                  </Badge>
                                )}
                                {hasDocument && (
                                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                                )}
                              </div>
                              <p className="text-xs text-gray-600 mt-1">
                                {config.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Upload New Document */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Upload className="h-5 w-5 text-purple-600" />
                    Upload New Document
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="document-type"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Document Type
                      </Label>
                      <select
                        id="document-type"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {Object.entries(documentTypes).map(([type, config]) => (
                          <option key={type} value={type}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label
                        htmlFor="file-upload"
                        className="text-sm font-semibold text-gray-700 mb-2 block"
                      >
                        Select File
                      </Label>
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                      />
                      <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        Accepted: PDF, JPG, PNG, DOC, DOCX • Max: 10MB
                      </p>
                    </div>
                    {selectedFile && (
                      <div className="bg-white border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-100 rounded-lg">
                              <FileText className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)}{" "}
                                MB
                              </p>
                            </div>
                          </div>
                          <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="bg-purple-600 hover:bg-purple-700"
                          >
                            {uploading ? (
                              <>
                                <Loader2 className="animate-spin mr-2 h-4 w-4" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ✅ IMPROVED: Uploaded Documents */}
      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <FileText className="h-6 w-6 text-blue-600" />
                Uploaded Documents ({documents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documents.map((document) => {
                  const docType =
                    documentTypes[document.document_type] ||
                    documentTypes.additional;
                  return (
                    <div
                      key={document.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {docType.icon}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-1">
                            {document.file_name}
                          </p>
                          <p className="text-xs text-gray-500 mb-2">
                            {docType.label} •{" "}
                            {document.file_size
                              ? `${(document.file_size / 1024 / 1024).toFixed(
                                  2
                                )} MB`
                              : ""}{" "}
                            •{" "}
                            {new Date(document.created_at).toLocaleDateString()}
                          </p>
                          {document.status && (
                            <Badge
                              className={`text-xs ${
                                document.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : document.status === "rejected"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {document.status.charAt(0).toUpperCase() +
                                document.status.slice(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => handleDownloadDocument(document)}
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          {request.status !== "completed" && (
                            <Button
                              onClick={() => handleDeleteDocument(document.id)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ✅ IMPROVED: Communications */}
      {communications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl">
                <MessageSquare className="h-6 w-6 text-green-600" />
                Activity & Communications ({communications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {communications.map((comm) => {
                  // Determine the style based on source and type
                  const getCommStyle = () => {
                    if (comm.source === "activity_log") {
                      return "bg-blue-50 border-l-4 border-blue-500";
                    } else if (comm.sender_type === "admin") {
                      return "bg-green-50 border-l-4 border-green-500";
                    } else if (comm.sender_type === "system") {
                      return "bg-gray-50 border-l-4 border-gray-400";
                    } else {
                      return "bg-purple-50 border-l-4 border-purple-500";
                    }
                  };

                  const getBadgeInfo = () => {
                    if (comm.source === "activity_log") {
                      return { label: "System Activity", variant: "outline" };
                    } else if (comm.sender_type === "admin") {
                      return { label: "Support Team", variant: "default" };
                    } else if (comm.sender_type === "system") {
                      return { label: "Automated", variant: "secondary" };
                    } else {
                      return { label: "You", variant: "outline" };
                    }
                  };

                  const badgeInfo = getBadgeInfo();

                  return (
                    <div
                      key={comm.id}
                      className={`p-4 rounded-xl ${getCommStyle()}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={badgeInfo.variant}
                            className="text-xs"
                          >
                            {badgeInfo.label}
                          </Badge>
                          {comm.source && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {comm.source.replace("_", " ")}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(comm.created_at).toLocaleString("en-GB")}
                        </span>
                      </div>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
                        {comm.message}
                      </p>

                      {/* Show metadata if available (for activity logs) */}
                      {comm.metadata &&
                        Object.keys(comm.metadata).length > 0 && (
                          <details className="mt-3">
                            <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                              View Details
                            </summary>
                            <pre className="text-xs text-gray-600 mt-2 bg-gray-100 p-2 rounded overflow-auto">
                              {JSON.stringify(comm.metadata, null, 2)}
                            </pre>
                          </details>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* Info box about communications */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    <strong>About this section:</strong> This shows system
                    activities, automated updates, and any communications
                    related to your company formation request.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ✅ IMPROVED: Additional Services (if completed) */}
      {request.status === "completed" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
            <CardContent className="p-8">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="p-4 bg-purple-100 rounded-2xl">
                    <FaShoppingBag className="h-8 w-8 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      🎉 Company Formation Complete!
                    </h3>
                    <p className="text-gray-600 text-lg">
                      Explore additional services to grow your business
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate("/dashboard/marketplace")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-8 py-3"
                  size="lg"
                >
                  <FaShoppingBag className="mr-3 h-5 w-5" />
                  Browse Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ✅ IMPROVED: Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-100 rounded-2xl">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Need Help?
                  </h3>
                  <p className="text-gray-600 text-lg">
                    Have questions about your company formation? Our support
                    team is here to help.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <Mail className="h-5 w-5 mr-2" />
                  Contact Support
                </Button>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <Phone className="h-5 w-5 mr-2" />
                  Schedule Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
