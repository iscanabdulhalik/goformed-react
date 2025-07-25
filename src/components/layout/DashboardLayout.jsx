import React, { useState, useCallback } from "react";
import styled from "styled-components";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const SIDEBAR_WIDTH_DEFAULT = 260;
const SIDEBAR_WIDTH_COLLAPSED = 88; // İkonların rahat sığacağı genişlik

const DashboardWrapper = styled.div`
  display: flex;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MainContent = styled.main`
  flex-grow: 1;
  padding: 2.5rem 3rem;
  width: 100%;
  margin-left: ${({ $sidebarwidth }) => `${$sidebarwidth}px`};
  transition: margin-left 0.3s ease-in-out;
`;

const DashboardLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  const currentSidebarWidth = isCollapsed
    ? SIDEBAR_WIDTH_COLLAPSED
    : SIDEBAR_WIDTH_DEFAULT;

  return (
    <DashboardWrapper>
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        width={currentSidebarWidth}
      />
      <MainContent $sidebarwidth={currentSidebarWidth}>
        <Outlet />
      </MainContent>
    </DashboardWrapper>
  );
};

export default DashboardLayout;
