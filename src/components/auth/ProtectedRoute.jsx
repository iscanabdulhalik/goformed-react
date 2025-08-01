// src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";
import Loader from "@/components/ui/Loader";

// ✅ Regular user protection
export function ProtectedRoute({ children, requireAuth = true }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (requireAuth && !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please sign in to access this page",
        }}
      />
    );
  }

  if (!requireAuth && user) {
    // Redirect authenticated users away from auth pages
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ✅ Admin protection
export function AdminRoute({ children }) {
  const { user, isAdmin, loading, profile } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: location.pathname,
          message: "Please sign in to access admin panel",
        }}
      />
    );
  }

  if (!isAdmin) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          message: "Admin access required",
        }}
      />
    );
  }

  return children;
}

// ✅ Guest only (for login/register pages)
export function GuestRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

// ✅ Role-based protection
export function RoleBasedRoute({ children, allowedRoles = ["user"] }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          message: "Please sign in to access this page",
        }}
      />
    );
  }

  const userRole = profile?.role || "user";

  if (!allowedRoles.includes(userRole)) {
    return (
      <Navigate
        to="/dashboard"
        replace
        state={{
          message: "You do not have permission to access this page",
        }}
      />
    );
  }

  return children;
}
