// src/pages/admin/AdminNotificationManagement.jsx - Notification Management
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
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

// Send Notification Modal
const SendNotificationModal = ({ isOpen, onClose, onSend }) => {
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    target: "all", // all, specific_user, specific_role
    targetValue: "",
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role")
        .order("full_name");

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Create notification record
      const notificationData = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        target_type: formData.target,
        target_value: formData.targetValue,
        created_by: (await supabase.auth.getUser()).data.user.id,
      };

      const { data: notification, error: notificationError } = await supabase
        .from("notifications")
        .insert(notificationData)
        .select()
        .single();

      if (notificationError) throw notificationError;

      // Determine recipients
      let recipients = [];

      if (formData.target === "all") {
        recipients = users.map((user) => user.id);
      } else if (formData.target === "specific_user") {
        recipients = [formData.targetValue];
      } else if (formData.target === "specific_role") {
        recipients = users
          .filter((user) => user.role === formData.targetValue)
          .map((user) => user.id);
      }

      // Create user notifications
      const userNotifications = recipients.map((userId) => ({
        notification_id: notification.id,
        user_id: userId,
        read: false,
      }));

      if (userNotifications.length > 0) {
        const { error: userNotificationError } = await supabase
          .from("user_notifications")
          .insert(userNotifications);

        if (userNotificationError) throw userNotificationError;
      }

      onSend(notification);
      onClose();

      // Reset form
      setFormData({
        title: "",
        message: "",
        type: "info",
        target: "all",
        targetValue: "",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      alert("Failed to send notification");
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
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="flex justify-between items-center p-6 border-b">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Send Notification
              </h2>
              <p className="text-sm text-gray-500">
                Create and send notifications to users
              </p>
            </div>
            <Button onClick={onClose} variant="ghost" size="icon">
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

            {/* Type */}
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

            {/* Target */}
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
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm mb-3"
              >
                <option value="all">All Users</option>
                <option value="specific_user">Specific User</option>
                <option value="specific_role">Specific Role</option>
              </select>

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
                        className={`p-2 cursor-pointer hover:bg-gray-50 ${
                          formData.targetValue === user.id ? "bg-blue-50" : ""
                        }`}
                        onClick={() =>
                          setFormData({ ...formData, targetValue: user.id })
                        }
                      >
                        <p className="text-sm font-medium">
                          {user.full_name || "Unnamed User"}
                        </p>
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
                  <option value="user">Users</option>
                  <option value="admin">Admins</option>
                </select>
              )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Preview:
              </h4>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  NOTIFICATION_TYPES[formData.type].bgColor
                } border-l-current`}
              >
                <div className="flex items-start gap-2">
                  {React.createElement(NOTIFICATION_TYPES[formData.type].icon, {
                    className: "h-4 w-4 mt-0.5",
                  })}
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
                {loading ? "Sending..." : "Send Notification"}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Main Notification Management Component
export default function AdminNotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSendModal, setShowSendModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    sent: 0,
    read: 0,
    unread: 0,
  });

  useEffect(() => {
    fetchNotifications();
    fetchStats();
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          *,
          profiles!notifications_created_by_fkey(full_name, email),
          user_notifications(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total notifications
      const { count: totalNotifications } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true });

      // Get user notifications stats
      const { data: userNotifications, error } = await supabase
        .from("user_notifications")
        .select("read");

      if (error) throw error;

      const readCount = userNotifications?.filter((n) => n.read).length || 0;
      const unreadCount = userNotifications?.filter((n) => !n.read).length || 0;

      setStats({
        total: totalNotifications || 0,
        sent: userNotifications?.length || 0,
        read: readCount,
        unread: unreadCount,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleSendNotification = (newNotification) => {
    setNotifications([newNotification, ...notifications]);
    fetchStats(); // Refresh stats
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;

    try {
      // Delete user notifications first
      await supabase
        .from("user_notifications")
        .delete()
        .eq("notification_id", notificationId);

      // Delete notification
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;

      setNotifications(notifications.filter((n) => n.id !== notificationId));
      fetchStats();
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
            Send and manage notifications to users
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bell className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">
                  Total Notifications
                </p>
                <p className="text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Send className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Sent</p>
                <p className="text-lg font-bold text-gray-900">{stats.sent}</p>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Notification</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target</TableHead>
                <TableHead>Sent By</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notifications.map((notification) => {
                const typeConfig = NOTIFICATION_TYPES[notification.type];
                const TypeIcon = typeConfig.icon;

                return (
                  <TableRow key={notification.id}>
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${typeConfig.bgColor}`}>
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
                      <span className="text-xs text-gray-600">
                        {notification.profiles?.full_name ||
                          notification.profiles?.email ||
                          "Admin"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleDateString()}
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

          {notifications.length === 0 && (
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
