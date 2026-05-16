"use client";

import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export default function FadeIn({ children, className, delay = 0, duration = 0.5, y = 20 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
