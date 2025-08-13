// src/components/layout/Footer.jsx - MOBILE-FIRST RESPONSIVE
import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        {/* Footer Content */}
        <div className="grid gap-6 sm:gap-8 pb-6 sm:pb-8 lg:grid-cols-3 items-start">
          {/* Logo and Description - Full width on mobile */}
          <div className="flex flex-col gap-3 sm:gap-4 lg:col-span-1 text-center lg:text-left">
            <h4 className="text-lg sm:text-xl font-bold">GoFormed</h4>
            <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto lg:mx-0 leading-relaxed">
              The easiest way to launch and manage your UK business, from
              anywhere in the world.
            </p>
          </div>

          {/* Links Grid - Responsive columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 text-sm sm:text-base lg:col-span-2">
            <div className="space-y-3 text-center sm:text-left">
              <h4 className="font-semibold text-gray-900">Product</h4>
              <div className="space-y-2">
                <Link
                  to="/#pricing"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  to="/#services"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Services
                </Link>
                <Link
                  to="/register"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <h4 className="font-semibold text-gray-900">Company</h4>
              <div className="space-y-2">
                <Link
                  to="/#about"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  About Us
                </Link>
                <Link
                  to="/#faq"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  FAQ
                </Link>
                <Link
                  to="/#contact"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contact
                </Link>
              </div>
            </div>

            <div className="space-y-3 text-center sm:text-left col-span-2 sm:col-span-1">
              <h4 className="font-semibold text-gray-900">Legal</h4>
              <div className="space-y-2">
                <Link
                  to="/privacy"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  to="/terms"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom - Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 sm:pt-6 text-xs sm:text-sm text-muted-foreground border-t gap-4 sm:gap-0">
          <div className="text-center sm:text-left">
            © {new Date().getFullYear()} GoFormed. All Rights Reserved.
          </div>

          {/* Additional Info - Hidden on very small screens */}
          <div className="hidden sm:flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>System Operational</span>
            </div>
            <span>Made with ❤️ in UK</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
