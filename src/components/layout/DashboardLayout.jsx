// src/components/layout/DashboardLayout.jsx - FULLY RESPONSIVE VERSION
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Header from "./Header";

const SIDEBAR_WIDTH_DEFAULT = 280;
const SIDEBAR_WIDTH_COLLAPSED = 80;

export default function DashboardLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);

      // Auto-collapse sidebar on smaller screens
      if (window.innerWidth < 1280) {
        // xl breakpoint
        setIsCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentSidebarWidth = isMobile
    ? 0
    : isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  const toggleCollapse = () => {
    setIsCollapsed((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Hidden on mobile */}
      {!isMobile && (
        <Sidebar
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
          width={currentSidebarWidth}
        />
      )}

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 ease-out ${
          isMobile ? "ml-0" : `ml-[${currentSidebarWidth}px]`
        }`}
        style={{
          marginLeft: isMobile ? 0 : `${currentSidebarWidth}px`,
        }}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <div className="p-3 sm:p-4 lg:p-6">
          <motion.div
            key={location.pathname}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
