import { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlertIcon,
  StarIcon,
  ClockIcon,
  CheckCircleIcon,
  CreditCardIcon,
  BellIcon,
  CoinsIcon,
  ArrowUpIcon,
  TrophyIcon,
  HeartIcon,
  Award,
  BadgeCheckIcon,
  FileTextIcon
} from "lucide-react";

export default function TrustScore() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("myScore");
  
  // Define types for trust score data
  type TierType = {
    name: string;
    minimumScore?: number;
    platformFeeDiscount: number;
    payoutSpeed: number;
    escrowRequirements?: string;
    verificationLevel?: string;
    prioritySupport?: boolean;
    contractTemplateAccess?: string;
  };
  
  type TrustScoreDataType = {
    overallScore: number;
    ratingFactor: number;
    reliabilityFactor: number;
    disputeFactor: number;
    tier: TierType;
    nextTier: TierType;
    pointsToNextTier: number;
    history: Array<{
      date: string;
      score: number;
    }>;
    userHistory: {
      contractsCompleted: number;
      contractsCancelled: number;
      averageRating: number;
      disputesInitiated: number;
      disputesLost: number;
      paymentsPunctual: number;
      paymentsLate: number;
      deliverablesOnTime: number;
      deliverablesLate: number;
    };
  };
  
  // Mock trust score data (In production, this would come from an API)
  const userTrustData: TrustScoreDataType = {
    overallScore: 83,
    ratingFactor: 0.86,
    reliabilityFactor: 0.78,
    disputeFactor: 0.92,
    tier: {
      name: "gold",
      minimumScore: 75,
      platformFeeDiscount: 20,
      payoutSpeed: 24,
      escrowRequirements: "partial",
      verificationLevel: "basic",
      prioritySupport: true,
      contractTemplateAccess: "premium"
    },
    nextTier: {
      name: "platinum",
      minimumScore: 90,
      platformFeeDiscount: 30,
      payoutSpeed: 6
    },
    pointsToNextTier: 7,
    history: [
      { date: "2024-04-01", score: 81 },
      { date: "2024-03-01", score: 78 },
      { date: "2024-02-01", score: 75 },
      { date: "2024-01-01", score: 72 }
    ],
    userHistory: {
      contractsCompleted: 18,
      contractsCancelled: 1,
      averageRating: 4.8,
      disputesInitiated: 2,
      disputesLost: 0,
      paymentsPunctual: 15,
      paymentsLate: 2,
      deliverablesOnTime: 16,
      deliverablesLate: 2
    }
  };
  
  // Animation for progress bar
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setProgress(userTrustData.overallScore), 500);
    return () => clearTimeout(timer);
  }, [userTrustData.overallScore]);
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  const getTierColorClass = (tierName: string) => {
    switch (tierName) {
      case 'platinum':
        return 'text-purple-600';
      case 'gold':
        return 'text-yellow-600';
      case 'silver':
        return 'text-neutral-500';
      default:
        return 'text-stone-600';
    }
  };
  
  const getTierIconClass = (tierName: string) => {
    switch (tierName) {
      case 'platinum':
        return 'bg-purple-100';
      case 'gold':
        return 'bg-yellow-100';
      case 'silver':
        return 'bg-neutral-100';
      default:
        return 'bg-stone-100';
    }
  };
  
  const renderTierBadge = (tierName: string) => {
    const displayName = tierName.charAt(0).toUpperCase() + tierName.slice(1);
    const colorClass = getTierColorClass(tierName);
    return (
      <Badge variant="outline" className={`${colorClass} border-current uppercase font-medium`}>
        {displayName}
      </Badge>
    );
  };
  
  const renderMyScore = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        {/* Trust Score Overview */}
        <Card className="overflow-hidden border-0 shadow-md">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 pt-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center">
                  <ShieldAlertIcon className="h-5 w-5 mr-2 text-primary" />
                  Your Trust Score
                </CardTitle>
                {renderTierBadge(userTrustData.tier.name)}
              </div>
              <CardDescription>
                Based on your contract history, ratings, and platform behavior
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pb-6">
              <div className="flex items-center justify-center py-4">
                <div className="relative h-48 w-48">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-primary">{userTrustData.overallScore}</span>
                    <span className="text-sm text-neutral-500">out of 100</span>
                  </div>
                  <svg className="h-48 w-48" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="url(#trustScoreGradient)"
                      strokeWidth="6"
                      strokeDasharray={`${userTrustData.overallScore * 2.83} 283`}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                    <defs>
                      <linearGradient id="trustScoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-sm text-neutral-500">Rating</div>
                  <div className="flex items-center justify-center mt-1">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="font-medium">{(userTrustData.ratingFactor * 5).toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-neutral-500">Reliability</div>
                  <div className="flex items-center justify-center mt-1">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mr-1" />
                    <span className="font-medium">{Math.round(userTrustData.reliabilityFactor * 100)}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-neutral-500">Dispute</div>
                  <div className="flex items-center justify-center mt-1">
                    <BadgeCheckIcon className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="font-medium">{Math.round(userTrustData.disputeFactor * 100)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
          
          <CardContent className="pt-6">
            <h3 className="font-semibold text-md mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center">
                    <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                    Rating Factor
                  </span>
                  <span className="text-sm text-neutral-500">
                    {Math.round(userTrustData.ratingFactor * 100)}%
                  </span>
                </div>
                <Progress value={userTrustData.ratingFactor * 100} className="h-2" />
                <p className="text-xs text-neutral-500">Based on client ratings and feedback</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center">
                    <ClockIcon className="h-4 w-4 text-green-500 mr-2" />
                    Reliability Factor
                  </span>
                  <span className="text-sm text-neutral-500">
                    {Math.round(userTrustData.reliabilityFactor * 100)}%
                  </span>
                </div>
                <Progress value={userTrustData.reliabilityFactor * 100} className="h-2" />
                <p className="text-xs text-neutral-500">Based on on-time deliveries and milestones</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium flex items-center">
                    <ShieldAlertIcon className="h-4 w-4 text-blue-500 mr-2" />
                    Dispute Factor
                  </span>
                  <span className="text-sm text-neutral-500">
                    {Math.round(userTrustData.disputeFactor * 100)}%
                  </span>
                </div>
                <Progress value={userTrustData.disputeFactor * 100} className="h-2" />
                <p className="text-xs text-neutral-500">Based on dispute history and resolutions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Tier Benefits */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Award className="h-5 w-5 mr-2 text-primary" />
              Your Trust Tier Benefits
            </CardTitle>
            <CardDescription>
              Benefits you receive based on your {userTrustData.tier.name.toUpperCase()} tier status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex items-start">
                <div className={`rounded-full p-2 ${getTierIconClass(userTrustData.tier.name)} mr-3`}>
                  <CoinsIcon className={`h-5 w-5 ${getTierColorClass(userTrustData.tier.name)}`} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Platform Fee Discount</h4>
                  <p className="text-sm text-neutral-500">{userTrustData.tier.platformFeeDiscount}% discount on platform fees</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`rounded-full p-2 ${getTierIconClass(userTrustData.tier.name)} mr-3`}>
                  <ClockIcon className={`h-5 w-5 ${getTierColorClass(userTrustData.tier.name)}`} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Fast Payouts</h4>
                  <p className="text-sm text-neutral-500">Payouts processed within {userTrustData.tier.payoutSpeed} hours</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`rounded-full p-2 ${getTierIconClass(userTrustData.tier.name)} mr-3`}>
                  <CreditCardIcon className={`h-5 w-5 ${getTierColorClass(userTrustData.tier.name)}`} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Escrow Requirements</h4>
                  <p className="text-sm text-neutral-500">
                    {userTrustData.tier.escrowRequirements === "partial" ? "Reduced" : "Standard"} escrow requirements
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`rounded-full p-2 ${getTierIconClass(userTrustData.tier.name)} mr-3`}>
                  <FileTextIcon className={`h-5 w-5 ${getTierColorClass(userTrustData.tier.name)}`} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Contract Templates</h4>
                  <p className="text-sm text-neutral-500">
                    Access to {userTrustData.tier.contractTemplateAccess} contract templates
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`rounded-full p-2 ${getTierIconClass(userTrustData.tier.name)} mr-3`}>
                  <BellIcon className={`h-5 w-5 ${getTierColorClass(userTrustData.tier.name)}`} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Support Priority</h4>
                  <p className="text-sm text-neutral-500">
                    {userTrustData.tier.prioritySupport ? "Priority" : "Standard"} customer support
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className={`rounded-full p-2 ${getTierIconClass(userTrustData.tier.name)} mr-3`}>
                  <BadgeCheckIcon className={`h-5 w-5 ${getTierColorClass(userTrustData.tier.name)}`} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Verification Level</h4>
                  <p className="text-sm text-neutral-500">
                    {userTrustData.tier.verificationLevel === "basic" ? "Simplified" : "Standard"} verification process
                  </p>
                </div>
              </div>
            </div>
            
            {userTrustData.nextTier && (
              <>
                <Separator className="my-6" />
                
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <h3 className="font-medium text-sm mb-2 flex items-center">
                    <TrophyIcon className="h-4 w-4 mr-2 text-primary" />
                    Next Tier: {userTrustData.nextTier.name.toUpperCase()}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-3">
                    You need {userTrustData.pointsToNextTier} more points to reach {userTrustData.nextTier.name.toUpperCase()} tier
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>{userTrustData.tier.name.toUpperCase()}</span>
                      <span>{userTrustData.nextTier.name.toUpperCase()}</span>
                    </div>
                    <Progress 
                      value={((userTrustData.overallScore - (userTrustData.tier.minimumScore || 0)) / 
                             ((userTrustData.nextTier.minimumScore || 100) - (userTrustData.tier.minimumScore || 0))) * 100} 
                      className="h-2" 
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-start">
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1 mt-0.5" />
                      <span className="text-xs text-neutral-700">Platform fee discount increases to {userTrustData.nextTier.platformFeeDiscount}%</span>
                    </div>
                    <div className="flex items-start">
                      <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1 mt-0.5" />
                      <span className="text-xs text-neutral-700">Payout time reduces to {userTrustData.nextTier.payoutSpeed} hours</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Trust Score History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trust Score History</CardTitle>
            <CardDescription>
              How your trust score has evolved over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end justify-between px-2">
              {userTrustData.history.map((point, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="flex-1 w-12 flex flex-col justify-end">
                    <div 
                      className="w-12 bg-primary/80 rounded-t-sm" 
                      style={{ height: `${point.score * 0.38}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-500 w-16 text-center">
                    {new Date(point.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <div className="flex items-center justify-center">
                <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-700">
                  Improved by {userTrustData.overallScore - userTrustData.history[userTrustData.history.length - 1].score} points in the last {userTrustData.history.length} months
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderTierSystem = () => {
    // Add types to tiers
    type TierType = {
      name: string;
      minimumScore: number;
      platformFeeDiscount: number;
      payoutSpeed: number;
      escrowRequirements: string;
      verificationLevel: string;
      prioritySupport: boolean;
      contractTemplateAccess: string;
      description: string;
    };
    
    const tiers: TierType[] = [
      {
        name: "bronze",
        minimumScore: 0,
        platformFeeDiscount: 0,
        payoutSpeed: 72,
        escrowRequirements: "full",
        verificationLevel: "enhanced",
        prioritySupport: false,
        contractTemplateAccess: "basic",
        description: "Default tier for all new users."
      },
      {
        name: "silver",
        minimumScore: 50,
        platformFeeDiscount: 10,
        payoutSpeed: 48,
        escrowRequirements: "full",
        verificationLevel: "enhanced",
        prioritySupport: false,
        contractTemplateAccess: "basic",
        description: "For users with good standing and consistent performance."
      },
      {
        name: "gold",
        minimumScore: 75,
        platformFeeDiscount: 20,
        payoutSpeed: 24,
        escrowRequirements: "partial",
        verificationLevel: "basic",
        prioritySupport: true,
        contractTemplateAccess: "premium",
        description: "For highly trusted users with excellent track records."
      },
      {
        name: "platinum",
        minimumScore: 90,
        platformFeeDiscount: 30,
        payoutSpeed: 6,
        escrowRequirements: "minimal",
        verificationLevel: "simplified",
        prioritySupport: true,
        contractTemplateAccess: "all",
        description: "For our most trusted and highest-performing users."
      }
    ];
    
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <TrophyIcon className="h-5 w-5 mr-2 text-primary" />
              Trust Tier System
            </CardTitle>
            <CardDescription>
              How our trust-based tier system works and the benefits of each tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex overflow-x-auto pb-4">
              <div className="grid grid-cols-4 gap-4 min-w-[800px]">
                {tiers.map((tier, index) => (
                  <div 
                    key={index} 
                    className={`border rounded-lg p-4 ${
                      tier.name === userTrustData.tier.name 
                        ? 'border-primary bg-primary/5' 
                        : 'border-neutral-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className={`font-medium capitalize ${getTierColorClass(tier.name)}`}>
                        {tier.name}
                      </h3>
                      {tier.name === userTrustData.tier.name && (
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                          Your Tier
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="text-neutral-600 mb-4 text-xs">{tier.description}</p>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Min. Score</span>
                        <span className="font-medium">{tier.minimumScore}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Fee Discount</span>
                        <span className="font-medium">{tier.platformFeeDiscount}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Payout Speed</span>
                        <span className="font-medium">{tier.payoutSpeed} hrs</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Escrow</span>
                        <span className="font-medium capitalize">{tier.escrowRequirements}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Verification</span>
                        <span className="font-medium capitalize">{tier.verificationLevel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Priority Support</span>
                        <span className="font-medium">{tier.prioritySupport ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Templates</span>
                        <span className="font-medium capitalize">{tier.contractTemplateAccess}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How Trust Scores Are Calculated</CardTitle>
            <CardDescription>
              The factors that contribute to your trust score on our platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium text-md flex items-center">
                  <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
                  Rating Factor (40%)
                </h3>
                <p className="text-sm text-neutral-600">
                  Based on the ratings you receive from clients or freelancers. Higher ratings lead to a better rating factor.
                </p>
                <div className="flex items-center space-x-2 text-sm text-neutral-600">
                  <span>• Average Rating: {userTrustData.userHistory.averageRating}/5</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-md flex items-center">
                  <ClockIcon className="h-4 w-4 text-green-500 mr-2" />
                  Reliability Factor (40%)
                </h3>
                <p className="text-sm text-neutral-600">
                  Based on how reliably you complete contracts, deliver on time, or make payments (depending on your role).
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-600">
                  <span>• Contracts Completed: {userTrustData.userHistory.contractsCompleted}</span>
                  <span>• Contracts Cancelled: {userTrustData.userHistory.contractsCancelled}</span>
                  <span>• Deliverables On Time: {userTrustData.userHistory.deliverablesOnTime}</span>
                  <span>• Deliverables Late: {userTrustData.userHistory.deliverablesLate}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium text-md flex items-center">
                  <ShieldAlertIcon className="h-4 w-4 text-blue-500 mr-2" />
                  Dispute Factor (20%)
                </h3>
                <p className="text-sm text-neutral-600">
                  Based on your history of disputes, how they were resolved, and your overall conduct on the platform.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-neutral-600">
                  <span>• Disputes Initiated: {userTrustData.userHistory.disputesInitiated}</span>
                  <span>• Disputes Lost: {userTrustData.userHistory.disputesLost}</span>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-sm text-blue-700 mb-2 flex items-center">
                  <HeartIcon className="h-4 w-4 mr-2" />
                  Tips to Improve Your Trust Score
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Complete projects on time and deliver quality work</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Maintain clear communication throughout projects</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Resolve issues amicably without escalating to disputes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Pay promptly upon milestone completion (for clients)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Receive positive reviews by exceeding expectations</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Trust Score | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900 flex items-center">
                    <ShieldAlertIcon className="h-6 w-6 mr-2 text-primary" />
                    Trust Score
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600">Your trustworthiness rating and associated benefits</p>
                </div>
              </div>
              
              <Tabs defaultValue="myScore" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="myScore" className="flex items-center">
                    <ShieldAlertIcon className="h-4 w-4 mr-2" />
                    My Trust Score
                  </TabsTrigger>
                  <TabsTrigger value="tiers" className="flex items-center">
                    <TrophyIcon className="h-4 w-4 mr-2" />
                    Trust Tier System
                  </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                  <TabsContent value="myScore">
                    {renderMyScore()}
                  </TabsContent>
                  <TabsContent value="tiers">
                    {renderTierSystem()}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}