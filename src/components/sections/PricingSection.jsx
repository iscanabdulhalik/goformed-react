// src/components/sections/PricingSection.jsx - Enhanced Design without Prices

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
import { Check, Star, Sparkles, Crown, Zap, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const plans = {
  nonResident: [
    {
      name: "Entrepreneur",
      desc: "Perfect for solo founders and international digital nomads starting their UK journey.",
      badge: "Popular",
      badgeColor: "bg-blue-500",
      icon: Zap,
      features: [
        "Official UK Limited Company Registration",
        "Premium Registered Office Address in London",
        "Digital Mail Forwarding Service",
        "Companies House Filing Support",
        "Standard Community Support",
        "Business Banking Guidance",
      ],
    },
    {
      name: "Pro Builder",
      desc: "The complete solution for ambitious entrepreneurs and growing businesses.",
      badge: "Recommended",
      badgeColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: Crown,
      features: [
        "Everything in Entrepreneur Package",
        "Priority VAT Registration & Filing",
        "Dedicated Business Banking Support",
        "Premium 24/7 Priority Support",
        "Business Address & Phone Service",
        "First Year Accountancy Support",
        "Legal Document Templates",
      ],
    },
  ],
  resident: [
    {
      name: "Entrepreneur",
      desc: "The essential package for UK residents launching their business venture.",
      badge: "Best Value",
      badgeColor: "bg-green-500",
      icon: Shield,
      features: [
        "UK Limited Company Registration",
        "London Registered Office Address",
        "Automatic HMRC Registration",
        "Companies House Integration",
        "Lifetime Customer Support",
        "Banking Introduction Service",
      ],
    },
    {
      name: "Pro Builder",
      desc: "For ambitious UK founders who need comprehensive business setup.",
      badge: "Most Complete",
      badgeColor: "bg-gradient-to-r from-orange-500 to-red-500",
      icon: Sparkles,
      features: [
        "Everything in Entrepreneur Package",
        "Full VAT Registration Service",
        "Business Banking Partnerships",
        "Annual Confirmation Statement Filing",
        "Professional Business Address",
        "Dedicated Account Manager",
        "Business Growth Consultation",
      ],
    },
  ],
};

const PlanCard = ({ plan, isPopular, index }) => {
  const IconComponent = plan.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="relative h-full"
    >
      <Card
        className={`relative flex flex-col h-full transition-all duration-500 border-2 ${
          isPopular
            ? "border-purple-200 bg-gradient-to-br from-purple-50 via-white to-pink-50 shadow-xl"
            : "border-gray-200 bg-white hover:border-blue-200 shadow-lg hover:shadow-xl"
        }`}
      >
        {/* Floating Badge */}
        {plan.badge && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
            <div
              className={`${plan.badgeColor} text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg`}
            >
              {plan.badge}
            </div>
          </div>
        )}

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
          <IconComponent className="w-full h-full text-gray-400" />
        </div>

        <CardHeader className="text-center pb-4 relative z-10">
          <div className="flex justify-center mb-4">
            <div
              className={`w-16 h-16 rounded-2xl ${
                isPopular
                  ? "bg-gradient-to-br from-purple-500 to-pink-500"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600"
              } flex items-center justify-center shadow-lg`}
            >
              <IconComponent className="w-8 h-8 text-white" />
            </div>
          </div>

          <CardTitle className="text-2xl xl:text-3xl font-bold mb-2">
            {plan.name}
          </CardTitle>
          <CardDescription className="text-base leading-relaxed">
            {plan.desc}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 space-y-6 relative z-10">
          {/* Pricing Display */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center py-6"
          >
            <div
              className={`text-5xl font-bold ${
                isPopular
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
                  : "text-gray-800"
              } mb-2`}
            >
              Get Quote
            </div>
            <p className="text-sm text-gray-600 font-medium">
              Contact us for personalized pricing
            </p>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="space-y-3">
              {plan.features.map((feature, featureIndex) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.4 + featureIndex * 0.1,
                  }}
                  className="flex items-start gap-3"
                >
                  <div
                    className={`flex-shrink-0 w-5 h-5 rounded-full ${
                      isPopular ? "bg-purple-500" : "bg-green-500"
                    } flex items-center justify-center mt-0.5`}
                  >
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CardContent>

        <CardFooter className="pt-6 relative z-10">
          <Button
            asChild
            className={`w-full h-12 font-semibold text-base rounded-xl transition-all duration-300 ${
              isPopular
                ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl"
                : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl"
            }`}
          >
            <Link to="/register">
              Get Started
              {isPopular && <Star className="w-4 h-4 ml-2" />}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
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
    transition: { duration: 0.5, ease: "easeInOut" },
  },
  exit: (direction) => ({
    x: direction === "right" ? -100 : 100,
    opacity: 0,
    transition: { duration: 0.4, ease: "easeInOut" },
  }),
};

export default function EnhancedPricingSection() {
  const [activeTab, setActiveTab] = React.useState("nonResident");
  const [direction, setDirection] = React.useState("right");

  const handleTabChange = (value) => {
    setDirection(value === "resident" ? "right" : "left");
    setActiveTab(value);
  };

  return (
    <section
      id="pricing"
      className="w-full py-16 sm:py-20 md:py-24 lg:py-32 relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50" />

      {/* Animated Background Shapes */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-200/30 to-purple-200/30 rounded-full blur-xl"
      />

      <motion.div
        animate={{
          scale: [1.2, 1, 1.2],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute bottom-10 right-10 w-48 h-48 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-xl"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 sm:mb-16"
        >
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Choose Your{" "}
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Perfect Package
            </span>
          </motion.h2>

          <motion.p
            className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Transparent, comprehensive packages designed for every stage of your
            entrepreneurial journey.
          </motion.p>
        </motion.div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full max-w-6xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-12 h-14 p-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg">
              <TabsTrigger
                value="nonResident"
                className="text-sm font-semibold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                Non-UK Resident
              </TabsTrigger>
              <TabsTrigger
                value="resident"
                className="text-sm font-semibold py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white transition-all duration-300"
              >
                UK Resident
              </TabsTrigger>
            </TabsList>
          </motion.div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={activeTab}
              custom={direction}
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="grid lg:grid-cols-2 gap-8 lg:gap-12"
            >
              {activeTab === "nonResident" && (
                <>
                  <PlanCard plan={plans.nonResident[0]} index={0} />
                  <PlanCard
                    plan={plans.nonResident[1]}
                    isPopular={true}
                    index={1}
                  />
                </>
              )}
              {activeTab === "resident" && (
                <>
                  <PlanCard plan={plans.resident[0]} index={0} />
                  <PlanCard
                    plan={plans.resident[1]}
                    isPopular={true}
                    index={1}
                  />
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </Tabs>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-16 sm:mt-20"
        >
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-3xl p-8 sm:p-12 border border-blue-100 shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              Every business is unique. Contact our experts to discuss your
              specific requirements and get a tailored package that fits your
              needs perfectly.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Link to="#contact">
                Get Custom Quote
                <Sparkles className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
