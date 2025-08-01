// src/App.jsx - SessionWarningModal Eklendi ve Yapı Optimize Edildi
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

// Bileşenleri import et
import ErrorBoundary from "@/components/ErrorBoundary";
import SessionWarningModal from "@/components/auth/SessionWarningModal"; // Oturum uyarı modalı
import {
  ProtectedRoute,
  AdminRoute,
  GuestRoute,
} from "@/components/auth/ProtectedRoute";
import Loader from "@/components/ui/Loader";
import AuthCallback from "@/components/AuthCallback";

// Layoutları import et
import Layout from "@/components/layout/Layout";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AdminLayout from "@/components/layout/AdminLayout";

// Hemen yüklenmesi gereken kritik sayfalar
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";

// İhtiyaç duyulduğunda yüklenecek (Lazy-loaded) sayfalar
const ForgotPasswordPage = lazy(() => import("@/pages/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/DashboardPage"));
const MarketplacePage = lazy(() => import("@/pages/MarketplacePage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const RequestDetailsPage = lazy(() => import("@/pages/RequestDetailsPage"));

// Lazy-loaded admin sayfaları
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
); // Eğer varsa

// Sayfa yüklenirken gösterilecek olan genel yükleyici bileşeni
const PageLoader = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background">
    <Loader />
  </div>
);

// Suspense için bir sarmalayıcı bileşen
const SuspenseWrapper = ({ children }) => (
  <ErrorBoundary>
    <Suspense fallback={<PageLoader />}>{children}</Suspense>
  </ErrorBoundary>
);

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        {/* Oturum Uyarısı Modalı tüm uygulama üzerinde aktif olacak */}
        <SessionWarningModal />

        <Routes>
          {/* Herkese Açık Rotalar */}
          <Route
            path="/"
            element={
              <Layout>
                <HomePage />
              </Layout>
            }
          />
          <Route path="/auth/callback" element={<AuthCallback />} />

          {/* Sadece Misafirlerin (Giriş Yapmamış Kullanıcıların) Girebildiği Rotalar */}
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
          <Route
            path="/admin/login"
            element={
              <GuestRoute>
                <SuspenseWrapper>
                  <AdminLoginPage />
                </SuspenseWrapper>
              </GuestRoute>
            }
          />

          {/* Giriş Yapmış Kullanıcılar İçin Korumalı Rotalar */}
          <Route
            path="/dashboard/*"
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

          {/* Sadece Adminlerin Girebildiği Korumalı Rotalar */}
          <Route
            path="/admin/*"
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
            {/* Diğer admin rotaları buraya eklenebilir... */}
          </Route>

          {/* Bulunamayan Sayfalar İçin "Catch All" Rotası */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center text-center">
                <h1 className="text-4xl font-bold">404 - Not Found</h1>
                <p className="text-muted-foreground mt-2">
                  The page you are looking for does not exist.
                </p>
                <Navigate to="/" replace />
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
