// src/components/layout/DashboardLayout.jsx - Temizlenmiş versiyon
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "./Sidebar";
import { User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIDEBAR_WIDTH_DEFAULT = 280;
const SIDEBAR_WIDTH_COLLAPSED = 80;

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, profile } = useAuth(); // ✅ Context'ten al
  const location = useLocation();

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

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
        {/* ✅ Simplified Top Bar */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white border-b border-gray-200 px-6 py-3 sticky top-0 z-40"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-base font-medium text-gray-900">Dashboard</h1>
              {user && (
                <div className="hidden md:flex items-center text-sm text-gray-500">
                  <span>
                    Welcome,{" "}
                    {profile?.full_name ||
                      user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                </div>
              )}
            </div>

            {/* ✅ Right side actions */}
            <div className="flex items-center space-x-3">
              {/* Notifications - Future implementation */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                {/* Notification badge */}
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full text-xs"></span>
              </Button>

              {/* User Profile */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ✅ Page Content */}
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
