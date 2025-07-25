import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const FadeInWhenVisible = ({ children }) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Animasyon sadece bir kez tetiklensin
    threshold: 0.1, // Elemanın %10'u görününce tetikle
  });

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      animate={inView ? "visible" : "hidden"}
      variants={variants}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      {children}
    </motion.div>
  );
};

export default FadeInWhenVisible;
