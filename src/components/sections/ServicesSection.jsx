import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Building2,
  PackageCheck,
  Landmark,
  FileBadge,
  Mailbox,
  TrendingUp,
} from "lucide-react";

const services = [
  {
    icon: <Building2 className="h-8 w-8 text-primary" />,
    title: "Company Formation",
    desc: "Start your UK business the right way with our expert company formation services.",
  },
  {
    icon: <PackageCheck className="h-8 w-8 text-primary" />,
    title: "Ready Made Companies",
    desc: "Need a business ready to trade? Our pre-registered UK companies come with everything set up.",
  },
  {
    icon: <Landmark className="h-8 w-8 text-primary" />,
    title: "Business Banking Assistance",
    desc: "Secure access to UK banking and payment solutions tailored for your business.",
  },
  {
    icon: <FileBadge className="h-8 w-8 text-primary" />,
    title: "Corporate Compliance",
    desc: "Stay legally compliant with our corporate support services, from filings to registered office addresses.",
  },
  {
    icon: <Mailbox className="h-8 w-8 text-primary" />,
    title: "Virtual Office & Business Address",
    desc: "Establish a professional presence with a prestigious UK business address.",
  },
  {
    icon: <TrendingUp className="h-8 w-8 text-primary" />,
    title: "Business Growth & Expansion",
    desc: "Take your company to the next level with strategic business solutions and advisory.",
  },
];
// Animasyon varyantları
const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
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
            Our Core <span className="text-gradient">Services</span>
          </h2>
          <p className="max-w-3xl mx-auto mt-4 text-xl text-muted-foreground font-sans">
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
            <motion.div key={service.title} variants={itemVariants}>
              <Card className="bg-card/50 hover:border-primary/50 hover:shadow-lg transition-all duration-300 h-full p-6">
                {/* 
                  YENİ YAPI: İkon ve başlığı yan yana getirmek için flexbox kullanıyoruz.
                */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">{service.icon}</div>
                  <div className="flex-1">
                    <CardTitle className="mb-2">{service.title}</CardTitle>
                    <p className="text-muted-foreground font-sans text-sm leading-relaxed">
                      {service.desc}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
