// src/components/layout/DashboardLayout.jsx - Fixed header size and notifications
import React, { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./Sidebar";
import {
  Bell,
  User,
  Search,
  X,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const SIDEBAR_WIDTH_DEFAULT = 280;
const SIDEBAR_WIDTH_COLLAPSED = 80;

// Page titles mapping
const pageTitles = {
  "/dashboard": "Dashboard",
  "/dashboard/marketplace": "Marketplace",
  "/dashboard/orders": "Orders",
  "/dashboard/settings": "Settings",
};

// Mock notifications - gerçek sistemde API'den gelecek
const mockNotifications = [
  {
    id: 1,
    title: "Company Formation Update",
    message: "Your company AVALON CONSULTING LTD is now under review",
    type: "info",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    read: false,
  },
  {
    id: 2,
    title: "Payment Confirmed",
    message: "Payment for Pro Builder package received successfully",
    type: "success",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: 3,
    title: "Documents Required",
    message: "Please upload additional documents for company verification",
    type: "warning",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
];

const NotificationIcon = ({ type }) => {
  const icons = {
    info: <Bell className="h-4 w-4 text-blue-500" />,
    success: <CheckCircle className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-orange-500" />,
  };
  return icons[type] || icons.info;
};

const NotificationPanel = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={onClose}
          />

          {/* Notification Panel */}
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 border-l border-gray-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {unreadCount} unread notification
                    {unreadCount !== 1 ? "s" : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    className="text-xs"
                  >
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <Bell className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No notifications</p>
                  <p className="text-sm">You're all caught up!</p>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${
                        notification.read
                          ? "bg-white border-l-gray-300"
                          : "bg-blue-50 border-l-blue-500"
                      }`}
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3
                              className={`text-sm font-medium ${
                                notification.read
                                  ? "text-gray-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h3>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                            )}
                          </div>
                          <p
                            className={`text-sm mt-1 ${
                              notification.read
                                ? "text-gray-500"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTime(notification.timestamp)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const formatTime = (timestamp) => {
  const now = new Date();
  const diff = now.getTime() - timestamp.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else {
    return `${days}d ago`;
  }
};

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const location = useLocation();

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    return pageTitles[path] || "Dashboard";
  };

  // Get user info
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleMarkAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        width={currentSidebarWidth}
      />

      {/* Main Content */}
      <main
        className="transition-all duration-300 ease-out"
        style={{ marginLeft: `${currentSidebarWidth}px` }}
      >
        {/* Top Bar - Reduced padding and font sizes */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.h1
                key={location.pathname}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-base font-medium text-gray-900 tracking-tight"
              >
                {getPageTitle()}
              </motion.h1>

              {/* User name next to title */}
              {user && (
                <div className="hidden md:flex items-center text-sm text-gray-500">
                  <span>
                    Good evening,{" "}
                    {user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                </div>
              )}
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => setShowNotifications(true)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </Badge>
                  )}
                </Button>
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {user?.user_metadata?.avatar_url ? (
                    <img
                      src={user.user_metadata.avatar_url}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Page Content */}
        <div className="p-6">
          <motion.div
            key={location.pathname}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>

      {/* Notification Panel */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
    </div>
  );
}
