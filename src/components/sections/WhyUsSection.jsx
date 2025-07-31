// src/components/sections/WhyUsSection.jsx

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
// ÖNEMLİ: Bu bölüm için uygun, ekibinizi veya ofisinizi gösteren bir görseli
// projenizin 'src/assets/images/' klasörüne ekleyip adını 'team.jpg' olarak değiştirin.
import teamImage from "../../assets/images/team.jpg";

const features = [
  "Expert guidance since 2019",
  "Affordable, transparent pricing with no hidden fees",
  "Fast, 100% remote, and hassle-free setup",
  "Dedicated support for global entrepreneurs",
];

export default function WhyUsSection() {
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: "easeOut" },
    },
  };

  const textVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: "easeOut", delay: 0.2 },
    },
  };

  return (
    <section className="w-full py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 place-items-center">
          <motion.div
            variants={imageVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <img
              src={teamImage}
              alt="GoFormed Team"
              className="rounded-lg shadow-xl"
            />
          </motion.div>
          <motion.div
            variants={textVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            className="space-y-6 text-center lg:text-left"
          >
            <h2 className="text-3xl md:text-4xl font-bold">
              Built from Experience, For{" "}
              <span className="text-gradient">Global Ambition.</span>
            </h2>
            <p className="text-xl text-muted-foreground font-sans">
              GoFormed was born from a clear mission: to dismantle the barriers
              for international entrepreneurs. We transformed our own struggles
              with complex bureaucracy into a streamlined, elegant platform.
            </p>
            <ul className="space-y-4 pt-2">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex justify-center lg:justify-start items-center gap-3"
                >
                  <CheckCircle className="text-secondary h-6 w-6" />
                  <span className="text-lg font-sans">{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
