// src/pages/DashboardPage.jsx
import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import Container from "../components/common/Container";
import Button from "../components/common/Button";

const DashboardWrapper = styled.div`
  padding: 6rem 0;
  background-color: ${({ theme }) => theme.colors.background};
  min-height: 80vh;
`;

const DashboardCard = styled.div`
  background-color: #fff;
  padding: 3rem;
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadow};
  text-align: center;
  max-width: 700px;
  margin: 0 auto;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const WelcomeText = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 2.5rem;
`;

const EmailDisplay = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) =>
    theme.colors.primary.replace(")", ", 0.1)")};
  padding: 0.5rem 1rem;
  border-radius: 50px;
  display: inline-block;
  margin-bottom: 2.5rem;
`;

const DashboardPage = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((error) => {
        console.error("Logout Error:", error);
      });
  };

  if (loading) {
    return <DashboardWrapper>Loading...</DashboardWrapper>;
  }

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <DashboardWrapper>
      <Container>
        <DashboardCard>
          <WelcomeTitle>Welcome to Your Dashboard</WelcomeTitle>
          <WelcomeText>You are logged in with the email:</WelcomeText>
          <EmailDisplay>{user.email}</EmailDisplay>
          <p>
            Your company documents and management tools will appear here soon.
          </p>
          <Button onClick={handleLogout} style={{ marginTop: "2rem" }}>
            Sign Out
          </Button>
        </DashboardCard>
      </Container>
    </DashboardWrapper>
  );
};

export default DashboardPage;
