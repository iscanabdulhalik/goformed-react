// src/components/auth/ProtectedRoute.jsx - Enhanced with better error handling
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

// Loading component
const AuthLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-muted-foreground">Checking authentication...</p>
    </div>
  </div>
);

// Error component for when Supabase is not configured
const AuthError = ({ children }) => {
  const { isSupabaseConfigured } = useAuth();

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            Configuration Error
          </h1>
          <p className="text-muted-foreground mb-4">
            The application is not properly configured. Please check the
            environment variables.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return children;
};

// Protected route for authenticated users
export const ProtectedRoute = ({ children, redirectTo = "/login" }) => {
  const { user, loading, isInitialized, isSupabaseConfigured } = useAuth();
  const location = useLocation();

  // Show error if Supabase is not configured
  if (!isSupabaseConfigured) {
    return <AuthError>{children}</AuthError>;
  }

  // Show loading while checking authentication
  if (loading || !isInitialized) {
    return <AuthLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <Navigate to={redirectTo} state={{ from: location.pathname }} replace />
    );
  }

  return children;
};

// Admin route for admin users only
export const AdminRoute = ({ children, redirectTo = "/dashboard" }) => {
  const { user, loading, isInitialized, isAdmin, isSupabaseConfigured } =
    useAuth();
  const location = useLocation();

  // Show error if Supabase is not configured
  if (!isSupabaseConfigured) {
    return <AuthError>{children}</AuthError>;
  }

  // Show loading while checking authentication
  if (loading || !isInitialized) {
    return <AuthLoader />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Redirect to dashboard if not admin
  if (!isAdmin()) {
    return (
      <Navigate
        to={redirectTo}
        state={{
          from: location.pathname,
          error: "Access denied. Admin privileges required.",
        }}
        replace
      />
    );
  }

  return children;
};

// Guest route for non-authenticated users only
export const GuestRoute = ({ children, redirectTo = "/dashboard" }) => {
  const { user, loading, isInitialized, isSupabaseConfigured } = useAuth();
  const location = useLocation();

  // Show error if Supabase is not configured
  if (!isSupabaseConfigured) {
    return <AuthError>{children}</AuthError>;
  }

  // Show loading while checking authentication
  if (loading || !isInitialized) {
    return <AuthLoader />;
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    const from = location.state?.from || redirectTo;
    return <Navigate to={from} replace />;
  }

  return children;
};

// Public route (no authentication required)
export const PublicRoute = ({ children }) => {
  const { isSupabaseConfigured } = useAuth();

  // Show error if Supabase is not configured
  if (!isSupabaseConfigured) {
    return <AuthError>{children}</AuthError>;
  }

  return children;
};
