import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types (freelancer or client)
export enum UserType {
  FREELANCER = "freelancer",
  CLIENT = "client",
}

// Contract status
export enum ContractStatus {
  DRAFT = "draft",
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Milestone status
export enum MilestoneStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  PENDING_REVIEW = "pending_review",
  READY_FOR_PAYMENT = "ready_for_payment",
  COMPLETED = "completed",
}

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  userType: text("user_type").notNull(),
  bio: text("bio"),
  profileImage: text("profile_image"),
});

// Contracts schema
export const contracts = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  clientId: integer("client_id").notNull(),
  freelancerId: integer("freelancer_id").notNull(),
  status: text("status").notNull().default(ContractStatus.DRAFT),
  totalAmount: doublePrecision("total_amount").notNull(),
  contractType: text("contract_type").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  termsAndConditions: text("terms_and_conditions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Milestones schema
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull().default(MilestoneStatus.NOT_STARTED),
  dueDate: timestamp("due_date").notNull(),
  completedDate: timestamp("completed_date"),
});

// Templates schema
export const templates = pgTable("templates", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(false),
});

// Schema Validations

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
  userType: true,
  bio: true,
  profileImage: true,
}).refine(data => 
  [UserType.FREELANCER, UserType.CLIENT].includes(data.userType as UserType), {
    message: "User type must be 'freelancer' or 'client'",
    path: ["userType"],
  }
);

export const insertContractSchema = createInsertSchema(contracts).pick({
  title: true,
  description: true,
  clientId: true,
  freelancerId: true,
  status: true,
  totalAmount: true,
  contractType: true,
  startDate: true,
  endDate: true,
  termsAndConditions: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).pick({
  contractId: true,
  title: true,
  description: true,
  amount: true,
  status: true,
  dueDate: true,
});

export const insertTemplateSchema = createInsertSchema(templates).pick({
  userId: true,
  title: true,
  description: true,
  content: true,
  isPublic: true,
});

// Export Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = z.infer<typeof insertContractSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type Template = typeof templates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
