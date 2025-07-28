// src/components/sections/TrustedBySection.jsx

import React from "react";
import { motion } from "framer-motion";
import StripeLogo from "@/assets/logos/stripe.svg";
import WiseLogo from "@/assets/logos/wise.svg";
import MercuryLogo from "@/assets/logos/mercury.svg";
import AwsLogo from "@/assets/logos/aws.svg";
import DeelLogo from "@/assets/logos/deel.svg";
import RevolutLogo from "@/assets/logos/revolut.svg";
import XeroLogo from "@/assets/logos/xero.svg";
import SlackLogo from "@/assets/logos/slack.svg";

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

// Animasyonun kesintisiz olması için partner listesini ikiye katlıyoruz
const doubledPartners = [...partners, ...partners];

const marqueeVariants = {
  animate: {
    x: [0, -1344], // 8 logo * (128px genişlik + 32px*2 boşluk) = 1536. Bu değeri logolarınızın boyutuna göre ayarlayabilirsiniz.
    transition: {
      x: {
        repeat: Infinity,
        repeatType: "loop",
        duration: 40, // Animasyon süresi
        ease: "linear",
      },
    },
  },
};

export default function TrustedBySection() {
  return (
    <section className="w-full py-16 sm:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h4 className="text-center text-sm font-semibold uppercase text-muted-foreground tracking-wider mb-10">
          Integrated with the tools you love and trust
        </h4>
        <div
          className="w-full overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
          }}
        >
          <motion.div
            className="flex"
            variants={marqueeVariants}
            animate="animate"
          >
            {doubledPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 flex justify-center items-center w-48" // Her logoya sabit bir alan veriyoruz
              >
                <img
                  src={partner.logo}
                  alt={`${partner.name} Logo`}
                  className="h-12 grayscale opacity-60 transition-all hover:grayscale-0 hover:opacity-100"
                />
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
