// src/components/layout/Navbar.jsx - FULLY RESPONSIVE VERSION
import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import NotificationBell from "@/components/ui/NotificationBell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Building2,
  ShoppingCart,
  FileText,
  Shield,
  ChevronDown,
  Globe,
  Home,
  Mail,
  Info,
  Phone,
} from "lucide-react";

// Profile dropdown menu
const ProfileDropdown = ({ user, profile, onSignOut, isAdmin }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const getProfilePhoto = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    if (user?.user_metadata?.picture) {
      return user.user_metadata.picture;
    }
    if (user?.app_metadata?.picture) {
      return user.app_metadata.picture;
    }
    return null;
  };

  const getDisplayName = () => {
    return (
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "User"
    );
  };

  const getInitials = () => {
    const name = getDisplayName();
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profilePhoto = getProfilePhoto();

  const menuItems = [
    {
      icon: Building2,
      label: "Dashboard",
      onClick: () => {
        navigate("/dashboard");
        setIsOpen(false);
      },
    },
    {
      icon: ShoppingCart,
      label: "Orders",
      onClick: () => {
        navigate("/dashboard/orders");
        setIsOpen(false);
      },
    },
    {
      icon: Settings,
      label: "Settings",
      onClick: () => {
        navigate("/dashboard/settings");
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 p-1 rounded-full hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={getDisplayName()}
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-white shadow-sm"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}

          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs sm:text-sm font-semibold ${
              profilePhoto ? "hidden" : "flex"
            }`}
          >
            {getInitials()}
          </div>

          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        <ChevronDown
          className={`w-3 h-3 sm:w-4 sm:h-4 text-gray-500 transition-transform hidden sm:block ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 py-2"
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={getDisplayName()}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}

                  <div
                    className={`w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold ${
                      profilePhoto ? "hidden" : "flex"
                    }`}
                  >
                    {getInitials()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate text-sm">
                    {getDisplayName()}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                  {isAdmin && (
                    <Badge className="text-xs mt-1 bg-purple-100 text-purple-800">
                      Admin
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="py-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-2">
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Smooth scroll to section function
const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    const offset = 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

// Main Navbar Component
export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  const handleNavigation = (href) => {
    if (href.startsWith("/#")) {
      if (location.pathname !== "/") {
        navigate("/");
        setTimeout(() => {
          const sectionId = href.substring(2);
          scrollToSection(sectionId);
        }, 100);
      } else {
        const sectionId = href.substring(2);
        scrollToSection(sectionId);
      }
    } else {
      navigate(href);
    }
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === "/") {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/#features", icon: ShoppingCart },
    { name: "About", href: "/#about", icon: Info },
    { name: "Contact", href: "/#contact", icon: Mail },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-1.5 sm:space-x-2 font-bold text-lg sm:text-xl text-gray-900 hover:text-blue-600 transition-colors"
            >
              <Building2 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-600 flex-shrink-0" />
              <span className="text-base sm:text-lg lg:text-xl">GoFormed</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={`flex items-center gap-1.5 lg:gap-2 px-2.5 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </button>
              );
            })}
          </div>

          {/* Right Side - Auth & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-4">
            {user ? (
              <>
                {/* Notifications Bell - Hidden on small screens */}
                <div className="hidden sm:block">
                  <NotificationBell userId={user.id} />
                </div>

                {/* Dashboard Button */}
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex text-xs lg:text-sm px-2 lg:px-3"
                >
                  <Link to="/dashboard">
                    <Building2 className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Dashboard</span>
                    <span className="lg:hidden">Dash</span>
                  </Link>
                </Button>

                {/* Profile Dropdown */}
                <ProfileDropdown
                  user={user}
                  profile={profile}
                  onSignOut={handleSignOut}
                  isAdmin={isAdmin}
                />
              </>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Link to="/register">
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Start</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden p-1.5 h-8 w-8"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-colors ${
                        isActive(item.href)
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </button>
                  );
                })}

                {user && (
                  <div className="pt-4 border-t border-gray-200 space-y-1">
                    {/* Mobile Notifications */}
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Notifications
                      </span>
                      <NotificationBell userId={user.id} />
                    </div>

                    {/* Mobile Dashboard Link */}
                    <button
                      onClick={() => {
                        navigate("/dashboard");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      <Building2 className="w-5 h-5" />
                      Dashboard
                    </button>

                    {/* Mobile Orders Link */}
                    <button
                      onClick={() => {
                        navigate("/dashboard/orders");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      Orders
                    </button>

                    {/* Mobile Settings Link */}
                    <button
                      onClick={() => {
                        navigate("/dashboard/settings");
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors"
                    >
                      <Settings className="w-5 h-5" />
                      Settings
                    </button>

                    {/* Mobile Sign Out */}
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out
                    </button>
                  </div>
                )}

                {/* Mobile Auth Buttons for non-logged users */}
                {!user && (
                  <div className="pt-4 border-t border-gray-200 space-y-3 px-3">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full justify-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link to="/login">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full justify-center bg-blue-600 hover:bg-blue-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link to="/register">Get Started</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
