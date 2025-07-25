import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "./firebase";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";

// Layout'lar
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layout/DashboardLayout";

import "./App.css";

const App = () => {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
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
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to="/dashboard" /> : <RegisterPage />}
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={user ? <DashboardLayout /> : <Navigate to="/login" />}
      >
        <Route index element={<DashboardPage />} />
        <Route path="marketplace" element={<MarketplacePage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Diğer dashboard sayfaları buraya eklenebilir */}
      </Route>
    </Routes>
  );
};

export default App;
