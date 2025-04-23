import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { formatCurrency } from "@/lib/contracts";
import { ArrowUpIcon, PlusIcon, ClockIcon } from "lucide-react";

type StatsData = {
  activeContracts: number;
  pendingPayments: number;
  totalEarned: number;
  templateCount: number;
};

export default function DashboardStats() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery<StatsData>({
    queryKey: ['/api/stats', `userId=${user?.id}`]
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 h-32" />
          </Card>
        ))}
      </div>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  const formatPercentage = (value: number) => `${value}%`;
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-neutral-500 truncate">Active Contracts</dt>
          <dd className="mt-1 text-3xl font-semibold text-neutral-900">{stats.activeContracts}</dd>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              {formatPercentage(12)}
            </span>
            <span className="text-neutral-500 ml-2">from last month</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-neutral-500 truncate">Pending Payments</dt>
          <dd className="mt-1 text-3xl font-semibold text-neutral-900">{formatCurrency(stats.pendingPayments)}</dd>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-yellow-600 flex items-center">
              <ClockIcon className="mr-1 h-4 w-4" />
              3 milestones
            </span>
            <span className="text-neutral-500 ml-2">due this week</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-neutral-500 truncate">Total Earned</dt>
          <dd className="mt-1 text-3xl font-semibold text-neutral-900">{formatCurrency(stats.totalEarned)}</dd>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-green-600 flex items-center">
              <ArrowUpIcon className="mr-1 h-4 w-4" />
              {formatPercentage(18)}
            </span>
            <span className="text-neutral-500 ml-2">from last quarter</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-neutral-500 truncate">Contract Templates</dt>
          <dd className="mt-1 text-3xl font-semibold text-neutral-900">{stats.templateCount}</dd>
          <div className="mt-2 flex items-center text-sm">
            <span className="text-primary flex items-center cursor-pointer">
              <PlusIcon className="mr-1 h-4 w-4" />
              Create new
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
