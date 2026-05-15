import * as dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq, count } from "drizzle-orm";
import * as schema from "./schema";

dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const { skills: skillsTable, learningPaths, resources, pathSteps } = schema;

// ─── Types ────────────────────────────────────────────────────────────────────

type ResourceSeed = {
  title: string;
  platform: string;
  url: string;
  costType: "free" | "paid";
  costUsd?: string;
  estimatedHours: number;
  whyItsHere: string;
};

type StepSeed = {
  stage: "foundation" | "practice" | "project";
  resource: ResourceSeed;
};

type PathSeed = {
  title: string;
  description: string;
  totalHours: number;
  steps: StepSeed[];
};

type SkillSeed = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  cardColor: string;
  paths: { beginner: PathSeed; intermediate: PathSeed; advanced: PathSeed };
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_DATA: SkillSeed[] = [
  // ── PYTHON ──────────────────────────────────────────────────────────────────
  {
    slug: "python",
    name: "Python",
    description: "Learn to code with the world's most versatile programming language",
    icon: "code-2",
    cardColor: "bg-blue-100",
    paths: {
      beginner: {
        title: "Python for Absolute Beginners",
        description: "Get from zero to writing real Python programs with guided projects",
        totalHours: 10,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Python for Everybody – Dr. Chuck YouTube Series",
              platform: "YouTube",
              url: "https://www.youtube.com/playlist?list=PLlRFEj9H3Oj7Bp8-DfGpfAfDBiblRfl5p",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "The gold standard free Python intro. Dr. Chuck is genuinely engaging and never loses beginners.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Automate the Boring Stuff with Python",
              platform: "Blog",
              url: "https://automatetheboringstuff.com",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Free online book. Teaches practical scripts from day one instead of toy examples.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build 5 Python Projects for Beginners – freeCodeCamp",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=DLn3jOsNRVE",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "Short guided projects that solidify the basics with real output.",
            },
          },
        ],
      },
      intermediate: {
        title: "Python for Real-World Use",
        description: "Build practical Python tools, scripts, and web-connected programs",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Python OOP Tutorials – Corey Schafer",
              platform: "YouTube",
              url: "https://www.youtube.com/playlist?list=PL-osiE80TeTsqhIuOqKhwlXsIBIdSeYtc",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "The clearest object-oriented programming explanation available on YouTube.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "100 Days of Code: The Complete Python Pro Bootcamp",
              platform: "Udemy",
              url: "https://www.udemy.com/course/100-days-of-code/",
              costType: "paid",
              costUsd: "15.99",
              estimatedHours: 10,
              whyItsHere: "Best-in-class applied Python practice. Buy during a sale — it's always on sale.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Web Scraping with BeautifulSoup – Real Python",
              platform: "Blog",
              url: "https://realpython.com/beautiful-soup-web-scraper-python",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Portfolio-ready project. Real Python is consistently accurate and well-maintained.",
            },
          },
        ],
      },
      advanced: {
        title: "Python for Production",
        description: "Build, test, and deploy production-grade Python APIs and services",
        totalHours: 25,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "FastAPI Official Tutorial",
              platform: "Blog",
              url: "https://fastapi.tiangolo.com/tutorial",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "The best Python API framework. The official docs are the best tutorial.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Python Testing with pytest – Real Python",
              platform: "Blog",
              url: "https://realpython.com/pytest-python-testing",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Testing is the gap most self-taught Python devs have. Fix it here.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build and Deploy a REST API with FastAPI",
              platform: "Blog",
              url: "https://realpython.com/fastapi-python-web-apis",
              costType: "free",
              estimatedHours: 15,
              whyItsHere: "Full portfolio project with a real database. Employer-ready output.",
            },
          },
        ],
      },
    },
  },

  // ── EXCEL ────────────────────────────────────────────────────────────────────
  {
    slug: "excel",
    name: "Microsoft Excel",
    description: "Master spreadsheets, formulas, and data analysis",
    icon: "table-2",
    cardColor: "bg-green-100",
    paths: {
      beginner: {
        title: "Excel from Zero",
        description: "Learn formulas, formatting, and build your first real spreadsheets",
        totalHours: 8,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Excel for Beginners – Leila Gharani",
              platform: "YouTube",
              url: "https://www.youtube.com/playlist?list=PLmejDGrsgFyCn3e_fBKAkJFHy0lsrHNiT",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Best production quality Excel tutorials on YouTube. Never boring.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Excel Skills for Business – Macquarie University",
              platform: "Coursera",
              url: "https://www.coursera.org/specializations/excel",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Free to audit. Structured and certificate-worthy.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Personal Budget Tracker in Excel",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=K74_FNnlIF8",
              costType: "free",
              estimatedHours: 1,
              whyItsHere: "Real output you'll actually use after completing it.",
            },
          },
        ],
      },
      intermediate: {
        title: "Excel for Data Work",
        description: "Master pivot tables, Power Query, and analytical workflows",
        totalHours: 14,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Excel Pivot Tables Full Tutorial – Leila Gharani",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=m0wI61ahfLc",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "The clearest pivot table explanation available anywhere.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "INDEX/MATCH Tutorial – MyExcelOnline",
              platform: "Blog",
              url: "https://www.myexcelonline.com/blog/excel-index-match",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "INDEX/MATCH is what separates intermediate from basic Excel users.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Power Query Full Course – Leila Gharani",
              platform: "YouTube",
              url: "https://www.youtube.com/playlist?list=PLmejDGrsgFyBlDZPFwTsW8qGZQ2PAsF8C",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Power Query is the unlock for real data work in Excel.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Sales Dashboard in Excel",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=K74_FNnlIF8",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Dashboard project for your portfolio. Visually impressive output.",
            },
          },
        ],
      },
      advanced: {
        title: "Excel Power User",
        description: "Automate with VBA and build professional reporting systems",
        totalHours: 15,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Excel VBA for Beginners – Excel Macro Mastery",
              platform: "Blog",
              url: "https://excelmacromastery.com/excel-vba-tutorial",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "The most structured VBA learning resource available for free.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Advanced Excel Formulas – LAMBDA and Arrays",
              platform: "Blog",
              url: "https://exceljet.net/articles/excel-lambda-function",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Array formulas and LAMBDA are the future of Excel. Learn them here.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build an Automated Report Generator in VBA",
              platform: "Blog",
              url: "https://excelmacromastery.com/vba-real-world-projects",
              costType: "free",
              estimatedHours: 7,
              whyItsHere: "Real automation project that demonstrates professional-level Excel skills.",
            },
          },
        ],
      },
    },
  },

  // ── SQL ──────────────────────────────────────────────────────────────────────
  {
    slug: "sql",
    name: "SQL",
    description: "Query and analyze data with structured databases",
    icon: "database",
    cardColor: "bg-orange-100",
    paths: {
      beginner: {
        title: "SQL from Scratch",
        description: "Learn to write queries against real databases from the ground up",
        totalHours: 10,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "SQLZoo Interactive Tutorial",
              platform: "Blog",
              url: "https://sqlzoo.net",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Runs in the browser with no setup. The best starting point for SQL syntax.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "SQL for Data Analysis – Mode Analytics",
              platform: "Blog",
              url: "https://mode.com/sql-tutorial",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Uses realistic datasets and teaches analytical thinking from the start.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "SQL Murder Mystery",
              platform: "Blog",
              url: "https://mystery.knightlab.com",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "Gamified SQL practice. Genuinely fun and tests all the basics.",
            },
          },
        ],
      },
      intermediate: {
        title: "SQL for Analytics",
        description: "Write complex analytical queries using window functions and CTEs",
        totalHours: 15,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Advanced SQL – Kaggle Learn",
              platform: "Blog",
              url: "https://www.kaggle.com/learn/advanced-sql",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Window functions and CTEs — the things that separate intermediate from basic SQL.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "SQLBolt – Interactive SQL Exercises",
              platform: "Blog",
              url: "https://sqlbolt.com",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Fast drill-style exercises for writing complex queries under time pressure.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Analyze a Real Dataset with SQL in BigQuery",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=r3jA-c9CJVY",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Portfolio-ready data analysis project using Google's free BigQuery tier.",
            },
          },
        ],
      },
      advanced: {
        title: "SQL for Engineers",
        description: "Master Postgres performance, indexing, and production SQL",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "PostgreSQL Official Tutorial",
              platform: "Blog",
              url: "https://www.postgresql.org/docs/current/tutorial.html",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Understand Postgres-specific features: indexes, explain plans, and CTEs.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Use the Index, Luke – SQL Performance",
              platform: "Blog",
              url: "https://use-the-index-luke.com",
              costType: "free",
              estimatedHours: 7,
              whyItsHere: "The single best resource on SQL performance that exists. Read every page.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "PostgreSQL Exercises – pgexercises.com",
              platform: "Blog",
              url: "https://pgexercises.com",
              costType: "free",
              estimatedHours: 8,
              whyItsHere: "Deep practical exercises with no hand-holding. Real interview-level SQL.",
            },
          },
        ],
      },
    },
  },

  // ── WEB DEVELOPMENT ──────────────────────────────────────────────────────────
  {
    slug: "web-dev",
    name: "Web Development",
    description: "Build websites and web apps from scratch",
    icon: "globe",
    cardColor: "bg-purple-100",
    paths: {
      beginner: {
        title: "Web Dev from Zero",
        description: "Build your first websites with HTML, CSS, and core web principles",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "The Odin Project – Foundations",
              platform: "Blog",
              url: "https://www.theodinproject.com/paths/foundations",
              costType: "free",
              estimatedHours: 10,
              whyItsHere: "The best free full-stack curriculum on the internet. Structured and comprehensive.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Responsive Web Design – freeCodeCamp",
              platform: "Blog",
              url: "https://www.freecodecamp.org/learn/2022/responsive-web-design",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Hands-on HTML and CSS with real projects and a free certificate.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Personal Portfolio Website",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=_xkSvufmjEs",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Every web developer needs a portfolio. Build yours as your first project.",
            },
          },
        ],
      },
      intermediate: {
        title: "JavaScript and React",
        description: "Build dynamic web apps with modern JavaScript and React",
        totalHours: 30,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "JavaScript.info – The Modern JavaScript Tutorial",
              platform: "Blog",
              url: "https://javascript.info",
              costType: "free",
              estimatedHours: 10,
              whyItsHere: "The most complete and well-written free JavaScript resource available.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "React Official Tutorial – Tic-Tac-Toe",
              platform: "Blog",
              url: "https://react.dev/learn",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "The official React docs are now genuinely excellent. Start here.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Full Stack Open – University of Helsinki",
              platform: "Blog",
              url: "https://fullstackopen.com/en",
              costType: "free",
              estimatedHours: 12,
              whyItsHere: "University-grade free course covering React, Node, and databases.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Full-Stack App with Next.js",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=wm5gMKuwSYk",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Portfolio project using the most in-demand React framework.",
            },
          },
        ],
      },
      advanced: {
        title: "Production Web Engineering",
        description: "Ship fast, tested, and scalable web applications",
        totalHours: 25,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Web Performance Fundamentals – web.dev",
              platform: "Blog",
              url: "https://web.dev/learn/performance",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Google's official guide to making fast websites. Required reading for senior roles.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Testing JavaScript – Kent C. Dodds",
              platform: "Blog",
              url: "https://testingjavascript.com",
              costType: "paid",
              costUsd: "97.00",
              estimatedHours: 10,
              whyItsHere: "The definitive JavaScript testing course. Worth every dollar.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build and Deploy a SaaS App with Next.js and Stripe",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=_lJuJTACE0M",
              costType: "free",
              estimatedHours: 10,
              whyItsHere: "Full production-grade project with auth, payments, and deployment.",
            },
          },
        ],
      },
    },
  },

  // ── DATA ANALYSIS ─────────────────────────────────────────────────────────────
  {
    slug: "data-analysis",
    name: "Data Analysis",
    description: "Turn raw data into actionable insights",
    icon: "bar-chart-2",
    cardColor: "bg-cyan-100",
    paths: {
      beginner: {
        title: "Data Analysis Foundations",
        description: "Analyze real datasets with Python, pandas, and visualization",
        totalHours: 12,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Data Analysis with Python – freeCodeCamp",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=r-uOLxNrNk8",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Covers pandas and NumPy from scratch. The fastest path to working with real data.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Kaggle Learn – Pandas",
              platform: "Blog",
              url: "https://www.kaggle.com/learn/pandas",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Interactive exercises with real datasets. Immediate feedback on every answer.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Exploratory Data Analysis Project – Kaggle",
              platform: "Blog",
              url: "https://www.kaggle.com/learn/data-visualization",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Build a real EDA project you can add to your portfolio immediately.",
            },
          },
        ],
      },
      intermediate: {
        title: "Data Analysis for Insights",
        description: "Turn data into clear insights with statistics and visualization",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Statistics for Data Science – StatQuest YouTube",
              platform: "YouTube",
              url: "https://www.youtube.com/c/joshstarmer",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Josh Starmer makes statistics genuinely understandable. No fluff.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Data Visualization with Python – Matplotlib and Seaborn",
              platform: "Blog",
              url: "https://realpython.com/python-matplotlib-guide",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Clear, practical guide to the two most important Python visualization libraries.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "End-to-End Data Analysis Project with Python",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=eMOA1pPVUc4",
              costType: "free",
              estimatedHours: 8,
              whyItsHere: "Full project from data collection to insight presentation. Portfolio-ready.",
            },
          },
        ],
      },
      advanced: {
        title: "Data Analysis at Scale",
        description: "Handle large datasets with SQL, Spark, and interactive dashboards",
        totalHours: 25,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "SQL + Python for Data Analysis – Mode",
              platform: "Blog",
              url: "https://mode.com/python-tutorial",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Combines SQL and Python the way real analysts actually work.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Apache Spark with Python – freeCodeCamp",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=_C8kWso4ne4",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Learn to work with datasets that don't fit in memory.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Data Dashboard with Streamlit",
              platform: "Blog",
              url: "https://docs.streamlit.io/get-started",
              costType: "free",
              estimatedHours: 15,
              whyItsHere: "Deploy a real interactive data dashboard. Employers love seeing this.",
            },
          },
        ],
      },
    },
  },

  // ── GRAPHIC DESIGN ───────────────────────────────────────────────────────────
  {
    slug: "graphic-design",
    name: "Graphic Design",
    description: "Create visual content that communicates and persuades",
    icon: "pen-tool",
    cardColor: "bg-pink-100",
    paths: {
      beginner: {
        title: "Graphic Design Basics",
        description: "Learn color, typography, and layout to create compelling visuals",
        totalHours: 10,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Graphic Design Basics – Canva Design School",
              platform: "Blog",
              url: "https://www.canva.com/learn/graphic-design-basics",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Covers color, typography, and layout fundamentals in plain language.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Graphic Design Fundamentals – GCFGlobal",
              platform: "Blog",
              url: "https://edu.gcfglobal.org/en/beginning-graphic-design",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Free, structured lessons covering all core principles with examples.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Design 5 Real Brand Assets in Canva",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=wnmGbMuMEhE",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Build a starter portfolio with real deliverables: logo, card, social post.",
            },
          },
        ],
      },
      intermediate: {
        title: "Design with Adobe and Figma",
        description: "Master the industry-standard tools for professional design",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Figma for Beginners – Official Tutorial",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=FTFaQWZBqQ8",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "The tool the industry has moved to. Learn Figma before anything else.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Photoshop for Beginners – Adobe",
              platform: "Blog",
              url: "https://helpx.adobe.com/photoshop/tutorials.html",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Official Adobe tutorials are thorough and always up to date.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Redesign a Real Brand Identity in Figma",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=qiW2qKVGT6I",
              costType: "free",
              estimatedHours: 10,
              whyItsHere: "Full brand project covering logo, colors, typography, and mockups.",
            },
          },
        ],
      },
      advanced: {
        title: "Professional Design Systems",
        description: "Build scalable, consistent design systems used at top companies",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Design Systems with Figma – Google Material",
              platform: "Blog",
              url: "https://m3.material.io/foundations",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Learn design systems from the team that built one of the best in the world.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Advanced Figma – Auto Layout and Components",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=TvV7NMNMFJI",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Auto layout is what makes Figma files professional and scalable.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Complete Design System from Scratch",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=EK-pHkc5EL4",
              costType: "free",
              estimatedHours: 10,
              whyItsHere: "End-to-end design system project. The kind of work that gets you hired.",
            },
          },
        ],
      },
    },
  },

  // ── COPYWRITING ──────────────────────────────────────────────────────────────
  {
    slug: "copywriting",
    name: "Copywriting",
    description: "Write words that sell, persuade, and connect",
    icon: "pencil",
    cardColor: "bg-yellow-100",
    paths: {
      beginner: {
        title: "Copywriting Fundamentals",
        description: "Learn the core principles that make words persuade and sell",
        totalHours: 8,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Copywriting 101 – Copyblogger",
              platform: "Blog",
              url: "https://copyblogger.com/copywriting-101",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "The most widely-read free copywriting guide online. Solid foundation.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "The Boron Letters – Gary Halbert",
              platform: "Blog",
              url: "https://www.thegaryhalbertletter.com/Boron/BoronIndex.htm",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "One of the most influential copywriting texts ever written. Free online.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Write 10 Headlines for Real Products",
              platform: "Blog",
              url: "https://copyhackers.com/2016/12/how-to-write-headlines",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "Headlines are 80% of copy. Practice them until they feel natural.",
            },
          },
        ],
      },
      intermediate: {
        title: "Copy That Converts",
        description: "Write emails and landing pages that drive real action",
        totalHours: 15,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Email Copywriting Masterclass – Copy Hackers",
              platform: "Blog",
              url: "https://copyhackers.com/email-copywriting",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Email copy is the highest-ROI skill in copywriting. Start here.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Landing Page Copywriting – Unbounce",
              platform: "Blog",
              url: "https://unbounce.com/landing-page-copywriting",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Practical frameworks for pages that actually convert.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Write a Full Email Welcome Sequence for a Real Brand",
              platform: "Blog",
              url: "https://copyhackers.com/2018/08/email-welcome-sequence",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Portfolio project that every brand and agency needs.",
            },
          },
        ],
      },
      advanced: {
        title: "Strategic Copywriting",
        description: "Position brands and craft messaging at a strategic level",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Obviously Awesome – Positioning by April Dunford",
              platform: "Blog",
              url: "https://www.obviouslyawesome.com",
              costType: "paid",
              costUsd: "19.99",
              estimatedHours: 5,
              whyItsHere: "Understanding positioning is what makes copy strategic instead of just clever.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "StoryBrand Framework – Donald Miller",
              platform: "Blog",
              url: "https://storybrand.com",
              costType: "paid",
              costUsd: "14.99",
              estimatedHours: 5,
              whyItsHere: "The most practical brand messaging framework available.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Write a Complete Brand Messaging Guide",
              platform: "Blog",
              url: "https://copyhackers.com/brand-voice",
              costType: "free",
              estimatedHours: 10,
              whyItsHere: "Full deliverable: voice, positioning, taglines, and core messages.",
            },
          },
        ],
      },
    },
  },

  // ── VIDEO EDITING ─────────────────────────────────────────────────────────────
  {
    slug: "video-editing",
    name: "Video Editing",
    description: "Edit and produce compelling video content",
    icon: "video",
    cardColor: "bg-red-100",
    paths: {
      beginner: {
        title: "Video Editing from Zero",
        description: "Edit your first videos with professional tools from day one",
        totalHours: 10,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "DaVinci Resolve for Beginners – Casey Faris",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=92NE8IfCMEY",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "DaVinci Resolve is free and professional-grade. This is the best beginner tutorial.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Basic Cuts and Transitions – Premiere Pro",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=Hls3Tp_OBRs",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Industry-standard tool. Knowing Premiere opens doors.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Edit a 3-Minute YouTube Video End to End",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=O6ERELse_QY",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Build a finished video you can actually post. Real output from day one.",
            },
          },
        ],
      },
      intermediate: {
        title: "Video Editing for Content Creators",
        description: "Add color grading, motion graphics, and branded assets",
        totalHours: 18,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Color Grading in DaVinci Resolve – Full Course",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=Y4HSyVxRPLE",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Color is what makes the difference between amateur and professional video.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Motion Graphics with After Effects – Basics",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=rVh3-3f9_QA",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Motion graphics open up a new dimension of production value.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Create a Full YouTube Channel Intro and Branded Assets",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=wnmGbMuMEhE",
              costType: "free",
              estimatedHours: 7,
              whyItsHere: "Branded video package: intro, outro, lower thirds. Portfolio-ready.",
            },
          },
        ],
      },
      advanced: {
        title: "Professional Video Production",
        description: "Master color science, sound design, and documentary editing",
        totalHours: 25,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Advanced Color Science – Mixing Light",
              platform: "Blog",
              url: "https://mixinglight.com",
              costType: "paid",
              costUsd: "25.00",
              estimatedHours: 8,
              whyItsHere: "The highest-quality color grading education available for professional work.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Sound Design and Audio Mixing for Video",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=5r0VmWDUUlg",
              costType: "free",
              estimatedHours: 7,
              whyItsHere: "Audio is 50% of video quality and gets ignored by 90% of editors.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Edit a Short Documentary from Raw Footage",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=e9pMCVWZPOA",
              costType: "free",
              estimatedHours: 10,
              whyItsHere: "The most demanding editing project you can put in a portfolio.",
            },
          },
        ],
      },
    },
  },

  // ── PERSONAL FINANCE ─────────────────────────────────────────────────────────
  {
    slug: "personal-finance",
    name: "Personal Finance",
    description: "Build wealth, manage money, and achieve financial goals",
    icon: "dollar-sign",
    cardColor: "bg-emerald-100",
    paths: {
      beginner: {
        title: "Personal Finance 101",
        description: "Build the habits and systems that lead to financial security",
        totalHours: 8,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Personal Finance for Beginners – Khan Academy",
              platform: "Blog",
              url: "https://www.khanacademy.org/college-careers-more/personal-finance",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Free, structured, unbiased. The best starting point for financial literacy.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "I Will Teach You To Be Rich – Ramit Sethi",
              platform: "Blog",
              url: "https://www.amazon.com/Will-Teach-You-Rich-Second/dp/1523505745",
              costType: "paid",
              costUsd: "14.99",
              estimatedHours: 3,
              whyItsHere: "The most actionable personal finance book for people in their 20s and 30s.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Net Worth Tracker in Google Sheets",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=_LP6oJTxqug",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "Track your actual financial position. The habit of tracking changes behavior.",
            },
          },
        ],
      },
      intermediate: {
        title: "Investing and Wealth Building",
        description: "Grow your money with evidence-based long-term strategies",
        totalHours: 15,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "How the Economic Machine Works – Ray Dalio",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=PHe0bXAIuk0",
              costType: "free",
              estimatedHours: 1,
              whyItsHere: "30 minutes that explains the economy better than most textbooks.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Passive Investing with Index Funds – Bogleheads",
              platform: "Blog",
              url: "https://www.bogleheads.org/wiki/Getting_started",
              costType: "free",
              estimatedHours: 6,
              whyItsHere: "Evidence-based investing philosophy that outperforms 90% of active strategies.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Personal Investment Policy Statement",
              platform: "Blog",
              url: "https://www.bogleheads.org/wiki/Investment_policy_statement",
              costType: "free",
              estimatedHours: 8,
              whyItsHere: "A written plan that prevents emotional investing decisions.",
            },
          },
        ],
      },
      advanced: {
        title: "Advanced Personal Finance",
        description: "Optimize taxes, explore real estate, and plan for independence",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Tax Optimization for Regular People – Mad Fientist",
              platform: "Blog",
              url: "https://www.madfientist.com/tax-optimization",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Legally reducing taxes is the highest-ROI financial move most people ignore.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Real Estate Investing Fundamentals – BiggerPockets",
              platform: "Blog",
              url: "https://www.biggerpockets.com/real-estate-investing-basics",
              costType: "free",
              estimatedHours: 7,
              whyItsHere: "The most comprehensive free real estate education available.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Complete Financial Independence Plan",
              platform: "Blog",
              url: "https://www.madfientist.com/financial-independence",
              costType: "free",
              estimatedHours: 8,
              whyItsHere: "Full plan: savings rate, investment timeline, target number, withdrawal strategy.",
            },
          },
        ],
      },
    },
  },

  // ── AI TOOLS ─────────────────────────────────────────────────────────────────
  {
    slug: "ai-tools",
    name: "AI Tools",
    description: "Use AI to work faster, write better, and build more",
    icon: "cpu",
    cardColor: "bg-violet-100",
    paths: {
      beginner: {
        title: "AI Tools for Everyday Work",
        description: "Use AI to work faster and smarter in any job",
        totalHours: 6,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "ChatGPT for Beginners – Full Guide",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=AsFgn8vU-tQ",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "Practical intro to prompting. Gets you from curious to productive in 2 hours.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "Learn Prompting – Free Prompt Engineering Guide",
              platform: "Blog",
              url: "https://learnprompting.org/docs/intro",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "The most comprehensive free prompt engineering resource. Practical and specific.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Personal AI Workflow for Your Job",
              platform: "Blog",
              url: "https://www.oneusefulthing.org/p/a-guide-to-using-ai-productively",
              costType: "free",
              estimatedHours: 2,
              whyItsHere: "Ethan Mollick's practical guide to integrating AI into real work.",
            },
          },
        ],
      },
      intermediate: {
        title: "AI for Content and Productivity",
        description: "Build content systems and workflows powered by AI",
        totalHours: 12,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Advanced ChatGPT Prompting – More Useful Things",
              platform: "Blog",
              url: "https://www.oneusefulthing.org",
              costType: "free",
              estimatedHours: 3,
              whyItsHere: "Ethan Mollick is the most credible AI productivity researcher writing for general audiences.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "AI Image Generation – Midjourney Beginner to Pro",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=gMRzvQFvOak",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Midjourney is the highest-quality image AI. This is the fastest path to good outputs.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build a Content Creation System Using Claude and Notion",
              platform: "Blog",
              url: "https://www.anthropic.com/claude",
              costType: "free",
              estimatedHours: 5,
              whyItsHere: "Build a real workflow: research, draft, edit, publish — all with AI assistance.",
            },
          },
        ],
      },
      advanced: {
        title: "Building with AI",
        description: "Use AI APIs and frameworks to build real AI-powered applications",
        totalHours: 20,
        steps: [
          {
            stage: "foundation",
            resource: {
              title: "Anthropic Claude API – Official Docs",
              platform: "Blog",
              url: "https://docs.anthropic.com",
              costType: "free",
              estimatedHours: 4,
              whyItsHere: "Learn to use the most capable AI API available. The docs are well-written.",
            },
          },
          {
            stage: "practice",
            resource: {
              title: "LangChain for Beginners – Full Course",
              platform: "YouTube",
              url: "https://www.youtube.com/watch?v=lG7Uxts9SXs",
              costType: "free",
              estimatedHours: 8,
              whyItsHere: "The most widely-used framework for building AI-powered applications.",
            },
          },
          {
            stage: "project",
            resource: {
              title: "Build an AI-Powered App with Next.js and Claude API",
              platform: "Blog",
              url: "https://docs.anthropic.com/en/docs/build-with-claude/overview",
              costType: "free",
              estimatedHours: 8,
              whyItsHere: "End-to-end AI app project using the stack most companies are actually hiring for.",
            },
          },
        ],
      },
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateResource(r: ResourceSeed): Promise<string> {
  const [existing] = await db
    .select({ id: resources.id })
    .from(resources)
    .where(eq(resources.url, r.url));

  if (existing) return existing.id;

  const [created] = await db
    .insert(resources)
    .values({
      title: r.title,
      platform: r.platform,
      url: r.url,
      costType: r.costType,
      costUsd: r.costUsd ?? null,
      estimatedHours: r.estimatedHours,
      whyItsHere: r.whyItsHere,
    })
    .returning({ id: resources.id });

  return created.id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Skills
  await db
    .insert(skillsTable)
    .values(
      SEED_DATA.map((s) => ({
        slug: s.slug,
        name: s.name,
        description: s.description,
        icon: s.icon,
        cardColor: s.cardColor,
      }))
    )
    .onConflictDoNothing();

  const allSkills = await db.select({ id: skillsTable.id, slug: skillsTable.slug }).from(skillsTable);
  const skillMap = Object.fromEntries(allSkills.map((s) => [s.slug, s.id]));

  // 2. Paths + steps
  for (const skillData of SEED_DATA) {
    const skillId = skillMap[skillData.slug];

    for (const [level, pathData] of Object.entries(skillData.paths)) {
      await db
        .insert(learningPaths)
        .values({
          skillId,
          level,
          title: pathData.title,
          description: pathData.description,
          totalHours: pathData.totalHours,
        })
        .onConflictDoNothing();

      const [path] = await db
        .select({ id: learningPaths.id })
        .from(learningPaths)
        .where(and(eq(learningPaths.skillId, skillId), eq(learningPaths.level, level)));

      for (let i = 0; i < pathData.steps.length; i++) {
        const { stage, resource } = pathData.steps[i];
        const resourceId = await getOrCreateResource(resource);

        await db
          .insert(pathSteps)
          .values({ pathId: path.id, resourceId, stepOrder: i + 1, stage })
          .onConflictDoNothing();
      }
    }
  }

  // 3. Counts
  const [[{ sc }], [{ pc }], [{ rc }], [{ stc }]] = await Promise.all([
    db.select({ sc: count() }).from(skillsTable),
    db.select({ pc: count() }).from(learningPaths),
    db.select({ rc: count() }).from(resources),
    db.select({ stc: count() }).from(pathSteps),
  ]);

  console.log("✅ Seed complete");
  console.log(`Skills: ${sc}`);
  console.log(`Paths: ${pc}`);
  console.log(`Resources: ${rc}`);
  console.log(`Steps: ${stc}`);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
