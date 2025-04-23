import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Contract, ContractStatus } from "@shared/schema";
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/contracts";
import { PlusIcon, UserCircleIcon, CalendarIcon } from "lucide-react";
import ContractDetail from "@/components/contracts/contract-detail";

export default function ActiveContracts() {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  
  const { data: contracts, isLoading } = useQuery<Contract[]>({
    queryKey: ['/api/contracts', `userId=${user?.id}`, `userType=${user?.userType}`]
  });
  
  const handleContractClick = (contract: Contract) => {
    setSelectedContract(contract);
  };
  
  const closeContractDetail = () => {
    setSelectedContract(null);
  };
  
  const activeContracts = contracts?.filter(
    contract => contract.status === ContractStatus.ACTIVE
  ) || [];
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex items-center justify-between px-4 py-5 sm:px-6">
          <h2 className="text-lg font-medium text-neutral-900">Active Contracts</h2>
          <Link href="/contracts">
            <a className="text-sm font-medium text-primary hover:text-primary-dark">View all</a>
          </Link>
        </CardHeader>
        <div className="border-t border-neutral-200 flex-grow">
          {isLoading ? (
            <div className="animate-pulse p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded"></div>
              ))}
            </div>
          ) : activeContracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12">
              <p className="text-neutral-500 mb-4">No active contracts found</p>
              <Link href="/contracts">
                <Button variant="outline">Create your first contract</Button>
              </Link>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-neutral-200">
              {activeContracts.map((contract) => (
                <li key={contract.id}>
                  <a 
                    className="block hover:bg-neutral-50 cursor-pointer" 
                    onClick={() => handleContractClick(contract)}
                  >
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-primary truncate">{contract.title}</p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(contract.status)}`}>
                              {contract.status === ContractStatus.ACTIVE ? "In Progress" : contract.status}
                            </span>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <p className="text-sm text-neutral-700 font-medium">{formatCurrency(contract.totalAmount)}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-neutral-500">
                            <UserCircleIcon className="flex-shrink-0 mr-1.5 text-neutral-400 h-4 w-4" />
                            <span>{user?.userType === 'freelancer' ? `Client #${contract.clientId}` : `Freelancer #${contract.freelancerId}`}</span>
                          </p>
                          <p className="mt-2 flex items-center text-sm text-neutral-500 sm:mt-0 sm:ml-6">
                            <CalendarIcon className="flex-shrink-0 mr-1.5 text-neutral-400 h-4 w-4" />
                            <span>Due {formatDate(contract.endDate)}</span>
                          </p>
                        </div>
                        <div className="flex items-center text-sm text-neutral-500">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-600 mr-1"></span>
                          2/4 milestones complete
                        </div>
                      </div>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        <CardFooter className="border-t border-neutral-200 px-4 py-4 sm:px-6">
          <Link href="/contracts/new">
            <Button className="w-full">
              <PlusIcon className="mr-2 h-4 w-4" /> Create New Contract
            </Button>
          </Link>
        </CardFooter>
      </Card>
      
      {selectedContract && (
        <ContractDetail 
          isOpen={Boolean(selectedContract)} 
          onClose={closeContractDetail} 
          contractId={selectedContract.id} 
        />
      )}
    </>
  );
}
