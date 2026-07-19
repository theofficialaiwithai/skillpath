import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans, Fraunces } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Navbar from "@/components/navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  style: ["normal", "italic"],
  weight: ["400", "700", "900"],
});

export const metadata: Metadata = {
  title: { default: "SkillPath — Find Your Learning Path", template: "%s | SkillPath" },
  description:
    "Curated, personalized learning paths across YouTube, Coursera, books, and live events. Built for ambitious self-learners.",
  keywords: ["learning path", "online courses", "skill building", "curated learning"],
  openGraph: {
    title: "SkillPath — Find Your Learning Path",
    description: "Curated, personalized learning paths across YouTube, Coursera, books, and live events. Built for ambitious self-learners.",
    url: "https://skillpath-hazel.vercel.app",
    siteName: "SkillPath",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "People learning together",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable} ${fraunces.variable}`}>
        <body className="font-sans antialiased bg-bg-warm">
          <Navbar />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
