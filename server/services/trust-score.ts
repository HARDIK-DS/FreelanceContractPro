import { User, Contract, Milestone, Dispute, Review } from '@shared/schema';
import { storage } from '../storage';
import { calculateTrustScore } from './ai';

/**
 * Trust Score Tiers with benefits
 */
export enum TrustTier {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
}

/**
 * Trust Score benefits by tier
 */
interface TrustTierBenefits {
  tier: TrustTier;
  minimumScore: number;
  platformFeeDiscount: number; // Percentage discount on platform fees
  payoutSpeed: number; // In hours
  escrowRequirements: 'full' | 'partial' | 'minimal';
  verificationLevel: 'basic' | 'enhanced' | 'simplified';
  prioritySupport: boolean;
  contractTemplateAccess: 'basic' | 'premium' | 'all';
}

/**
 * Trust tier definitions
 */
export const TRUST_TIERS: TrustTierBenefits[] = [
  {
    tier: TrustTier.BRONZE,
    minimumScore: 0, // Default tier
    platformFeeDiscount: 0, // No discount
    payoutSpeed: 72, // 3 days
    escrowRequirements: 'full',
    verificationLevel: 'enhanced',
    prioritySupport: false,
    contractTemplateAccess: 'basic'
  },
  {
    tier: TrustTier.SILVER,
    minimumScore: 50,
    platformFeeDiscount: 10, // 10% discount
    payoutSpeed: 48, // 2 days
    escrowRequirements: 'full',
    verificationLevel: 'enhanced',
    prioritySupport: false,
    contractTemplateAccess: 'basic'
  },
  {
    tier: TrustTier.GOLD,
    minimumScore: 75,
    platformFeeDiscount: 20, // 20% discount
    payoutSpeed: 24, // 1 day
    escrowRequirements: 'partial',
    verificationLevel: 'basic', // Simplified verification for trusted users
    prioritySupport: true,
    contractTemplateAccess: 'premium'
  },
  {
    tier: TrustTier.PLATINUM,
    minimumScore: 90,
    platformFeeDiscount: 30, // 30% discount
    payoutSpeed: 6, // 6 hours
    escrowRequirements: 'minimal',
    verificationLevel: 'simplified',
    prioritySupport: true,
    contractTemplateAccess: 'all'
  }
];

/**
 * Get user trust history data
 * @param userId User ID to get history for
 * @returns User's trust history data
 */
export async function getUserTrustHistory(userId: number): Promise<{
  contractsCompleted: number;
  contractsCancelled: number;
  averageRating: number;
  disputesInitiated: number;
  disputesLost: number;
  paymentsPunctual: number; // For clients
  paymentsLate: number;     // For clients
  deliverablesOnTime: number; // For freelancers
  deliverablesLate: number;   // For freelancers
}> {
  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    let contracts: Contract[] = [];
    if (user.userType === 'freelancer') {
      contracts = await storage.getContractsByFreelancer(userId);
    } else if (user.userType === 'client') {
      contracts = await storage.getContractsByClient(userId);
    }
    
    // Count completed contracts
    const contractsCompleted = contracts.filter(c => c.status === 'completed').length;
    
    // Count cancelled contracts
    const contractsCancelled = contracts.filter(c => c.status === 'cancelled').length;
    
    // Get average rating
    const averageRating = await storage.getUserRating(userId);
    
    // Get disputes
    const disputes = await storage.getDisputesByUser(userId);
    const disputesInitiated = disputes.filter(d => d.initiatedBy === userId).length;
    
    // Count disputes lost (where resolution wasn't in favor of the user)
    const disputesLost = disputes.filter(d => {
      if (user.userType === 'freelancer') {
        return d.status === 'resolved_for_client';
      } else {
        return d.status === 'resolved_for_freelancer';
      }
    }).length;
    
    // Initialize payment and deliverable counters
    let paymentsPunctual = 0;
    let paymentsLate = 0;
    let deliverablesOnTime = 0;
    let deliverablesLate = 0;
    
    // Process all milestones for metrics
    for (const contract of contracts) {
      const milestones = await storage.getMilestonesByContract(contract.id);
      
      for (const milestone of milestones) {
        if (milestone.status !== 'completed') continue;
        
        // Skip milestones without completion date
        if (!milestone.completedDate) continue;
        
        const completionDate = new Date(milestone.completedDate);
        const dueDate = new Date(milestone.dueDate);
        
        if (user.userType === 'freelancer') {
          // Track deliverable timeliness for freelancers
          if (completionDate <= dueDate) {
            deliverablesOnTime++;
          } else {
            deliverablesLate++;
          }
        } else if (user.userType === 'client') {
          // Track payment timeliness for clients
          // Get payments related to this milestone
          const payments = await storage.getEscrowPaymentsByMilestone(milestone.id);
          
          for (const payment of payments) {
            if (!payment.releasedAt) continue;
            
            const releaseDate = new Date(payment.releasedAt);
            // Consider payment punctual if released within 3 days of milestone completion
            const deadlineForPayment = new Date(completionDate.getTime() + 3 * 24 * 60 * 60 * 1000);
            
            if (releaseDate <= deadlineForPayment) {
              paymentsPunctual++;
            } else {
              paymentsLate++;
            }
          }
        }
      }
    }
    
    return {
      contractsCompleted,
      contractsCancelled,
      averageRating,
      disputesInitiated,
      disputesLost,
      paymentsPunctual,
      paymentsLate,
      deliverablesOnTime,
      deliverablesLate
    };
  } catch (error) {
    console.error('Error retrieving user trust history:', error);
    
    // Return default values if data can't be retrieved
    return {
      contractsCompleted: 0,
      contractsCancelled: 0,
      averageRating: 0,
      disputesInitiated: 0,
      disputesLost: 0,
      paymentsPunctual: 0,
      paymentsLate: 0,
      deliverablesOnTime: 0,
      deliverablesLate: 0
    };
  }
}

/**
 * Calculate a user's trust score and determine their tier
 * @param userId User ID to calculate score for
 * @returns Trust score details and tier benefits
 */
export async function calculateUserTrustScore(userId: number): Promise<{
  trustScore: {
    overallScore: number;
    ratingFactor: number;
    reliabilityFactor: number;
    disputeFactor: number;
    recommendation: string;
  };
  tier: TrustTierBenefits;
  nextTier?: TrustTierBenefits;
  pointsToNextTier?: number;
}> {
  try {
    const user = await storage.getUser(userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    const userHistory = await getUserTrustHistory(userId);
    
    // Calculate trust score using AI service
    const trustScore = await calculateTrustScore(
      userId,
      user.userType as 'freelancer' | 'client',
      userHistory
    );
    
    // Determine current tier based on score
    const currentTier = TRUST_TIERS.reduce((highest, tier) => {
      if (trustScore.overallScore >= tier.minimumScore && tier.minimumScore >= highest.minimumScore) {
        return tier;
      }
      return highest;
    }, TRUST_TIERS[0]);
    
    // Find next tier if not at the highest
    let nextTier: TrustTierBenefits | undefined;
    let pointsToNextTier: number | undefined;
    
    if (currentTier.tier !== TrustTier.PLATINUM) {
      const tierIndex = TRUST_TIERS.findIndex(t => t.tier === currentTier.tier);
      if (tierIndex >= 0 && tierIndex < TRUST_TIERS.length - 1) {
        nextTier = TRUST_TIERS[tierIndex + 1];
        pointsToNextTier = nextTier.minimumScore - trustScore.overallScore;
      }
    }
    
    return {
      trustScore,
      tier: currentTier,
      nextTier,
      pointsToNextTier
    };
  } catch (error) {
    console.error('Error calculating trust score:', error);
    
    // Return default values if calculation fails
    return {
      trustScore: {
        overallScore: 0,
        ratingFactor: 0,
        reliabilityFactor: 0,
        disputeFactor: 0,
        recommendation: 'Unable to calculate trust score'
      },
      tier: TRUST_TIERS[0] // Default to Bronze tier
    };
  }
}

/**
 * Apply trust tier benefits to a transaction or operation
 * @param userId User ID to apply benefits for
 * @param operation Type of operation ('fee', 'payout', 'escrow', etc.)
 * @param value Original value to modify based on benefits
 * @returns Modified value based on user's trust tier
 */
export async function applyTrustBenefits(
  userId: number,
  operation: 'fee' | 'payout' | 'escrow' | 'verification',
  value: number | string
): Promise<number | string> {
  try {
    const { tier } = await calculateUserTrustScore(userId);
    
    switch (operation) {
      case 'fee':
        // Apply fee discount
        if (typeof value === 'number') {
          return value * (1 - tier.platformFeeDiscount / 100);
        }
        return value;
        
      case 'payout':
        // Return payout speed in hours
        return tier.payoutSpeed;
        
      case 'escrow':
        // Return escrow requirements level
        return tier.escrowRequirements;
        
      case 'verification':
        // Return verification level
        return tier.verificationLevel;
        
      default:
        return value;
    }
  } catch (error) {
    console.error('Error applying trust benefits:', error);
    return value; // Return original value if there's an error
  }
}