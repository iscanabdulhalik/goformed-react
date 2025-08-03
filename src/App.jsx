// src/App.jsx - Projenizdeki dosya yoluna göre son düzeltme

import React from "react";
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toast";
import Layout from "@/components/layout/Layout";
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
// ✅ DÜZELTME: Bileşen, projenizdeki doğru konum olan 'sections' altından çağrılıyor.
import CompanyFormationPage from "@/components/sections/CompanyFormationFlow";
import MarketplacePage from "@/pages/MarketplacePage";
import OrdersPage from "@/pages/OrdersPage";
import RequestDetailsPage from "@/pages/RequestDetailsPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthCallback from "@/components/AuthCallback";

// Admin Pages
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import AdminUserManagement from "@/pages/admin/AdminUserManagement";
import AdminCompanyManagement from "@/pages/admin/AdminCompanyManagement";
import AdminNotificationManagement from "@/pages/admin/AdminNotificationManagement";
import AdminLayout from "@/components/layout/AdminLayout";

function App() {
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
              <Layout isDashboard>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/company-formation"
          element={
            <ProtectedRoute>
              <Layout isDashboard>
                <CompanyFormationPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/marketplace"
          element={
            <ProtectedRoute>
              <Layout isDashboard>
                <MarketplacePage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/orders"
          element={
            <ProtectedRoute>
              <Layout isDashboard>
                <OrdersPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/request/:id"
          element={
            <ProtectedRoute>
              <Layout isDashboard>
                <RequestDetailsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute>
              <Layout isDashboard>
                <SettingsPage />
              </Layout>
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
      <Toaster />
    </AuthProvider>
  );
}

export default App;
