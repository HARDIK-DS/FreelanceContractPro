import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircleIcon,
  BrainCircuitIcon,
  AlertTriangleIcon,
  MessageSquareIcon,
  FileTextIcon,
  BarChart3Icon,
  ArrowUpIcon,
  ClockIcon,
  GavelIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AIInsights() {
  const { user, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("redflags");
  const [messageToAnalyze, setMessageToAnalyze] = useState("");
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  
  // Mock dispute data (In production, this would come from an API)
  const disputeData = {
    id: 123,
    contractId: 456,
    reason: "Client claims the delivered work doesn't meet the specified requirements.",
    status: "under_review",
    evidence: [
      { type: "message", content: "Our agreement clearly stated mobile compatibility as a requirement." },
      { type: "screenshot", url: "#", description: "Screenshot showing requirements document" }
    ],
    recommendation: "compromise",
    confidenceScore: 0.78,
    reasoning: "While the contract does mention mobile compatibility, the specific requirements were not detailed enough. The freelancer delivered a working solution, but mobile optimization could be improved.",
    suggestedResolution: "Release 75% of the milestone payment, with the remaining 25% to be released after mobile optimization improvements are made.",
    fairAmountToRelease: 750
  };
  
  // Mock red flag data
  const redFlagSample = {
    redFlags: {
      toxicity: 0.15,
      scopeCreep: 0.62,
      delayRisk: 0.38,
      paymentRisk: 0.12
    },
    analysis: "There are signs of scope creep in this message. The client is requesting features that weren't part of the original agreement.",
    suggestedActions: [
      "Politely remind the client about the original project scope",
      "Offer to create a change order for the new requirements",
      "Document this conversation in the contract history"
    ]
  };
  
  // Fetch recent message history for red flag analysis
  const { data: recentMessages, isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/messages', `userId=${user?.id}`],
    // Since this is a demo, we'll provide some mock data for recentMessages
    enabled: false
  });
  
  // Analyze message for red flags
  const handleAnalyzeMessage = async () => {
    // In production, this would call the backend API
    // const response = await apiRequest('POST', '/api/analyze-message', { message: messageToAnalyze });
    // setAnalysisResult(response);
    
    // For demo purposes, using mock data
    setAnalysisResult(redFlagSample);
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  const renderRedFlagAnalysis = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        {/* Message Analysis Tool */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <MessageSquareIcon className="h-5 w-5 mr-2 text-primary" />
              Red Flag Message Analyzer
            </CardTitle>
            <CardDescription>
              Analyze messages for potential red flags like scope creep, payment risks, or toxicity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste a message here to analyze for red flags..."
              className="min-h-32"
              value={messageToAnalyze}
              onChange={(e) => setMessageToAnalyze(e.target.value)}
            />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleAnalyzeMessage} disabled={!messageToAnalyze}>
              <BrainCircuitIcon className="h-4 w-4 mr-2" />
              Analyze Message
            </Button>
          </CardFooter>
        </Card>
        
        {/* Analysis Results */}
        {analysisResult && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Red Flag Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Toxicity</span>
                      <span className="text-sm text-neutral-500">
                        {Math.round(analysisResult.redFlags.toxicity * 100)}%
                      </span>
                    </div>
                    <Progress value={analysisResult.redFlags.toxicity * 100} className={`h-2 ${analysisResult.redFlags.toxicity > 0.5 ? 'bg-red-100' : 'bg-neutral-100'}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Scope Creep</span>
                      <span className="text-sm text-neutral-500">
                        {Math.round(analysisResult.redFlags.scopeCreep * 100)}%
                      </span>
                    </div>
                    <Progress value={analysisResult.redFlags.scopeCreep * 100} className={`h-2 ${analysisResult.redFlags.scopeCreep > 0.5 ? 'bg-red-100' : 'bg-neutral-100'}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Delay Risk</span>
                      <span className="text-sm text-neutral-500">
                        {Math.round(analysisResult.redFlags.delayRisk * 100)}%
                      </span>
                    </div>
                    <Progress value={analysisResult.redFlags.delayRisk * 100} className={`h-2 ${analysisResult.redFlags.delayRisk > 0.5 ? 'bg-red-100' : 'bg-neutral-100'}`} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Payment Risk</span>
                      <span className="text-sm text-neutral-500">
                        {Math.round(analysisResult.redFlags.paymentRisk * 100)}%
                      </span>
                    </div>
                    <Progress value={analysisResult.redFlags.paymentRisk * 100} className={`h-2 ${analysisResult.redFlags.paymentRisk > 0.5 ? 'bg-red-100' : 'bg-neutral-100'}`} />
                  </div>
                </div>
                
                <Separator />
                
                {/* Analysis and Recommended Actions */}
                <div>
                  <h3 className="font-semibold text-md mb-2">Analysis</h3>
                  <p className="text-sm text-neutral-700 mb-4">{analysisResult.analysis}</p>
                  
                  <h3 className="font-semibold text-md mb-2">Recommended Actions</h3>
                  <ul className="space-y-2">
                    {analysisResult.suggestedActions.map((action: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <span className="text-primary mr-2">•</span>
                        <span className="text-sm">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Recent Messages with Red Flags */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Messages with Red Flags</CardTitle>
            <CardDescription>
              Messages from your contracts that our AI has identified as potentially problematic
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <AlertTriangleIcon className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Website Redesign Project - Client Message</h4>
                      <p className="text-sm text-neutral-700 mt-1">
                        "I know we agreed on a simple homepage redesign, but could you also add an e-commerce section with about 20 product pages? It shouldn't take too long."
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                    Scope Creep
                  </Badge>
                </div>
              </div>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start">
                    <AlertCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Mobile App Development - Client Message</h4>
                      <p className="text-sm text-neutral-700 mt-1">
                        "This is completely unacceptable. I've been waiting for 2 days. If you can't deliver on time, I'll have to find someone else and dispute payment."
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                    Payment Risk
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderDisputeResolution = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <GavelIcon className="h-5 w-5 mr-2 text-primary" />
                AI-Powered Dispute Analysis
              </CardTitle>
              <Badge variant="outline">{disputeData.status}</Badge>
            </div>
            <CardDescription>
              Dispute #{disputeData.id} for Contract #{disputeData.contractId}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Dispute Details */}
              <div>
                <h3 className="font-semibold text-md mb-2">Dispute Reason</h3>
                <p className="text-sm text-neutral-700">{disputeData.reason}</p>
              </div>
              
              <Separator />
              
              {/* AI Recommendation */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-md">AI Recommendation</h3>
                  <div className="flex items-center">
                    <span className="text-sm text-neutral-500 mr-2">Confidence:</span>
                    <Progress value={disputeData.confidenceScore * 100} className="w-24 h-2" />
                    <span className="text-sm text-neutral-500 ml-2">{Math.round(disputeData.confidenceScore * 100)}%</span>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-medium">
                    Recommended outcome: <span className="text-blue-700 capitalize">{disputeData.recommendation}</span>
                  </p>
                  {disputeData.fairAmountToRelease && (
                    <p className="text-sm mt-1">
                      Fair amount to release: <span className="font-medium">${disputeData.fairAmountToRelease}</span>
                    </p>
                  )}
                </div>
                
                <h3 className="font-semibold text-md mb-2">Reasoning</h3>
                <p className="text-sm text-neutral-700 mb-4">{disputeData.reasoning}</p>
                
                <h3 className="font-semibold text-md mb-2">Suggested Resolution</h3>
                <p className="text-sm text-neutral-700">{disputeData.suggestedResolution}</p>
              </div>
              
              <Separator />
              
              {/* Evidence Summary */}
              <div>
                <h3 className="font-semibold text-md mb-2">Evidence Analysis</h3>
                <ul className="space-y-2">
                  {disputeData.evidence.map((item: any, index: number) => (
                    <li key={index} className="text-sm">
                      <span className="font-medium">{item.type === 'message' ? 'Message' : 'Screenshot'}: </span>
                      {item.content || item.description}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline">Reject Recommendation</Button>
            <Button>Accept Recommendation</Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  const renderAnalytics = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3Icon className="h-5 w-5 mr-2 text-primary" />
              Communication Analytics
            </CardTitle>
            <CardDescription>
              Insights derived from analyzing your contract communications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Communication Health Score */}
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Communication Health</h3>
                  <div className="flex items-center">
                    <div className="relative h-16 w-16">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold">82%</span>
                      </div>
                      <svg className="h-16 w-16" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                        <circle
                          cx="18"
                          cy="18"
                          r="15"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="3"
                          strokeDasharray="82 100"
                          strokeLinecap="round"
                          transform="rotate(-90 18 18)"
                        />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-neutral-600">Overall health of your communications is positive</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">+5% from last month</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Response Time */}
                <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                  <h3 className="text-sm font-medium text-neutral-700 mb-2">Average Response Time</h3>
                  <div className="flex items-center">
                    <div className="h-16 w-16 flex items-center justify-center">
                      <ClockIcon className="h-8 w-8 text-blue-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-lg font-bold">4.2 hrs</p>
                      <p className="text-sm text-neutral-600">Your average response time to clients</p>
                      <div className="flex items-center mt-1">
                        <ArrowUpIcon className="h-3 w-3 text-green-500 mr-1" />
                        <span className="text-xs text-green-500">Faster than 68% of freelancers</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              {/* Communication Patterns */}
              <div>
                <h3 className="font-semibold text-md mb-3">Communication Patterns</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Clear Requirements</span>
                    <div className="flex items-center">
                      <Progress value={78} className="w-40 h-2 mr-2" />
                      <span className="text-sm text-neutral-500">78%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Positive Tone</span>
                    <div className="flex items-center">
                      <Progress value={92} className="w-40 h-2 mr-2" />
                      <span className="text-sm text-neutral-500">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Thorough Feedback</span>
                    <div className="flex items-center">
                      <Progress value={65} className="w-40 h-2 mr-2" />
                      <span className="text-sm text-neutral-500">65%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Timely Updates</span>
                    <div className="flex items-center">
                      <Progress value={88} className="w-40 h-2 mr-2" />
                      <span className="text-sm text-neutral-500">88%</span>
                    </div>
                  </div>
                </div>
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
        <title>AI Insights | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900 flex items-center">
                    <BrainCircuitIcon className="h-6 w-6 mr-2 text-primary" />
                    AI Insights
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600">Smart contract and communication analysis powered by AI</p>
                </div>
              </div>
              
              <Tabs defaultValue="redflags" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="redflags" className="flex items-center">
                    <AlertTriangleIcon className="h-4 w-4 mr-2" />
                    Red Flag Alerts
                  </TabsTrigger>
                  <TabsTrigger value="disputes" className="flex items-center">
                    <GavelIcon className="h-4 w-4 mr-2" />
                    Dispute Resolution
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="flex items-center">
                    <BarChart3Icon className="h-4 w-4 mr-2" />
                    Analytics
                  </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                  <TabsContent value="redflags">
                    {renderRedFlagAnalysis()}
                  </TabsContent>
                  <TabsContent value="disputes">
                    {renderDisputeResolution()}
                  </TabsContent>
                  <TabsContent value="analytics">
                    {renderAnalytics()}
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