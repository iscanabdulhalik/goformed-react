import React from "react";
import HeroSection from "../components/sections/HeroSection";
import TrustedBySection from "../components/sections/TrustedBySection";
import HowItWorksSection from "../components/sections/HowItWorksSection";
import AboutSection from "../components/sections/AboutSection"; // Yeni
import PricingSection from "../components/sections/PricingSection";
import FaqSection from "../components/sections/FaqSection";
import ContactSection from "../components/sections/ContactSection"; // Yeni

const HomePage = () => {
  return (
    <>
      <HeroSection />
      <TrustedBySection />
      <HowItWorksSection id="services" />
      <AboutSection /> {/* Yeni About bölümünü WhyUs yerine koyduk */}
      <PricingSection id="pricing" />
      <FaqSection id="faq" />
      <ContactSection /> {/* Yeni Contact bölümünü sona ekledik */}
    </>
  );
};

export default HomePage;
