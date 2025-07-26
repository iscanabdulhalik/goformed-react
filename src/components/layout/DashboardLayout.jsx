import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const SIDEBAR_WIDTH_DEFAULT = 260;
const SIDEBAR_WIDTH_COLLAPSED = 88;

export default function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  return (
    <div className="relative min-h-screen flex">
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        width={currentSidebarWidth}
      />
      <main
        className="flex-1 overflow-auto p-4 sm:p-6 md:p-8 transition-all duration-300"
        style={{ marginLeft: `${currentSidebarWidth}px` }}
      >
        <Outlet />
      </main>
    </div>
  );
}
