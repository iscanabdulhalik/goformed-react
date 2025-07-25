import React from "react";
import styled from "styled-components";

const DashboardWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding-top: 2rem;
`;

const GlobeIcon = styled.div`
  font-size: 6rem;
  color: ${({ theme }) => theme.colors.accent};
  margin-bottom: 2rem;
  display: inline-block;
  /* İkonu daha yumuşak göstermek için filter efekti kaldırıldı */
`;

const SectionTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  font-size: 2.5rem;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 1.1rem;
  margin-bottom: 4rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const UKCard = styled.div`
  padding: 2.5rem;
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  text-align: left;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;

  .flag-icon {
    font-size: 2rem;
    margin-right: 1rem;
  }
  h3 {
    margin: 0;
    font-size: 1.5rem;
  }
`;

const PriceInfo = styled.p`
  margin: 0 0 2rem 3rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const GetStartedButton = styled.button`
  width: 100%;
  padding: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.accent};
  color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.accentHover};
  }
`;

const DashboardPage = () => {
  return (
    <DashboardWrapper>
      <GlobeIcon>🌍</GlobeIcon>
      <SectionTitle>Welcome to GoFormed</SectionTitle>
      <SectionSubtitle>
        Start your UK business journey with our seamless and fully-remote
        incorporation service.
      </SectionSubtitle>

      <UKCard>
        <CardHeader>
          <span className="flag-icon">🇬🇧</span>
          <h3>United Kingdom</h3>
        </CardHeader>
        <PriceInfo>
          Starts from $197 (one-time, no extra fees), then $59/year
        </PriceInfo>
        <GetStartedButton>Get Started</GetStartedButton>
      </UKCard>
    </DashboardWrapper>
  );
};

export default DashboardPage;
