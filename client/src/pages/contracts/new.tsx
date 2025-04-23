import { Helmet } from "react-helmet";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ContractForm from "@/components/contracts/contract-form";

export default function NewContract() {
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
        <title>Create New Contract | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0 mb-6">
              <h1 className="text-2xl font-semibold text-neutral-900">Create New Contract</h1>
              <p className="mt-1 text-sm text-neutral-600">Create a contract to define terms and milestones</p>
            </div>
            
            <div className="px-4 sm:px-0">
              <ContractForm />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
