import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  cardColor: text("card_color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const learningPaths = pgTable(
  "learning_paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    skillId: uuid("skill_id")
      .notNull()
      .references(() => skills.id),
    level: text("level").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    totalHours: integer("total_hours").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique().on(t.skillId, t.level),
    check("level_check", sql`${t.level} IN ('beginner', 'intermediate', 'advanced')`),
  ]
);

export const resources = pgTable("resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  costType: text("cost_type").notNull(),
  costUsd: numeric("cost_usd"),
  estimatedHours: integer("estimated_hours").notNull(),
  whyItsHere: text("why_its_here").notNull(),
  qualityScore: integer("quality_score").default(80),
  // Personalization fields
  type: text("type"),            // 'video' | 'article' | 'course' | 'podcast' | 'docs' | 'project'
  isProjectBased: boolean("is_project_based").default(false),
  rating: integer("rating"),    // 1–5 explicit rating (falls back to qualityScore/20 if null)
  createdAt: timestamp("created_at").defaultNow(),
});

export const pathSteps = pgTable(
  "path_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    pathId: uuid("path_id")
      .notNull()
      .references(() => learningPaths.id),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id),
    stepOrder: integer("step_order").notNull(),
    stage: text("stage").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    unique().on(t.pathId, t.stepOrder),
    check("stage_check", sql`${t.stage} IN ('foundation', 'practice', 'project')`),
  ]
);

export const userProfiles = pgTable("user_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkUserId: text("clerk_user_id").unique().notNull(),
  email: text("email").notNull(),
  displayName: text("display_name"),
  subscribed: boolean("subscribed").default(false),
  subscriptionId: text("subscription_id"),
  subscriptionStatus: text("subscription_status").default("free"), // 'free' | 'active' | 'canceled' | 'past_due'
  freeUntil: timestamp("free_until"),
  // Personalization preferences
  budget: text("budget"),                        // 'free' | 'under_50' | '50_200' | 'no_limit'
  learningStyles: text("learning_styles").array(), // ['visual','auditory','experiential','symbolic','reflective','social']
  resourceTypes: text("resource_types").array(), // preferred resource types e.g. ['video','article']
  timeline: text("timeline"),                    // 'asap' | '1_3_months' | '3_6_months' | 'no_deadline'
  completedPathsCount: integer("completed_paths_count").default(0),
  autoCompleteEnabled: boolean("auto_complete_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userPaths = pgTable(
  "user_paths",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    pathId: uuid("path_id")
      .notNull()
      .references(() => learningPaths.id),
    hoursPerWeek: integer("hours_per_week").notNull(),
    isCompleted: boolean("is_completed").default(false),
    startedAt: timestamp("started_at").defaultNow(),
    completedAt: timestamp("completed_at"),
  },
  (t) => [unique().on(t.clerkUserId, t.pathId)]
);

export const userProgress = pgTable(
  "user_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    userPathId: uuid("user_path_id")
      .notNull()
      .references(() => userPaths.id),
    pathStepId: uuid("path_step_id")
      .notNull()
      .references(() => pathSteps.id),
    completedAt: timestamp("completed_at").defaultNow(),
    lastOpenedAt: timestamp("last_opened_at", { withTimezone: true }),
  },
  (t) => [unique().on(t.clerkUserId, t.pathStepId)]
);

export const resourceRatings = pgTable(
  "resource_ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkUserId: text("clerk_user_id").notNull(),
    resourceId: uuid("resource_id")
      .notNull()
      .references(() => resources.id),
    rating: integer("rating").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [unique().on(t.clerkUserId, t.resourceId)]
);

// Guest / unauthenticated session — stores onboarding answers before sign-up
export const guestSessions = pgTable("guest_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").unique().notNull(),
  skillId: uuid("skill_id").references(() => skills.id),
  pathId: uuid("path_id").references(() => learningPaths.id),
  level: text("level"),
  hoursPerWeek: integer("hours_per_week"),
  budget: text("budget"),
  learningStyles: text("learning_styles").array(),
  resourceTypes: text("resource_types").array(),
  timeline: text("timeline"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
    .default(sql`now() + interval '7 days'`),
});

// Event cache — stores scraped community events for 24 hours
export const cachedEvents = pgTable("cached_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  skillKeyword: text("skill_keyword").notNull(),
  source: text("source").notNull(), // 'luma' | 'eventbrite' | 'meetup' | 'partiful'
  eventTitle: text("event_title").notNull(),
  eventUrl: text("event_url").notNull(),
  eventDate: timestamp("event_date", { withTimezone: true }),
  eventLocation: text("event_location"),
  coverImageUrl: text("cover_image_url"),
  organizerName: text("organizer_name"),
  cachedAt: timestamp("cached_at", { withTimezone: true }).defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true })
    .default(sql`now() + interval '24 hours'`),
});
