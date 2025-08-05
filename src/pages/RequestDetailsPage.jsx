// src/pages/RequestDetailsPage.jsx - İSTENEN DÜZELTMELERİN UYGULANDIĞI TAM VE GÜNCEL KOD
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Loader from "@/components/ui/Loader";
import {
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle,
  FaSpinner,
  FaPoundSign,
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
} from "lucide-react";

// Status configuration (Değişiklik yok)
const statusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800",
    icon: FaClock,
    label: "Pending Payment",
    description: "Payment is required to proceed with your company formation",
    progress: 10,
    nextSteps: [
      "Complete payment to start processing",
      "Upload required documents",
      "Wait for review confirmation",
    ],
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800",
    icon: FaCheckCircle,
    label: "Payment Completed",
    description: "Payment received successfully. Starting review process.",
    progress: 25,
    nextSteps: [
      "Upload identity documents",
      "Provide proof of address",
      "Wait for document verification",
    ],
  },
  in_review: {
    color: "bg-blue-100 text-blue-800",
    icon: FaSpinner,
    label: "In Review",
    description: "Our team is reviewing your application and documents",
    progress: 50,
    nextSteps: [
      "Application under review",
      "Document verification in progress",
      "You will be contacted if additional info is needed",
    ],
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800",
    icon: FaExclamationTriangle,
    label: "Documents Required",
    description: "Additional documents are needed to proceed",
    progress: 35,
    nextSteps: [
      "Check document requirements below",
      "Upload missing documents",
      "Wait for verification",
    ],
  },
  processing: {
    color: "bg-purple-100 text-purple-800",
    icon: FaSpinner,
    label: "Processing",
    description: "Your company is being processed with Companies House",
    progress: 75,
    nextSteps: [
      "Application submitted to Companies House",
      "Processing typically takes 24-48 hours",
      "You'll receive confirmation once completed",
    ],
  },
  completed: {
    color: "bg-green-100 text-green-800",
    icon: FaCheckCircle,
    label: "Completed",
    description: "Congratulations! Your company has been successfully formed",
    progress: 100,
    nextSteps: [
      "Download your incorporation documents",
      "Set up business banking",
      "Consider additional services",
    ],
  },
  rejected: {
    color: "bg-red-100 text-red-800",
    icon: FaTimesCircle,
    label: "Rejected",
    description: "Your application has been rejected. Please contact support.",
    progress: 0,
    nextSteps: [
      "Contact support for assistance",
      "Review rejection reasons",
      "Consider resubmitting with corrections",
    ],
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800",
    icon: FaTimesCircle,
    label: "Cancelled",
    description: "This request has been cancelled",
    progress: 0,
    nextSteps: [],
  },
};

// Document types configuration (Değişiklik yok)
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

export default function RequestDetailsPage() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // ✅ YENİ: Profile verisi için ayrı state
  const [documents, setDocuments] = useState([]);
  const [communications, setCommunications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("identity");
  const [user, setUser] = useState(null);

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

        // ✅ GÜNCELLEME 1: İlişki (JOIN) olmadan, sadece başvuru verisini çek.
        const { data: requestData, error: requestError } = await supabase
          .from("company_requests")
          .select("*")
          .eq("id", requestId)
          .eq("user_id", user.id) // ✅ Güvenlik: Sadece mevcut kullanıcıya ait başvuruyu çek
          .single();

        if (requestError) {
          throw new Error(
            "Request not found or you do not have permission to view it."
          );
        }
        setRequest(requestData);

        // ✅ GÜNCELLEME 2: Profile verisini ayrı bir sorgu ile çek.
        // Bu sorgu başarısız olsa bile sayfa çalışmaya devam edecek.
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (profileError && profileError.code !== "PGRST116") {
            // 'PGRST116' = no rows found
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

        // Dokümanları ve iletişimleri çekmeye devam et
        const { data: documentsData } = await supabase
          .from("documents")
          .select("*")
          .eq("request_id", requestId)
          .order("created_at", { ascending: false });
        setDocuments(documentsData || []);

        const { data: communicationsData } = await supabase
          .from("order_communications")
          .select(
            "*, profiles!order_communications_sender_id_fkey(full_name, email)"
          )
          .eq("company_request_id", requestId)
          .order("created_at", { ascending: false });
        setCommunications(communicationsData || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (requestId) {
      fetchData();
    }

    // ✅ GÜNCELLEME 3: Canlı güncelleme aboneliği korunuyor.
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
        (payload) => {
          setRequest((current) => ({ ...current, ...payload.new }));
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
        (payload) => {
          if (payload.eventType === "INSERT")
            setDocuments((current) => [payload.new, ...current]);
          else if (payload.eventType === "UPDATE")
            setDocuments((current) =>
              current.map((doc) =>
                doc.id === payload.new.id ? payload.new : doc
              )
            );
          else if (payload.eventType === "DELETE")
            setDocuments((current) =>
              current.filter((doc) => doc.id !== payload.old.id)
            );
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [requestId, navigate]);

  // handleFileChange, handleUpload, handleDownloadDocument, handleDeleteDocument fonksiyonları aynı kalıyor...
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
      await supabase
        .from("documents")
        .insert({
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

  // Hata ve bulunamadı durumları için JSX (Değişiklik yok)
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <Card className="max-w-md">
          {" "}
          <CardContent className="p-6 text-center">
            {" "}
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />{" "}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Request
            </h3>{" "}
            <p className="text-gray-600 mb-4">{error}</p>{" "}
            <div className="flex gap-2 justify-center">
              {" "}
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Try Again
              </Button>{" "}
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>
    );
  }
  if (!request) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {" "}
        <Card className="max-w-md">
          {" "}
          <CardContent className="p-6 text-center">
            {" "}
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />{" "}
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Request Not Found
            </h3>{" "}
            <p className="text-gray-600 mb-4">
              The requested company formation details could not be found.
            </p>{" "}
            <Button onClick={() => navigate("/dashboard")}>
              Back to Dashboard
            </Button>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </div>
    );
  }

  const status = statusConfig[request.status] || statusConfig.pending_payment;
  const StatusIcon = status.icon;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header (Değişiklik yok) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        {" "}
        <div>
          {" "}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {request.company_name}
          </h1>{" "}
          <p className="text-gray-600">
            {" "}
            Request ID: {request.id.slice(0, 8)} • Created{" "}
            {new Date(request.created_at).toLocaleDateString()}{" "}
          </p>{" "}
        </div>{" "}
        <div className="flex items-center gap-4">
          {" "}
          <Badge className={`${status.color} border px-3 py-1`}>
            {" "}
            <StatusIcon className="mr-2 h-4 w-4" /> {status.label}{" "}
          </Badge>{" "}
          <Button onClick={() => navigate("/dashboard")} variant="outline">
            {" "}
            Back to Dashboard{" "}
          </Button>{" "}
        </div>{" "}
      </motion.div>

      {/* Status Progress (Değişiklik yok) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="flex items-center gap-2">
              {" "}
              <StatusIcon className="h-5 w-5" /> Current Status: {status.label}{" "}
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            <div className="space-y-4">
              {" "}
              <div>
                {" "}
                <div className="flex justify-between text-sm mb-2">
                  {" "}
                  <span>Progress</span> <span>{status.progress}%</span>{" "}
                </div>{" "}
                <Progress value={status.progress} className="h-2" />{" "}
              </div>{" "}
              <p className="text-gray-600">{status.description}</p>{" "}
              {status.nextSteps.length > 0 && (
                <div>
                  {" "}
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Next Steps:
                  </h4>{" "}
                  <ul className="space-y-1">
                    {" "}
                    {status.nextSteps.map((step, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        {" "}
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />{" "}
                        {step}{" "}
                      </li>
                    ))}{" "}
                  </ul>{" "}
                </div>
              )}{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Details (Değişiklik yok) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {" "}
          <Card>
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="flex items-center gap-2">
                {" "}
                <Building2 className="h-5 w-5" /> Company Details{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent className="space-y-4">
              {" "}
              <div>
                {" "}
                <Label className="text-sm font-medium text-gray-700">
                  Company Name
                </Label>{" "}
                <p className="text-gray-900 font-semibold">
                  {request.company_name}
                </p>{" "}
              </div>{" "}
              <div>
                {" "}
                <Label className="text-sm font-medium text-gray-700">
                  Package
                </Label>{" "}
                <p className="text-gray-900">{request.package_name}</p>{" "}
              </div>{" "}
              {request.package_price && (
                <div>
                  {" "}
                  <Label className="text-sm font-medium text-gray-700">
                    Package Price
                  </Label>{" "}
                  <p className="text-gray-900 font-semibold flex items-center gap-1">
                    {" "}
                    <FaPoundSign className="h-3 w-3" />{" "}
                    {parseFloat(request.package_price).toFixed(2)}{" "}
                  </p>{" "}
                </div>
              )}{" "}
              <div>
                {" "}
                <Label className="text-sm font-medium text-gray-700">
                  Created
                </Label>{" "}
                <p className="text-gray-900">
                  {new Date(request.created_at).toLocaleString("en-GB")}
                </p>{" "}
              </div>{" "}
              {request.completed_at && (
                <div>
                  {" "}
                  <Label className="text-sm font-medium text-gray-700">
                    Completed
                  </Label>{" "}
                  <p className="text-gray-900">
                    {new Date(request.completed_at).toLocaleString("en-GB")}
                  </p>{" "}
                </div>
              )}{" "}
              {request.notes && (
                <div>
                  {" "}
                  <Label className="text-sm font-medium text-gray-700">
                    Notes
                  </Label>{" "}
                  <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                    {request.notes}
                  </p>{" "}
                </div>
              )}{" "}
            </CardContent>{" "}
          </Card>{" "}
        </motion.div>

        {/* ✅ GÜNCELLEME 4: Personal Details, request.profiles yerine userProfile state'inden besleniyor. */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile ? (
                <>
                  <div>
                    <Label>Full Name</Label>
                    <p>{userProfile.full_name || "Not provided"}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p>{userProfile.email}</p>
                  </div>
                  {userProfile.phone && (
                    <div>
                      <Label>Phone</Label>
                      <p>{userProfile.phone}</p>
                    </div>
                  )}
                  {userProfile.country && (
                    <div>
                      <Label>Country</Label>
                      <p>{userProfile.country}</p>
                    </div>
                  )}
                  {userProfile.address && (
                    <div>
                      <Label>Address</Label>
                      <p className="whitespace-pre-line">
                        {userProfile.address}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  User profile details could not be loaded.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Diğer tüm bölümler (Document Upload, Uploaded Documents, Communications, Help Section) aynı kalıyor. */}
      {/* Document Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {" "}
        <Card>
          {" "}
          <CardHeader>
            {" "}
            <CardTitle className="flex items-center gap-2">
              {" "}
              <Upload className="h-5 w-5" /> Document Upload{" "}
            </CardTitle>{" "}
          </CardHeader>{" "}
          <CardContent>
            {" "}
            {request.status === "completed" ? (
              <div className="text-center py-6">
                {" "}
                <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />{" "}
                <p className="text-gray-600">
                  {" "}
                  Your company formation is complete. No additional documents
                  required.{" "}
                </p>{" "}
              </div>
            ) : (
              <div className="space-y-6">
                {" "}
                <div>
                  {" "}
                  <h4 className="font-semibold text-gray-900 mb-3">
                    Required Documents
                  </h4>{" "}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {" "}
                    {Object.entries(documentTypes).map(([type, config]) => {
                      const hasDocument = documents.some(
                        (doc) => doc.document_type === type
                      );
                      return (
                        <div
                          key={type}
                          className={`p-3 border rounded-lg ${
                            hasDocument
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          {" "}
                          <div className="flex items-center gap-2 mb-1">
                            {" "}
                            {config.icon}{" "}
                            <span className="font-medium text-sm">
                              {config.label}
                            </span>{" "}
                            {config.required && (
                              <Badge variant="outline" className="text-xs">
                                Required
                              </Badge>
                            )}{" "}
                            {hasDocument && (
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                            )}{" "}
                          </div>{" "}
                          <p className="text-xs text-gray-600">
                            {config.description}
                          </p>{" "}
                        </div>
                      );
                    })}{" "}
                  </div>{" "}
                </div>{" "}
                <div className="border-t pt-6">
                  {" "}
                  <h4 className="font-semibold text-gray-900 mb-4">
                    Upload New Document
                  </h4>{" "}
                  <div className="space-y-4">
                    {" "}
                    <div>
                      {" "}
                      <Label htmlFor="document-type">Document Type</Label>{" "}
                      <select
                        id="document-type"
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full mt-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        {" "}
                        {Object.entries(documentTypes).map(([type, config]) => (
                          <option key={type} value={type}>
                            {config.label}
                          </option>
                        ))}{" "}
                      </select>{" "}
                    </div>{" "}
                    <div>
                      {" "}
                      <Label htmlFor="file-upload">Select File</Label>{" "}
                      <Input
                        id="file-upload"
                        type="file"
                        onChange={handleFileChange}
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        className="mt-1"
                      />{" "}
                      <p className="text-xs text-gray-500 mt-1">
                        Accepted formats: PDF, JPG, PNG, DOC, DOCX. Maximum
                        size: 10MB
                      </p>{" "}
                    </div>{" "}
                    {selectedFile && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        {" "}
                        <div className="flex items-center justify-between">
                          {" "}
                          <div>
                            {" "}
                            <p className="text-sm font-medium text-blue-900">
                              {selectedFile.name}
                            </p>{" "}
                            <p className="text-xs text-blue-700">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </p>{" "}
                          </div>{" "}
                          <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            {" "}
                            {uploading ? (
                              <>
                                <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="mr-2 h-4 w-4" />
                                Upload
                              </>
                            )}{" "}
                          </Button>{" "}
                        </div>{" "}
                      </div>
                    )}{" "}
                  </div>{" "}
                </div>{" "}
              </div>
            )}{" "}
          </CardContent>{" "}
        </Card>{" "}
      </motion.div>
      {/* Uploaded Documents */}
      {documents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {" "}
          <Card>
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="flex items-center gap-2">
                {" "}
                <FileText className="h-5 w-5" /> Uploaded Documents (
                {documents.length}){" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent>
              {" "}
              <div className="space-y-3">
                {" "}
                {documents.map((document) => {
                  const docType =
                    documentTypes[document.document_type] ||
                    documentTypes.additional;
                  return (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      {" "}
                      <div className="flex items-center gap-3">
                        {" "}
                        <div className="p-2 bg-blue-100 rounded-lg">
                          {docType.icon}
                        </div>{" "}
                        <div>
                          {" "}
                          <p className="font-medium text-sm text-gray-900">
                            {document.file_name}
                          </p>{" "}
                          <p className="text-xs text-gray-500">
                            {" "}
                            {docType.label} •{" "}
                            {document.file_size
                              ? `${(document.file_size / 1024 / 1024).toFixed(
                                  2
                                )} MB`
                              : ""}{" "}
                            • Uploaded{" "}
                            {new Date(document.created_at).toLocaleDateString()}{" "}
                          </p>{" "}
                          {document.status && (
                            <Badge
                              className={`text-xs mt-1 ${
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
                          )}{" "}
                        </div>{" "}
                      </div>{" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <Button
                          onClick={() => handleDownloadDocument(document)}
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Download className="h-4 w-4" />
                        </Button>{" "}
                        {request.status !== "completed" && (
                          <Button
                            onClick={() => handleDeleteDocument(document.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}{" "}
                      </div>{" "}
                    </div>
                  );
                })}{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </motion.div>
      )}
      {/* Communications */}
      {communications.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          {" "}
          <Card>
            {" "}
            <CardHeader>
              {" "}
              <CardTitle className="flex items-center gap-2">
                {" "}
                <MessageSquare className="h-5 w-5" /> Communications{" "}
              </CardTitle>{" "}
            </CardHeader>{" "}
            <CardContent>
              {" "}
              <div className="space-y-4">
                {" "}
                {communications.map((comm) => (
                  <div
                    key={comm.id}
                    className={`p-4 rounded-lg ${
                      comm.sender_type === "admin"
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "bg-gray-50"
                    }`}
                  >
                    {" "}
                    <div className="flex justify-between items-start mb-2">
                      {" "}
                      <div className="flex items-center gap-2">
                        {" "}
                        <Badge
                          variant={
                            comm.sender_type === "admin" ? "default" : "outline"
                          }
                          className="text-xs"
                        >
                          {" "}
                          {comm.sender_type === "admin"
                            ? "Support Team"
                            : "You"}{" "}
                        </Badge>{" "}
                        <span className="text-xs text-gray-500">
                          {new Date(comm.created_at).toLocaleString("en-GB")}
                        </span>{" "}
                      </div>{" "}
                    </div>{" "}
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {comm.message}
                    </p>{" "}
                  </div>
                ))}{" "}
              </div>{" "}
            </CardContent>{" "}
          </Card>{" "}
        </motion.div>
      )}
      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        {" "}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
          {" "}
          <CardContent className="p-6">
            {" "}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {" "}
              <div className="flex items-center gap-4">
                {" "}
                <div className="p-3 bg-blue-100 rounded-full">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>{" "}
                <div>
                  {" "}
                  <h3 className="font-semibold text-gray-900">
                    Need Help?
                  </h3>{" "}
                  <p className="text-sm text-gray-600">
                    Have questions about your company formation? Our support
                    team is here to help.
                  </p>{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex gap-2">
                {" "}
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Button>{" "}
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Phone className="h-4 w-4 mr-2" />
                  Schedule Call
                </Button>{" "}
              </div>{" "}
            </div>{" "}
          </CardContent>{" "}
        </Card>{" "}
      </motion.div>
    </div>
  );
}
