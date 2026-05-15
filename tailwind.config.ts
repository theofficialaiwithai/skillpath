import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        brand: {
          DEFAULT: "#FF4D2E",
          dark: "#D93D20",
        },
        accent: {
          purple: "#7C3AED",
          yellow: "#F59E0B",
        },
        bg: {
          warm: "#F9F8F4",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
    },
  },
  safelist: [
    "bg-blue-100", "bg-green-100", "bg-orange-100", "bg-purple-100",
    "bg-cyan-100", "bg-pink-100", "bg-yellow-100", "bg-red-100",
    "bg-emerald-100", "bg-violet-100",
    "border-blue-400", "border-green-400", "border-orange-400", "border-purple-400",
    "border-cyan-400", "border-pink-400", "border-yellow-400", "border-red-400",
    "border-emerald-400", "border-violet-400",
  ],
  plugins: [],
};
export default config;
