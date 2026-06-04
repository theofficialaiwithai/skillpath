"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  itemDelay?: number;
  y?: number;
}

export default function StaggerList({
  children,
  className,
  itemDelay = 0.05,
  y = 16,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const items = React.Children.toArray(children);

  // During SSR and initial hydration: render children as plain divs so content
  // is immediately visible and there is no server/client HTML mismatch.
  if (!mounted) {
    return (
      <div className={className}>
        {items.map((child, i) => (
          <div key={i}>{child}</div>
        ))}
      </div>
    );
  }

  // After mount, animate each child in with a staggered delay.
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
