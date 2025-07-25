// src/components/sections/HeroSection.jsx
import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Container from "../../components/common/Container";
import { ButtonLink } from "../../components/common/Button";

const HeroWrapper = styled.section`
  padding-top: 12rem;
  padding-bottom: 8rem;
  background-color: ${({ theme }) => theme.colors.background};
`;

const HeroGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 4rem;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const HeroContent = styled(motion.div)`
  h1 {
    font-size: 3.8rem;
    font-weight: 800;
    line-height: 1.2;
    margin-bottom: 1.5rem;
    font-family: "Poppins", sans-serif;
  }
  p {
    font-size: 1.2rem;
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 2.5rem;
    max-width: 520px;
    @media (max-width: 992px) {
      margin-left: auto;
      margin-right: auto;
    }
  }
`;

const HeroImageWrapper = styled(motion.div)`
  img {
    width: 100%;
    max-width: 550px;
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

// Animasyon varyantları
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // Çocuk elemanların animasyonunu geciktirir
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeInOut" },
  },
};

const HeroSection = () => {
  return (
    <HeroWrapper>
      <Container>
        <HeroGrid>
          <HeroContent
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.h1 variants={itemVariants}>
              Your UK Business, Launched Globally.
            </motion.h1>
            <motion.p variants={itemVariants}>
              GoFormed provides entrepreneurs worldwide with a seamless platform
              to incorporate in the UK, manage compliance, and access global
              financial tools.
            </motion.p>
            <motion.div variants={itemVariants}>
              <ButtonLink
                to="/register"
                $primary
                style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}
              >
                Launch My Company
              </ButtonLink>
            </motion.div>
          </HeroContent>
          <HeroImageWrapper
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <img
              src="https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=2787&auto=format&fit=crop"
              alt="Global Business Dashboard"
            />
          </HeroImageWrapper>
        </HeroGrid>
      </Container>
    </HeroWrapper>
  );
};

export default HeroSection;
