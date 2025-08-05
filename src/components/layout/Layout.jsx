// src/components/layout/Layout.jsx - DÜZELTİLMİŞ VERSİYON
import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar"; // ✅ Header değil, Navbar olmalı!
import Footer from "./Footer";

export default function Layout({ children }) {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="flex flex-col min-h-screen w-full">
      {!isAuthPage && <Navbar />} {/* ✅ Header değil, Navbar! */}
      <main className="flex-1 w-full">{children}</main>
      {!isAuthPage && <Footer />}
    </div>
  );
}
