"use client";

import Link from "next/link";
import { useAuth, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const { isSignedIn } = useAuth();

  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 bg-white">
      <Link href="/" className="font-heading text-xl font-bold text-brand">
        SkillPath
      </Link>
      <div className="flex items-center gap-3">
        {isSignedIn ? (
          <UserButton />
        ) : (
          <>
            <Link
              href="/sign-in"
              className="text-sm font-medium text-zinc-700 hover:text-zinc-900 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm font-medium bg-brand text-white px-4 py-2 rounded-md hover:bg-brand-dark transition-colors"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
