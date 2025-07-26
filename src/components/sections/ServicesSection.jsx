import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const services = [
  {
    num: "01",
    title: "Company Formation",
    desc: "Start your UK business the right way with our expert company formation services.",
  },
  {
    num: "02",
    title: "Ready Made Companies",
    desc: "Need a business ready to trade? Our pre-registered UK companies come with VAT and everything set up.",
  },
  {
    num: "03",
    title: "Business Banking Assistance",
    desc: "Secure access to UK banking and payment solutions tailored for your business.",
  },
  {
    num: "04",
    title: "Corporate Compliance",
    desc: "Stay legally compliant with our corporate support services, from filings to registered office addresses.",
  },
  {
    num: "05",
    title: "Virtual Office & Business Address",
    desc: "Establish a professional presence with a prestigious UK business address.",
  },
  {
    num: "06",
    title: "Business Growth & Expansion",
    desc: "Take your company to the next level with strategic business solutions and advisory.",
  },
];

// Başlık için animasyon varyantı
const titleVariants = {
  /* ... */
};
const containerVariants = {
  /* ... */
};
const itemVariants = {
  /* ... */
};

export default function ServicesSection() {
  const titleControls = useAnimation();
  const gridControls = useAnimation();
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      titleControls.start("visible");
      gridControls.start("visible");
    }
  }, [inView, titleControls, gridControls]);

  return (
    <section id="features" className="w-full py-24 sm:py-32" ref={ref}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate={titleControls}
          className="text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold">
            Our Core <span className="text-primary">Services</span>
          </h2>
          <p className="max-w-3xl mx-auto mt-4 text-xl text-muted-foreground">
            Everything you need to launch, manage, and grow your global business
            from a single, unified platform.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={gridControls}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {services.map((service) => (
            <motion.div key={service.num} variants={itemVariants}>
              <Card className="bg-muted/20 h-full border-transparent hover:border-primary/50 transition-colors duration-300">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <span className="text-4xl font-bold text-primary">
                      {service.num}
                    </span>
                    <CardTitle>{service.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{service.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
