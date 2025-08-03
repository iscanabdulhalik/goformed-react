import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/supabase";
import { supabaseAdmin, adminHelpers } from "@/lib/supabase-admin";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  Send,
  Users,
  User,
  Building,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertTriangle,
  Info,
  X,
  Plus,
  Eye,
  Trash2,
  Mail,
  Monitor,
  Shield,
} from "lucide-react";

// Notification types
const NOTIFICATION_TYPES = {
  info: {
    icon: Info,
    color: "bg-blue-100 text-blue-800",
    bgColor: "bg-blue-50",
  },
  success: {
    icon: CheckCircle,
    color: "bg-green-100 text-green-800",
    bgColor: "bg-green-50",
  },
  warning: {
    icon: AlertTriangle,
    color: "bg-orange-100 text-orange-800",
    bgColor: "bg-orange-50",
  },
  error: {
    icon: AlertTriangle,
    color: "bg-red-100 text-red-800",
    bgColor: "bg-red-50",
  },
};

// Delivery methods
const DELIVERY_METHODS = {
  dashboard: { icon: Monitor, label: "Dashboard Only", color: "text-blue-600" },
  email: { icon: Mail, label: "Email Only", color: "text-green-600" },
  both: { icon: Bell, label: "Dashboard + Email", color: "text-purple-600" },
};

// ✅ DUPLICATE PREVENTION UTILITIES
const deduplicateEmails = (emails) => {
  console.log(`[DEDUP_EMAILS] Input: ${emails.length} emails`);

  const seen = new Set();
  const unique = emails.filter((email, index) => {
    if (!email || !email.trim()) {
      console.log(`[DEDUP_EMAILS] Skipping empty email at index ${index}`);
      return false;
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (seen.has(normalizedEmail)) {
      console.log(
        `[DEDUP_EMAILS] Skipping duplicate email: ${normalizedEmail} (index: ${index})`
      );
      return false;
    }

    seen.add(normalizedEmail);
    return true;
  });

  console.log(`[DEDUP_EMAILS] Output: ${unique.length} unique emails`);
  console.log(
    `[DEDUP_EMAILS] Duplicates removed: ${emails.length - unique.length}`
  );

  // Log unique emails for debugging (first 3)
  unique.slice(0, 3).forEach((email, index) => {
    console.log(`[DEDUP_EMAILS] Unique ${index + 1}: ${email}`);
  });

  return unique;
};

const deduplicateUsers = (users) => {
  console.log(`[DEDUP_USERS] Input: ${users.length} users`);

  const seenIds = new Set();
  const seenEmails = new Set();
  const unique = users.filter((user, index) => {
    if (!user || !user.id || !user.email) {
      console.log(
        `[DEDUP_USERS] Skipping invalid user at index ${index}:`,
        user
      );
      return false;
    }

    const idKey = user.id.toLowerCase();
    const emailKey = user.email.toLowerCase().trim();

    if (seenIds.has(idKey)) {
      console.log(
        `[DEDUP_USERS] Skipping duplicate ID: ${user.id} (${user.email})`
      );
      return false;
    }

    if (seenEmails.has(emailKey)) {
      console.log(
        `[DEDUP_USERS] Skipping duplicate email: ${user.email} (${user.id})`
      );
      return false;
    }

    seenIds.add(idKey);
    seenEmails.add(emailKey);
    return true;
  });

  console.log(`[DEDUP_USERS] Output: ${unique.length} unique users`);
  console.log(
    `[DEDUP_USERS] Duplicates removed: ${users.length - unique.length}`
  );

  return unique;
};

// Enhanced Send Notification Modal with Duplicate Prevention
const SendNotificationModal = ({ isOpen, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    target: "all",
    targetValue: "",
    deliveryMethod: "dashboard",
    emailSubject: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [duplicateInfo, setDuplicateInfo] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      setDuplicateInfo(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (
      formData.title &&
      (formData.deliveryMethod === "email" ||
        formData.deliveryMethod === "both")
    ) {
      setFormData((prev) => ({
        ...prev,
        emailSubject: prev.emailSubject || `GoFormed: ${formData.title}`,
      }));
    }
  }, [formData.title, formData.deliveryMethod]);

  const fetchUsers = async () => {
    try {
      console.log("📋 Loading users for notification...");

      const authUsers = await adminHelpers.getAllUsers();
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, role");

      console.log(`[FETCH_USERS] Auth users: ${authUsers.length}`);
      console.log(`[FETCH_USERS] Profiles: ${profiles?.length || 0}`);

      const mergedUsers = authUsers
        .filter((authUser) => authUser?.id && authUser?.email)
        .map((authUser) => {
          const profile = profiles?.find((p) => p.id === authUser.id);
          return {
            id: authUser.id,
            email: authUser.email,
            full_name: profile?.full_name || "Unnamed User",
            role: profile?.role || "user",
          };
        });

      console.log(
        `[FETCH_USERS] Merged users before dedup: ${mergedUsers.length}`
      );

      // ✅ Enhanced deduplication - by both ID and email
      const seenIds = new Set();
      const seenEmails = new Set();
      const uniqueUsers = mergedUsers.filter((user) => {
        const idKey = user.id.toLowerCase();
        const emailKey = user.email.toLowerCase().trim();

        if (seenIds.has(idKey)) {
          console.log(`[DEDUP] Skipping duplicate ID: ${user.id}`);
          return false;
        }

        if (seenEmails.has(emailKey)) {
          console.log(`[DEDUP] Skipping duplicate email: ${user.email}`);
          return false;
        }

        seenIds.add(idKey);
        seenEmails.add(emailKey);
        return true;
      });

      console.log(`[FETCH_USERS] Final unique users: ${uniqueUsers.length}`);
      console.log(
        `[FETCH_USERS] Duplicates removed: ${
          mergedUsers.length - uniqueUsers.length
        }`
      );

      // Log first few users for debugging
      uniqueUsers.slice(0, 3).forEach((user, index) => {
        console.log(
          `[FETCH_USERS] User ${index + 1}: ${user.email} (${user.id})`
        );
      });

      setUsers(uniqueUsers);
    } catch (error) {
      console.error("❌ User loading error:", error);
      setUsers([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDuplicateInfo(null);

    console.log("--- DUPLICATE-SAFE NOTIFICATION SEND ---");

    // Validation
    if (!formData.title || !formData.message) {
      alert("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (
      (formData.deliveryMethod === "email" ||
        formData.deliveryMethod === "both") &&
      !formData.emailSubject
    ) {
      alert("Email subject is required");
      setLoading(false);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // ✅ Target users belirleme ve STRONG deduplication
      let targetUserIds = [];
      let targetEmails = [];

      console.log(
        `[TARGET_SELECTION] Starting with ${users.length} available users`
      );

      if (formData.target === "all") {
        const allUsers = deduplicateUsers(users);
        targetUserIds = allUsers.map((u) => u.id);
        targetEmails = allUsers.map((u) => u.email);
        console.log(
          `[TARGET_SELECTION] All users selected: ${allUsers.length}`
        );
      } else if (formData.target === "specific_user") {
        const targetUser = users.find((u) => u.id === formData.targetValue);
        if (targetUser) {
          targetUserIds = [targetUser.id];
          targetEmails = [targetUser.email];
          console.log(`[TARGET_SELECTION] Specific user: ${targetUser.email}`);
        }
      } else if (formData.target === "specific_role") {
        const roleUsers = users.filter((u) => u.role === formData.targetValue);
        const uniqueRoleUsers = deduplicateUsers(roleUsers);
        targetUserIds = uniqueRoleUsers.map((u) => u.id);
        targetEmails = uniqueRoleUsers.map((u) => u.email);
        console.log(
          `[TARGET_SELECTION] Role ${formData.targetValue}: ${uniqueRoleUsers.length} users`
        );
      }

      console.log(`[TARGET_SELECTION] Initial emails: ${targetEmails.length}`);
      console.log(
        `[TARGET_SELECTION] Initial user IDs: ${targetUserIds.length}`
      );

      // ✅ CRITICAL: Strong email deduplication with detailed logging
      const originalEmailCount = targetEmails.length;
      const uniqueEmails = deduplicateEmails(targetEmails);
      const emailDuplicatesFound = originalEmailCount - uniqueEmails.length;

      // ✅ CRITICAL: Strong user ID deduplication
      const originalUserCount = targetUserIds.length;
      const uniqueUserIds = [
        ...new Set(targetUserIds.filter((id) => id && id.trim())),
      ];
      const userDuplicatesFound = originalUserCount - uniqueUserIds.length;

      console.log(`[DEDUPLICATION_SUMMARY]:`);
      console.log(
        `  - Original emails: ${originalEmailCount} -> Unique: ${uniqueEmails.length} (${emailDuplicatesFound} duplicates removed)`
      );
      console.log(
        `  - Original user IDs: ${originalUserCount} -> Unique: ${uniqueUserIds.length} (${userDuplicatesFound} duplicates removed)`
      );

      // ✅ Cross-check: Email count should match user count
      if (uniqueEmails.length !== uniqueUserIds.length) {
        console.warn(
          `[MISMATCH WARNING] Emails (${uniqueEmails.length}) != Users (${uniqueUserIds.length})`
        );
        console.log("Unique emails:", uniqueEmails);
        console.log("Unique user IDs:", uniqueUserIds);
      }

      if (emailDuplicatesFound > 0 || userDuplicatesFound > 0) {
        setDuplicateInfo({
          total_emails: originalEmailCount,
          unique_emails: uniqueEmails.length,
          email_duplicates: emailDuplicatesFound,
          total_users: originalUserCount,
          unique_users: uniqueUserIds.length,
          user_duplicates: userDuplicatesFound,
        });
      }

      console.log(
        `[TARGET] ${uniqueEmails.length} unique email recipients selected`
      );
      console.log(
        `[TARGET] ${uniqueUserIds.length} unique user recipients selected`
      );

      let notificationForUI = null;

      // Dashboard notification oluştur
      if (
        formData.deliveryMethod === "dashboard" ||
        formData.deliveryMethod === "both"
      ) {
        console.log("Creating dashboard notification...");

        const notificationData = {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target_type: formData.target,
          target_value: formData.targetValue || null,
          created_by: user.id,
          delivery_method: formData.deliveryMethod,
          recipient_count: Math.max(uniqueEmails.length, uniqueUserIds.length),
        };

        const { data: createdNotification, error: notificationError } =
          await supabase
            .from("notifications")
            .insert(notificationData)
            .select()
            .single();

        if (notificationError) throw notificationError;
        notificationForUI = createdNotification;

        // ✅ User notifications için unique user ID'leri kullan
        if (uniqueUserIds.length > 0) {
          const userNotifications = uniqueUserIds.map((userId) => ({
            notification_id: createdNotification.id,
            user_id: userId,
            read: false,
          }));

          const { error: userNotificationError } = await supabase
            .from("user_notifications")
            .insert(userNotifications);

          if (userNotificationError) throw userNotificationError;
          console.log(
            `✅ ${uniqueUserIds.length} unique user notifications created`
          );
        }
      }

      // ✅ Email kuyruğuna ekleme (DUPLICATE PREVENTION)
      if (
        formData.deliveryMethod === "email" ||
        formData.deliveryMethod === "both"
      ) {
        console.log("Queueing emails with duplicate prevention...");

        if (uniqueEmails.length > 0) {
          try {
            console.log(
              `[EMAIL] Processing ${uniqueEmails.length} unique emails...`
            );

            // Format subject for better identification
            const emailSubject =
              formData.emailSubject || `GoFormed: ${formData.title}`;

            // Use the proven adminHelpers.sendEmailNotification method
            const emailResult = await adminHelpers.sendEmailNotification(
              uniqueEmails,
              emailSubject,
              formData.message
            );

            console.log("✅ Email queue result:", emailResult);

            // Check if emails were actually queued
            if (emailResult.success && emailResult.count > 0) {
              console.log(`✅ ${emailResult.count} emails queued successfully`);

              // Update duplicate info if needed
              if (emailResult.count !== uniqueEmails.length) {
                setDuplicateInfo((prev) => ({
                  ...prev,
                  email_duplicates_prevented:
                    uniqueEmails.length - emailResult.count,
                }));
              }
            } else {
              console.warn("⚠️ No emails were queued:", emailResult.message);

              // Only try fallback if it's NOT due to recent duplicates
              if (!emailResult.message?.includes("recent duplicates")) {
                console.log("Trying direct database insert as fallback...");

                const emailJobs = uniqueEmails.map((email) => ({
                  recipient: email,
                  subject: emailSubject,
                  template_name: "notification",
                  template_data: {
                    message: formData.message,
                    title: formData.title,
                    type: formData.type,
                  },
                  status: "pending",
                  attempts: 0,
                }));

                const { data: insertedEmails, error: insertError } =
                  await supabase.from("email_queue").insert(emailJobs).select();

                if (insertError) {
                  console.error(
                    "❌ Direct database insert failed:",
                    insertError
                  );
                  throw new Error(
                    "Both queue methods failed: " + insertError.message
                  );
                } else {
                  console.log(
                    `✅ ${
                      insertedEmails?.length || 0
                    } emails queued via direct insert`
                  );

                  // Manually trigger email processor - DISABLED FOR DEBUGGING
                  try {
                    console.log(
                      "⚠️ Email processor trigger disabled for debugging"
                    );
                    console.log(
                      "📌 Emails queued, will be processed automatically by cron job"
                    );
                    /*
                    const processorResponse = await fetch(
                      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/email-processor`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify({
                          trigger: 'manual_notification',
                          batch_size: insertedEmails.length,
                          timestamp: Date.now()
                        })
                      }
                    );
                    
                    if (processorResponse.ok) {
                      console.log('✅ Email processor triggered manually');
                    } else {
                      console.warn('⚠️ Could not trigger processor manually');
                    }
                    */
                  } catch (processorError) {
                    console.warn(
                      "⚠️ Processor trigger failed:",
                      processorError
                    );
                  }
                }
              } else {
                console.log(
                  "ℹ️ Skipping fallback - emails are recent duplicates (24h window)"
                );
                alert(
                  "Info: Emails were not sent because similar emails were sent recently (24h duplicate prevention)"
                );
              }
            }
          } catch (emailError) {
            console.error("❌ Email processing failed:", emailError);

            // Show user-friendly error but don't block the whole operation
            alert(
              `Warning: Email sending failed (${emailError.message}), but dashboard notification was created successfully.`
            );
          }
        } else {
          console.log("⚠️ No unique emails to send");
        }
      }

      // Email-only notification için database kaydı
      if (formData.deliveryMethod === "email" && !notificationForUI) {
        const emailNotificationData = {
          title: formData.title,
          message: formData.message,
          type: formData.type,
          target_type: formData.target,
          target_value: formData.targetValue || null,
          created_by: user.id,
          delivery_method: "email",
          recipient_count: uniqueEmails.length,
        };

        const { data: emailNotification, error: emailNotificationError } =
          await supabase
            .from("notifications")
            .insert(emailNotificationData)
            .select()
            .single();

        if (emailNotificationError) throw emailNotificationError;
        notificationForUI = emailNotification;
      }

      // UI'yi güncelle
      onSend({
        ...notificationForUI,
        delivery_method: formData.deliveryMethod,
        recipient_count: Math.max(uniqueEmails.length, uniqueUserIds.length),
      });

      // Success message with duplicate info
      let successMessage = `Notification sent to ${Math.max(
        uniqueEmails.length,
        uniqueUserIds.length
      )} unique recipients`;
      if (emailDuplicatesFound > 0 || userDuplicatesFound > 0) {
        successMessage += ` (${
          emailDuplicatesFound + userDuplicatesFound
        } duplicates prevented)`;
      }
      alert(successMessage);

      onClose();
      setFormData({
        title: "",
        message: "",
        type: "info",
        target: "all",
        targetValue: "",
        deliveryMethod: "dashboard",
        emailSubject: "",
      });
      setDuplicateInfo(null);
    } catch (error) {
      console.error("!!! NOTIFICATION ERROR:", error);
      alert("Failed to send notification: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Send Notification (Duplicate Prevention Active)
              </h2>
              <p className="text-sm text-gray-500">
                Create and send notifications via dashboard and/or email
              </p>
              {users.length > 0 && (
                <p className="text-xs text-blue-600 mt-1">
                  {users.length} users available
                </p>
              )}
              {duplicateInfo && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-600" />
                    <span className="font-medium text-green-800">
                      Duplicate Prevention Active:
                    </span>
                  </div>
                  <div className="text-green-700 mt-1">
                    {duplicateInfo.email_duplicates > 0 && (
                      <div>
                        • {duplicateInfo.email_duplicates} duplicate emails
                        prevented
                      </div>
                    )}
                    {duplicateInfo.user_duplicates > 0 && (
                      <div>
                        • {duplicateInfo.user_duplicates} duplicate users
                        prevented
                      </div>
                    )}
                    {duplicateInfo.email_duplicates_prevented > 0 && (
                      <div>
                        • {duplicateInfo.email_duplicates_prevented} duplicate
                        queue entries prevented
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Delivery Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Delivery Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(DELIVERY_METHODS).map(([key, method]) => (
                  <label
                    key={key}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.deliveryMethod === key
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300 bg-white hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value={key}
                      checked={formData.deliveryMethod === key}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          deliveryMethod: e.target.value,
                        })
                      }
                      className="sr-only"
                    />
                    <div className="flex flex-col items-center text-center">
                      <method.icon className={`h-6 w-6 mb-2 ${method.color}`} />
                      <span className="text-sm font-medium text-gray-900">
                        {method.label}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <Input
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Notification title"
                required
              />
            </div>

            {/* Email Subject */}
            {(formData.deliveryMethod === "email" ||
              formData.deliveryMethod === "both") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject *
                </label>
                <Input
                  value={formData.emailSubject}
                  onChange={(e) =>
                    setFormData({ ...formData, emailSubject: e.target.value })
                  }
                  placeholder="Email subject line"
                  required
                />
              </div>
            )}

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <Textarea
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                placeholder="Notification message"
                rows={4}
                required
              />
            </div>

            {/* Type and Target */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="info">Info</option>
                  <option value="success">Success</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Send To
                </label>
                <select
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      target: e.target.value,
                      targetValue: "",
                    })
                  }
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">All Users ({users.length})</option>
                  <option value="specific_user">Specific User</option>
                  <option value="specific_role">Specific Role</option>
                </select>
              </div>
            </div>

            {/* Specific User Selection */}
            {formData.target === "specific_user" && (
              <div>
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                <div className="max-h-32 overflow-y-auto border rounded-md">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-3 cursor-pointer hover:bg-gray-50 ${
                        formData.targetValue === user.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() =>
                        setFormData({ ...formData, targetValue: user.id })
                      }
                    >
                      <p className="text-sm font-medium">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Role Selection */}
            {formData.target === "specific_role" && (
              <select
                value={formData.targetValue}
                onChange={(e) =>
                  setFormData({ ...formData, targetValue: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">Select Role</option>
                <option value="user">
                  Users ({users.filter((u) => u.role === "user").length})
                </option>
                <option value="admin">
                  Admins ({users.filter((u) => u.role === "admin").length})
                </option>
              </select>
            )}

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Preview:
              </h4>

              {/* Dashboard Preview */}
              {(formData.deliveryMethod === "dashboard" ||
                formData.deliveryMethod === "both") && (
                <div className="mb-3">
                  <p className="text-xs text-gray-600 mb-2">
                    Dashboard Notification:
                  </p>
                  <div
                    className={`p-3 rounded-lg border-l-4 ${
                      NOTIFICATION_TYPES[formData.type].bgColor
                    } border-l-current`}
                  >
                    <div className="flex items-start gap-2">
                      {React.createElement(
                        NOTIFICATION_TYPES[formData.type].icon,
                        {
                          className: "h-4 w-4 mt-0.5",
                        }
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {formData.title || "Notification Title"}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {formData.message ||
                            "Notification message will appear here"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Email Preview */}
              {(formData.deliveryMethod === "email" ||
                formData.deliveryMethod === "both") && (
                <div>
                  <p className="text-xs text-gray-600 mb-2">Email Preview:</p>
                  <div className="bg-white border rounded-lg p-3">
                    <p className="text-sm font-semibold">
                      Subject: {formData.emailSubject || "Email subject"}
                    </p>
                    <hr className="my-2" />
                    <p className="text-sm text-gray-700">
                      {formData.message || "Email message will appear here"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" onClick={onClose} variant="outline">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading
                  ? "Sending..."
                  : `Send ${DELIVERY_METHODS[formData.deliveryMethod].label}`}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default function AdminNotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    dashboard: 0,
    email: 0,
    both: 0,
    read: 0,
    unread: 0,
  });

  const fetchStats = useCallback(async () => {
    try {
      console.log("📊 Stats yükleniyor...");

      // Notifications sayısı
      const { count: totalNotifications, error: totalError } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true });

      if (totalError) {
        console.error("Total notifications error:", totalError.message);
      }

      // User notifications sayısı (read/unread)
      const { data: userNotifications, error: userNotifError } = await supabase
        .from("user_notifications")
        .select("read");

      if (userNotifError) {
        console.error("User notifications error:", userNotifError.message);
      }

      const readCount = userNotifications?.filter((n) => n.read).length || 0;
      const unreadCount = userNotifications?.filter((n) => !n.read).length || 0;

      // Email queue stats (optional - hata varsa skip et)
      let emailStats = { total: 0, pending: 0, sent: 0, failed: 0 };

      try {
        const { count: emailCount, error: emailError } = await supabase
          .from("email_queue")
          .select("*", { count: "exact", head: true });

        if (!emailError && emailCount !== null) {
          emailStats.total = emailCount;

          // Email status'larını ayrı ayrı al
          const { count: pendingCount } = await supabase
            .from("email_queue")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending");

          const { count: sentCount } = await supabase
            .from("email_queue")
            .select("*", { count: "exact", head: true })
            .eq("status", "sent");

          const { count: failedCount } = await supabase
            .from("email_queue")
            .select("*", { count: "exact", head: true })
            .eq("status", "failed");

          emailStats.pending = pendingCount || 0;
          emailStats.sent = sentCount || 0;
          emailStats.failed = failedCount || 0;
        }
      } catch (emailStatsError) {
        console.warn("Email stats error (skipping):", emailStatsError);
      }

      // Stats'ı güncelle
      setStats({
        total: totalNotifications || 0,
        dashboard: totalNotifications || 0,
        email: emailStats.sent,
        both: 0,
        read: readCount,
        unread: unreadCount,
      });

      console.log("✅ Stats başarıyla yüklendi");
    } catch (error) {
      console.error("❌ Critical stats error:", error);

      // Hata durumunda default stats
      setStats({
        total: 0,
        dashboard: 0,
        email: 0,
        both: 0,
        read: 0,
        unread: 0,
      });
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      console.log("🚀 Admin notifications sayfası yükleniyor...");

      try {
        await Promise.allSettled([fetchNotifications(), fetchStats()]);
      } catch (error) {
        console.error("❌ Data loading error:", error);
      } finally {
        setLoading(false);
        console.log("✅ Sayfa yükleme tamamlandı");
      }
    };

    loadData();
  }, [fetchNotifications, fetchStats]);

  const handleSendNotification = (newNotification) => {
    setNotifications((prev) => [newNotification, ...prev]);
    fetchStats();
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm("Are you sure you want to delete this notification?"))
      return;

    try {
      await supabase
        .from("user_notifications")
        .delete()
        .eq("notification_id", notificationId);

      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      fetchStats();
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification: " + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Notification Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Send notifications via dashboard and email (Duplicate Prevention
            Active)
          </p>
        </div>
        <Button
          onClick={() => setShowSendModal(true)}
          className="bg-red-600 hover:bg-red-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Send Notification
        </Button>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Monitor className="h-4 w-4 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Dashboard</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.dashboard}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Emails</p>
                <p className="text-lg font-bold text-gray-900">{stats.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Read</p>
                <p className="text-lg font-bold text-gray-900">{stats.read}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Clock className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Unread</p>
                <p className="text-lg font-bold text-gray-900">
                  {stats.unread}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Recent Notifications ({notifications.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No notifications sent yet</p>
              <Button
                onClick={() => setShowSendModal(true)}
                className="mt-4 bg-red-600 hover:bg-red-700"
              >
                Send Your First Notification
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notification</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Delivery</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.map((notification) => {
                  const typeConfig = NOTIFICATION_TYPES[notification.type];
                  const TypeIcon = typeConfig.icon;
                  const deliveryMethod =
                    DELIVERY_METHODS[notification.delivery_method] ||
                    DELIVERY_METHODS.dashboard;

                  return (
                    <TableRow key={notification.id}>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg ${typeConfig.bgColor}`}
                          >
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeConfig.color}>
                          {notification.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <deliveryMethod.icon
                            className={`h-3 w-3 ${deliveryMethod.color}`}
                          />
                          <span className="text-xs">
                            {deliveryMethod.label.split(" ")[0]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {notification.target_type === "all" && (
                            <Users className="h-3 w-3" />
                          )}
                          {notification.target_type === "specific_user" && (
                            <User className="h-3 w-3" />
                          )}
                          {notification.target_type === "specific_role" && (
                            <Building className="h-3 w-3" />
                          )}
                          <span className="text-xs capitalize">
                            {notification.target_type.replace("_", " ")}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs font-medium">
                          {notification.recipient_count || "N/A"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-gray-500">
                          {new Date(
                            notification.created_at
                          ).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleDeleteNotification(notification.id)
                            }
                          >
                            <Trash2 className="h-3 w-3 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={showSendModal}
        onClose={() => setShowSendModal(false)}
        onSend={handleSendNotification}
      />
    </div>
  );
}
