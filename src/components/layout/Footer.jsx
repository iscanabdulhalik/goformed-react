// src/components/layout/Footer.jsx

import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    // 1. Ana footer elementi tam genişlikte (`w-full`) ve üst çizgiyi (`border-t`) içeriyor.
    //    Bu, çizginin sayfanın bir ucundan diğerine uzanmasını sağlar.
    <footer className="w-full border-t bg-background">
      {/*
        2. Tüm footer içeriği, genişliği sınırlayan ve içeriği ortalayan
           tek bir `container` div'i içine alınmıştır.
      */}
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Footer'ın üst kısmı: Logo ve linkler */}
        <div className="grid gap-8 pb-8 lg:grid-cols-3 items-start">
          {/* Sütun 1: Logo ve Açıklama */}
          <div className="flex flex-col gap-2 lg:col-span-1">
            <h4 className="text-lg font-bold">GoFormed</h4>
            <p className="text-muted-foreground text-sm max-w-[300px]">
              The easiest way to launch and manage your UK business, from
              anywhere in the world.
            </p>
          </div>

          {/* Sütun 2, 3, 4: Link Grid'i */}
          <div className="grid grid-cols-2 gap-4 text-sm lg:col-span-2 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="font-semibold">Product</h4>
              <Link
                to="/#pricing"
                className="block text-muted-foreground hover:text-foreground"
              >
                Pricing
              </Link>
              <Link
                to="/#services"
                className="block text-muted-foreground hover:text-foreground"
              >
                Services
              </Link>
              <Link
                to="/register"
                className="block text-muted-foreground hover:text-foreground"
              >
                Get Started
              </Link>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Company</h4>
              <Link
                to="/#about"
                className="block text-muted-foreground hover:text-foreground"
              >
                About Us
              </Link>
              <Link
                to="/#faq"
                className="block text-muted-foreground hover:text-foreground"
              >
                FAQ
              </Link>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Legal</h4>
              <Link
                to="/privacy"
                className="block text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link
                to="/terms"
                className="block text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Footer'ın alt kısmı: Copyright bilgisi */}
        {/* Bu bölüm, üst kısımdan bir çizgi ile ayrılmıştır. */}
        <div className="flex items-center justify-center pt-6 text-sm text-muted-foreground border-t">
          © {new Date().getFullYear()} GoFormed. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
