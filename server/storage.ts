import { 
  users, User, InsertUser, 
  contracts, Contract, InsertContract, 
  milestones, Milestone, InsertMilestone,
  templates, Template, InsertTemplate,
  ContractStatus, MilestoneStatus
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Contract operations
  getContract(id: number): Promise<Contract | undefined>;
  getContractsByFreelancer(freelancerId: number): Promise<Contract[]>;
  getContractsByClient(clientId: number): Promise<Contract[]>;
  createContract(contract: InsertContract): Promise<Contract>;
  updateContractStatus(id: number, status: ContractStatus): Promise<Contract | undefined>;
  
  // Milestone operations
  getMilestone(id: number): Promise<Milestone | undefined>;
  getMilestonesByContract(contractId: number): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestoneStatus(id: number, status: MilestoneStatus): Promise<Milestone | undefined>;
  completeMilestone(id: number, completedDate: Date): Promise<Milestone | undefined>;
  
  // Template operations
  getTemplate(id: number): Promise<Template | undefined>;
  getUserTemplates(userId: number): Promise<Template[]>;
  getPublicTemplates(): Promise<Template[]>;
  createTemplate(template: InsertTemplate): Promise<Template>;
  
  // Dashboard stats
  getUserStats(userId: number): Promise<{
    activeContracts: number;
    pendingPayments: number;
    totalEarned: number;
    templateCount: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contracts: Map<number, Contract>;
  private milestones: Map<number, Milestone>;
  private templates: Map<number, Template>;
  
  private userIdCounter: number;
  private contractIdCounter: number;
  private milestoneIdCounter: number;
  private templateIdCounter: number;

  constructor() {
    this.users = new Map();
    this.contracts = new Map();
    this.milestones = new Map();
    this.templates = new Map();
    
    this.userIdCounter = 1;
    this.contractIdCounter = 1;
    this.milestoneIdCounter = 1;
    this.templateIdCounter = 1;
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...userData, id };
    this.users.set(id, user);
    return user;
  }

  // Contract operations
  async getContract(id: number): Promise<Contract | undefined> {
    return this.contracts.get(id);
  }

  async getContractsByFreelancer(freelancerId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.freelancerId === freelancerId
    );
  }

  async getContractsByClient(clientId: number): Promise<Contract[]> {
    return Array.from(this.contracts.values()).filter(
      (contract) => contract.clientId === clientId
    );
  }

  async createContract(contractData: InsertContract): Promise<Contract> {
    const id = this.contractIdCounter++;
    const now = new Date();
    const contract: Contract = { 
      ...contractData,
      id, 
      createdAt: now 
    };
    this.contracts.set(id, contract);
    return contract;
  }

  async updateContractStatus(id: number, status: ContractStatus): Promise<Contract | undefined> {
    const contract = this.contracts.get(id);
    
    if (!contract) {
      return undefined;
    }
    
    const updatedContract = { ...contract, status };
    this.contracts.set(id, updatedContract);
    return updatedContract;
  }

  // Milestone operations
  async getMilestone(id: number): Promise<Milestone | undefined> {
    return this.milestones.get(id);
  }

  async getMilestonesByContract(contractId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      (milestone) => milestone.contractId === contractId
    );
  }

  async createMilestone(milestoneData: InsertMilestone): Promise<Milestone> {
    const id = this.milestoneIdCounter++;
    const milestone: Milestone = { ...milestoneData, id, completedDate: null };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestoneStatus(id: number, status: MilestoneStatus): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    
    if (!milestone) {
      return undefined;
    }
    
    const updatedMilestone = { ...milestone, status };
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }
  
  async completeMilestone(id: number, completedDate: Date): Promise<Milestone | undefined> {
    const milestone = this.milestones.get(id);
    
    if (!milestone) {
      return undefined;
    }
    
    const updatedMilestone = { 
      ...milestone, 
      status: MilestoneStatus.COMPLETED, 
      completedDate: completedDate
    };
    
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  // Template operations
  async getTemplate(id: number): Promise<Template | undefined> {
    return this.templates.get(id);
  }

  async getUserTemplates(userId: number): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.userId === userId
    );
  }

  async getPublicTemplates(): Promise<Template[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.isPublic
    );
  }

  async createTemplate(templateData: InsertTemplate): Promise<Template> {
    const id = this.templateIdCounter++;
    const template: Template = { ...templateData, id };
    this.templates.set(id, template);
    return template;
  }
  
  // Dashboard stats
  async getUserStats(userId: number): Promise<{
    activeContracts: number;
    pendingPayments: number;
    totalEarned: number;
    templateCount: number;
  }> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return {
        activeContracts: 0,
        pendingPayments: 0,
        totalEarned: 0,
        templateCount: 0
      };
    }
    
    let userContracts: Contract[] = [];
    if (user.userType === 'freelancer') {
      userContracts = await this.getContractsByFreelancer(userId);
    } else {
      userContracts = await this.getContractsByClient(userId);
    }
    
    const activeContracts = userContracts.filter(c => 
      c.status === ContractStatus.ACTIVE
    ).length;
    
    let totalEarned = 0;
    let pendingPayments = 0;
    
    for (const contract of userContracts) {
      const contractMilestones = await this.getMilestonesByContract(contract.id);
      
      const completedMilestones = contractMilestones.filter(
        m => m.status === MilestoneStatus.COMPLETED
      );
      
      const pendingMilestones = contractMilestones.filter(
        m => m.status === MilestoneStatus.READY_FOR_PAYMENT || 
             m.status === MilestoneStatus.PENDING_REVIEW
      );
      
      for (const milestone of completedMilestones) {
        totalEarned += milestone.amount;
      }
      
      for (const milestone of pendingMilestones) {
        pendingPayments += milestone.amount;
      }
    }
    
    const templates = await this.getUserTemplates(userId);
    const templateCount = templates.length;
    
    return {
      activeContracts,
      pendingPayments,
      totalEarned,
      templateCount
    };
  }
}

export const storage = new MemStorage();
