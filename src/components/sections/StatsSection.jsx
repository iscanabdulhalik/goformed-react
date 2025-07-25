import React from "react";
import styled from "styled-components";
import Container from "../common/Container";

const StatsWrapper = styled.section`
  padding: 5rem 0;
  background-color: #ffffff;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatItem = styled.div`
  h2 {
    font-size: 2.5rem;
    color: ${({ theme }) => theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  p {
    font-size: 1rem;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const stats = [
  { value: "2300+", label: "Clients" },
  { value: "2800+", label: "Companies formed" },
  { value: "150+", label: "Countries served" },
  { value: "6+", label: "Years of experience" },
];

const StatsSection = () => {
  return (
    <StatsWrapper>
      <Container>
        <StatsGrid>
          {stats.map((stat, index) => (
            <StatItem key={index}>
              <h2>{stat.value}</h2>
              <p>{stat.label}</p>
            </StatItem>
          ))}
        </StatsGrid>
      </Container>
    </StatsWrapper>
  );
};

export default StatsSection;
