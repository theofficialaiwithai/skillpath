import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });

export const metadata: Metadata = {
  title: { default: "SkillPath", template: "%s | SkillPath" },
  description:
    "Build a structured learning path through the best resources on YouTube, Udemy, Coursera, and more. Stop browsing — start learning.",
  keywords: ["learning path", "online courses", "skill building", "curated learning"],
  openGraph: {
    title: "SkillPath",
    description: "Stop browsing. Start learning.",
    url: "https://skillpath.vercel.app",
    siteName: "SkillPath",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
        <body className="font-sans antialiased bg-bg-warm">
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
