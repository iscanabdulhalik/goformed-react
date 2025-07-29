// src/components/layout/Sidebar.jsx - Ağırbaşlı & Oturaklı Tasarım
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import {
  FaTachometerAlt,
  FaStore,
  FaListAlt,
  FaCog,
  FaSignOutAlt,
  FaChevronLeft,
  FaChevronRight,
  FaUser,
} from "react-icons/fa";
import goformedLogo from "@/assets/logos/goformed.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { to: "/dashboard", text: "Dashboard", icon: FaTachometerAlt },
  { to: "/dashboard/marketplace", text: "Marketplace", icon: FaStore },
  { to: "/dashboard/orders", text: "Orders", icon: FaListAlt },
  { to: "/dashboard/settings", text: "Settings", icon: FaCog },
];

export default function Sidebar({ isCollapsed, toggleCollapse, width }) {
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
        "fixed top-0 left-0 h-screen bg-white",
        "border-r border-gray-200 flex flex-col z-50",
        "transition-all duration-300 ease-out shadow-sm"
      )}
      style={{ width: `${width}px` }}
    >
      {/* Toggle Button - Orta Kısımda */}
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
            <FaChevronRight className="h-3 w-3" />
          ) : (
            <FaChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Logo Section - Sabit Boyut */}
      <div className="flex items-center justify-center h-20 border-b border-gray-100 px-4 flex-shrink-0">
        <div className="flex items-center justify-center">
          {/* Logo her zaman aynı boyutta kalır */}
          <img
            src={goformedLogo}
            alt="GoFormed"
            className="h-8 w-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {menuItems.map((item) => (
          <SidebarLink key={item.text} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto p-3 border-t border-gray-100">
        {/* User Profile Info */}
        <div
          className={cn(
            "flex items-center p-3 mb-3 rounded-lg bg-gray-50",
            isCollapsed && "justify-center"
          )}
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
            <FaUser className="h-4 w-4 text-gray-600" />
          </div>
          {!isCollapsed && (
            <div className="ml-3 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                User Account
              </p>
              <p className="text-xs text-gray-500 truncate">
                account@email.com
              </p>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          className={cn(
            "w-full text-gray-600 hover:text-red-600 hover:bg-red-50",
            "transition-colors duration-200 font-medium",
            isCollapsed ? "justify-center px-0" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <FaSignOutAlt className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
          {!isCollapsed && "Sign Out"}
        </Button>
      </div>
    </aside>
  );
}

function SidebarLink({ item, isCollapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "flex items-center px-3 py-3 rounded-lg transition-all duration-200",
          "text-gray-700 hover:text-gray-900 hover:bg-gray-100",
          "font-medium text-sm group",
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
        <span className="truncate font-medium">{item.text}</span>
      )}
    </NavLink>
  );
}
