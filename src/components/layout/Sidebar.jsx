import React from "react";
import styled from "styled-components";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import {
  FaTachometerAlt,
  FaStore,
  FaListAlt,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import goformedLogo from "../../assets/logos/goformed.png";

const SidebarWrapper = styled.aside`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${({ width }) => `${width}px`};
  background-color: #ffffff;
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  z-index: 100;
  transition: width 0.3s ease-in-out;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  padding: 2rem 1rem;
`;

const SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 2rem;
  min-height: 35px;
  position: relative;
`;

const Logo = styled.img`
  height: 35px;
  display: block;
  opacity: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "1")};
  transform: ${({ $isCollapsed }) => ($isCollapsed ? "scale(0)" : "scale(1)")};
  transition: all 0.3s ease-in-out;
`;

const ToggleButton = styled.button`
  background: #f8f9fa;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: all 0.2s ease;
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 100;

  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
    transform: scale(1.05);
  }

  svg {
    font-size: 16px;
  }
`;

const NavigationArea = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const NavItem = styled.li`
  margin-bottom: 0.5rem;
`;

const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  text-decoration: none;
  width: 100%;
  justify-content: ${({ $isCollapsed }) =>
    $isCollapsed ? "center" : "flex-start"};

  .icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-right: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "1rem")};
  }

  .text {
    white-space: nowrap;
    overflow: hidden;
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "1")};
    width: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "auto")};
    transition: all 0.3s ease-in-out;
  }

  &.active {
    background-color: ${({ theme }) => theme.colors.primary};
    color: #ffffff;
  }

  &:hover:not(.active) {
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
  }
`;

const LogoutSection = styled.div`
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  flex-shrink: 0;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  width: 100%;
  justify-content: ${({ $isCollapsed }) =>
    $isCollapsed ? "center" : "flex-start"};

  .icon {
    font-size: 1.2rem;
    flex-shrink: 0;
    margin-right: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "1rem")};
  }

  .text {
    white-space: nowrap;
    overflow: hidden;
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "1")};
    width: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "auto")};
    transition: all 0.3s ease-in-out;
  }

  &:hover {
    color: #dc3545;
    background-color: rgba(220, 53, 69, 0.1);
  }
`;

const CollapsedClickArea = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
`;

const ContentArea = styled.div`
  position: relative;
  z-index: 2;
`;

const menuItems = [
  { to: "/dashboard", text: "Dashboard", icon: <FaTachometerAlt /> },
  { to: "/dashboard/marketplace", text: "Marketplace", icon: <FaStore /> },
  { to: "/dashboard/orders", text: "Orders", icon: <FaListAlt /> },
  { to: "/dashboard/settings", text: "Settings", icon: <FaCog /> },
];

const Sidebar = ({ isCollapsed, toggleCollapse, expandSidebar, width }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        console.error("Logout error:", error);
      });
  };

  const handleSidebarClick = () => {
    if (isCollapsed) {
      expandSidebar();
    }
  };

  return (
    <SidebarWrapper width={width} $isCollapsed={isCollapsed}>
      {isCollapsed && <CollapsedClickArea onClick={handleSidebarClick} />}

      <ContentArea $isCollapsed={isCollapsed}>
        {/* Header Section */}
        <SidebarHeader $isCollapsed={isCollapsed}>
          <Logo
            src={goformedLogo}
            alt="GoFormed Logo"
            $isCollapsed={isCollapsed}
          />
          <ToggleButton onClick={toggleCollapse}>
            {isCollapsed ? <FaBars /> : <FaTimes />}
          </ToggleButton>
        </SidebarHeader>

        {/* Navigation Area */}
        <NavigationArea>
          <NavList>
            {menuItems.map((item) => (
              <NavItem key={item.to}>
                <StyledNavLink
                  to={item.to}
                  end={item.to === "/dashboard"}
                  $isCollapsed={isCollapsed}
                >
                  <span className="icon">{item.icon}</span>
                  <span className="text">{item.text}</span>
                </StyledNavLink>
              </NavItem>
            ))}
          </NavList>

          {/* Logout Section */}
          <LogoutSection>
            <LogoutButton
              onClick={handleLogout}
              $isCollapsed={isCollapsed}
              title="Çıkış Yap"
            >
              <span className="icon">
                <FaSignOutAlt />
              </span>
              <span className="text">Log Out</span>
            </LogoutButton>
          </LogoutSection>
        </NavigationArea>
      </ContentArea>
    </SidebarWrapper>
  );
};

export default Sidebar;
