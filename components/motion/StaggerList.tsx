"use client";

import React from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  itemDelay?: number;
  y?: number;
}

export default function StaggerList({ children, className, itemDelay = 0.05, y = 16 }: Props) {
  const items = React.Children.toArray(children);
  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * itemDelay, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
