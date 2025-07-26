// src/components/ui/Loader.jsx

import React from "react";
import { motion } from "framer-motion";
import goformedLogo from "@/assets/logos/goformed.png";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
      >
        {/* Logonuzu burada kullanıyoruz */}
        <img src={goformedLogo} alt="Loading..." className="h-16 w-auto" />
      </motion.div>
    </div>
  );
}
