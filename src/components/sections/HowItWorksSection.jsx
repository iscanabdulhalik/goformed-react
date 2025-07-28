// src/components/sections/HowItWorksSection.jsx

import React from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package, FileText, Rocket } from "lucide-react";

const steps = [
  {
    icon: <Package className="w-8 h-8" />,
    title: "Choose Your Package",
    desc: "Select the plan that fits your needs.",
  },
  {
    icon: <FileText className="w-8 h-8" />,
    title: "Submit Your Details",
    desc: "Fill out our simple online form in minutes.",
  },
  {
    icon: <Rocket className="w-8 h-8" />,
    title: "Launch Your Business",
    desc: "Receive your official company documents.",
  },
];

const cardVariants = {
  initial: { opacity: 0, y: 50 },
  whileInView: { opacity: 1, y: 0 },
};

export default function HowItWorksSection() {
  return (
    <section id="services" className="w-full py-24 sm:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">
          Launch in <span className="text-gradient">3 Simple</span> Steps
        </h2>
        <p className="max-w-3xl mx-auto mt-4 mb-16 text-xl text-muted-foreground font-sans">
          We've streamlined the entire incorporation process to be as fast and
          hassle-free as possible.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              variants={cardVariants}
              initial="initial"
              whileInView="whileInView"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="bg-card h-full">
                <CardHeader>
                  <CardTitle className="grid gap-4 place-items-center">
                    <div className="bg-primary/10 text-primary p-4 rounded-full">
                      {step.icon}
                    </div>
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="font-sans">
                    {step.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
