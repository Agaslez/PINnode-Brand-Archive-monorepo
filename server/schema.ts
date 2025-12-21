import { boolean, integer, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Authentication schemas
export const authRegisterSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const authLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
});

export type AuthRegister = z.infer<typeof authRegisterSchema>;
export type AuthLogin = z.infer<typeof authLoginSchema>;

// Drizzle schema for brand projects
export const brandProjects = pgTable("brand_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  logo: text("logo"), // SVG string or base64
  colorPalette: text("color_palette"), // JSON string
  fonts: text("fonts"), // JSON string  
  industry: text("industry"),
  rating: real("rating").default(0), // 0-5 rating system
  exported: boolean("exported").default(false), // czy został wyeksportowany
  edited: boolean("edited").default(false), // czy był edytowany po utworzeniu
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Drizzle schema for archived entries (chat files, documents)
export const archivedEntries = pgTable("archived_entries", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  content: text("content").notNull(), // encrypted content
  encrypted: boolean("encrypted").default(true),
  tags: text("tags").array(), // array of tags
  category: text("category"), // PINpall, Talism.ai, Avatar, DevOps etc.
  fileSize: integer("file_size"),
  source: text("source"), // ChatGPT, DeepSeek, Manual upload
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics table for tracking brand generations
export const generations = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: text("user_id"), // anonymous hash or null
  companyName: text("company_name"),
  industry: text("industry"),
  score: integer("score"), // 0-100 quality score
  generatedAt: timestamp("generated_at").defaultNow(),
  ip: text("ip"), // client IP for analytics
  userAgent: text("user_agent"), // browser/client info
});

// Zod schemas for brand projects
export const brandProjectSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  logo: z.string().optional(),
  colorPalette: z.string().optional(),
  fonts: z.string().optional(),
  industry: z.string().optional(),
  rating: z.number().min(0).max(5).default(0),
  exported: z.boolean().default(false),
  edited: z.boolean().default(false),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

// Zod schemas for archived entries
export const archivedEntrySchema = z.object({
  id: z.number().optional(),
  filename: z.string().min(1, "Filename is required"),
  content: z.string().min(1, "Content is required"),
  encrypted: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  category: z.string().optional(),
  fileSize: z.number().optional(),
  source: z.string().optional(),
  createdAt: z.date().optional(),
});

// Insert schemas (excluding auto-generated fields)
export const insertBrandProjectSchema = createInsertSchema(brandProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertArchivedEntrySchema = createInsertSchema(archivedEntries).omit({
  id: true,
  createdAt: true,
});

// Zod schema for generations
export const generationSchema = z.object({
  id: z.number().optional(),
  userId: z.string().nullable().optional(),
  companyName: z.string().min(1),
  industry: z.string(),
  score: z.number().min(0).max(100),
  generatedAt: z.date().optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
});

export const insertGenerationSchema = createInsertSchema(generations).omit({
  id: true,
  generatedAt: true,
});

// Types
export type BrandProject = z.infer<typeof brandProjectSchema>;
export type InsertBrandProject = z.infer<typeof insertBrandProjectSchema>;
export type SelectBrandProject = typeof brandProjects.$inferSelect;

export type ArchivedEntry = z.infer<typeof archivedEntrySchema>;
export type InsertArchivedEntry = z.infer<typeof insertArchivedEntrySchema>;
export type SelectArchivedEntry = typeof archivedEntries.$inferSelect;

export type Generation = z.infer<typeof generationSchema>;
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type SelectGeneration = typeof generations.$inferSelect;
