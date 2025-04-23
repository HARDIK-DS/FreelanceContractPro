import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User types (freelancer or client)
export enum UserType {
  FREELANCER = "freelancer",
  CLIENT = "client",
  MODERATOR = "moderator", // Added for dispute resolution
}

// Contract status
export enum ContractStatus {
  DRAFT = "draft",
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DISPUTED = "disputed", // Added for disputes
}

// Milestone status
export enum MilestoneStatus {
  NOT_STARTED = "not_started",
  IN_PROGRESS = "in_progress",
  PENDING_REVIEW = "pending_review",
  READY_FOR_PAYMENT = "ready_for_payment",
  COMPLETED = "completed",
  DISPUTED = "disputed", // Added for disputes
}

// Payment methods
export enum PaymentMethod {
  STRIPE = "stripe",
  PAYPAL = "paypal",
  RAZORPAY = "razorpay",
  CRYPTO = "crypto", // For blockchain payments
}

// Dispute status
export enum DisputeStatus {
  OPEN = "open",
  UNDER_REVIEW = "under_review",
  RESOLVED_FOR_CLIENT = "resolved_for_client",
  RESOLVED_FOR_FREELANCER = "resolved_for_freelancer",
  RESOLVED_COMPROMISE = "resolved_compromise",
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

// Escrow Payments schema
export const escrowPayments = pgTable("escrow_payments", {
  id: serial("id").primaryKey(),
  milestoneId: integer("milestone_id").notNull(),
  clientId: integer("client_id").notNull(),
  freelancerId: integer("freelancer_id").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: text("status").notNull(),
  paymentMethod: text("payment_method").notNull(),
  paymentDetails: jsonb("payment_details"), // Stores payment gateway response data
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  blockchainTxHash: text("blockchain_tx_hash"), // If using blockchain
  depositedAt: timestamp("deposited_at").defaultNow(),
  releasedAt: timestamp("released_at"),
});

// Disputes schema
export const disputes = pgTable("disputes", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  milestoneId: integer("milestone_id"),
  initiatedBy: integer("initiated_by").notNull(), // User ID who initiated the dispute
  respondent: integer("respondent").notNull(), // The other party
  moderatorId: integer("moderator_id"), // Optional moderator assigned to the dispute
  status: text("status").notNull().default(DisputeStatus.OPEN),
  reason: text("reason").notNull(),
  evidence: jsonb("evidence"), // Array of evidence files/links
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Reviews and Ratings
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  reviewerId: integer("reviewer_id").notNull(),
  receiverId: integer("receiver_id").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Blockchain Contract Records (for blockchain integration)
export const blockchainContracts = pgTable("blockchain_contracts", {
  id: serial("id").primaryKey(),
  contractId: integer("contract_id").notNull(),
  contractAddress: text("contract_address").notNull(), // Ethereum/Polygon contract address
  network: text("network").notNull(), // e.g., "ethereum", "polygon"
  deployerAddress: text("deployer_address").notNull(),
  contractAbi: jsonb("contract_abi").notNull(),
  deployedAt: timestamp("deployed_at").defaultNow(),
});

// 2FA Authentication Data
export const twoFactorAuth = pgTable("two_factor_auth", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  secret: text("secret").notNull(),
  verified: boolean("verified").default(false),
  backupCodes: jsonb("backup_codes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // e.g., "payment", "dispute", "message"
  title: text("title").notNull(),
  message: text("message").notNull(),
  read: boolean("read").default(false),
  data: jsonb("data"), // Additional data related to notification
  createdAt: timestamp("created_at").defaultNow(),
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

// Additional Insert Schemas
export const insertEscrowPaymentSchema = createInsertSchema(escrowPayments).pick({
  milestoneId: true,
  clientId: true,
  freelancerId: true,
  amount: true,
  status: true,
  paymentMethod: true,
  paymentDetails: true,
  stripePaymentIntentId: true,
  blockchainTxHash: true,
});

export const insertDisputeSchema = createInsertSchema(disputes).pick({
  contractId: true,
  milestoneId: true,
  initiatedBy: true,
  respondent: true,
  moderatorId: true,
  status: true,
  reason: true,
  evidence: true,
  resolution: true,
});

export const insertReviewSchema = createInsertSchema(reviews).pick({
  contractId: true,
  reviewerId: true,
  receiverId: true,
  rating: true,
  comment: true,
});

export const insertBlockchainContractSchema = createInsertSchema(blockchainContracts).pick({
  contractId: true,
  contractAddress: true,
  network: true,
  deployerAddress: true,
  contractAbi: true,
});

export const insertTwoFactorAuthSchema = createInsertSchema(twoFactorAuth).pick({
  userId: true,
  secret: true,
  verified: true,
  backupCodes: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  userId: true,
  type: true,
  title: true,
  message: true,
  read: true,
  data: true,
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

export type EscrowPayment = typeof escrowPayments.$inferSelect;
export type InsertEscrowPayment = z.infer<typeof insertEscrowPaymentSchema>;

export type Dispute = typeof disputes.$inferSelect;
export type InsertDispute = z.infer<typeof insertDisputeSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type BlockchainContract = typeof blockchainContracts.$inferSelect;
export type InsertBlockchainContract = z.infer<typeof insertBlockchainContractSchema>;

export type TwoFactorAuth = typeof twoFactorAuth.$inferSelect;
export type InsertTwoFactorAuth = z.infer<typeof insertTwoFactorAuthSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
