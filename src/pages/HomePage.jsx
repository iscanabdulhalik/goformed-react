import React from "react";
import HeroSection from "../components/sections/HeroSection";
import TrustedBySection from "../components/sections/TrustedBySection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import ServicesSection from "../components/sections/ServicesSection";
import PricingSection from "../components/sections/PricingSection";
import FaqSection from "../components/sections/FaqSection";
import ContactSection from "../components/sections/ContactSection";
import SocialProofSection from "../components/sections/SocialProofSection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <ServicesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <ContactSection />
    </>
  );
};

export default HomePage;
