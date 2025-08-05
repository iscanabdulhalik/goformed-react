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
  MapPin,
  Phone,
  Mail,
  Calendar,
  Globe,
  Briefcase,
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
} from "lucide-react";

// Status configuration
const statusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    label: "Pending Payment",
    description: "Payment is required to proceed",
    progress: 10,
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: CheckCircle,
    label: "Payment Completed",
    description: "Payment received, starting review",
    progress: 25,
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Clock,
    label: "In Review",
    description: "Application under review",
    progress: 50,
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: AlertTriangle,
    label: "Documents Required",
    description: "Additional documents needed",
    progress: 35,
  },
  processing: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Clock,
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
    icon: Ban,
    label: "Rejected",
    description: "Application rejected",
    progress: 0,
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: X,
    label: "Cancelled",
    description: "Request cancelled",
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
  const [error, setError] = useState(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [newNote, setNewNote] = useState("");

  // Communication
  const [showCommunication, setShowCommunication] = useState(false);
  const [communicationMessage, setCommunicationMessage] = useState("");
  const [sendingCommunication, setSendingCommunication] = useState(false);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch company request with user profile
      const { data: requestData, error: requestError } = await supabase
        .from("company_requests")
        .select(
          `
          *,
          profiles!company_requests_user_id_fkey (
            id,
            full_name,
            role,
            created_at,
            updated_at
          )
        `
        )
        .eq("id", requestId)
        .single();

      if (requestError) throw requestError;

      setRequest(requestData);
      setEditedStatus(requestData.status);
      setAdminNotes(requestData.admin_notes || "");

      // Fetch associated documents
      const { data: documentsData, error: documentsError } = await supabase
        .from("documents")
        .select("*")
        .eq("request_id", requestId)
        .order("created_at", { ascending: false });

      if (documentsError) throw documentsError;

      setDocuments(documentsData || []);
    } catch (err) {
      console.error("Error fetching request details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

      // Log admin activity
      await supabase.rpc("log_admin_activity", {
        p_admin_id: (await supabase.auth.getUser()).data.user?.id,
        p_action: "company_request_updated",
        p_target_type: "company_request",
        p_target_id: requestId,
        p_details: {
          old_status: request?.status,
          new_status: editedStatus,
          admin_notes: adminNotes,
        },
      });

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

      const { data: userData } = await supabase.auth.getUser();
      const adminId = userData.user?.id;

      const { error } = await supabase.from("order_communications").insert({
        order_id: requestId,
        sender_type: "admin",
        sender_id: adminId,
        message: communicationMessage.trim(),
      });

      if (error) throw error;

      setCommunicationMessage("");
      setShowCommunication(false);
      alert("Message sent to user successfully!");
    } catch (err) {
      console.error("Error sending communication:", err);
      alert(`Failed to send message: ${err.message}`);
    } finally {
      setSendingCommunication(false);
    }
  };

  // Download document
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
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
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

      {/* Status and Progress */}
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

            {isEditing && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <Label>Update Status</Label>
                  <Select value={editedStatus} onValueChange={setEditedStatus}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Admin Notes</Label>
                  <Textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add internal notes about this request..."
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
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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

            {request.payment_data && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Payment Info
                </Label>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <strong>Order ID:</strong> {request.payment_data.order_id}
                  </p>
                  <p>
                    <strong>Amount:</strong> {request.payment_data.currency}{" "}
                    {request.payment_data.total_price}
                  </p>
                  {request.payment_data.paid_at && (
                    <p>
                      <strong>Paid At:</strong>{" "}
                      {new Date(request.payment_data.paid_at).toLocaleString()}
                    </p>
                  )}
                </div>
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
            {userDetails.fullName && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Full Name
                </Label>
                <p className="text-gray-900">{userDetails.fullName}</p>
              </div>
            )}

            {userDetails.dateOfBirth && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Date of Birth
                </Label>
                <p className="text-gray-900">
                  {new Date(userDetails.dateOfBirth).toLocaleDateString()}
                </p>
              </div>
            )}

            {userDetails.nationality && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Nationality
                </Label>
                <p className="text-gray-900">{userDetails.nationality}</p>
              </div>
            )}

            {userDetails.countryOfResidence && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Country of Residence
                </Label>
                <p className="text-gray-900">
                  {userDetails.countryOfResidence}
                </p>
              </div>
            )}

            {userDetails.occupation && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Occupation
                </Label>
                <p className="text-gray-900">{userDetails.occupation}</p>
              </div>
            )}

            {userDetails.address && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Address
                </Label>
                <p className="text-gray-900 whitespace-pre-line">
                  {userDetails.address}
                </p>
              </div>
            )}

            {userDetails.contactEmail && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Contact Email
                </Label>
                <p className="text-gray-900">{userDetails.contactEmail}</p>
              </div>
            )}

            {userDetails.contactPhone && (
              <div>
                <Label className="text-sm font-medium text-gray-700">
                  Contact Phone
                </Label>
                <p className="text-gray-900">{userDetails.contactPhone}</p>
              </div>
            )}

            {/* User Profile Info */}
            {request.profiles && (
              <div className="border-t pt-4">
                <Label className="text-sm font-medium text-gray-700">
                  User Account
                </Label>
                <div className="bg-gray-50 p-3 rounded text-sm">
                  <p>
                    <strong>Profile Name:</strong>{" "}
                    {request.profiles.full_name || "Not set"}
                  </p>
                  <p>
                    <strong>Account Created:</strong>{" "}
                    {new Date(request.profiles.created_at).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Role:</strong> {request.profiles.role}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Uploaded Documents ({documents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No documents uploaded yet
            </p>
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
                        {document.document_type} •
                        {document.file_size
                          ? ` ${(document.file_size / 1024 / 1024).toFixed(
                              2
                            )} MB • `
                          : " "}
                        {new Date(document.created_at).toLocaleDateString()}
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

      {/* Action History */}
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
    </div>
  );
}
