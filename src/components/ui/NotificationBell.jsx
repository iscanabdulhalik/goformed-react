// src/components/ui/NotificationBell.jsx - Updated with better error handling
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/hooks/useNotification";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  RefreshCw,
} from "lucide-react";

// Notification type configurations
const notificationTypes = {
  info: {
    icon: Info,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  success: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
  error: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
  },
};

// Individual notification item
const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const typeConfig =
    notificationTypes[notification?.type] || notificationTypes.info;
  const TypeIcon = typeConfig.icon;

  const handleMarkAsRead = async () => {
    if (notification?.read || isProcessing) return;

    setIsProcessing(true);
    const success = await onMarkAsRead(notification.id);
    if (!success) {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    const success = await onDelete(notification.id);
    if (!success) {
      setIsProcessing(false);
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return "Unknown time";

    try {
      const now = new Date();
      const notificationDate = new Date(date);
      const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) return `${diffInHours}h ago`;

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays}d ago`;

      return notificationDate.toLocaleDateString();
    } catch (error) {
      return "Unknown time";
    }
  };

  // Handle missing notification data
  if (!notification) {
    return null;
  }

  const title = notification.title || "Notification";
  const message = notification.message || "New notification";
  const isRead = notification.read || false;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-4 border-l-4 ${typeConfig.borderColor} ${typeConfig.bgColor} rounded-lg mb-3 relative`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-2 rounded-full ${typeConfig.bgColor} ${typeConfig.color}`}
        >
          <TypeIcon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4
              className={`font-semibold text-sm ${
                isRead ? "text-gray-600" : "text-gray-900"
              }`}
            >
              {title}
            </h4>

            <div className="flex items-center gap-1 flex-shrink-0">
              {!isRead && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isProcessing}
                  className="p-1 hover:bg-white rounded-full transition-colors"
                  title="Mark as read"
                >
                  {isProcessing ? (
                    <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                  ) : (
                    <Check className="w-3 h-3 text-gray-400 hover:text-green-600" />
                  )}
                </button>
              )}

              <button
                onClick={handleDelete}
                disabled={isProcessing}
                className="p-1 hover:bg-white rounded-full transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-3 h-3 text-gray-400 hover:text-red-600" />
              </button>
            </div>
          </div>

          <p
            className={`text-sm mt-1 ${
              isRead ? "text-gray-500" : "text-gray-700"
            }`}
          >
            {message}
          </p>

          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">
              {formatTimeAgo(notification.created_at)}
            </span>

            {!isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main notification bell component
export const NotificationBell = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
  } = useNotifications(userId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayedNotifications = showAll
    ? notifications
    : notifications.slice(0, 5);

  const handleRetry = () => {
    if (refetch) {
      refetch();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Bell className="w-6 h-6 text-gray-600" />

        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                </h3>

                <div className="flex items-center gap-2">
                  {error && (
                    <Button
                      onClick={handleRetry}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Retry
                    </Button>
                  )}

                  {unreadCount > 0 && !error && (
                    <Button
                      onClick={markAllAsRead}
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                    >
                      <CheckCheck className="w-3 h-3 mr-1" />
                      Mark all read
                    </Button>
                  )}

                  <Button
                    onClick={() => setIsOpen(false)}
                    variant="ghost"
                    size="sm"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-96 overflow-y-auto">
              {loading && (
                <div className="p-8 text-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-500">Loading notifications...</p>
                </div>
              )}

              {error && (
                <div className="p-4 text-center">
                  <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <p className="text-red-600 text-sm mb-2">
                    Failed to load notifications
                  </p>
                  <p className="text-gray-500 text-xs">{error}</p>
                  <Button
                    onClick={handleRetry}
                    variant="outline"
                    size="sm"
                    className="mt-2"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Try Again
                  </Button>
                </div>
              )}

              {!loading && !error && notifications.length === 0 && (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No notifications yet</p>
                  <p className="text-gray-400 text-sm">
                    We'll notify you of important updates
                  </p>
                </div>
              )}

              {!loading && !error && notifications.length > 0 && (
                <div className="p-4">
                  <AnimatePresence>
                    {displayedNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={markAsRead}
                        onDelete={deleteNotification}
                      />
                    ))}
                  </AnimatePresence>

                  {notifications.length > 5 && !showAll && (
                    <Button
                      onClick={() => setShowAll(true)}
                      variant="ghost"
                      className="w-full mt-2"
                    >
                      Show {notifications.length - 5} more notifications
                    </Button>
                  )}

                  {showAll && notifications.length > 5 && (
                    <Button
                      onClick={() => setShowAll(false)}
                      variant="ghost"
                      className="w-full mt-2"
                    >
                      Show less
                    </Button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
