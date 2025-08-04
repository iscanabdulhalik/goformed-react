// src/components/auth/ProtectedRoute.jsx - FIXED LOADING ISSUE
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// ✅ SIMPLIFIED Loading component with timeout
const LoadingScreen = ({ message = "Loading..." }) => {
  const [showFallback, setShowFallback] = React.useState(false);

  // ✅ Show fallback after 5 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">{message}</p>
        {showFallback && (
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 underline"
            >
              Taking too long? Click to refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ FIXED: Protected route with timeout handling
export const ProtectedRoute = ({ children }) => {
  const { user, loading, isInitialized } = useAuth();
  const location = useLocation();
  const [forceRender, setForceRender] = React.useState(false);

  console.log("🔒 ProtectedRoute check:", {
    user: !!user,
    loading,
    isInitialized,
    path: location.pathname,
    forceRender,
  });

  // ✅ CRITICAL: Force render after timeout
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !isInitialized) {
        console.warn("⚠️ ProtectedRoute forcing render after timeout");
        setForceRender(true);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timer);
  }, [loading, isInitialized]);

  // ✅ Show loading only if really needed and not timed out
  if ((loading || !isInitialized) && !forceRender) {
    return <LoadingScreen message="Checking authentication..." />;
  }

  // ✅ Redirect to login if not authenticated
  if (!user) {
    console.log("❌ No user, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("✅ User authenticated, rendering protected content");
  return children;
};

// ✅ FIXED: Guest route with timeout handling
export const GuestRoute = ({ children }) => {
  const { user, loading, isInitialized, isAdmin } = useAuth();
  const location = useLocation();
  const [forceRender, setForceRender] = React.useState(false);

  console.log("👋 GuestRoute check:", {
    user: !!user,
    isAdmin: isAdmin(),
    loading,
    isInitialized,
    path: location.pathname,
    forceRender,
  });

  // ✅ CRITICAL: Force render after timeout
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !isInitialized) {
        console.warn("⚠️ GuestRoute forcing render after timeout");
        setForceRender(true);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timer);
  }, [loading, isInitialized]);

  // ✅ Show loading only if really needed and not timed out
  if ((loading || !isInitialized) && !forceRender) {
    return <LoadingScreen message="Checking user status..." />;
  }

  // If user is authenticated, redirect based on role and current page
  if (user) {
    // ✅ CRITICAL FIX: Check which login page they're trying to access
    const isAdminLoginPage = location.pathname === "/admin/login";
    const isRegularLoginPage = location.pathname === "/login";

    console.log("🔄 Authenticated user accessing guest route:", {
      isAdminLoginPage,
      isRegularLoginPage,
      isAdmin: isAdmin(),
      userEmail: user.email,
    });

    // If they're trying to access admin login but are not admin
    if (isAdminLoginPage && !isAdmin()) {
      console.log(
        "❌ Non-admin trying to access admin login, redirecting to user dashboard"
      );
      return <Navigate to="/dashboard" replace />;
    }

    // If they're trying to access regular login and are admin
    if (isRegularLoginPage && isAdmin()) {
      console.log(
        "✅ Admin accessing regular login, redirecting to admin dashboard"
      );
      return <Navigate to="/admin" replace />;
    }

    // If they're trying to access admin login and are admin
    if (isAdminLoginPage && isAdmin()) {
      console.log(
        "✅ Admin accessing admin login, redirecting to admin dashboard"
      );
      return <Navigate to="/admin" replace />;
    }

    // For regular login or other guest routes, redirect to user dashboard
    console.log(
      "🔄 Regular user accessing guest route, redirecting to dashboard"
    );
    return <Navigate to="/dashboard" replace />;
  }

  console.log("✅ No user, rendering guest content");
  return children;
};

// ✅ FIXED: Admin route with timeout handling
export const AdminRoute = ({ children }) => {
  const { user, loading, isInitialized, isAdmin, profile } = useAuth();
  const location = useLocation();
  const [forceRender, setForceRender] = React.useState(false);

  console.log("👑 AdminRoute check:", {
    user: !!user,
    profile: !!profile,
    isAdmin: isAdmin(),
    loading,
    isInitialized,
    path: location.pathname,
    userEmail: user?.email,
    profileRole: profile?.role,
    forceRender,
  });

  // ✅ CRITICAL: Force render after timeout
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading && !isInitialized) {
        console.warn("⚠️ AdminRoute forcing render after timeout");
        setForceRender(true);
      }
    }, 8000); // 8 second timeout

    return () => clearTimeout(timer);
  }, [loading, isInitialized]);

  // ✅ Show loading only if really needed and not timed out
  if ((loading || !isInitialized) && !forceRender) {
    return <LoadingScreen message="Verifying admin access..." />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log("❌ No user for admin route, redirecting to admin login");
    return (
      <Navigate
        to="/admin/login"
        state={{
          from: location,
          error: "Please sign in with admin credentials",
        }}
        replace
      />
    );
  }

  // Check admin privileges (allow some time for profile to load, but don't wait forever)
  if (!isAdmin()) {
    console.log("❌ User lacks admin privileges:", {
      email: user.email,
      profileRole: profile?.role,
      userMetadata: user.user_metadata?.role,
      appMetadata: user.app_metadata?.role,
    });

    return (
      <Navigate
        to="/admin/login"
        state={{
          from: location,
          error: "Access denied. Admin privileges required.",
        }}
        replace
      />
    );
  }

  console.log("✅ Admin access granted, rendering admin content");
  return children;
};
