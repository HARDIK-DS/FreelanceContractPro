import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Contract, Milestone, MilestoneStatus } from "@shared/schema";
import { formatCurrency, getStatusBadgeColor } from "@/lib/contracts";

type UpcomingPayment = {
  id: number;
  title: string;
  clientName: string;
  amount: number;
  dueInDays: number;
  status: MilestoneStatus;
};

export default function UpcomingPayments() {
  const { user } = useAuth();
  
  const { data: contracts, isLoading: isLoadingContracts } = useQuery<Contract[]>({
    queryKey: ['/api/contracts', `userId=${user?.id}`, `userType=${user?.userType}`]
  });
  
  // Simulating upcoming payments from milestones
  // In a real app, you would have a dedicated endpoint for this
  const upcomingPayments: UpcomingPayment[] = [
    {
      id: 1,
      title: "Website Redesign - Milestone 3",
      clientName: "Acme Corporation",
      amount: 1500,
      dueInDays: 5,
      status: MilestoneStatus.PENDING_REVIEW,
    },
    {
      id: 2,
      title: "Mobile App - Milestone 2",
      clientName: "TechStart Inc.",
      amount: 2500,
      dueInDays: 12,
      status: MilestoneStatus.NOT_STARTED,
    },
    {
      id: 3,
      title: "Content Strategy - Milestone 4",
      clientName: "GlobalMarket Ltd.",
      amount: 800,
      dueInDays: 3,
      status: MilestoneStatus.READY_FOR_PAYMENT,
    }
  ];
  
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
        return "Completed";
      default:
        return status;
    }
  };
  
  if (isLoadingContracts) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="px-4 py-5 sm:px-6">
        <h2 className="text-lg font-medium text-neutral-900">Upcoming Payments</h2>
      </CardHeader>
      <div className="border-t border-neutral-200 flex-1">
        <ul role="list" className="divide-y divide-neutral-200">
          {upcomingPayments.map((payment) => (
            <li key={payment.id} className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-neutral-900">{payment.title}</p>
                  <p className="text-sm text-neutral-500">{payment.clientName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-neutral-900">{formatCurrency(payment.amount)}</p>
                  <p className="text-xs text-neutral-500">Due in {payment.dueInDays} days</p>
                </div>
              </div>
              <div className="mt-2">
                <div className="flex items-center">
                  <span className="text-xs font-medium text-neutral-700">Status:</span>
                  <span className={`ml-1 text-xs inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${getStatusBadgeColor(payment.status)}`}>
                    {getStatusLabel(payment.status)}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-neutral-200 px-4 py-4 mt-auto">
        <Link href="/payments">
          <a className="block text-center text-sm font-medium text-primary hover:text-primary-dark">
            View all upcoming payments
          </a>
        </Link>
      </div>
    </Card>
  );
}
