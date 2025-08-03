// src/pages/HomePage.jsx - Updated without CompanyFormationFlow
import React from "react";
import HeroSection from "../components/sections/HeroSection";
import TrustedBySection from "../components/sections/TrustedBySection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import ServicesSection from "../components/sections/ServicesSection";
import PricingSection from "../components/sections/PricingSection";
import FaqSection from "../components/sections/FaqSection";
import ContactSection from "../components/sections/ContactSection";
import SocialProofSection from "../components/sections/SocialProofSection";
import WhyUsSection from "../components/sections/WhyUsSection";
import AboutSection from "../components/sections/AboutSection";
import CtaSection from "../components/sections/CtaSection";

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <ServicesSection />
      <WhyUsSection />
      <AboutSection />
      <HowItWorksSection />
      <SocialProofSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <ContactSection />
    </>
  );
};

export default HomePage;
