// src/components/ui/CustomTabs.jsx - Modern animated tab component
import React, { useState } from "react";
import { motion } from "framer-motion";

const CustomTabs = ({ tabs, defaultValue, onChange, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue || tabs[0]?.value);

  const handleTabChange = (value) => {
    setActiveTab(value);
    onChange?.(value);
  };

  return (
    <div className="w-full">
      {/* Tab List */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleTabChange(tab.value)}
            className={`relative flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
              activeTab === tab.value
                ? "text-white"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            {/* Background Animation */}
            {activeTab === tab.value && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
            </span>

            {/* Hover Effect for Inactive Tabs */}
            {activeTab !== tab.value && (
              <motion.div
                className="absolute inset-0 bg-blue-50 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200"
                whileHover={{ scale: 1.02 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="tab-content">{children}</div>
    </div>
  );
};

const CustomTabContent = ({ value, activeValue, children }) => {
  if (value !== activeValue) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
};

export { CustomTabs, CustomTabContent };
