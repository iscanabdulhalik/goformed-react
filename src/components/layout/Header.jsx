// src/components/layout/Header.jsx - GOOGLE PROFIL FOTOĞRAFI + SAATE GÖRE SELAMLAMA
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
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
import NotificationBell from "@/components/ui/NotificationBell"; // ✅ Bildirim bileşeni

// Saate göre selamlama fonksiyonu
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

export default function Header() {
  const { user, profile } = useAuth();
  const { logout } = useLogout();
  const location = useLocation();

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
  };

  return (
    <motion.div
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-40"
    >
      <div className="flex items-center justify-between">
        {/* Sol Taraf: Selamlama ve Breadcrumb */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <div className={`${timeGreeting.color}`}>{timeGreeting.icon}</div>
            <h1 className="text-lg font-semibold text-gray-900">
              {timeGreeting.greeting}
            </h1>
          </div>

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

        {/* Sağ Taraf: Bildirimler ve Profil */}
        <div className="flex items-center space-x-3">
          {/* ✅ Bildirim Bileşeni */}
          {user && <NotificationBell userId={user.id} />}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-3 py-2 h-auto"
              >
                <Avatar className="h-8 w-8">
                  {/* ✅ Google profile photo support */}
                  <AvatarImage
                    src={userInfo.avatar}
                    alt={userInfo.displayName}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
                    {userInfo.initials}
                  </AvatarFallback>
                </Avatar>

                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {userInfo.displayName}
                  </div>
                  <div className="text-xs text-gray-500">
                    {profile?.role === "admin" ? "Administrator" : "User"}
                  </div>
                </div>

                <ChevronDown className="h-4 w-4 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userInfo.displayName}</p>
                  <p className="text-xs text-gray-500">{userInfo.email}</p>
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
    </motion.div>
  );
}
