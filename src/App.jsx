// src/App.jsx - Optimized with better route management and error handling
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Components
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionWarningModal from "@/components/auth/SessionWarningModal";
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
  PublicRoute,
} from "@/components/auth/ProtectedRoute";
import Loader from "@/components/ui/Loader";
import AuthCallback from "@/components/AuthCallback";

// Layouts
import Layout from "@/components/layout/Layout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Critical pages (eager loaded)
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

// Lazy loaded pages
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const RequestDetailsPage = lazy(() => import("@/pages/RequestDetailsPage"));

// Admin pages
const AdminLoginPage = lazy(() => import("@/pages/admin/AdminLoginPage"));
const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/AdminDashboardPage")
);
const AdminUserManagement = lazy(() =>
  import("@/pages/admin/AdminUserManagement")
);
const AdminNotificationManagement = lazy(() =>
  import("@/pages/admin/AdminNotificationManagement")
);
const AdminCompanyManagement = lazy(() =>
  import("@/pages/admin/AdminCompanyManagement")
);

// Global loading component
const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader />
      <p className="text-muted-foreground mt-4">Loading...</p>
    </div>
  </div>
);

// Suspense wrapper with error boundary
const SuspenseWrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

// 404 Not Found component
const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center text-center bg-background">
    <div className="max-w-md mx-auto">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
      <p className="text-muted-foreground mb-8">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="space-y-2">
        <a
          href="/"
          className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Go Home
        </a>
        <br />
        <button
          onClick={() => window.history.back()}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Go Back
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* Global session warning modal */}
        <SessionWarningModal />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <Layout>
                  <HomePage />
                </Layout>
              </PublicRoute>
            }
          />

          {/* Auth Callback */}
          <Route
            path="/auth/callback"
            element={
              <PublicRoute>
                <AuthCallback />
              </PublicRoute>
            }
          />

          {/* Guest Only Routes (Logged out users) */}
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <GuestRoute>
                <SuspenseWrapper>
                  <ForgotPasswordPage />
                </SuspenseWrapper>
              </GuestRoute>
            }
          />

          {/* Protected User Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route
              index
              element={
                <SuspenseWrapper>
                  <DashboardPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="marketplace"
              element={
                <SuspenseWrapper>
                  <MarketplacePage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="orders"
              element={
                <SuspenseWrapper>
                  <OrdersPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="settings"
              element={
                <SuspenseWrapper>
                  <SettingsPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="request/:id"
              element={
                <SuspenseWrapper>
                  <RequestDetailsPage />
                </SuspenseWrapper>
              }
            />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin/login"
            element={
              <GuestRoute redirectTo="/admin">
                <SuspenseWrapper>
                  <AdminLoginPage />
                </SuspenseWrapper>
              </GuestRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route
              index
              element={
                <SuspenseWrapper>
                  <AdminDashboardPage />
                </SuspenseWrapper>
              }
            />
            <Route
              path="users"
              element={
                <SuspenseWrapper>
                  <AdminUserManagement />
                </SuspenseWrapper>
              }
            />
            <Route
              path="notifications"
              element={
                <SuspenseWrapper>
                  <AdminNotificationManagement />
                </SuspenseWrapper>
              }
            />
            <Route
              path="companies"
              element={
                <SuspenseWrapper>
                  <AdminCompanyManagement />
                </SuspenseWrapper>
              }
            />
          </Route>

          {/* Legacy admin routes redirect */}
          <Route
            path="/admin/dashboard"
            element={<Navigate to="/admin" replace />}
          />

          {/* Catch all - 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
