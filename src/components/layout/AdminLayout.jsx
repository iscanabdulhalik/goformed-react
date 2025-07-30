// src/components/layout/AdminLayout.jsx - Admin Dashboard Layout
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Settings,
  Bell,
  BarChart3,
  FileText,
  LogOut,
  Shield,
  ChevronLeft,
  ChevronRight,
  Search,
  User,
  Building,
  Zap,
  MessageSquare,
} from "lucide-react";
import goformedLogo from "@/assets/logos/goformed.png";

const SIDEBAR_WIDTH_DEFAULT = 280;
const SIDEBAR_WIDTH_COLLAPSED = 80;

// Admin menu items
const adminMenuItems = [
  {
    to: "/admin",
    text: "Dashboard",
    icon: BarChart3,
    description: "Overview & Analytics",
  },
  {
    to: "/admin/users",
    text: "User Management",
    icon: Users,
    description: "Manage Users",
  },
  {
    to: "/admin/companies",
    text: "Company Requests",
    icon: Building,
    description: "Review Applications",
  },
  {
    to: "/admin/notifications",
    text: "Notifications",
    icon: Bell,
    description: "Send Notifications",
  },
  {
    to: "/admin/automations",
    text: "Automations",
    icon: Zap,
    description: "Workflow Rules",
  },
  {
    to: "/admin/reports",
    text: "Reports",
    icon: FileText,
    description: "Analytics & Reports",
  },
  {
    to: "/admin/settings",
    text: "Settings",
    icon: Settings,
    description: "System Settings",
  },
];

// Page titles mapping
const pageTitles = {
  "/admin": "Admin Dashboard",
  "/admin/users": "User Management",
  "/admin/companies": "Company Requests",
  "/admin/notifications": "Notifications",
  "/admin/automations": "Automations",
  "/admin/reports": "Reports",
  "/admin/settings": "Settings",
};

const AdminSidebarLink = ({ item, isCollapsed }) => {
  const location = useLocation();
  const isActive = location.pathname === item.to;

  return (
    <Link
      to={item.to}
      className={`flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative ${
        isActive
          ? "bg-red-50 text-red-700 hover:text-red-800 hover:bg-red-100"
          : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
      } ${isCollapsed && "justify-center"}`}
    >
      <item.icon
        className={`h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
          !isCollapsed && "mr-3"
        }`}
      />
      {!isCollapsed && (
        <div className="flex-1">
          <span className="truncate font-medium text-sm">{item.text}</span>
          {item.description && (
            <div className="text-xs text-gray-500 mt-0.5">
              {item.description}
            </div>
          )}
        </div>
      )}

      {/* Tooltip for collapsed state */}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {item.text}
          {item.description && (
            <div className="text-gray-300 text-xs">{item.description}</div>
          )}
        </div>
      )}
    </Link>
  );
};

export default function AdminLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  // Get current page title
  const getPageTitle = () => {
    const path = location.pathname;
    return pageTitles[path] || "Admin Dashboard";
  };

  // Check admin authentication
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate("/admin/login");
          return;
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        if (profileError || !profile || profile.role !== "admin") {
          navigate("/admin/login");
          return;
        }

        setAdmin({
          ...user,
          profile,
        });
      } catch (error) {
        console.error("Admin auth check error:", error);
        navigate("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <aside
        className="fixed top-0 left-0 h-screen bg-white border-r border-gray-200 flex flex-col z-50 transition-all duration-300 ease-out shadow-sm"
        style={{ width: `${currentSidebarWidth}px` }}
      >
        {/* Toggle Button */}
        <div className="absolute -right-4 top-1/2 transform -translate-y-1/2 z-50">
          <Button
            onClick={() => setIsCollapsed(!isCollapsed)}
            variant="outline"
            size="icon"
            className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-600 hover:text-red-600 transition-all duration-200 shadow-sm"
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
          <div className="flex items-center justify-center">
            <img
              src={goformedLogo}
              alt="GoFormed Admin"
              className="h-8 w-auto object-contain"
            />
            {!isCollapsed && (
              <Badge className="ml-2 bg-red-600 text-white text-xs">
                Admin
              </Badge>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {adminMenuItems.map((item) => (
            <AdminSidebarLink
              key={item.text}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="p-3 border-t border-gray-100">
          {!isCollapsed && (
            <div className="mb-3 p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {admin.profile?.full_name || admin.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    Administrator
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            className={`w-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200 font-medium ${
              isCollapsed ? "justify-center px-0" : "justify-start"
            }`}
            onClick={handleLogout}
          >
            <LogOut className={`h-4 w-4 ${!isCollapsed && "mr-3"}`} />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </aside>

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
              <motion.h1
                key={location.pathname}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-sm font-medium text-gray-900 tracking-tight"
              >
                {getPageTitle()}
              </motion.h1>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center text-xs text-gray-500">
                <Shield className="h-3 w-3 mr-1" />
                <span>Admin</span>
                <span className="mx-2">/</span>
                <span className="text-gray-900">
                  {getPageTitle().replace("Admin ", "")}
                </span>
              </div>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:flex relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users, companies..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Quick Actions */}
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-red-200 text-red-600 hover:bg-red-50"
              >
                <MessageSquare className="h-3 w-3 mr-2" />
                Send Notification
              </Button>

              {/* Admin Profile */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {admin.profile?.full_name || admin.email?.split("@")[0]}
                  </p>
                  <p className="text-xs text-red-600 font-medium">Admin</p>
                </div>
                <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                  <Shield className="h-4 w-4 text-white" />
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
