// src/components/layout/Layout.jsx - Router kullanımı kaldırıldı
import React from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout({ children }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen w-full">
      {!isAuthPage && <Header />}

      <main className="flex-1 w-full">{children}</main>

      {!isAuthPage && <Footer />}
    </div>
  );
}
