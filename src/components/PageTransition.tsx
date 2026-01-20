import { motion } from "framer-motion";
import React from "react";
import { useSplash } from "../contexts/SplashContext";

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const { splashRemoved } = useSplash();

  return (
    <motion.div
      initial={splashRemoved ? { opacity: 0 } : { opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: splashRemoved ? 1.3 : 0 }}
    >
      {children}
    </motion.div>
  );
};
