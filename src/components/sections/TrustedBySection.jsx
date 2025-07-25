import React from "react";
import styled, { keyframes } from "styled-components";
import Container from "../common/Container";

// SVG'leri doğrudan import etmek yerine URL veya React-Icons kullanabiliriz
// Ama şimdilik mevcut yapıyı koruyup daha fazla logo ekleyelim.
// NOT: Bu logoların projenizde assets/logos altında olması gerekir.
// Alternatif olarak, dış URL'ler de kullanılabilir.
import StripeLogo from "../../assets/logos/stripe.svg";
import WiseLogo from "../../assets/logos/wise.svg";
import MercuryLogo from "../../assets/logos/mercury.svg";
import AwsLogo from "../../assets/logos/aws.svg";
import DeelLogo from "../../assets/logos/deel.svg";
// Yeni eklenen logolar (varsayımsal)
import RevolutLogo from "../../assets/logos/revolut.svg";
import XeroLogo from "../../assets/logos/xero.svg";
import SlackLogo from "../../assets/logos/slack.svg";

const TrustedWrapper = styled.section`
  padding: 4rem 0;
  background-color: #fff;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const SectionTitle = styled.h4`
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 3rem;
  font-family: "Inter", sans-serif;
`;

// Kayan animasyon için keyframes
const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
`;

// Animasyon Konteyneri
const LogosContainer = styled.div`
  overflow: hidden;
  position: relative;
  width: 100%;
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    white 20%,
    white 80%,
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    white 20%,
    white 80%,
    transparent
  );
`;

const LogosSlide = styled.div`
  display: flex;
  width: fit-content;
  /* Animasyonu burada uyguluyoruz */
  animation: ${scroll} 30s linear infinite;
`;

const LogoImg = styled.img`
  height: 35px;
  margin: 0 40px;
  filter: grayscale(1) opacity(0.6);
  transition: ${({ theme }) => theme.transition};
  &:hover {
    filter: grayscale(0) opacity(1);
  }
`;

const partners = [
  { name: "Stripe", logo: StripeLogo },
  { name: "Wise", logo: WiseLogo },
  { name: "Mercury", logo: MercuryLogo },
  { name: "AWS", logo: AwsLogo },
  { name: "Deel", logo: DeelLogo },
  { name: "Revolut", logo: RevolutLogo },
  { name: "Xero", logo: XeroLogo },
  { name: "Slack", logo: SlackLogo },
];

const TrustedBySection = () => {
  // Animasyonun kesintisiz olması için logoları iki kez render ediyoruz
  const doubledPartners = [...partners, ...partners];

  return (
    <TrustedWrapper>
      <Container>
        <SectionTitle>
          Integrated with the tools you love and trust
        </SectionTitle>
        <LogosContainer>
          <LogosSlide>
            {doubledPartners.map((p, index) => (
              <LogoImg key={index} src={p.logo} alt={`${p.name} Logo`} />
            ))}
          </LogosSlide>
        </LogosContainer>
      </Container>
    </TrustedWrapper>
  );
};

export default TrustedBySection;
