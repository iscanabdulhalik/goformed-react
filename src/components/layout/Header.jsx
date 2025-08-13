// src/components/layout/Header.jsx - FULLY RESPONSIVE VERSION
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/useAuth";
import {
  Bell,
  User,
  Settings,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/ui/NotificationBell";

// Saate göre selamlama fonksiyonu
const getTimeBasedGreeting = (userName) => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return {
      greeting: `Good Morning${userName ? `, ${userName}` : ""}!`,
      shortGreeting: "Morning!",
      icon: <Sunrise className="w-4 h-4" />,
      color: "text-orange-600",
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: `Good Afternoon${userName ? `, ${userName}` : ""}!`,
      shortGreeting: "Afternoon!",
      icon: <Sun className="w-4 h-4" />,
      color: "text-blue-600",
    };
  } else if (hour >= 17 && hour < 21) {
    return {
      greeting: `Good Evening${userName ? `, ${userName}` : ""}!`,
      shortGreeting: "Evening!",
      icon: <Sunset className="w-4 h-4" />,
      color: "text-purple-600",
    };
  } else {
    return {
      greeting: `Good Night${userName ? `, ${userName}` : ""}!`,
      shortGreeting: "Night!",
      icon: <Moon className="w-4 h-4" />,
      color: "text-indigo-600",
    };
  }
};

export default function Header() {
  const { user, profile } = useAuth();
  const { logout } = useLogout();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Get user display info with Google profile photo support
  const getUserDisplayInfo = () => {
    const email = user?.email || "";
    const displayName =
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      email.split("@")[0] ||
      "User";

    // ✅ Check for Google profile photo
    const avatar =
      user?.user_metadata?.avatar_url || user?.user_metadata?.picture || null;

    // Get initials for fallback
    const initials = displayName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);

    return {
      displayName,
      email,
      avatar,
      initials,
      isGoogleUser:
        !!user?.app_metadata?.provider ||
        user?.user_metadata?.iss?.includes("google"),
    };
  };

  const userInfo = getUserDisplayInfo();
  const timeGreeting = getTimeBasedGreeting(userInfo.displayName);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
  };

  // Get current page name for breadcrumb
  const getCurrentPageName = () => {
    const path = location.pathname;
    if (path === "/dashboard") return null;

    const segments = path.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    // Convert to readable format
    return lastSegment
      ?.replace(/-/g, " ")
      ?.replace(/([A-Z])/g, " $1")
      ?.replace(/^\w/, (c) => c.toUpperCase())
      ?.trim();
  };

  const currentPage = getCurrentPageName();

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm"
    >
      {/* Main Header */}
      <div className="px-3 sm:px-4 lg:px-6 py-3 lg:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Greeting */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 h-8 w-8"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>

            {/* Greeting Section */}
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className={`${timeGreeting.color} flex-shrink-0`}>
                {timeGreeting.icon}
              </div>
              <div className="min-w-0">
                {/* Desktop Greeting */}
                <h1 className="hidden sm:block text-base lg:text-lg font-semibold text-gray-900 truncate">
                  {timeGreeting.greeting}
                </h1>
                {/* Mobile Greeting */}
                <h1 className="sm:hidden text-sm font-semibold text-gray-900 truncate">
                  {timeGreeting.shortGreeting}
                </h1>

                {/* Breadcrumb - Hidden on mobile */}
                {currentPage && (
                  <div className="hidden md:flex items-center text-xs lg:text-sm text-gray-500 mt-0.5">
                    <span>Dashboard</span>
                    <span className="mx-1">/</span>
                    <span className="capitalize truncate">{currentPage}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Notifications - Hidden on small mobile */}
            {user && (
              <div className="hidden xs:block">
                <NotificationBell userId={user.id} />
              </div>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1.5 sm:gap-2 px-1.5 sm:px-3 py-1.5 sm:py-2 h-auto hover:bg-gray-50 rounded-lg"
                >
                  <Avatar className="h-7 w-7 sm:h-8 sm:w-8">
                    <AvatarImage
                      src={userInfo.avatar}
                      alt={userInfo.displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs sm:text-sm font-semibold">
                      {userInfo.initials}
                    </AvatarFallback>
                  </Avatar>

                  {/* User Info - Hidden on mobile */}
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-24 lg:max-w-32">
                      {userInfo.displayName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {profile?.role === "admin" ? "Admin" : "User"}
                    </div>
                  </div>

                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-64 sm:w-72">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium truncate">
                      {userInfo.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userInfo.email}
                    </p>
                    {userInfo.isGoogleUser && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">
                          Google Account
                        </span>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <Link
                    to="/dashboard/settings"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>

                {/* Mobile-only: Show notifications in menu */}
                <div className="xs:hidden">
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <div className="flex items-center gap-2 w-full">
                      <Bell className="h-4 w-4" />
                      <span>Notifications</span>
                      {user && (
                        <div className="ml-auto">
                          <NotificationBell userId={user.id} />
                        </div>
                      )}
                    </div>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-600 focus:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-gray-200 bg-gray-50"
          >
            <div className="px-4 py-3 space-y-2">
              {/* Current Page Indicator */}
              {currentPage && (
                <div className="text-xs text-gray-500 mb-3">
                  <span className="font-medium">Dashboard</span>
                  <span className="mx-1">/</span>
                  <span className="capitalize">{currentPage}</span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/dashboard">
                    <User className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="justify-start"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link to="/dashboard/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                </Button>
              </div>

              {/* User Info Card */}
              <div className="bg-white rounded-lg p-3 border border-gray-200 mt-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={userInfo.avatar}
                      alt={userInfo.displayName}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                      {userInfo.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {userInfo.displayName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {userInfo.email}
                    </p>
                    {userInfo.isGoogleUser && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-green-600">
                          Google Account
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="w-full mt-3 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
