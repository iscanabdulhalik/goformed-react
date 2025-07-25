import React, { useState } from "react";
import styled, { css } from "styled-components";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { motion } from "framer-motion";
import Container from "../common/Container";
import { ButtonLink } from "../common/Button";

const PricingWrapper = styled.section`
  padding: 6rem 0;
  background-color: ${({ theme }) => theme.colors.background};
  scroll-margin-top: 100px; /* HEADER BOŞLUĞU */
`;

const SectionTitle = styled(motion.h2)`
  text-align: center;
  font-family: "Poppins", sans-serif;
  font-size: 2.8rem;
  font-weight: 800;
  margin-bottom: 4rem;
`;

const TabContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  margin-bottom: 4rem;
  background-color: #fff;
  border-radius: 50px;
  padding: 0.5rem;
  display: inline-flex;
  box-shadow: ${({ theme }) => theme.shadow};
`;

const TabButton = styled.button`
  padding: 0.75rem 2rem;
  font-family: "Inter", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  border: none;
  border-radius: 50px;
  cursor: pointer;
  transition: all 0.3s ease;

  ${({ active, theme }) =>
    active &&
    css`
      background-color: ${theme.colors.primary};
      color: #fff;
      box-shadow: 0 4px 15px ${theme.colors.primary.replace(")", ", 0.4)")};
    `}
`;

// Kartlar arasındaki boşluk artırıldı
const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem; // Boşluk artırıldı

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

// Daha sade ve profesyonel bir kart yapısı
const PricingCard = styled(motion.div)`
  background-color: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius};
  box-shadow: ${({ theme }) => theme.shadow};
  padding: 2.5rem;
  display: flex;
  flex-direction: column;

  h3 {
    font-family: "Poppins", sans-serif;
    font-size: 1.8rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: ${({ theme }) => theme.colors.primary};
  }

  .description {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 1.5rem;
    min-height: 40px;
  }

  .price {
    font-family: "Poppins", sans-serif;
    font-size: 3rem;
    font-weight: 800;
    margin: 1rem 0;
  }

  ul {
    list-style: none;
    text-align: left;
    margin: 1.5rem 0;
    padding: 0;
    flex-grow: 1;

    li {
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      font-family: "Inter", sans-serif;

      .icon {
        color: ${({ theme }) => theme.colors.success};
        margin-right: 0.75rem;
        flex-shrink: 0;
      }
    }
  }

  .cta-button {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
  }
`;

const plans = {
  nonResident: [
    {
      name: "Entrepreneur",
      price: "£199",
      desc: "Ideal for solo founders and international digital nomads.",
      features: [
        "Official UK Limited Company",
        "Registered Office Address",
        "Digital Mail Forwarding Service",
        "Standard Community Support",
      ],
    },
    {
      name: "Pro Builder",
      price: "£499",
      desc: "The complete solution for growing businesses and agencies.",
      features: [
        "Everything in Entrepreneur Package",
        "VAT Registration & Filing",
        "Dedicated Business Bank Account Support",
        "Premium 24/7 Priority Support",
      ],
    },
  ],
  resident: [
    {
      name: "Entrepreneur",
      price: "£12",
      desc: "The essential package for UK residents starting a new venture.",
      features: [
        "UK Limited Company Registration",
        "Registered Office Address",
        "Automatic HMRC Registration",
        "Lifetime Customer Support",
      ],
    },
    {
      name: "Pro Builder",
      price: "£99",
      desc: "For ambitious UK founders who need more on day one.",
      features: [
        "Everything in Entrepreneur Package",
        "Full VAT Registration Service",
        "Access to Business Banking Partnerships",
        "Annual Confirmation Statement Filing",
      ],
    },
  ],
};

const PricingSection = ({ id }) => {
  const [activeTab, setActiveTab] = useState("nonResident");

  return (
    <PricingWrapper id={id}>
      <Container style={{ textAlign: "center" }}>
        <SectionTitle>Find the Perfect Fit</SectionTitle>

        <TabContainer>
          <TabButton
            active={activeTab === "nonResident"}
            onClick={() => setActiveTab("nonResident")}
          >
            Non-UK Resident
          </TabButton>
          <TabButton
            active={activeTab === "resident"}
            onClick={() => setActiveTab("resident")}
          >
            UK Resident
          </TabButton>
        </TabContainer>

        <PricingGrid>
          {plans[activeTab].map((plan, index) => (
            <PricingCard
              key={`${activeTab}-${index}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                y: -10,
                boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.1)",
              }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <h3>{plan.name}</h3>
              <p className="description">{plan.desc}</p>
              <div className="price">{plan.price}</div>
              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>
                    <FaCheckCircle className="icon" /> {feature}
                  </li>
                ))}
              </ul>
              <ButtonLink to="/register" $primary className="cta-button">
                Choose Plan
              </ButtonLink>
            </PricingCard>
          ))}
        </PricingGrid>
      </Container>
    </PricingWrapper>
  );
};

export default PricingSection;
