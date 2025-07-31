// src/App.jsx - Lazy loading ile optimize edilmiş versiyon
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Components (always loaded)
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionWarningModal from "@/components/auth/SessionWarningModal";
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from "@/components/auth/ProtectedRoute";
import Loader from "@/components/ui/Loader";

// Layouts (always loaded - they're small)
import Layout from "@/components/layout/Layout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// ✅ Lazy loaded pages - Critical pages loaded immediately
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

// ✅ Lazy loaded pages - Less critical pages
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const RequestDetailsPage = lazy(() => import("@/pages/RequestDetailsPage"));

// ✅ Admin pages - Lazy loaded (admin users are minority)
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

// ✅ Loading component with better UX
const PageLoader = ({ message = "Loading..." }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <Loader />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  </div>
);

// ✅ Suspense wrapper with error boundary
const SuspenseWrapper = ({
  children,
  fallback,
  errorMessage = "Loading page...",
}) => (
  <ErrorBoundary>
    <Suspense fallback={fallback || <PageLoader message={errorMessage} />}>
      {children}
    </Suspense>
  </ErrorBoundary>
);

const App = () => {
  return (
    <ErrorBoundary>
      <SessionWarningModal />

      <Routes>
        {/* ✅ Public Routes - No lazy loading */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        {/* ✅ Auth Routes - No lazy loading (critical) */}
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
              <SuspenseWrapper errorMessage="Loading password reset page...">
                <ForgotPasswordPage />
              </SuspenseWrapper>
            </GuestRoute>
          }
        />

        {/* ✅ Protected User Routes - Lazy loaded */}
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
              <SuspenseWrapper errorMessage="Loading dashboard...">
                <DashboardPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="marketplace"
            element={
              <SuspenseWrapper errorMessage="Loading marketplace...">
                <MarketplacePage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="orders"
            element={
              <SuspenseWrapper errorMessage="Loading orders...">
                <OrdersPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="settings"
            element={
              <SuspenseWrapper errorMessage="Loading settings...">
                <SettingsPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="request/:id"
            element={
              <SuspenseWrapper errorMessage="Loading request details...">
                <RequestDetailsPage />
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* ✅ Admin Login - Lazy loaded */}
        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <SuspenseWrapper errorMessage="Loading admin login...">
                <AdminLoginPage />
              </SuspenseWrapper>
            </GuestRoute>
          }
        />

        {/* ✅ Protected Admin Routes - Lazy loaded */}
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
              <SuspenseWrapper errorMessage="Loading admin dashboard...">
                <AdminDashboardPage />
              </SuspenseWrapper>
            }
          />
          <Route
            path="users"
            element={
              <SuspenseWrapper errorMessage="Loading user management...">
                <AdminUserManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path="companies"
            element={
              <SuspenseWrapper errorMessage="Loading company management...">
                <div>Company Management Coming Soon</div>
              </SuspenseWrapper>
            }
          />
          <Route
            path="notifications"
            element={
              <SuspenseWrapper errorMessage="Loading notification management...">
                <AdminNotificationManagement />
              </SuspenseWrapper>
            }
          />
          <Route
            path="automations"
            element={
              <SuspenseWrapper errorMessage="Loading automations...">
                <div>Automations Coming Soon</div>
              </SuspenseWrapper>
            }
          />
          <Route
            path="reports"
            element={
              <SuspenseWrapper errorMessage="Loading reports...">
                <div>Reports Coming Soon</div>
              </SuspenseWrapper>
            }
          />
          <Route
            path="settings"
            element={
              <SuspenseWrapper errorMessage="Loading admin settings...">
                <div>Admin Settings Coming Soon</div>
              </SuspenseWrapper>
            }
          />
        </Route>

        {/* ✅ Catch All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
