// src/components/sections/PricingSection.jsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const plans = {
  nonResident: [
    {
      name: "Entrepreneur",
      price: "£199",
      desc: "Ideal for solo founders and international digital nomads.",
      features: [
        "Official UK Limited Company",
        "Registered Office Address",
        "Digital Mail Forwarding Service",
        "Standard Community Support",
      ],
    },
    {
      name: "Pro Builder",
      price: "£499",
      desc: "The complete solution for growing businesses and agencies.",
      features: [
        "Everything in Entrepreneur Package",
        "VAT Registration & Filing",
        "Dedicated Business Bank Account Support",
        "Premium 24/7 Priority Support",
      ],
    },
  ],
  resident: [
    {
      name: "Entrepreneur",
      price: "£12",
      desc: "The essential package for UK residents starting a new venture.",
      features: [
        "UK Limited Company Registration",
        "Registered Office Address",
        "Automatic HMRC Registration",
        "Lifetime Customer Support",
      ],
    },
    {
      name: "Pro Builder",
      price: "£99",
      desc: "For ambitious UK founders who need more on day one.",
      features: [
        "Everything in Entrepreneur Package",
        "Full VAT Registration Service",
        "Access to Business Banking Partnerships",
        "Annual Confirmation Statement Filing",
      ],
    },
  ],
};

const PlanCard = ({ plan, isPopular }) => {
  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <Card
      className={`relative flex flex-col h-full transition-all duration-300 ${
        isPopular ? "border-primary shadow-lg" : "border-border"
      }`}
    >
      {isPopular && (
        <div className="absolute top-0 right-4 -translate-y-1/2 bg-gradient-to-r from-primary to-purple-500 text-white px-3 py-1 text-sm font-bold rounded-full shadow-md">
          Most Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="font-sans">{plan.desc}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold"
        >
          {plan.price}
        </motion.div>
        <motion.ul
          variants={listVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="space-y-3 text-sm text-muted-foreground font-sans"
        >
          {plan.features.map((feature) => (
            <motion.li
              key={feature}
              variants={itemVariants}
              className="flex items-center gap-3"
            >
              <Check className="text-secondary h-5 w-5" />
              <span>{feature}</span>
            </motion.li>
          ))}
        </motion.ul>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          className={`w-full ${
            isPopular ? "" : "bg-primary/90 hover:bg-primary"
          }`}
        >
          <Link to="/register">Choose Plan</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

const tabContentVariants = {
  initial: (direction) => ({
    x: direction === "right" ? 100 : -100,
    opacity: 0,
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.4, ease: "easeInOut" },
  },
  exit: (direction) => ({
    x: direction === "right" ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  }),
};

export default function PricingSection() {
  const [activeTab, setActiveTab] = React.useState("nonResident");
  const [direction, setDirection] = React.useState("right");

  const handleTabChange = (value) => {
    setDirection(value === "resident" ? "right" : "left");
    setActiveTab(value);
  };

  return (
    <section id="pricing" className="w-full py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Find the <span className="text-gradient">Perfect Fit</span>
          </h2>
          <p className="max-w-3xl mx-auto text-xl text-muted-foreground mt-4 font-sans">
            Simple, transparent pricing for every stage of your business.
          </p>
        </div>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full max-w-4xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 mb-8 h-auto p-1">
            <TabsTrigger value="nonResident" className="py-2">
              Non-UK Resident
            </TabsTrigger>
            <TabsTrigger value="resident" className="py-2">
              UK Resident
            </TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
            >
              {activeTab === "nonResident" && (
                <div className="grid md:grid-cols-2 gap-8">
                  <PlanCard plan={plans.nonResident[0]} />
                  <PlanCard plan={plans.nonResident[1]} isPopular={true} />
                </div>
              )}
              {activeTab === "resident" && (
                <div className="grid md:grid-cols-2 gap-8">
                  <PlanCard plan={plans.resident[0]} />
                  <PlanCard plan={plans.resident[1]} isPopular={true} />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </div>
    </section>
  );
}
