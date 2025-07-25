import React from "react";
import styled from "styled-components";
// İkonu doğru şekilde import ediyoruz.
import { FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import Container from "../common/Container";

const WhyUsWrapper = styled.section`
  padding: 6rem 0;
  background-color: #ffffff; // Zeminden ayrışması için beyaz
  scroll-margin-top: 100px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const TextContent = styled(motion.div)`
  h2 {
    font-size: 3rem; /* Başlığı daha etkili hale getiriyoruz */
    line-height: 1.3;
    margin-bottom: 2rem;
  }
  p {
    font-size: 1.15rem; /* Metni büyütüyoruz */
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 2.5rem;
    line-height: 1.7;
    font-family: "Inter", sans-serif;
  }
`;

// Madde listesini ve ikonları doğru şekilde stillendiriyoruz.
const FeatureList = styled.ul`
  list-style: none;
  padding: 0;
  li {
    display: flex;
    align-items: flex-start;
    margin-bottom: 1.25rem;
    font-size: 1.1rem;
    font-weight: 500;

    .icon {
      color: ${({ theme }) => theme.colors.primary};
      margin-right: 1rem;
      margin-top: 4px; // Dikey hizalama için ince ayar
      flex-shrink: 0;
    }
  }
`;

const ImageContent = styled(motion.div)`
  img {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius};
    box-shadow: ${({ theme }) => theme.shadow};
  }
`;

const WhyUsSection = ({ id }) => {
  return (
    <WhyUsWrapper id={id}>
      <Container>
        <SectionGrid>
          <TextContent
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <h2>Built from Experience, For Global Ambition.</h2>
            <p>
              GoFormed was born from a clear mission: to dismantle the barriers
              for international entrepreneurs. We transformed our own struggles
              with complex bureaucracy into a streamlined, elegant platform,
              ensuring your journey to a UK-based business is fast, transparent,
              and empowering.
            </p>
            <FeatureList>
              <li>
                <FaCheckCircle className="icon" />
                <span>Expert guidance since 2019</span>
              </li>
              <li>
                <FaCheckCircle className="icon" />
                <span>Affordable, no hidden fees</span>
              </li>
              <li>
                <FaCheckCircle className="icon" />
                <span>Fast, hassle-free setup</span>
              </li>
            </FeatureList>
          </TextContent>
          <ImageContent
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7 }}
          >
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2940&auto=format&fit=crop"
              alt="Team collaborating"
            />
          </ImageContent>
        </SectionGrid>
      </Container>
    </WhyUsWrapper>
  );
};
export default WhyUsSection;
