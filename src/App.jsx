// src/App.jsx

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

// Sayfaları import ediyoruz
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import FinishLoginPage from "./pages/FinishLoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

// Layout'ları ve Loader'ı import ediyoruz
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layout/DashboardLayout";
import Loader from "./components/ui/Loader";

const App = () => {
  const [user, loading] = useAuthState(auth);

  // Firebase kullanıcı durumunu kontrol ederken yükleme animasyonunu göster
  if (loading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Herkesin Erişebileceği Genel Rotalar */}
      <Route
        path="/"
        element={
          <Layout>
            <HomePage />
          </Layout>
        }
      />
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />

      {/* Kimlik Doğrulama Yardımcı Rotaları */}
      <Route path="/finish-login" element={<FinishLoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Sadece Giriş Yapmış Kullanıcıların Erişebileceği Korumalı Rotalar */}
      <Route
        path="/dashboard"
        element={user ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Gelecekte eklenecek diğer dashboard sayfaları buraya gelebilir */}
      </Route>

      {/* Tanımlanmayan diğer tüm yollar için ana sayfaya yönlendirme (isteğe bağlı) */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
