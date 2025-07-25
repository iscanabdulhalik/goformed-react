import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import Container from "../common/Container";

const StyledFooter = styled.footer`
  padding: 5rem 0;
  background-color: #ffffff;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr repeat(3, 1fr);
  gap: 4rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const BrandColumn = styled.div`
  h4 {
    font-size: 1.8rem;
    font-weight: 800;
    margin-bottom: 1rem;
    font-family: "Poppins", sans-serif;
    color: ${({ theme }) =>
      theme.colors.text}; // Ana metin rengiyle daha iyi okunabilirlik
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    max-width: 300px;
  }
`;

const FooterColumn = styled.div`
  h4 {
    font-family: "Poppins", sans-serif;
    color: ${({ theme }) => theme.colors.text};
    font-weight: 600;
    margin-bottom: 1.5rem;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  ul li {
    margin-bottom: 1rem;
  }

  a {
    color: ${({ theme }) => theme.colors.textSecondary};
    &:hover {
      color: ${({ theme }) => theme.colors.primary};
      text-decoration: underline;
    }
  }
`;

const BottomBar = styled.div`
  text-align: center;
  margin-top: 4rem;
  padding-top: 2rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
`;

const Footer = () => (
  <StyledFooter>
    <Container>
      <FooterGrid>
        <BrandColumn>
          {}
          <h4>GoFormed</h4>
          <p>
            The easiest way to launch and manage your UK business, from anywhere
            in the world.
          </p>
        </BrandColumn>
        <FooterColumn>
          <h4>Product</h4>
          <ul>
            <li>
              <Link to="/#pricing">Pricing</Link>
            </li>
            <li>
              <Link to="/#services">Services</Link>
            </li>
            <li>
              <Link to="/register">Get Started</Link>
            </li>
          </ul>
        </FooterColumn>
        <FooterColumn>
          <h4>Company</h4>
          <ul>
            <li>
              <Link to="/#about">About Us</Link>
            </li>
            <li>
              <Link to="/#faq">FAQ</Link>
            </li>
            <li>
              <Link to="/reviews">Reviews</Link>
            </li>
          </ul>
        </FooterColumn>
        <FooterColumn>
          <h4>Legal</h4>
          <ul>
            <li>
              <Link to="/privacy">Privacy Policy</Link>
            </li>
            <li>
              <Link to="/terms">Terms of Service</Link>
            </li>
          </ul>
        </FooterColumn>
      </FooterGrid>
      <BottomBar>
        © {new Date().getFullYear()} GoFormed. All Rights Reserved.
      </BottomBar>
    </Container>
  </StyledFooter>
);

export default Footer;
