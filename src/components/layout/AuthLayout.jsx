// src/components/layout/AuthLayout.jsx - FULLY RESPONSIVE VERSION
import React from "react";
import authBgImage from "@/assets/images/auth-image.jpg";

// Ana layout container - Mobile first responsive
export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col lg:grid lg:grid-cols-2 lg:max-w-none">
      {children}
    </div>
  );
}

// Görseli ve metni içeren panel - Mobile optimized
export function AuthImage() {
  return (
    <div className="relative hidden lg:flex h-full flex-col p-6 xl:p-10 text-white order-2 lg:order-1">
      {/* 1. Arka Plan Resmi - Responsive */}
      <div
        className="absolute inset-0 bg-cover bg-center lg:bg-center xl:bg-center"
        style={{ backgroundImage: `url(${authBgImage})` }}
      />

      {/* 2. YARI ŞEFFAF GRADIENT KATMANI - Enhanced for mobile */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent lg:from-black/60 lg:via-black/20" />

      {/* 3. İÇERİK - Responsive spacing */}
      <div className="relative z-20 flex h-full flex-col justify-between">
        {/* Logo Alanı */}
        <div className="flex items-center text-lg lg:text-xl font-medium">
          GoFormed
        </div>

        {/* Alıntı Alanı - Responsive text */}
        <div className="space-y-3 lg:space-y-4">
          <blockquote className="space-y-2 lg:space-y-3">
            <p className="text-base lg:text-lg xl:text-xl font-medium leading-relaxed">
              "This service has been a true game-changer for our international
              operations. Seamless and efficient."
            </p>
            <footer className="text-sm lg:text-base font-light text-white/80">
              Sofia Davis, Global Entrepreneur
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}

// Sağdaki içerik paneli - Mobile first
export function AuthContent({ children }) {
  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 order-1 lg:order-2 bg-white">
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">{children}</div>
    </div>
  );
}
