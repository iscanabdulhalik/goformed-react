// src/components/layout/AdminLayout.jsx - FIXED ADMIN SIGN OUT
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Building,
  Users,
  Settings,
  LogOut,
  Bell,
  Home,
  Menu,
  X,
  Shield,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import goformedLogo from "@/assets/logos/goformed.png";

const AdminLayout = ({ children }) => {
  const { user, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  // ✅ FIXED: Complete admin sign out with navigation
  const handleSignOut = async () => {
    try {
      console.log("🚪 Admin signing out...");

      // Clear auth state
      await signOut();

      console.log("✅ Admin sign out successful, redirecting to home");

      // ✅ CRITICAL: Navigate to home page, not admin login
      navigate("/", { replace: true });

      // Close sidebar if open
      setSidebarOpen(false);
    } catch (error) {
      console.error("❌ Admin sign out error:", error);
      // Even if signOut fails, redirect to home
      navigate("/", { replace: true });
    }
  };

  const navigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: Home,
      current: location.pathname === "/admin",
    },
    {
      name: "User Management",
      href: "/admin/users",
      icon: Users,
      current: location.pathname === "/admin/users",
    },
    {
      name: "Company Management",
      href: "/admin/companies",
      icon: Building,
      current: location.pathname === "/admin/companies",
    },
    {
      name: "Notifications",
      href: "/admin/notifications",
      icon: MessageSquare,
      current: location.pathname === "/admin/notifications",
    },
    {
      name: "Reports",
      href: "/admin/reports",
      icon: BarChart3,
      current: location.pathname === "/admin/reports",
    },
    {
      name: "Settings",
      href: "/admin/settings",
      icon: Settings,
      current: location.pathname === "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
              <div className="flex flex-shrink-0 items-center px-4">
                <img className="h-8 w-auto" src={goformedLogo} alt="GoFormed" />
                <Badge className="ml-2 bg-red-600 text-white text-xs">
                  Admin
                </Badge>
              </div>
              <nav className="mt-5 space-y-1 px-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`${
                      item.current
                        ? "bg-red-100 text-red-900"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        item.current
                          ? "text-red-500"
                          : "text-gray-400 group-hover:text-gray-500"
                      } mr-4 h-6 w-6`}
                    />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex flex-shrink-0 p-4 border-t border-gray-200">
              <div className="flex items-center w-full">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-red-600" />
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.email}
                  </p>
                  <p className="text-xs text-red-600 font-medium">
                    Administrator
                  </p>
                </div>
                <Button
                  onClick={handleSignOut}
                  variant="ghost"
                  size="sm"
                  className="ml-2 hover:bg-red-50 hover:text-red-600"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <img className="h-8 w-auto" src={goformedLogo} alt="GoFormed" />
              <Badge className="ml-2 bg-red-600 text-white text-xs">
                Admin
              </Badge>
            </div>
            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? "bg-red-100 text-red-900 border-r-2 border-red-500"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                >
                  <item.icon
                    className={`${
                      item.current
                        ? "text-red-500"
                        : "text-gray-400 group-hover:text-gray-500"
                    } mr-3 h-5 w-5`}
                  />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Admin user info */}
          <div className="flex flex-shrink-0 p-4 border-t border-gray-200 bg-red-50">
            <div className="flex items-center w-full">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.email}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-red-600 font-medium">
                    Administrator
                  </p>
                  <Link
                    to="/dashboard"
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    User View
                  </Link>
                </div>
              </div>
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="ml-2 hover:bg-red-100 hover:text-red-700"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <img className="h-8 w-auto" src={goformedLogo} alt="GoFormed" />
              <Badge className="ml-2 bg-red-600 text-white text-xs">
                Admin
              </Badge>
            </div>
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="ghost"
              size="sm"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Admin footer */}
        <footer className="bg-white border-t border-gray-200 px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>© 2025 GoFormed Admin Panel</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>System Operational</span>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Admin Session • {user?.email}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AdminLayout;
