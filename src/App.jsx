// src/App.jsx - Fixed RequestDetailsPage import, other placeholders preserved

import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ProtectedRoute,
  GuestRoute,
  AdminRoute,
} from "@/components/auth/ProtectedRoute";

// Pages
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import DashboardPage from "@/pages/DashboardPage";
import MarketplacePage from "@/pages/MarketplacePage";
import OrdersPage from "@/pages/OrdersPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthCallback from "@/components/AuthCallback";
import CompanyFormationFlow from "@/components/sections/CompanyFormationFlow";

// ✅ Gerçek RequestDetailsPage bileşeni import edildi
import RequestDetailsPage from "@/pages/RequestDetailsPage";

// Admin Pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUserManagement from "@/pages/admin/AdminUserManagement";
import AdminCompanyManagement from "@/pages/admin/AdminCompanyManagement";
import AdminNotificationManagement from "@/pages/admin/AdminNotificationManagement";
import AdminLayout from "@/components/layout/AdminLayout";

// ✅ Diğer geçici bileşenler isteğiniz üzerine korundu.
const PaymentSuccessPage = () => (
  <div className="p-6 text-center">
    <h1 className="text-2xl font-bold mb-4 text-green-600">
      Payment Successful!
    </h1>
    <p className="text-gray-600">
      Your payment has been processed successfully.
    </p>
  </div>
);

const CompanyRequestDetail = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold mb-4">Company Request Detail</h1>
    <p className="text-gray-600">
      Company request detail page is under development.
    </p>
  </div>
);

function App() {
  console.log("🚀 App component rendering...");

  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        {/* Auth Callback Route */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Guest Only Routes */}
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
              <ForgotPasswordPage />
            </GuestRoute>
          }
        />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Company Formation Flow - Standalone */}
        <Route
          path="/dashboard/company-formation"
          element={
            <ProtectedRoute>
              <CompanyFormationFlow />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/marketplace"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <MarketplacePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/orders"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <OrdersPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ✅ Rota artık gerçek RequestDetailsPage bileşenini kullanıyor */}
        <Route
          path="/dashboard/request/:id"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <RequestDetailsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <SettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Payment Success Route */}
        <Route
          path="/payment-success"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PaymentSuccessPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/login"
          element={
            <GuestRoute>
              <AdminLoginPage />
            </GuestRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/notifications"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminNotificationManagement />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminUserManagement />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/companies"
          element={
            <AdminRoute>
              <AdminLayout>
                <AdminCompanyManagement />
              </AdminLayout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/companies/:id"
          element={
            <AdminRoute>
              <AdminLayout>
                <CompanyRequestDetail />
              </AdminLayout>
            </AdminRoute>
          }
        />

        {/* 404 Not Found */}
        <Route
          path="*"
          element={
            <Layout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold">404</h1>
                  <p className="text-gray-600">Page Not Found</p>
                  <Link to="/" className="text-blue-600 hover:underline">
                    Go Home
                  </Link>
                </div>
              </div>
            </Layout>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
