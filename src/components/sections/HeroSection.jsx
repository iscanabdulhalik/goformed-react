import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/images/founder-portrait.jpg";

export default function HeroSection() {
  return (
    <section className="w-full min-h-screen flex items-center justify-center pt-10 pb-20 md:pt-16 md:pb-32">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 items-center justify-items-center gap-10 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center lg:text-left space-y-6 max-w-lg lg:max-w-none"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Your UK Business, <br /> Launched{" "}
              <span className="text-primary">Globally.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
              GoFormed provides entrepreneurs worldwide with a seamless platform
              to incorporate in the UK, manage compliance, and access global
              financial tools.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link to="/register">Launch My Company</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="w-full sm:w-auto"
              >
                <a href="#features">Learn More</a>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center lg:justify-end w-full"
          >
            <div className="relative">
              <img
                src={heroImage}
                alt="Global Business Entrepreneur"
                className="rounded-lg w-[90%] max-w-md lg:max-w-lg shadow-2xl object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
