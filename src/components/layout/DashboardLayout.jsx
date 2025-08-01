// src/components/layout/DashboardLayout.jsx - Düzeltilmiş versiyon
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { User, Bell, Sun, Moon, Sunrise, Sunset } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIDEBAR_WIDTH_DEFAULT = 280;
const SIDEBAR_WIDTH_COLLAPSED = 80;

// Time-based greeting function
const getTimeBasedGreeting = (userName) => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Good Morning, ${userName}!`,
      icon: <Sunrise className="w-4 h-4" />,
      color: "text-orange-600",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: `Good Afternoon, ${userName}!`,
      icon: <Sun className="w-4 h-4" />,
      color: "text-blue-600",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: `Good Evening, ${userName}!`,
      icon: <Sunset className="w-4 h-4" />,
      color: "text-purple-600",
    };
  } else {
    return {
      greeting: `Good Night, ${userName}!`,
      icon: <Moon className="w-4 h-4" />,
      color: "text-indigo-600",
    };
  }
};

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, profile } = useAuth();
  const location = useLocation();

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  };

  const userName = getUserDisplayName();
  const timeGreeting = getTimeBasedGreeting(userName);

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
        {/* Top Bar */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <div className={`${timeGreeting.color}`}>
                  {timeGreeting.icon}
                </div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {timeGreeting.greeting}
                </h1>
              </div>

              {/* Breadcrumb - Optional */}
              <div className="hidden md:flex items-center text-sm text-gray-500">
                <span>Dashboard</span>
                {location.pathname !== "/dashboard" && (
                  <>
                    <span className="mx-2">/</span>
                    <span className="capitalize">
                      {location.pathname.split("/").pop()?.replace("-", " ")}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {/* Notification badge - will be implemented later */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {userName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.role === "admin" ? "Administrator" : "User"}
                  </p>
                </div>
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
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
    </div>
  );
}
