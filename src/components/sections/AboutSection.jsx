import React from "react";
import styled from "styled-components";
import { motion } from "framer-motion";
import Container from "../common/Container";
// Görseldeki gibi bir portre fotoğrafı (örnek)
import portraitImage from "../../assets/images/founder-portrait.jpg";

const AboutWrapper = styled.section`
  padding: 6rem 0;
  background-color: #ffffff;
  scroll-margin-top: 100px;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4rem;
  align-items: center;

  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    text-align: center;
  }
`;

const TextContent = styled(motion.div)`
  h1 {
    font-family: "Lora", serif;
    font-size: 4rem;
    line-height: 1.2;
    margin-bottom: 2rem;
  }
  .highlight {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const StatsGrid = styled.div`
  display: flex;
  gap: 3rem;
  margin-top: 2.5rem;
  @media (max-width: 992px) {
    justify-content: center;
  }
`;

const StatItem = styled.div`
  strong {
    font-family: "Poppins", sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
  }
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const ImageContent = styled(motion.div)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;

  .background-shape {
    position: absolute;
    width: 85%;
    height: 95%;
    background-color: ${({ theme }) =>
      theme.colors.primary.replace(")", ", 0.1)")};
    border-radius: ${({ theme }) => theme.borderRadius};
    z-index: 0;
  }

  img {
    position: relative;
    z-index: 1;
    max-width: 400px;
  }
`;

const AboutSection = () => {
  return (
    <AboutWrapper id="about">
      <Container>
        <SectionGrid>
          <TextContent>
            <h1>
              Get to Know <br />
              <span className="highlight">GoFormed</span>
            </h1>
            <StatsGrid>
              <StatItem>
                <strong>2900+</strong>
                <p>Companies formed</p>
              </StatItem>
              <StatItem>
                <strong>150+</strong>
                <p>Countries served</p>
              </StatItem>
            </StatsGrid>
          </TextContent>
          <ImageContent>
            <div className="background-shape"></div>
            {/* Bu görseli kendi projenizdeki bir görselle değiştirmelisiniz */}
            <img
              src={
                "https://pngimg.com/uploads/businessman/businessman_PNG6565.png"
              }
              alt="GoFormed Founder"
            />
          </ImageContent>
        </SectionGrid>
      </Container>
    </AboutWrapper>
  );
};

export default AboutSection;
