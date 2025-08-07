// src/pages/admin/CompanyRequestDetail.jsx - Admin view for company request details
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  User,
  AlertCircle,
  FileText,
  Download,
  Edit,
  Save,
  X,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
  ArrowLeft,
  Loader2,
  Eye,
  Ban,
  CheckCheck,
  Upload,
  Bug,
} from "lucide-react";

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
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: AlertTriangle,
    label: "Documents Required",
    description: "Additional documents are needed to proceed",
    progress: 35,
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
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: X,
    label: "Cancelled",
    description: "This request has been cancelled",
    progress: 0,
  },
};

export default function CompanyRequestDetail() {
  const { id: requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const [userProfile, setUserProfile] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [user, setUser] = useState(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  // Communication
  const [showCommunication, setShowCommunication] = useState(false);
  const [communicationMessage, setCommunicationMessage] = useState("");
  const [sendingCommunication, setSendingCommunication] = useState(false);

  const [activityLogs, setActivityLogs] = useState([]);

  // Debug states
  const [debugInfo, setDebugInfo] = useState(null);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  // ✅ COMPLETELY FIXED fetchRequestDetails function - gets documents by user_id
  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching request details for ID:", requestId);

      // ✅ 1. Get current user first
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("User not authenticated");
      }
      setUser(user);

      // ✅ 2. Company request'i çek
      const { data: requestData, error: requestError } = await supabase
        .from("company_requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (requestError) {
        console.error("❌ Request fetch error:", requestError);
        throw new Error("Request not found");
      }

      setRequest(requestData);
      setEditedStatus(requestData.status);
      setAdminNotes(requestData.admin_notes || "");
      console.log("✅ Request data:", requestData);

      // ✅ 3. User profile'ını çek
      if (requestData.user_id) {
        try {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", requestData.user_id)
            .single();

          if (!profileError && profileData) {
            setUserProfile(profileData);
            console.log("✅ Profile data:", profileData);
          } else {
            console.warn("⚠️ Profile not found:", profileError?.message);
          }
        } catch (profileErr) {
          console.warn("⚠️ Profile fetch failed:", profileErr);
        }
      }

      // ✅ 4. FIXED: Always check storage folder first, ignore database
      console.log(
        "🔍 Starting documents fetch - checking storage folder:",
        `${requestData.user_id}/${requestId}`
      );

      let documentsData = [];

      // ALWAYS check storage first - ignore database completely for now
      try {
        const { data: requestStorageFiles, error: storageError } =
          await supabase.storage
            .from("documents")
            .list(`${requestData.user_id}/${requestId}`, {
              limit: 100,
              sortBy: { column: "created_at", order: "desc" },
            });

        if (
          !storageError &&
          requestStorageFiles &&
          requestStorageFiles.length > 0
        ) {
          console.log(
            "✅ Found files in request folder:",
            requestStorageFiles.length
          );
          console.log("📁 Storage files details:", requestStorageFiles);

          // Convert ALL storage files to document format
          const virtualDocuments = requestStorageFiles
            .filter((file) => file.name && file.id !== null) // Only actual files, not folders
            .map((file) => ({
              id: `storage_${file.name}_${Date.now()}_${Math.random()}`,
              file_name: file.name,
              storage_path: `${requestData.user_id}/${requestId}/${file.name}`,
              document_type: file.metadata?.mimetype || getFileType(file.name),
              created_at:
                file.created_at || file.updated_at || new Date().toISOString(),
              uploaded_by: requestData.user_id,
              request_id: requestId,
              source: "storage_direct",
              file_size: file.metadata?.size || 0,
            }));

          documentsData = virtualDocuments;
          console.log(
            "✅ All storage files converted to documents:",
            virtualDocuments.length
          );
          console.log(
            "📄 Document list:",
            virtualDocuments.map((d) => d.file_name)
          );
        } else {
          console.log(
            "❌ No files found in request storage folder:",
            storageError?.message
          );
        }
      } catch (err) {
        console.warn("⚠️ Storage check failed:", err);
      }

      // Fallback: If no files in request folder, check user root
      if (documentsData.length === 0 && requestData.user_id) {
        try {
          console.log(
            "🔍 Fallback: Checking user root folder:",
            requestData.user_id
          );
          const { data: userRootFiles, error: rootError } =
            await supabase.storage
              .from("documents")
              .list(`${requestData.user_id}`, {
                limit: 100,
                sortBy: { column: "created_at", order: "desc" },
              });

          if (!rootError && userRootFiles && userRootFiles.length > 0) {
            console.log(
              "✅ Found files in user root folder:",
              userRootFiles.length
            );

            const rootVirtualDocuments = userRootFiles
              .filter((file) => file.name && file.id !== null)
              .map((file) => ({
                id: `storage_root_${file.name}_${Date.now()}_${Math.random()}`,
                file_name: file.name,
                storage_path: `${requestData.user_id}/${file.name}`,
                document_type:
                  file.metadata?.mimetype || getFileType(file.name),
                created_at:
                  file.created_at ||
                  file.updated_at ||
                  new Date().toISOString(),
                uploaded_by: requestData.user_id,
                request_id: requestId,
                source: "storage_root",
                file_size: file.metadata?.size || 0,
              }));

            documentsData = rootVirtualDocuments;
            console.log(
              "✅ User root files converted to documents:",
              rootVirtualDocuments.length
            );
          }
        } catch (rootErr) {
          console.warn("⚠️ User root check failed:", rootErr);
        }
      }

      console.log("📄 Final documents count:", documentsData.length);
      if (documentsData.length > 0) {
        console.log(
          "📄 Final document list:",
          documentsData.map((d) => ({
            name: d.file_name,
            path: d.storage_path,
            source: d.source,
            size: d.file_size,
          }))
        );
      }
      setDocuments(documentsData || []);

      // ✅ 5. Activity logs
      const { data: activityData, error: activityError } = await supabase
        .from("activity_logs")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!activityError) {
        setActivityLogs(activityData || []);
        console.log("✅ Activity logs:", activityData?.length || 0);
      } else {
        console.warn("⚠️ Activity logs error:", activityError);
      }

      // ✅ 6. Communications - Skip for now
      setCommunications([]);

      // ✅ 7. Set debug info
      setDebugInfo({
        requestId,
        requestUserId: requestData.user_id,
        currentUserId: user.id,
        documentsCount: documentsData?.length || 0,
        lastFetch: new Date().toISOString(),
      });
    } catch (error) {
      console.error("💥 Error fetching request details:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fixed file upload function that uses correct user ID
  const uploadFile = async (file, requestId, currentUserId) => {
    try {
      console.log("📤 Starting file upload:", {
        fileName: file.name,
        fileSize: file.size,
        requestId,
        currentUserId,
        requestOwnerId: request?.user_id,
      });

      // ✅ Use the request owner's ID for the storage path, not current admin's ID
      const targetUserId = request?.user_id || currentUserId;

      // Generate unique file path
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const uniqueFileName = `${timestamp}_${cleanFileName}`;
      const storagePath = `${targetUserId}/${requestId}/${uniqueFileName}`;

      console.log("📂 Using storage path:", storagePath);

      // ✅ 1. Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Storage upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ File uploaded to storage:", uploadData);

      // ✅ 2. Save file record to database with correct path
      const { data: documentData, error: documentError } = await supabase
        .from("documents")
        .insert([
          {
            request_id: requestId,
            file_name: file.name,
            storage_path: storagePath, // This now matches the actual storage location
            document_type: file.type || "application/octet-stream",
            uploaded_by: currentUserId, // Who uploaded it (admin)
          },
        ])
        .select()
        .single();

      if (documentError) {
        console.error("❌ Database insert error:", documentError);

        // Clean up uploaded file if database insert fails
        try {
          await supabase.storage.from("documents").remove([storagePath]);
          console.log("🧹 Cleaned up uploaded file after database error");
        } catch (cleanupError) {
          console.error("❌ Cleanup error:", cleanupError);
        }

        throw documentError;
      }

      console.log(
        "✅ Document record created with correct path:",
        documentData
      );

      // ✅ 3. Log the activity
      try {
        await supabase.from("activity_logs").insert([
          {
            request_id: requestId,
            user_id: currentUserId,
            action: "document_uploaded",
            description: `File uploaded by admin: ${file.name}`,
            metadata: {
              file_name: file.name,
              file_size: file.size,
              file_type: file.type,
              storage_path: storagePath,
              uploaded_by_admin: true,
              target_user_id: targetUserId,
            },
          },
        ]);
        console.log("✅ Activity logged successfully");
      } catch (logError) {
        console.warn("⚠️ Activity log failed:", logError);
      }

      return {
        success: true,
        document: documentData,
        storagePath: storagePath,
      };
    } catch (error) {
      console.error("💥 File upload failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  };

  // ✅ File upload handler
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const uploadResults = [];

    try {
      for (const file of files) {
        console.log(`📤 Uploading file: ${file.name}`);

        const result = await uploadFile(file, requestId, user.id);
        uploadResults.push(result);

        if (result.success) {
          console.log(`✅ Upload successful: ${file.name}`);
        } else {
          console.error(`❌ Upload failed: ${file.name} - ${result.error}`);
          alert(`Failed to upload ${file.name}: ${result.error}`);
        }
      }

      // Refresh the documents list
      await fetchRequestDetails();

      // Show summary
      const successful = uploadResults.filter((r) => r.success).length;
      const failed = uploadResults.filter((r) => !r.success).length;

      if (successful > 0) {
        alert(`Successfully uploaded ${successful} file(s)`);
      }
      if (failed > 0) {
        alert(`Failed to upload ${failed} file(s)`);
      }
    } catch (error) {
      console.error("💥 Upload process error:", error);
      alert(`Upload error: ${error.message}`);
    } finally {
      setUploading(false);
      // Clear the file input
      event.target.value = "";
    }
  };

  // ✅ Enhanced debug storage function
  const debugStorageContents = async () => {
    try {
      console.log("🔍 Starting comprehensive storage debug...");

      // 1. Check all available buckets
      const { data: buckets, error: bucketsError } =
        await supabase.storage.listBuckets();

      if (bucketsError) {
        console.error("❌ Could not list buckets:", bucketsError);
      } else {
        console.log(
          "🗂️ Available buckets:",
          buckets?.map((b) => b.name)
        );
      }

      // 2. Try different bucket names - including "documents"
      const possibleBuckets = ["documents", "company-documents", "files"];

      for (const bucketName of possibleBuckets) {
        try {
          console.log(`🔍 Checking bucket: ${bucketName}`);

          const { data: rootFiles, error: rootError } = await supabase.storage
            .from(bucketName)
            .list("", { limit: 100 });

          if (!rootError && rootFiles) {
            console.log(
              `✅ Bucket ${bucketName} accessible:`,
              rootFiles.length,
              "items"
            );
            console.log(`📁 ${bucketName} contents:`, rootFiles);

            // Check user folders
            if (request?.user_id) {
              const { data: userFiles, error: userError } =
                await supabase.storage
                  .from(bucketName)
                  .list(`${request.user_id}`, { limit: 100 });

              if (!userError && userFiles) {
                console.log(
                  `📁 Request owner folder in ${bucketName}:`,
                  userFiles.length,
                  "items"
                );

                // Check specific request folder
                const { data: requestFiles, error: requestError } =
                  await supabase.storage
                    .from(bucketName)
                    .list(`${request.user_id}/${requestId}`, { limit: 100 });

                if (!requestError && requestFiles) {
                  console.log(
                    `📁 Request folder in ${bucketName}:`,
                    requestFiles.length,
                    "items"
                  );
                  console.log(`📄 Request files:`, requestFiles);
                }
              }
            }

            // Also check current admin user folder
            if (user?.id && user.id !== request?.user_id) {
              const { data: adminFiles, error: adminError } =
                await supabase.storage
                  .from(bucketName)
                  .list(`${user.id}`, { limit: 100 });

              if (!adminError && adminFiles) {
                console.log(
                  `📁 Admin folder in ${bucketName}:`,
                  adminFiles.length,
                  "items"
                );
              }
            }
          } else {
            console.log(`❌ Bucket ${bucketName} error:`, rootError?.message);
          }
        } catch (err) {
          console.log(`❌ Bucket ${bucketName} exception:`, err.message);
        }
      }

      // 3. Check document paths from database
      if (documents.length > 0) {
        console.log("🔍 Checking database document paths...");
        for (const doc of documents) {
          console.log(`📄 Document: ${doc.file_name}`);
          console.log(`   Path: ${doc.storage_path}`);
          console.log(`   Type: ${doc.document_type}`);
          console.log(`   Created: ${doc.created_at}`);

          // Try to verify each file exists
          try {
            const { data: fileExists, error: existsError } =
              await supabase.storage
                .from("company-documents")
                .list(doc.storage_path.split("/").slice(0, -1).join("/"), {
                  search: doc.file_name,
                });

            if (!existsError && fileExists?.length > 0) {
              console.log(`   ✅ File exists in storage`);
            } else {
              console.log(
                `   ❌ File not found in storage:`,
                existsError?.message
              );
            }
          } catch (err) {
            console.log(`   ❌ Error checking file:`, err.message);
          }
        }
      }
    } catch (error) {
      console.error("💥 Debug storage error:", error);
    }
  };

  // ✅ Manual debug function for browser console
  if (typeof window !== "undefined") {
    window.debugCompanyDocuments = async () => {
      console.log("🧪 Manual debug started...");

      const requestUserId =
        request?.user_id || "28efa979-c0a0-414e-a0ba-b7fd7ce82dea";
      const currentRequestId =
        requestId || "e2ecec0a-5fc7-4f1b-b962-acdba728c122";

      console.log("🔍 Checking documents bucket structure...");
      console.log(`👤 User ID: ${requestUserId}`);
      console.log(`📝 Request ID: ${currentRequestId}`);

      // Check documents bucket root
      const { data: bucketFiles, error: bucketError } = await supabase.storage
        .from("documents")
        .list("", { limit: 20 });

      console.log("📁 Documents bucket root:", {
        data: bucketFiles,
        error: bucketError,
      });

      // Check specific user folder
      console.log(`🔍 Checking user folder: ${requestUserId}`);
      const { data: userFiles, error: userError } = await supabase.storage
        .from("documents")
        .list(requestUserId, { limit: 100 });

      console.log(`📁 User ${requestUserId} folder:`, {
        data: userFiles,
        error: userError,
      });

      // Check specific request folder: userId/requestId/
      console.log(
        `🔍 Checking request folder: ${requestUserId}/${currentRequestId}`
      );
      const { data: requestFiles, error: requestError } = await supabase.storage
        .from("documents")
        .list(`${requestUserId}/${currentRequestId}`, { limit: 100 });

      console.log(`📁 Request folder ${requestUserId}/${currentRequestId}:`, {
        data: requestFiles,
        error: requestError,
      });

      if (requestFiles && requestFiles.length > 0) {
        console.log(
          "🎯 FILES FOUND IN REQUEST FOLDER:",
          requestFiles.map((f) => ({
            name: f.name,
            size: f.metadata?.size,
            type: f.metadata?.mimetype,
            created: f.created_at,
            isFolder: f.id === null,
            fullPath: `documents/${requestUserId}/${currentRequestId}/${f.name}`,
          }))
        );
      } else {
        console.log("❌ No files found in request folder");
      }

      // Check database records
      const { data: dbDocs, error: dbError } = await supabase
        .from("documents")
        .select("*")
        .eq("request_id", currentRequestId);

      console.log("🗄️ Database documents:", { data: dbDocs, error: dbError });

      return {
        bucketRoot: { data: bucketFiles, error: bucketError },
        userFolder: { data: userFiles, error: userError },
        requestFolder: { data: requestFiles, error: requestError },
        database: { data: dbDocs, error: dbError },
        paths: {
          userPath: `documents/${requestUserId}`,
          requestPath: `documents/${requestUserId}/${currentRequestId}`,
        },
      };
    };
  }

  // Update request status and notes
  const handleUpdate = async () => {
    try {
      setUpdating(true);

      const updates = {
        status: editedStatus,
        admin_notes: adminNotes,
        updated_at: new Date().toISOString(),
      };

      if (editedStatus === "completed") {
        updates.completed_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("company_requests")
        .update(updates)
        .eq("id", requestId);

      if (error) throw error;

      // Update local state
      setRequest((prev) => ({ ...prev, ...updates }));
      setIsEditing(false);

      alert("Request updated successfully!");
    } catch (err) {
      console.error("Error updating request:", err);
      alert(`Failed to update request: ${err.message}`);
    } finally {
      setUpdating(false);
    }
  };

  // Send communication to user
  const handleSendCommunication = async () => {
    if (!communicationMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    try {
      setSendingCommunication(true);
      // This would need a proper communication system
      alert("Communication feature not implemented yet");
      setCommunicationMessage("");
      setShowCommunication(false);
    } catch (err) {
      console.error("Error sending communication:", err);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSendingCommunication(false);
    }
  };

  // ✅ Helper function to get file type from extension
  const getFileType = (fileName) => {
    if (!fileName) return "application/octet-stream";
    const ext = fileName.split(".").pop()?.toLowerCase();
    const typeMap = {
      pdf: "application/pdf",
      doc: "application/msword",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      txt: "text/plain",
      csv: "text/csv",
      zip: "application/zip",
      rar: "application/x-rar-compressed",
    };
    return typeMap[ext] || "application/octet-stream";
  };

  // ✅ Download function for userId/requestId/filename structure
  const handleDownloadDocument = async (document) => {
    try {
      console.log("📥 Starting document download:", {
        fileName: document.file_name,
        source: document.source,
        requestUserId: request?.user_id,
        requestId: requestId,
      });

      let downloadPath;

      // Determine correct path based on source
      if (document.source === "storage_direct") {
        // File is in userId/requestId/ folder
        downloadPath = `${request.user_id}/${requestId}/${document.file_name}`;
      } else if (document.source === "storage_root") {
        // File is in userId/ root folder
        downloadPath = `${request.user_id}/${document.file_name}`;
      } else if (document.storage_path) {
        // Use stored path from database
        downloadPath = document.storage_path;
      } else {
        // Default: try userId/requestId/ first
        downloadPath = `${request.user_id}/${requestId}/${document.file_name}`;
      }

      console.log("🔍 Trying to download from path:", downloadPath);

      let { data, error } = await supabase.storage
        .from("documents")
        .download(downloadPath);

      if (error) {
        console.error("❌ Download error:", error);

        // Try alternative path if first attempt fails
        const altPath =
          document.source === "storage_direct"
            ? `${request.user_id}/${document.file_name}`
            : `${request.user_id}/${requestId}/${document.file_name}`;

        console.log("🔍 Trying alternative path:", altPath);

        const { data: altData, error: altError } = await supabase.storage
          .from("documents")
          .download(altPath);

        if (altError) {
          throw new Error(`File not found at: ${downloadPath} or ${altPath}`);
        }

        if (altData) {
          data = altData;
          downloadPath = altPath;
          console.log("✅ Alternative path successful");
        }
      }

      if (!data) {
        throw new Error("No data received from storage");
      }

      // Create download
      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = document.file_name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log("✅ Download successful from path:", downloadPath);
    } catch (error) {
      console.error("💥 Download failed:", error);

      // Show debug info in console
      console.log("🔍 Debug info:");
      console.log("- File name:", document.file_name);
      console.log(
        "- Request path:",
        `${request.user_id}/${requestId}/${document.file_name}`
      );
      console.log("- Root path:", `${request.user_id}/${document.file_name}`);
      console.log("- User ID:", request.user_id);
      console.log("- Request ID:", requestId);
      console.log("- Bucket: documents");

      alert(
        `Download failed: ${error.message}\n\nTried paths:\n• documents/${request.user_id}/${requestId}/${document.file_name}\n• documents/${request.user_id}/${document.file_name}`
      );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading request details...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Error Loading Request
        </h3>
        <p className="text-gray-600 mb-4">{error || "Request not found"}</p>
        <Button onClick={() => navigate("/admin")}>Back to Admin</Button>
      </div>
    );
  }

  const status = statusConfig[request.status] || statusConfig.pending_payment;
  const StatusIcon = status.icon;
  const userDetails = request.user_details?.personalDetails || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Button
            onClick={() => navigate("/admin")}
            variant="ghost"
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Admin
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {request.company_name}
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Request ID: {request.id.slice(0, 8)}</span>
            <span>
              Created: {new Date(request.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className={`${status.color} border px-3 py-1`}>
            <StatusIcon className="mr-2 h-4 w-4" />
            {status.label}
          </Badge>

          <Button
            onClick={() => setIsEditing(!isEditing)}
            variant="outline"
            size="sm"
          >
            <Edit className="mr-2 h-3 w-3" />
            {isEditing ? "Cancel Edit" : "Edit Request"}
          </Button>

          {/* Debug button for development */}
          {import.meta.env.DEV && (
            <Button
              onClick={debugStorageContents}
              variant="outline"
              size="sm"
              className="text-purple-600 border-purple-200"
            >
              <Bug className="mr-2 h-3 w-3" />
              Debug
            </Button>
          )}

          <Dialog open={showCommunication} onOpenChange={setShowCommunication}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <MessageSquare className="mr-2 h-3 w-3" />
                Message User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Send Message to User</DialogTitle>
                <DialogDescription>
                  Send a message to {userDetails.fullName || "the user"} about
                  their company formation request.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={communicationMessage}
                  onChange={(e) => setCommunicationMessage(e.target.value)}
                  placeholder="Enter your message..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowCommunication(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSendCommunication}
                  disabled={sendingCommunication}
                >
                  {sendingCommunication ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Status Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              Current Status: {status.label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{status.progress}%</span>
                </div>
                <Progress value={status.progress} className="h-2" />
              </div>
              <p className="text-gray-600">{status.description}</p>

              {/* Status Update Section for Admins */}
              {isEditing && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <Label htmlFor="status-select">Update Status</Label>
                    <Select
                      value={editedStatus}
                      onValueChange={setEditedStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <config.icon className="h-4 w-4" />
                              {config.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="admin-notes">Admin Notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Add notes about this request..."
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdate}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {updating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedStatus(request.status);
                        setAdminNotes(request.admin_notes || "");
                      }}
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {request.payment_data && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Payment Information
                  </h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium">Order ID:</span>{" "}
                        {request.payment_data.order_id}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span>{" "}
                        {request.payment_data.currency}{" "}
                        {request.payment_data.total_price}
                      </div>
                      {request.payment_data.paid_at && (
                        <div className="col-span-2">
                          <span className="font-medium">Paid At:</span>{" "}
                          {new Date(
                            request.payment_data.paid_at
                          ).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Company Name
              </Label>
              <p className="text-gray-900 font-semibold">
                {request.company_name}
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Package
              </Label>
              <p className="text-gray-900">{request.package_name}</p>
            </div>

            {request.package_price && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Package Price
                </Label>
                <p className="text-gray-900 font-semibold">
                  £{parseFloat(request.package_price).toFixed(2)}
                </p>
              </div>
            )}

            <div>
              <Label className="text-sm font-medium text-gray-700">
                Request Date
              </Label>
              <p className="text-gray-900">
                {new Date(request.created_at).toLocaleString()}
              </p>
            </div>

            {request.completed_at && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Completed Date
                </Label>
                <p className="text-gray-900">
                  {new Date(request.completed_at).toLocaleString()}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(() => {
              const userDetails =
                request.user_details?.personalDetails ||
                request.user_details ||
                {};
              const profileData = userProfile || {};

              const fullName =
                profileData.full_name ||
                userDetails.fullName ||
                (userDetails.firstName && userDetails.lastName
                  ? `${userDetails.firstName} ${userDetails.lastName}`
                  : "Not provided");

              const email =
                userDetails.contactEmail ||
                userDetails.email ||
                user?.email ||
                "Not provided";

              const phone =
                userDetails.phoneNumber || userDetails.phone || "Not provided";

              const country =
                userDetails.country ||
                userDetails.nationality ||
                "Not provided";

              const address =
                userDetails.address ||
                userDetails.homeAddress ||
                "Not provided";

              return (
                <>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <p className="text-gray-900">{fullName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Email
                    </Label>
                    <p className="text-gray-900">{email}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Phone
                    </Label>
                    <p className="text-gray-900">{phone}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Country
                    </Label>
                    <p className="text-gray-900">{country}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-700">
                      Address
                    </Label>
                    <p className="text-gray-900 whitespace-pre-line">
                      {address}
                    </p>
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Documents ({documents.length})
            </CardTitle>
            <div className="flex gap-2">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
              />
              <Button
                onClick={() => document.getElementById("file-upload")?.click()}
                disabled={uploading}
                size="sm"
                variant="outline"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No documents uploaded yet</p>
              <p className="text-sm text-gray-400">
                Users can upload documents, or you can upload them here
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        {document.file_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {document.document_type || "Unknown type"} •{" "}
                        {new Date(document.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        Path: {document.storage_path}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownloadDocument(document)}
                      variant="outline"
                      size="sm"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Notes */}
      {request.admin_notes && !isEditing && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Admin Notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-gray-900 whitespace-pre-wrap">
                {request.admin_notes}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Request Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Request Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Request Created</p>
                <p className="text-sm text-gray-500">
                  {new Date(request.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {request.payment_data?.paid_at && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Payment Completed</p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.payment_data.paid_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {request.completed_at && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-purple-100 rounded-full">
                  <CheckCheck className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Request Completed</p>
                  <p className="text-sm text-gray-500">
                    {new Date(request.completed_at).toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-gray-100 rounded-full">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Last Updated</p>
                <p className="text-sm text-gray-500">
                  {new Date(
                    request.updated_at || request.created_at
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => setEditedStatus("in_review")}
              variant="outline"
              className="justify-start"
            >
              <Clock className="mr-2 h-4 w-4" />
              Mark as In Review
            </Button>

            <Button
              onClick={() => setEditedStatus("processing")}
              variant="outline"
              className="justify-start"
            >
              <Building2 className="mr-2 h-4 w-4" />
              Mark as Processing
            </Button>

            <Button
              onClick={() => setEditedStatus("completed")}
              variant="outline"
              className="justify-start text-green-700 hover:text-green-800"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>

            <Button
              onClick={() => setEditedStatus("documents_requested")}
              variant="outline"
              className="justify-start text-orange-700 hover:text-orange-800"
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Request Documents
            </Button>

            <Button
              onClick={() => setShowCommunication(true)}
              variant="outline"
              className="justify-start text-blue-700 hover:text-blue-800"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Message
            </Button>

            <Button
              onClick={() => setEditedStatus("rejected")}
              variant="outline"
              className="justify-start text-red-700 hover:text-red-800"
            >
              <Ban className="mr-2 h-4 w-4" />
              Reject Request
            </Button>
          </div>

          {(editedStatus !== request.status ||
            adminNotes !== (request.admin_notes || "")) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-yellow-900">Unsaved Changes</p>
                  <p className="text-sm text-yellow-700">
                    You have unsaved changes. Click "Save Changes" to apply
                    them.
                  </p>
                </div>
                <Button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {updating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Debug Info (Development only) */}
      {import.meta.env.DEV && debugInfo && (
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-700">
              <Bug className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-purple-50 rounded-lg p-4">
              <pre className="text-xs text-purple-800 overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <strong>Browser Console Commands:</strong>
                </p>
                <code className="block bg-white p-2 rounded text-purple-600">
                  debugCompanyDocuments() // Check documents in console
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
