// src/components/layout/DashboardLayout.jsx - Düzeltilmiş versiyon
import React, { useState, useCallback, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import { Bell, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const SIDEBAR_WIDTH_DEFAULT = 280;
const SIDEBAR_WIDTH_COLLAPSED = 80;

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  console.log("🏠 DashboardLayout render:", {
    currentPath: location.pathname,
    loading,
    hasUser: !!user,
  });

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  // Get user info - basitleştirilmiş
  useEffect(() => {
    let mounted = true;

    const getUser = async () => {
      try {
        console.log("👤 DashboardLayout: Getting user info...");

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error) {
          console.error("❌ DashboardLayout: Error getting user:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          console.log("✅ DashboardLayout: User loaded:", user?.email);
          setUser(user);
          setLoading(false);
        }
      } catch (error) {
        console.error("❌ DashboardLayout: Exception getting user:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Eğer user loading'se, basit loader göster
  if (loading) {
    console.log("⏳ DashboardLayout: Loading user...");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // User yoksa, error state
  if (!user) {
    console.log("❌ DashboardLayout: No user found");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            Authentication Error
          </h2>
          <p className="text-gray-600 mb-4">Please try logging in again</p>
          <Button onClick={() => (window.location.href = "/login")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  console.log("✅ DashboardLayout: Rendering dashboard for user:", user.email);

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
        {/* Top Bar - Basitleştirilmiş */}
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
                    {user?.user_metadata?.full_name ||
                      user?.email?.split("@")[0] ||
                      "User"}
                  </span>
                </div>
              )}
            </div>

            {/* Right side actions - Basitleştirilmiş */}
            <div className="flex items-center space-x-3">
              {/* User Profile */}
              <div className="flex items-center space-x-3">
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
