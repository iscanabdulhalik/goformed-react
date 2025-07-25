import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Container from "../common/Container";
import { FaClipboardList, FaWpforms, FaRocket } from "react-icons/fa";

const StepIconOne = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const StepIconTwo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const StepIconThree = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 2 11 13"></path>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const HowWrapper = styled.section`
  padding: ${({ theme }) => theme.spacing.sectionPadding};
  background-color: ${({ theme }) => theme.colors.background};
  scroll-margin-top: 100px; /* HEADER BOŞLUĞU */
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  margin-bottom: 1rem;
`;
const SectionSubtitle = styled(motion.p)`
  text-align: center;
  max-width: 550px;
  margin: 0 auto 4rem auto;
  color: ${({ theme }) => theme.colors.textSecondary};
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const StepCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  padding: 2.5rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-10px);
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

const IconWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 100px;
  margin-bottom: 2.5rem;
  border-radius: 50%;
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.primary};
`;

const StepNumber = styled.span`
  position: absolute;
  top: -10px;
  left: -10px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  font-family: "Plus Jakarta Sans", sans-serif;
  border: 3px solid #fff;
`;

const StepTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  font-family: "Plus Jakarta Sans", sans-serif;
`;

const steps = [
  {
    icon: <StepIconOne />,
    title: "Choose Your Package",
    desc: "Select the plan that fits your needs, from basic formation to an all-inclusive pro package.",
  },
  {
    icon: <StepIconTwo />,
    title: "Submit Your Details",
    desc: "Fill out our simple online form in minutes. We handle all the complex government paperwork for you.",
  },
  {
    icon: <StepIconThree />,
    title: "Launch Your Business",
    desc: "Receive your official company documents and start operating your UK business from anywhere in the world.",
  },
];

const HowItWorksSection = ({ id }) => {
  return (
    <HowWrapper id={id}>
      <Container>
        <SectionTitle>Launch in 3 Simple Steps</SectionTitle>
        <SectionSubtitle>
          We've streamlined the entire incorporation process to be as fast and
          hassle-free as possible.
        </SectionSubtitle>
        <Grid>
          {steps.map((step, index) => (
            <StepCard key={index}>
              <IconWrapper>
                <StepNumber>{`0${index + 1}`}</StepNumber>
                {step.icon}
              </IconWrapper>
              <StepTitle>{step.title}</StepTitle>
              <p>{step.desc}</p>
            </StepCard>
          ))}
        </Grid>
      </Container>
    </HowWrapper>
  );
};

export default HowItWorksSection;
