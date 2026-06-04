"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    handleScroll(); // set initial state
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-[#F0EBE3] shadow-sm"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      {/* Logo */}
      <Link href="/" className="font-fraunces font-bold text-[#FF4D2E] text-xl">
        SkillPath
      </Link>

      {/* Center nav */}
      <div className="flex items-center gap-6">
        <Link
          href="/pricing"
          className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF4D2E] transition-colors duration-200"
        >
          Pricing
        </Link>
        {isSignedIn && (
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF4D2E] transition-colors duration-200"
          >
            Dashboard
          </Link>
        )}
      </div>

      {/* Auth */}
      <div className="flex items-center gap-3">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-[#1A1A1A] hover:text-[#FF4D2E] transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium bg-[#FF4D2E] text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
