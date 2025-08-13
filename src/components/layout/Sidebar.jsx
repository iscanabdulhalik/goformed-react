// src/components/layout/Sidebar.jsx - FULLY RESPONSIVE VERSION
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShoppingBag,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building,
  X,
  Menu,
} from "lucide-react";
import goformedLogo from "@/assets/logos/goformed.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Menu items with proper icons and descriptions
const menuItems = [
  {
    to: "/dashboard",
    text: "Overview",
    icon: LayoutDashboard,
    description: "Dashboard overview",
  },
  {
    to: "/dashboard/marketplace",
    text: "Marketplace",
    icon: ShoppingBag,
    description: "Additional Services",
  },
  {
    to: "/dashboard/orders",
    text: "Your Companies",
    icon: Building,
    description: "View company requests",
  },
  {
    to: "/dashboard/settings",
    text: "Settings",
    icon: Settings,
    description: "Account settings",
  },
];

// Mobile Sidebar Component
const MobileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    } finally {
      onClose();
    }
  };

  const handleNavigation = (to) => {
    navigate(to);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 h-full w-72 bg-white shadow-2xl z-50 lg:hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <img
                  src={goformedLogo}
                  alt="GoFormed"
                  className="h-7 w-auto object-contain"
                />
                <span className="font-bold text-lg text-gray-900">
                  GoFormed
                </span>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
              {menuItems.map((item) => (
                <button
                  key={item.text}
                  onClick={() => handleNavigation(item.to)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200",
                    "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
                    "font-medium text-sm group relative"
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="truncate font-medium">{item.text}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {item.description}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </nav>

            {/* Bottom - Logout */}
            <div className="p-3 border-t border-gray-200">
              <Button
                variant="ghost"
                className="w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Desktop Sidebar Component
const DesktopSidebar = ({ isCollapsed, toggleCollapse, width }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  return (
    <aside
      className={cn(
        "hidden lg:fixed lg:inset-y-0 lg:flex lg:flex-col",
        "bg-white border-r border-gray-200 z-50",
        "transition-all duration-300 ease-out shadow-sm"
      )}
      style={{ width: `${width}px` }}
    >
      {/* Toggle Button */}
      <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-50">
        <Button
          onClick={toggleCollapse}
          variant="outline"
          size="icon"
          className={cn(
            "w-8 h-8 rounded-full bg-white border-2 border-gray-200",
            "hover:border-gray-300 hover:bg-gray-50",
            "text-gray-600 hover:text-gray-800",
            "transition-all duration-200 shadow-sm"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 border-b border-gray-100 px-4 flex-shrink-0">
        <motion.div
          className="flex items-center justify-center"
          layout
          transition={{ duration: 0.3 }}
        >
          {isCollapsed ? (
            <img
              src={goformedLogo}
              alt="GoFormed"
              className="h-8 w-8 object-contain"
            />
          ) : (
            <div className="flex items-center gap-2">
              <img
                src={goformedLogo}
                alt="GoFormed"
                className="h-8 w-auto object-contain"
              />
              <span className="font-bold text-lg text-gray-900">GoFormed</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <SidebarLink key={item.text} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Logout Button - Bottom */}
      <div className="p-3 border-t border-gray-100">
        <Button
          variant="ghost"
          className={cn(
            "w-full text-gray-600 hover:text-red-600 hover:bg-red-50",
            "transition-colors duration-200 font-medium",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <LogOut className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </aside>
  );
};

// Sidebar Link Component
function SidebarLink({ item, isCollapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "flex items-center px-3 py-3 rounded-xl transition-all duration-200",
          "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
          "font-medium text-sm group relative",
          isActive &&
            "bg-blue-50 text-blue-700 hover:text-blue-800 hover:bg-blue-100",
          isCollapsed && "justify-center"
        )
      }
    >
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0 transition-colors duration-200",
          !isCollapsed && "mr-3"
        )}
      />

      {!isCollapsed && (
        <motion.div
          className="flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <span className="truncate font-medium">{item.text}</span>
          {item.description && (
            <div className="text-xs text-gray-500 mt-0.5">
              {item.description}
            </div>
          )}
        </motion.div>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          <div className="font-medium">{item.text}</div>
          {item.description && (
            <div className="text-gray-300 text-xs mt-0.5">
              {item.description}
            </div>
          )}
        </div>
      )}
    </NavLink>
  );
}

// Main Sidebar Component
export default function Sidebar({ isCollapsed, toggleCollapse, width }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isMobileOpen}
        onClose={() => setIsMobileOpen(false)}
      />

      {/* Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        width={width}
      />
    </>
  );
}
