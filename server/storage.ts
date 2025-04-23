import { 
  users, User, InsertUser, 
  contracts, Contract, InsertContract, 
  milestones, Milestone, InsertMilestone,
  templates, Template, InsertTemplate,
  escrowPayments, EscrowPayment, InsertEscrowPayment,
  disputes, Dispute, InsertDispute,
  reviews, Review, InsertReview,
  blockchainContracts, BlockchainContract, InsertBlockchainContract,
  twoFactorAuth, TwoFactorAuth, InsertTwoFactorAuth,
  notifications, Notification, InsertNotification,
  ContractStatus, MilestoneStatus, PaymentMethod, DisputeStatus, UserType
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
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
  
  // Escrow Payment operations
  createEscrowPayment(payment: InsertEscrowPayment): Promise<EscrowPayment>;
  getEscrowPayment(id: number): Promise<EscrowPayment | undefined>;
  getEscrowPaymentsByMilestone(milestoneId: number): Promise<EscrowPayment[]>;
  releaseEscrowPayment(id: number, releaseDate: Date): Promise<EscrowPayment | undefined>;
  
  // Dispute operations
  createDispute(dispute: InsertDispute): Promise<Dispute>;
  getDispute(id: number): Promise<Dispute | undefined>;
  getDisputesByContract(contractId: number): Promise<Dispute[]>;
  getDisputesByUser(userId: number): Promise<Dispute[]>;
  updateDisputeStatus(id: number, status: DisputeStatus, resolution?: string): Promise<Dispute | undefined>;
  assignModerator(disputeId: number, moderatorId: number): Promise<Dispute | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getReviewsByUser(userId: number): Promise<Review[]>;
  getReviewsByContract(contractId: number): Promise<Review[]>;
  getUserRating(userId: number): Promise<number>; // Average rating
  
  // Blockchain Contract operations
  createBlockchainContract(contract: InsertBlockchainContract): Promise<BlockchainContract>;
  getBlockchainContract(id: number): Promise<BlockchainContract | undefined>;
  getBlockchainContractByAddress(address: string, network: string): Promise<BlockchainContract | undefined>;
  getBlockchainContractsByAppContract(contractId: number): Promise<BlockchainContract[]>;
  
  // 2FA operations
  setupTwoFactorAuth(twoFactorData: InsertTwoFactorAuth): Promise<TwoFactorAuth>;
  getTwoFactorAuthByUser(userId: number): Promise<TwoFactorAuth | undefined>;
  verifyTwoFactorAuth(userId: number, token: string): Promise<boolean>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<Notification[]>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;
  
  // Dashboard stats
  getUserStats(userId: number): Promise<{
    activeContracts: number;
    pendingPayments: number;
    totalEarned: number;
    templateCount: number;
    disputesCount: number;
    averageRating: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contracts: Map<number, Contract>;
  private milestones: Map<number, Milestone>;
  private templates: Map<number, Template>;
  private escrowPayments: Map<number, EscrowPayment>;
  private disputes: Map<number, Dispute>;
  private reviews: Map<number, Review>;
  private blockchainContracts: Map<number, BlockchainContract>;
  private twoFactorAuths: Map<number, TwoFactorAuth>;
  private notifications: Map<number, Notification>;
  
  private userIdCounter: number;
  private contractIdCounter: number;
  private milestoneIdCounter: number;
  private templateIdCounter: number;
  private escrowPaymentIdCounter: number;
  private disputeIdCounter: number;
  private reviewIdCounter: number;
  private blockchainContractIdCounter: number;
  private notificationIdCounter: number;

  constructor() {
    this.users = new Map();
    this.contracts = new Map();
    this.milestones = new Map();
    this.templates = new Map();
    this.escrowPayments = new Map();
    this.disputes = new Map();
    this.reviews = new Map();
    this.blockchainContracts = new Map();
    this.twoFactorAuths = new Map();
    this.notifications = new Map();
    
    this.userIdCounter = 1;
    this.contractIdCounter = 1;
    this.milestoneIdCounter = 1;
    this.templateIdCounter = 1;
    this.escrowPaymentIdCounter = 1;
    this.disputeIdCounter = 1;
    this.reviewIdCounter = 1;
    this.blockchainContractIdCounter = 1;
    this.notificationIdCounter = 1;
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
    // Ensure proper defaults for optional fields
    const user: User = { 
      ...userData, 
      id,
      bio: userData.bio || null,
      profileImage: userData.profileImage || null 
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    
    if (!user) {
      return undefined;
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
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
      createdAt: now,
      status: contractData.status || ContractStatus.DRAFT
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
    const milestone: Milestone = { 
      ...milestoneData, 
      id, 
      completedDate: null,
      status: milestoneData.status || MilestoneStatus.NOT_STARTED
    };
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
    const template: Template = { 
      ...templateData, 
      id,
      isPublic: templateData.isPublic === undefined ? false : templateData.isPublic 
    };
    this.templates.set(id, template);
    return template;
  }
  
  // Escrow Payment operations
  async createEscrowPayment(paymentData: InsertEscrowPayment): Promise<EscrowPayment> {
    const id = this.escrowPaymentIdCounter++;
    const now = new Date();
    
    const payment: EscrowPayment = {
      ...paymentData,
      id,
      paymentDetails: paymentData.paymentDetails || null,
      stripePaymentIntentId: paymentData.stripePaymentIntentId || null,
      blockchainTxHash: paymentData.blockchainTxHash || null,
      depositedAt: now,
      releasedAt: null
    };
    
    this.escrowPayments.set(id, payment);
    return payment;
  }
  
  async getEscrowPayment(id: number): Promise<EscrowPayment | undefined> {
    return this.escrowPayments.get(id);
  }
  
  async getEscrowPaymentsByMilestone(milestoneId: number): Promise<EscrowPayment[]> {
    return Array.from(this.escrowPayments.values()).filter(
      (payment) => payment.milestoneId === milestoneId
    );
  }
  
  async releaseEscrowPayment(id: number, releaseDate: Date): Promise<EscrowPayment | undefined> {
    const payment = this.escrowPayments.get(id);
    
    if (!payment) {
      return undefined;
    }
    
    const updatedPayment = { ...payment, releasedAt: releaseDate };
    this.escrowPayments.set(id, updatedPayment);
    return updatedPayment;
  }
  
  // Dispute operations
  async createDispute(disputeData: InsertDispute): Promise<Dispute> {
    const id = this.disputeIdCounter++;
    const now = new Date();
    
    const dispute: Dispute = {
      ...disputeData,
      id,
      createdAt: now,
      resolvedAt: null,
      status: disputeData.status || DisputeStatus.OPEN
    };
    
    this.disputes.set(id, dispute);
    return dispute;
  }
  
  async getDispute(id: number): Promise<Dispute | undefined> {
    return this.disputes.get(id);
  }
  
  async getDisputesByContract(contractId: number): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(
      (dispute) => dispute.contractId === contractId
    );
  }
  
  async getDisputesByUser(userId: number): Promise<Dispute[]> {
    return Array.from(this.disputes.values()).filter(
      (dispute) => dispute.initiatedBy === userId || dispute.respondent === userId
    );
  }
  
  async updateDisputeStatus(id: number, status: DisputeStatus, resolution?: string): Promise<Dispute | undefined> {
    const dispute = this.disputes.get(id);
    
    if (!dispute) {
      return undefined;
    }
    
    const updatedDispute: Dispute = { 
      ...dispute, 
      status,
      resolution: resolution || dispute.resolution,
      resolvedAt: [
        DisputeStatus.RESOLVED_FOR_CLIENT,
        DisputeStatus.RESOLVED_FOR_FREELANCER,
        DisputeStatus.RESOLVED_COMPROMISE
      ].includes(status) ? new Date() : dispute.resolvedAt
    };
    
    this.disputes.set(id, updatedDispute);
    return updatedDispute;
  }
  
  async assignModerator(disputeId: number, moderatorId: number): Promise<Dispute | undefined> {
    const dispute = this.disputes.get(disputeId);
    
    if (!dispute) {
      return undefined;
    }
    
    const updatedDispute: Dispute = {
      ...dispute,
      moderatorId,
      status: DisputeStatus.UNDER_REVIEW
    };
    
    this.disputes.set(disputeId, updatedDispute);
    return updatedDispute;
  }
  
  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const id = this.reviewIdCounter++;
    const now = new Date();
    
    const review: Review = {
      ...reviewData,
      id,
      createdAt: now
    };
    
    this.reviews.set(id, review);
    return review;
  }
  
  async getReviewsByUser(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.receiverId === userId
    );
  }
  
  async getReviewsByContract(contractId: number): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (review) => review.contractId === contractId
    );
  }
  
  async getUserRating(userId: number): Promise<number> {
    const reviews = await this.getReviewsByUser(userId);
    
    if (reviews.length === 0) {
      return 0;
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }
  
  // Blockchain Contract operations
  async createBlockchainContract(contractData: InsertBlockchainContract): Promise<BlockchainContract> {
    const id = this.blockchainContractIdCounter++;
    const now = new Date();
    
    const blockchainContract: BlockchainContract = {
      ...contractData,
      id,
      deployedAt: now
    };
    
    this.blockchainContracts.set(id, blockchainContract);
    return blockchainContract;
  }
  
  async getBlockchainContract(id: number): Promise<BlockchainContract | undefined> {
    return this.blockchainContracts.get(id);
  }
  
  async getBlockchainContractByAddress(address: string, network: string): Promise<BlockchainContract | undefined> {
    return Array.from(this.blockchainContracts.values()).find(
      (contract) => contract.contractAddress === address && contract.network === network
    );
  }
  
  async getBlockchainContractsByAppContract(contractId: number): Promise<BlockchainContract[]> {
    return Array.from(this.blockchainContracts.values()).filter(
      (contract) => contract.contractId === contractId
    );
  }
  
  // 2FA operations
  async setupTwoFactorAuth(twoFactorData: InsertTwoFactorAuth): Promise<TwoFactorAuth> {
    const id = this.userIdCounter++; // Reusing the user ID counter as they're 1:1 with users
    
    const twoFactorAuth: TwoFactorAuth = {
      ...twoFactorData,
      id,
      verified: twoFactorData.verified || false,
      createdAt: new Date()
    };
    
    this.twoFactorAuths.set(id, twoFactorAuth);
    return twoFactorAuth;
  }
  
  async getTwoFactorAuthByUser(userId: number): Promise<TwoFactorAuth | undefined> {
    return Array.from(this.twoFactorAuths.values()).find(
      (tfa) => tfa.userId === userId
    );
  }
  
  async verifyTwoFactorAuth(userId: number, token: string): Promise<boolean> {
    // In a real implementation, we would validate the token against the secret
    // For this mock implementation, we'll just return true for demo purposes
    const tfa = await this.getTwoFactorAuthByUser(userId);
    
    if (!tfa) {
      return false;
    }
    
    // Mark as verified if not already
    if (!tfa.verified) {
      tfa.verified = true;
      this.twoFactorAuths.set(tfa.id, tfa);
    }
    
    return true; // In reality, validate token
  }
  
  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.notificationIdCounter++;
    const now = new Date();
    
    const notification: Notification = {
      ...notificationData,
      id,
      read: false,
      createdAt: now
    };
    
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => {
        // Sort by read status (unread first) and then by date (newest first)
        if (a.read !== b.read) {
          return a.read ? 1 : -1;
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
  
  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    
    if (!notification) {
      return undefined;
    }
    
    const updatedNotification = { ...notification, read: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }
  
  // Dashboard stats
  async getUserStats(userId: number): Promise<{
    activeContracts: number;
    pendingPayments: number;
    totalEarned: number;
    templateCount: number;
    disputesCount: number;
    averageRating: number;
  }> {
    const user = await this.getUser(userId);
    
    if (!user) {
      return {
        activeContracts: 0,
        pendingPayments: 0,
        totalEarned: 0,
        templateCount: 0,
        disputesCount: 0,
        averageRating: 0
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
    
    // Get user disputes count
    const userDisputes = await this.getDisputesByUser(userId);
    const disputesCount = userDisputes.length;
    
    // Get user average rating
    const averageRating = await this.getUserRating(userId);
    
    return {
      activeContracts,
      pendingPayments,
      totalEarned,
      templateCount,
      disputesCount,
      averageRating
    };
  }
}

export const storage = new MemStorage();
