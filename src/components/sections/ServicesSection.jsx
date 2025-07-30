import React, { useEffect, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

const services = [
  {
    icon: "💼",
    title: "Company Formation",
    desc: "Start your UK business the right way with our expert company formation services.",
    gradient: "from-blue-400 to-blue-600",
    hoverGradient: "from-blue-500 to-blue-700",
  },
  {
    icon: "📦",
    title: "Ready Made Companies",
    desc: "Need a business ready to trade? Our pre-registered UK companies come with everything set up.",
    gradient: "from-green-400 to-green-600",
    hoverGradient: "from-green-500 to-green-700",
  },
  {
    icon: "🏛️",
    title: "Business Banking Assistance",
    desc: "Secure access to UK banking and payment solutions tailored for your business.",
    gradient: "from-purple-400 to-purple-600",
    hoverGradient: "from-purple-500 to-purple-700",
  },
  {
    icon: "🎓",
    title: "Corporate Compliance",
    desc: "Stay legally compliant with our corporate support services, from filings to registered office addresses.",
    gradient: "from-orange-400 to-orange-600",
    hoverGradient: "from-orange-500 to-orange-700",
  },
  {
    icon: "🏠",
    title: "Virtual Office & Business Address",
    desc: "Establish a professional presence with a prestigious UK business address.",
    gradient: "from-pink-400 to-pink-600",
    hoverGradient: "from-pink-500 to-pink-700",
  },
  {
    icon: "📊",
    title: "Business Growth & Expansion",
    desc: "Take your company to the next level with strategic business solutions and advisory.",
    gradient: "from-teal-400 to-teal-600",
    hoverGradient: "from-teal-500 to-teal-700",
  },
];

const ServiceCard = ({ service, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      whileHover={{
        y: -8,
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
    >
      <div className="relative h-full">
        {/* Glow Effect */}
        <motion.div
          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${service.gradient} opacity-0 blur-xl`}
          animate={{
            opacity: isHovered ? 0.3 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Card */}
        <div className="relative h-full bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8 transition-all duration-300 hover:border-white/40">
          {/* 3D Icon Container */}
          <motion.div
            className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center shadow-2xl`}
            animate={{
              rotateY: isHovered ? 12 : 0,
              rotateX: isHovered ? -8 : 0,
              scale: isHovered ? 1.1 : 1,
            }}
            transition={{
              duration: 0.4,
              ease: "easeOut",
              type: "spring",
              stiffness: 200,
              damping: 20,
            }}
            style={{
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            {/* Icon Shadow */}
            <motion.div
              className="absolute inset-0 rounded-2xl bg-black/20 blur-md"
              animate={{
                scale: isHovered ? 1.2 : 1,
                opacity: isHovered ? 0.6 : 0.3,
              }}
              transition={{ duration: 0.3 }}
              style={{ transform: "translateZ(-10px)" }}
            />

            {/* Main Icon */}
            <motion.span
              className="text-3xl filter drop-shadow-lg relative z-10"
              animate={{
                rotateZ: isHovered ? 5 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              {service.icon}
            </motion.span>
          </motion.div>

          {/* Content */}
          <div className="text-center space-y-4">
            <motion.h3
              className="text-xl font-bold text-gray-800 dark:text-white"
              animate={{
                color: isHovered ? "#1f2937" : "#374151",
              }}
              transition={{ duration: 0.3 }}
            >
              {service.title}
            </motion.h3>

            <motion.p
              className="text-gray-600 dark:text-gray-300 leading-relaxed"
              animate={{
                opacity: isHovered ? 1 : 0.8,
              }}
              transition={{ duration: 0.3 }}
            >
              {service.desc}
            </motion.p>
          </div>

          {/* Floating Elements */}
          <motion.div
            className="absolute top-4 right-4 w-2 h-2 bg-white/40 rounded-full"
            animate={{
              scale: isHovered ? [1, 1.5, 1] : 1,
              opacity: isHovered ? [0.4, 0.8, 0.4] : 0.4,
            }}
            transition={{
              duration: 2,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute bottom-6 left-6 w-1 h-1 bg-white/30 rounded-full"
            animate={{
              scale: isHovered ? [1, 2, 1] : 1,
              opacity: isHovered ? [0.3, 0.7, 0.3] : 0.3,
            }}
            transition={{
              duration: 1.5,
              repeat: isHovered ? Infinity : 0,
              ease: "easeInOut",
              delay: 0.5,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default function EnhancedServicesSection() {
  const controls = useAnimation();
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [inView, controls]);

  return (
    <section
      id="features"
      className="w-full py-24 sm:py-32 relative overflow-hidden"
      ref={ref}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />

      {/* Animated Background Shapes */}
      <motion.div
        className="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-3xl"
        animate={{
          x: [0, 50, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-purple-200/20 rounded-full blur-3xl"
        animate={{
          x: [0, -40, 0],
          y: [0, 20, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={controls}
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.8,
                ease: "easeOut",
              },
            },
          }}
          className="text-center space-y-6"
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            Our Core Services
          </motion.h2>

          <motion.p
            className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={controls}
            variants={{
              visible: {
                opacity: 1,
                transition: {
                  delay: 0.3,
                  duration: 0.6,
                },
              },
            }}
          >
            Everything you need to launch, manage, and grow your global business
            from a single, unified platform.
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial="hidden"
          animate={controls}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
                delayChildren: 0.4,
              },
            },
          }}
        >
          {services.map((service, index) => (
            <ServiceCard key={service.title} service={service} index={index} />
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center pt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={controls}
          variants={{
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                delay: 1,
                duration: 0.6,
              },
            },
          }}
        >
          <motion.button
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{
              scale: 1.05,
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Explore All Services
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
