import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Container from "../common/Container";
import { ButtonLink } from "../common/Button";
import goformedLogo from "../../assets/logos/goformed.png";

// Header'ın stilleri, istediğiniz gibi sabit, beyaz ve temiz.
const StyledHeader = styled.header`
  position: relative;
  width: 100%;
  padding: 1.5rem 0;
  z-index: 1000;
  background-color: #ffffff;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  img {
    height: 35px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 3rem;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);

  @media (max-width: 992px) {
    display: none;
  }
`;

// Sayfa içi bölümlere giden linkler için standart <a> etiketi.
const AnchorLink = styled.a`
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

// Başka sayfalara giden linkler için react-router Link bileşeni.
const PageLink = styled(Link)`
  font-family: "Inter", sans-serif;
  font-weight: 500;
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.2s ease;
  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const StartButton = styled(ButtonLink)`
  background-color: #1a1a1a;
  color: #ffffff;
  border-color: #1a1a1a;
  padding: 0.75rem 1.5rem;
  font-weight: 600;

  &:hover {
    background-color: #333;
    border-color: #333;
  }
`;

const Header = () => {
  return (
    <StyledHeader>
      <Container>
        <Nav>
          <Logo to="/">
            <img src={goformedLogo} alt="GoFormed Logo" />
          </Logo>
          <NavLinks>
            {/* --- İŞTE DÜZELTME BURADA --- */}
            {/* 'href' özelliklerinden baştaki '/' kaldırıldı. */}
            <AnchorLink href="#">Home</AnchorLink>
            <AnchorLink href="#pricing">Pricing</AnchorLink>
            <AnchorLink href="#about">About</AnchorLink>
            <AnchorLink href="#contact">Contact us</AnchorLink>
          </NavLinks>
          <AuthButtons>
            <PageLink to="/login">Sign In</PageLink>
            <StartButton to="/register">Start My Business</StartButton>
          </AuthButtons>
        </Nav>
      </Container>
    </StyledHeader>
  );
};

export default Header;
