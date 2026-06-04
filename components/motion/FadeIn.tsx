"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}

export default function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.5,
  y = 20,
}: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // During SSR and initial hydration render a plain div so the content is
  // visible and the server/client HTML match exactly (no hydration mismatch).
  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  // After mount, Framer Motion takes over and plays the entrance animation.
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
