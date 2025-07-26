import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";
import {
  FaTachometerAlt,
  FaStore,
  FaListAlt,
  FaCog,
  FaSignOutAlt,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";
import goformedLogo from "@/assets/logos/goformed.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const menuItems = [
  { to: "/dashboard", text: "Dashboard", icon: FaTachometerAlt },
  { to: "/dashboard/marketplace", text: "Marketplace", icon: FaStore },
  { to: "/dashboard/orders", text: "Orders", icon: FaListAlt },
  { to: "/dashboard/settings", text: "Settings", icon: FaCog },
];

export default function Sidebar({ isCollapsed, toggleCollapse, width }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth).then(() => navigate("/login"));
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen bg-card text-card-foreground border-r flex flex-col z-50 transition-all duration-300",
        isCollapsed ? "items-center" : ""
      )}
      style={{ width: `${width}px` }}
    >
      {/* Toggle Butonu, her zaman görünür ve kenarda */}
      <Button
        onClick={toggleCollapse}
        variant="outline"
        size="icon"
        className="absolute top-1/2 -translate-y-1/2 rounded-full h-7 w-7 z-50"
        style={{ left: `${width - 14}px` }}
      >
        {isCollapsed ? (
          <FaAngleRight className="h-4 w-4" />
        ) : (
          <FaAngleLeft className="h-4 w-4" />
        )}
      </Button>

      {/* Logo Alanı */}
      <div className="flex items-center h-20 border-b w-full px-6 flex-shrink-0">
        <img
          src={goformedLogo}
          alt="GoFormed"
          className={cn(
            "h-8 transition-all duration-300",
            isCollapsed && "mx-auto" // Daraltılmış halde ortala
          )}
        />
      </div>

      {/* Navigasyon Alanı */}
      <nav className="flex-1 px-4 py-4 space-y-1 w-full">
        {menuItems.map((item) => (
          <SidebarLink key={item.text} item={item} isCollapsed={isCollapsed} />
        ))}
      </nav>

      {/* Çıkış Alanı */}
      <div className="mt-auto p-4 border-t w-full">
        <Button
          variant="ghost"
          className={cn(
            "w-full",
            isCollapsed ? "justify-center" : "justify-start"
          )}
          onClick={handleLogout}
        >
          <FaSignOutAlt className={cn("h-5 w-5", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Log Out"}
        </Button>
      </div>
    </aside>
  );
}

function SidebarLink({ item, isCollapsed }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      className={({ isActive }) =>
        cn(
          "flex items-center p-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isActive &&
            "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          isCollapsed && "justify-center"
        )
      }
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", !isCollapsed && "mr-3")} />
      {!isCollapsed && <span className="truncate">{item.text}</span>}
    </NavLink>
  );
}
