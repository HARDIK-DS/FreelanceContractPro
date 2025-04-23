import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/contracts";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Milestone, MilestoneStatus } from "@shared/schema";

// In a real application, we would have an API endpoint for payments
// Here we're simulating upcoming payments using milestone data
const simulatedMilestones: Milestone[] = [
  {
    id: 1,
    contractId: 1,
    title: "Website Redesign - Milestone 3",
    description: "CMS Integration",
    amount: 1500,
    status: MilestoneStatus.PENDING_REVIEW,
    dueDate: new Date('2023-06-01'),
    completedDate: null,
  },
  {
    id: 2,
    contractId: 2,
    title: "Mobile App - Milestone 2",
    description: "Frontend implementation",
    amount: 2500,
    status: MilestoneStatus.NOT_STARTED,
    dueDate: new Date('2023-06-08'),
    completedDate: null,
  },
  {
    id: 3,
    contractId: 3,
    title: "Content Strategy - Milestone 4",
    description: "Final content delivery",
    amount: 800,
    status: MilestoneStatus.READY_FOR_PAYMENT,
    dueDate: new Date('2023-05-30'),
    completedDate: null,
  },
  {
    id: 4,
    contractId: 1,
    title: "Website Redesign - Milestone 2",
    description: "Frontend development",
    amount: 1250,
    status: MilestoneStatus.COMPLETED,
    dueDate: new Date('2023-05-15'),
    completedDate: new Date('2023-05-15'),
  },
  {
    id: 5,
    contractId: 3,
    title: "Content Strategy - Milestone 3",
    description: "SEO optimization",
    amount: 950,
    status: MilestoneStatus.COMPLETED,
    dueDate: new Date('2023-05-10'),
    completedDate: new Date('2023-05-10'),
  }
];

export default function Payments() {
  const { user, isLoading: authLoading } = useAuth();
  
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  // Calculate days until due
  const getDaysUntilDue = (dueDate: Date) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Filter milestones by status
  const pendingPayments = simulatedMilestones.filter(
    milestone => milestone.status === MilestoneStatus.PENDING_REVIEW || 
                 milestone.status === MilestoneStatus.READY_FOR_PAYMENT
  );
  
  const upcomingPayments = simulatedMilestones.filter(
    milestone => milestone.status === MilestoneStatus.NOT_STARTED || 
                 milestone.status === MilestoneStatus.IN_PROGRESS
  );
  
  const completedPayments = simulatedMilestones.filter(
    milestone => milestone.status === MilestoneStatus.COMPLETED
  );
  
  const allPayments = [...pendingPayments, ...upcomingPayments, ...completedPayments];
  
  const getStatusLabel = (status: MilestoneStatus): string => {
    switch(status) {
      case MilestoneStatus.NOT_STARTED:
        return "Not Started";
      case MilestoneStatus.IN_PROGRESS:
        return "In Progress";
      case MilestoneStatus.PENDING_REVIEW:
        return "Awaiting Approval";
      case MilestoneStatus.READY_FOR_PAYMENT:
        return "Ready for Payment";
      case MilestoneStatus.COMPLETED:
        return "Paid";
      default:
        return status;
    }
  };
  
  const renderPaymentsList = (milestones: Milestone[]) => {
    if (!milestones.length) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-500">No payments found</p>
        </div>
      );
    }
    
    return (
      <div className="divide-y divide-neutral-200">
        {milestones.map(milestone => {
          const daysUntilDue = getDaysUntilDue(milestone.dueDate);
          
          return (
            <div key={milestone.id} className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{milestone.title}</p>
                  <p className="text-sm text-neutral-500">{milestone.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">{formatCurrency(milestone.amount)}</p>
                  <p className="text-xs text-neutral-500">
                    {milestone.status === MilestoneStatus.COMPLETED
                      ? `Paid on ${formatDate(milestone.completedDate!)}`
                      : daysUntilDue <= 0
                        ? "Overdue"
                        : `Due in ${daysUntilDue} days`
                    }
                  </p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-neutral-700 mr-1">Status:</span>
                  <span className={`text-xs inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${getStatusBadgeColor(milestone.status)}`}>
                    {getStatusLabel(milestone.status)}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {milestone.status === MilestoneStatus.READY_FOR_PAYMENT && (
                    <Button size="sm" variant="default">Process Payment</Button>
                  )}
                  {milestone.status === MilestoneStatus.PENDING_REVIEW && (
                    <Button size="sm" variant="outline">Review Work</Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Payments | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-neutral-900">Payments</h1>
                <p className="mt-1 text-sm text-neutral-600">Manage contract payments and transactions</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-neutral-900">{formatCurrency(1500 + 2500 + 800)}</h3>
                      <p className="text-sm text-neutral-500">Pending Payments</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-neutral-900">{formatCurrency(1250 + 950)}</h3>
                      <p className="text-sm text-neutral-500">Completed Payments</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-neutral-900">3</h3>
                      <p className="text-sm text-neutral-500">Pending Approvals</p>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <h3 className="text-lg font-medium text-neutral-900">7 days</h3>
                      <p className="text-sm text-neutral-500">Average Payment Time</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader className="p-0">
                  <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                      <TabsTrigger
                        value="all"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        All ({allPayments.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Pending ({pendingPayments.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="upcoming"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Upcoming ({upcomingPayments.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Completed ({completedPayments.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="p-6">
                      {renderPaymentsList(allPayments)}
                    </TabsContent>
                    
                    <TabsContent value="pending" className="p-6">
                      {renderPaymentsList(pendingPayments)}
                    </TabsContent>
                    
                    <TabsContent value="upcoming" className="p-6">
                      {renderPaymentsList(upcomingPayments)}
                    </TabsContent>
                    
                    <TabsContent value="completed" className="p-6">
                      {renderPaymentsList(completedPayments)}
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
