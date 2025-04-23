import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertContractSchema, 
  insertMilestoneSchema, 
  insertTemplateSchema,
  ContractStatus,
  MilestoneStatus
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth Routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username or email already exists
      const existingUsername = await storage.getUserByUsername(userData.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const existingEmail = await storage.getUserByEmail(userData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      
      const user = await storage.createUser(userData);
      // Don't send password back to the client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't send password back to the client
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json({ user: userWithoutPassword });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    // In a real application, this would use session/token for authentication
    // Here we're simulating auth for simplicity
    const userId = req.query.userId;
    
    if (!userId || typeof userId !== 'string') {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    try {
      const user = await storage.getUser(parseInt(userId, 10));
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send password back to the client
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Contract Routes
  app.get("/api/contracts", async (req: Request, res: Response) => {
    try {
      const { userId, userType } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const parsedUserId = parseInt(userId, 10);
      let contracts;
      
      if (userType === 'freelancer') {
        contracts = await storage.getContractsByFreelancer(parsedUserId);
      } else if (userType === 'client') {
        contracts = await storage.getContractsByClient(parsedUserId);
      } else {
        return res.status(400).json({ message: "Invalid user type" });
      }
      
      return res.status(200).json(contracts);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/contracts/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const contract = await storage.getContract(parseInt(id, 10));
      
      if (!contract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      return res.status(200).json(contract);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/contracts", async (req: Request, res: Response) => {
    try {
      const contractData = insertContractSchema.parse(req.body);
      const contract = await storage.createContract(contractData);
      
      return res.status(201).json(contract);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/contracts/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!Object.values(ContractStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid contract status" });
      }
      
      const updatedContract = await storage.updateContractStatus(parseInt(id, 10), status);
      
      if (!updatedContract) {
        return res.status(404).json({ message: "Contract not found" });
      }
      
      return res.status(200).json(updatedContract);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Milestone Routes
  app.get("/api/contracts/:contractId/milestones", async (req: Request, res: Response) => {
    try {
      const { contractId } = req.params;
      const milestones = await storage.getMilestonesByContract(parseInt(contractId, 10));
      
      return res.status(200).json(milestones);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/milestones", async (req: Request, res: Response) => {
    try {
      const milestoneData = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(milestoneData);
      
      return res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/milestones/:id/status", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!Object.values(MilestoneStatus).includes(status)) {
        return res.status(400).json({ message: "Invalid milestone status" });
      }
      
      const updatedMilestone = await storage.updateMilestoneStatus(parseInt(id, 10), status);
      
      if (!updatedMilestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      return res.status(200).json(updatedMilestone);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/milestones/:id/complete", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const completedDate = new Date();
      
      const completedMilestone = await storage.completeMilestone(parseInt(id, 10), completedDate);
      
      if (!completedMilestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      
      return res.status(200).json(completedMilestone);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Template Routes
  app.get("/api/templates", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      let templates;
      if (userId && typeof userId === 'string') {
        templates = await storage.getUserTemplates(parseInt(userId, 10));
      } else {
        templates = await storage.getPublicTemplates();
      }
      
      return res.status(200).json(templates);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/templates", async (req: Request, res: Response) => {
    try {
      const templateData = insertTemplateSchema.parse(req.body);
      const template = await storage.createTemplate(templateData);
      
      return res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard Stats
  app.get("/api/stats", async (req: Request, res: Response) => {
    try {
      const { userId } = req.query;
      
      if (!userId || typeof userId !== 'string') {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const stats = await storage.getUserStats(parseInt(userId, 10));
      
      return res.status(200).json(stats);
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
