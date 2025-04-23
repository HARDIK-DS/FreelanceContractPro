import { Helmet } from "react-helmet";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import DashboardStats from "@/components/dashboard/stats";
import ActiveContracts from "@/components/dashboard/active-contracts";
import UpcomingPayments from "@/components/dashboard/upcoming-payments";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  return (
    <>
      <Helmet>
        <title>Dashboard | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {/* Dashboard Header */}
            <div className="px-4 sm:px-0 mb-6">
              <h1 className="text-2xl font-semibold text-neutral-900">Your Dashboard</h1>
              <p className="mt-1 text-sm text-neutral-600">Manage your contracts and payments in one place</p>
            </div>
            
            {/* Dashboard Stats */}
            <div className="px-4 sm:px-0">
              <DashboardStats />
            </div>
            
            {/* Recent Contracts and Upcoming Milestones */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 sm:px-0">
              {/* Active Contracts */}
              <div className="lg:col-span-2">
                <ActiveContracts />
              </div>
              
              {/* Upcoming Payments */}
              <div className="lg:col-span-1">
                <UpcomingPayments />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
