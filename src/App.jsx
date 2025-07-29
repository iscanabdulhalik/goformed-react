import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./supabase"; // Firebase yerine Supabase'i import et

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";

import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layout/DashboardLayout";
import Loader from "./components/ui/Loader";

import RequestDetailsPage from "./pages/RequestDetailsPage";

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Component kaldırıldığında (cleanup) abonelikten çık
    return () => subscription.unsubscribe();
  }, []);

  // Oturum bilgisi alınana kadar yükleme ekranını göster
  if (loading) {
    return <Loader />;
  }

  const user = session?.user;

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
      </Route>

      <Route path="request/:id" element={<RequestDetailsPage />} />

      {/* Tanımlanmayan diğer tüm yollar için ana sayfaya yönlendirme */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default App;
