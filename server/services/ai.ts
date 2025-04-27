import OpenAI from 'openai';
import { Milestone, Contract, Dispute } from '@shared/schema';
import natural from 'natural';

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Initialize natural language toolkit
const tokenizer = new natural.WordTokenizer();
const TfIdf = natural.TfIdf;
const tfidf = new TfIdf();

/**
 * Sentiment analyzer using NLP
 */
class SentimentAnalyzer {
  private static instance: SentimentAnalyzer;
  private analyzer: natural.SentimentAnalyzer;

  private constructor() {
    // Initialize sentiment analyzer with English stemmer
    this.analyzer = new natural.SentimentAnalyzer('English', natural.PorterStemmer, 'afinn');
  }

  public static getInstance(): SentimentAnalyzer {
    if (!SentimentAnalyzer.instance) {
      SentimentAnalyzer.instance = new SentimentAnalyzer();
    }
    return SentimentAnalyzer.instance;
  }

  public analyze(text: string): { score: number; comparative: number } {
    const tokens = tokenizer.tokenize(text);
    if (!tokens || tokens.length === 0) {
      return { score: 0, comparative: 0 };
    }
    
    const sentiment = this.analyzer.getSentiment(tokens);
    return {
      score: sentiment,
      comparative: sentiment / tokens.length // Normalized score
    };
  }
}

/**
 * Analyze message for red flags
 * @param message Message content to analyze
 * @param context Additional context (contract details, history, etc.)
 * @returns Analysis results with red flag indicators
 */
export async function analyzeMessageForRedFlags(
  message: string,
  context: {
    contractType: string;
    messageHistory: Array<{ sender: string; content: string; timestamp: Date }>;
    milestones: Milestone[];
    deadlines: Date[];
  }
): Promise<{
  redFlags: {
    toxicity: number;
    scopeCreep: number;
    delayRisk: number;
    paymentRisk: number;
  };
  analysis: string;
  suggestedActions: string[];
}> {
  try {
    // Local sentiment analysis first to avoid unnecessary API calls
    const sentimentAnalyzer = SentimentAnalyzer.getInstance();
    const sentiment = sentimentAnalyzer.analyze(message);
    
    // Only call OpenAI if basic sentiment is concerning or we need deeper analysis
    if (sentiment.comparative < -0.3 || context.messageHistory.length > 5) {
      // Use OpenAI to analyze for red flags
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `You are an AI specialized in detecting potential issues in freelancer-client communications. 
                     Analyze the message for red flags such as toxicity, scope creep, delay risks, and payment issues.
                     Return a JSON object with:
                     1. redFlags (toxicity, scopeCreep, delayRisk, paymentRisk) as numbers between 0-1
                     2. analysis: A brief explanation
                     3. suggestedActions: Array of suggested actions`
          },
          {
            role: "user",
            content: `Message: ${message}\n\nContract Type: ${context.contractType}\n\nPrevious Messages: ${
              JSON.stringify(context.messageHistory.slice(-5))
            }\n\nMilestones: ${JSON.stringify(context.milestones)}\n\nDeadlines: ${
              context.deadlines.map(d => d.toISOString()).join(', ')
            }`
          }
        ],
        response_format: { type: "json_object" }
      });
      
      const result = JSON.parse(aiResponse.choices[0].message.content);
      return result;
    }
    
    // Basic analysis for non-risky messages
    return {
      redFlags: {
        toxicity: Math.max(0, -sentiment.comparative),
        scopeCreep: 0.1, // Default low risk
        delayRisk: 0.1,  // Default low risk
        paymentRisk: 0.1  // Default low risk
      },
      analysis: "No major red flags detected in this message.",
      suggestedActions: ["Continue normal communication"]
    };
  } catch (error) {
    console.error('Error analyzing message for red flags:', error);
    
    // Fallback to basic sentiment analysis on API failure
    const sentimentAnalyzer = SentimentAnalyzer.getInstance();
    const sentiment = sentimentAnalyzer.analyze(message);
    
    return {
      redFlags: {
        toxicity: Math.max(0, -sentiment.comparative),
        scopeCreep: 0.2,
        delayRisk: 0.2,
        paymentRisk: 0.2
      },
      analysis: "Unable to perform full analysis. Basic sentiment analysis completed.",
      suggestedActions: ["Monitor conversation manually"]
    };
  }
}

/**
 * AI-powered dispute resolution assistant
 * @param dispute The dispute to analyze
 * @param contractDetails Contract related to the dispute
 * @param communications All communications between the parties
 * @param deliverables Submitted deliverables related to the dispute
 * @returns Analysis and recommendation for dispute resolution
 */
export async function analyzeDispute(
  dispute: Dispute,
  contractDetails: Contract,
  communications: Array<{ sender: string; content: string; timestamp: Date }>,
  deliverables: Array<{ description: string; submittedAt: Date; feedback?: string }>
): Promise<{
  recommendation: 'client' | 'freelancer' | 'compromise';
  confidenceScore: number;
  reasoning: string;
  suggestedResolution: string;
  fairAmountToRelease?: number;
}> {
  try {
    // Prepare communications for analysis
    const communicationsText = communications.map(msg => 
      `[${msg.timestamp.toISOString()}] ${msg.sender}: ${msg.content}`
    ).join('\n');
    
    // Prepare deliverables for analysis
    const deliverablesText = deliverables.map(del => 
      `Description: ${del.description}\nSubmitted: ${del.submittedAt.toISOString()}${
        del.feedback ? `\nFeedback: ${del.feedback}` : ''
      }`
    ).join('\n\n');
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an AI specialized in fair dispute resolution for freelancer-client contracts.
                   Analyze all the provided information and suggest a fair resolution.
                   Return a JSON object with:
                   1. recommendation: Either 'client', 'freelancer', or 'compromise'
                   2. confidenceScore: A number between 0-1 indicating your confidence
                   3. reasoning: A brief justification of your recommendation
                   4. suggestedResolution: A specific resolution proposal
                   5. fairAmountToRelease: For compromise scenarios, suggest a fair amount to release from escrow`
        },
        {
          role: "user",
          content: `Dispute Reason: ${dispute.reason}\n\nContract Details: ${
            JSON.stringify(contractDetails)
          }\n\nCommunications:\n${communicationsText}\n\nDeliverables:\n${deliverablesText}`
        }
      ],
      response_format: { type: "json_object" }
    });
    
    const result = JSON.parse(aiResponse.choices[0].message.content);
    return result;
  } catch (error) {
    console.error('Error analyzing dispute:', error);
    // Provide a neutral fallback
    return {
      recommendation: 'compromise',
      confidenceScore: 0.5,
      reasoning: "Automatic analysis failed. Recommend human moderation.",
      suggestedResolution: "Unable to provide AI analysis. Please have a human moderator review the dispute.",
      fairAmountToRelease: contractDetails.totalAmount / 2 // Suggest 50% as fallback
    };
  }
}

/**
 * Calculate trust score based on user history
 * @param userId User ID to calculate trust score for
 * @param userType 'freelancer' or 'client'
 * @param userHistory User's history data
 * @returns Trust score and breakdown
 */
export async function calculateTrustScore(
  userId: number,
  userType: 'freelancer' | 'client',
  userHistory: {
    contractsCompleted: number;
    contractsCancelled: number;
    averageRating: number;
    disputesInitiated: number;
    disputesLost: number;
    paymentsPunctual: number; // For clients
    paymentsLate: number;     // For clients
    deliverablesOnTime: number; // For freelancers
    deliverablesLate: number;   // For freelancers
  }
): Promise<{
  overallScore: number; // 0-100
  ratingFactor: number; // 0-1
  reliabilityFactor: number; // 0-1
  disputeFactor: number; // 0-1
  recommendation: string;
}> {
  // Calculate overall score based on user type
  let ratingFactor = userHistory.averageRating / 5; // Normalized to 0-1
  
  // Calculate reliability factor
  let reliabilityFactor: number;
  if (userType === 'freelancer') {
    const deliverableTotal = userHistory.deliverablesOnTime + userHistory.deliverablesLate;
    reliabilityFactor = deliverableTotal > 0 
      ? userHistory.deliverablesOnTime / deliverableTotal 
      : 0.5;
  } else {
    const paymentTotal = userHistory.paymentsPunctual + userHistory.paymentsLate;
    reliabilityFactor = paymentTotal > 0 
      ? userHistory.paymentsPunctual / paymentTotal 
      : 0.5;
  }
  
  // Calculate dispute factor (lower is better)
  const contractTotal = userHistory.contractsCompleted + userHistory.contractsCancelled;
  const disputeFactor = contractTotal > 0
    ? 1 - (userHistory.disputesLost / contractTotal)
    : 0.5;
  
  // Calculate overall score (0-100 scale)
  const overallScore = Math.round(
    (ratingFactor * 0.4 + reliabilityFactor * 0.4 + disputeFactor * 0.2) * 100
  );
  
  // Generate recommendation
  let recommendation = '';
  if (overallScore >= 85) {
    recommendation = 'Highly trusted user with excellent track record';
  } else if (overallScore >= 70) {
    recommendation = 'Good standing user with solid reliability';
  } else if (overallScore >= 50) {
    recommendation = 'Average trust level, proceed with normal verification';
  } else if (overallScore >= 30) {
    recommendation = 'Some concerns - additional verification recommended';
  } else {
    recommendation = 'High risk - enhanced verification strongly recommended';
  }
  
  return {
    overallScore,
    ratingFactor,
    reliabilityFactor,
    disputeFactor,
    recommendation
  };
}