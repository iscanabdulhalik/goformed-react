// src/components/layout/Header.jsx

import React from "react";
import { Link, NavLink } from "react-router-dom";
import goformedLogo from "@/assets/logos/goformed.png";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "#", text: "Home" },
  { href: "#pricing", text: "Pricing" },
  { href: "#about", text: "About" },
  { href: "#contact", text: "Contact us" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Sol Sütun: Logo */}
        <div className="flex-1 flex justify-start">
          <Link to="/" className="flex items-center space-x-2 pl-32">
            <img src={goformedLogo} alt="GoFormed Logo" className="h-8" />
          </Link>
        </div>

        {/* Orta Sütun: Navigasyon Linkleri */}
        <nav className="hidden md:flex flex-1 justify-center">
          <div className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
              <a
                key={link.text}
                href={link.href}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.text}
              </a>
            ))}
          </div>
        </nav>

        {/* Sağ Sütun: Butonlar */}
        <div className="hidden md:flex flex-1 items-center justify-end space-x-4">
          <NavLink
            to="/login"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </NavLink>
          <Button asChild>
            <Link to="/register">Start My Business</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
