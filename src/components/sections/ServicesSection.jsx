import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Container from "../common/Container";
import FadeInWhenVisible from "../common/FadeInWhenVisible";

const ServicesWrapper = styled.section`
  padding: ${({ theme }) => theme.spacing.sectionPadding};
  background-color: ${({ theme }) => theme.colors.background};
`;

const SectionTitle = styled.h2`
  text-align: center;
  margin-bottom: 4rem;
`;

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
`;

const ServiceCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.cardBackground};
  padding: 2.5rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  text-align: left;

  .service-number {
    font-family: ${({ theme }) => theme.fonts.heading};
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 700;
    margin-bottom: 1rem;
  }

  h3 {
    margin-bottom: 1rem;
  }

  p {
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.8;
  }

  &::after {
    content: "";
    display: block;
    width: 50px;
    height: 2px;
    background-color: ${({ theme }) => theme.colors.primary};
    margin-top: 1.5rem;
  }
`;

const services = [
  {
    num: "01",
    title: "Company Formation",
    desc: "Start your UK business the right way with our expert company formation services.",
  },
  {
    num: "02",
    title: "Ready Made Companies",
    desc: "Need a business ready to trade? Our pre-registered UK companies come with VAT and everything set up.",
  },
  {
    num: "03",
    title: "Business Banking Assistance",
    desc: "Secure access to UK banking and payment solutions tailored for your business.",
  },
  {
    num: "04",
    title: "Corporate Compliance",
    desc: "Stay legally compliant with our corporate support services, from filings to registered office addresses.",
  },
  {
    num: "05",
    title: "Virtual Office & Business Address",
    desc: "Establish a professional presence with a prestigious UK business address.",
  },
  {
    num: "06",
    title: "Business Growth & Expansion",
    desc: "Take your company to the next level with strategic business solutions and advisory.",
  },
];

const ServicesSection = () => {
  return (
    <ServicesWrapper id="services">
      <Container>
        <FadeInWhenVisible>
          <SectionTitle>Our Core Services</SectionTitle>
        </FadeInWhenVisible>
        <ServiceGrid>
          {services.map((service, index) => (
            <FadeInWhenVisible key={index}>
              <ServiceCard
                whileHover={{
                  y: -10,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.05)",
                }}
                transition={{ duration: 0.3 }}
              >
                <div className="service-number">{service.num}</div>
                <h3>{service.title}</h3>
                <p>{service.desc}</p>
              </ServiceCard>
            </FadeInWhenVisible>
          ))}
        </ServiceGrid>
      </Container>
    </ServicesWrapper>
  );
};

export default ServicesSection;
