// src/components/auth/ProtectedRoute.jsx - MINIMAL VERSION
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// ✅ MINIMAL: Protected route
export const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("🔒 ProtectedRoute:", {
    user: !!user,
    loading,
    path: location.pathname,
  });

  // ✅ SHOW LOADING ONLY FOR 3 SECONDS MAX
  if (loading) {
    setTimeout(() => {
      console.log("⏰ Loading timeout - forcing render");
    }, 3000);

    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("🚫 No user, redirecting to login");
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  console.log("✅ User found, rendering children");
  return children;
};

// ✅ MINIMAL: Admin route
export const AdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  console.log("👑 AdminRoute:", { user: !!user, loading, isAdmin: isAdmin() });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>Checking admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/admin/login" state={{ from: location.pathname }} replace />
    );
  }

  if (!isAdmin()) {
    return (
      <Navigate
        to="/admin/login"
        state={{
          error: "Admin access required",
          from: location.pathname,
        }}
        replace
      />
    );
  }

  return children;
};

// ✅ MINIMAL: Guest route
export const GuestRoute = ({ children, redirectTo = "/dashboard" }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("👤 GuestRoute:", { user: !!user, loading });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (user) {
    const from = location.state?.from || redirectTo;
    console.log("🔄 User logged in, redirecting to:", from);
    return <Navigate to={from} replace />;
  }

  return children;
};
