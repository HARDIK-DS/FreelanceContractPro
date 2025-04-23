import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/contracts";
import { Link, Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ContractDetail from "@/components/contracts/contract-detail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Contract, ContractStatus } from "@shared/schema";

export default function Contracts() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  const { data: contracts, isLoading: contractsLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts', `userId=${user?.id}`, `userType=${user?.userType}`],
    enabled: !!user,
  });
  
  const isLoading = authLoading || contractsLoading;
  
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  const filterContracts = (status?: ContractStatus) => {
    if (!contracts) return [];
    
    let filtered = contracts;
    
    if (status) {
      filtered = filtered.filter(contract => contract.status === status);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(contract => 
        contract.title.toLowerCase().includes(term) || 
        contract.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };
  
  const activeContracts = filterContracts(ContractStatus.ACTIVE);
  const pendingContracts = filterContracts(ContractStatus.PENDING);
  const draftContracts = filterContracts(ContractStatus.DRAFT);
  const completedContracts = filterContracts(ContractStatus.COMPLETED);
  const allContracts = filterContracts();
  
  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract);
  };
  
  const closeContractDetail = () => {
    setSelectedContract(null);
  };
  
  const getStatusLabel = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const renderContractList = (contractList: Contract[]) => {
    if (isLoading) {
      return (
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      );
    }
    
    if (!contractList.length) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">No contracts found</p>
          <Link href="/contracts/new">
            <Button>
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Contract
            </Button>
          </Link>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {contractList.map(contract => (
          <Card key={contract.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleContractClick(contract)}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-medium text-primary">{contract.title}</h3>
                  <p className="text-sm text-neutral-500 mt-1 line-clamp-2">{contract.description}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(contract.status)}`}>
                    {getStatusLabel(contract.status)}
                  </span>
                  <p className="text-sm font-medium text-neutral-900 mt-1">{formatCurrency(contract.totalAmount)}</p>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-neutral-500">
                <div>
                  {user.userType === 'freelancer' ? (
                    <span>Client #{contract.clientId}</span>
                  ) : (
                    <span>Freelancer #{contract.freelancerId}</span>
                  )}
                </div>
                <div>Due {formatDate(contract.endDate)}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Contracts | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900">Contracts</h1>
                  <p className="mt-1 text-sm text-neutral-600">Manage your contract agreements</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Link href="/contracts/new">
                    <Button>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Contract
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <Input
                    placeholder="Search contracts..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Card>
                <CardHeader className="p-0">
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                      <TabsTrigger
                        value="all"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        All ({allContracts.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="active"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Active ({activeContracts.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="pending"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Pending ({pendingContracts.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="draft"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Draft ({draftContracts.length})
                      </TabsTrigger>
                      <TabsTrigger
                        value="completed"
                        className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                      >
                        Completed ({completedContracts.length})
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="all" className="p-6">
                      {renderContractList(allContracts)}
                    </TabsContent>
                    
                    <TabsContent value="active" className="p-6">
                      {renderContractList(activeContracts)}
                    </TabsContent>
                    
                    <TabsContent value="pending" className="p-6">
                      {renderContractList(pendingContracts)}
                    </TabsContent>
                    
                    <TabsContent value="draft" className="p-6">
                      {renderContractList(draftContracts)}
                    </TabsContent>
                    
                    <TabsContent value="completed" className="p-6">
                      {renderContractList(completedContracts)}
                    </TabsContent>
                  </Tabs>
                </CardHeader>
              </Card>
            </div>
          </div>
        </main>
        <Footer />
        
        {selectedContract && (
          <ContractDetail 
            isOpen={Boolean(selectedContract)} 
            onClose={closeContractDetail} 
            contractId={selectedContract.id} 
          />
        )}
      </div>
    </>
  );
}
