import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Contract, Milestone, ContractStatus, MilestoneStatus } from "@shared/schema";
import { formatCurrency, formatDate, getContractProgress, getStatusBadgeColor } from "@/lib/contracts";
import MilestoneItem from "./milestone-item";
import { FileIcon, InfoIcon, MessageSquareIcon, EditIcon } from "lucide-react";

interface ContractDetailProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: number;
}

export default function ContractDetail({ isOpen, onClose, contractId }: ContractDetailProps) {
  const { data: contract, isLoading: isLoadingContract } = useQuery<Contract>({
    queryKey: ['/api/contracts', contractId.toString()],
    enabled: isOpen,
  });
  
  const { data: milestones, isLoading: isLoadingMilestones } = useQuery<Milestone[]>({
    queryKey: ['/api/contracts', contractId.toString(), 'milestones'],
    enabled: isOpen,
  });
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);
  
  const isLoading = isLoadingContract || isLoadingMilestones;
  
  const progress = milestones ? getContractProgress(milestones) : 0;
  
  const getStatusLabel = (status: ContractStatus) => {
    switch (status) {
      case ContractStatus.ACTIVE:
        return "In Progress";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          {isLoading ? (
            <Skeleton className="h-7 w-3/4" />
          ) : (
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-medium">{contract?.title}</DialogTitle>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(contract?.status || ContractStatus.DRAFT)}`}>
                {getStatusLabel(contract?.status || ContractStatus.DRAFT)}
              </span>
            </div>
          )}
        </DialogHeader>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b">
                    <h4 className="text-sm font-medium text-neutral-900">Contract Details</h4>
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Client</p>
                      <p className="text-sm text-neutral-900">Client #{contract?.clientId}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Contract Value</p>
                      <p className="text-sm text-neutral-900">{formatCurrency(contract?.totalAmount || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Start Date</p>
                      <p className="text-sm text-neutral-900">{formatDate(contract?.startDate || new Date())}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">End Date</p>
                      <p className="text-sm text-neutral-900">{formatDate(contract?.endDate || new Date())}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-500">Contract Type</p>
                      <p className="text-sm text-neutral-900">{contract?.contractType}</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 border rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b">
                    <h4 className="text-sm font-medium text-neutral-900">Contract Terms</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-neutral-700">
                      {contract?.description}
                    </p>
                    <div className="mt-3">
                      <Button variant="link" className="p-0 h-auto">
                        <FileIcon className="h-4 w-4 mr-1" />
                        View full contract
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-3 border-b">
                    <h4 className="text-sm font-medium text-neutral-900">Payment Milestones</h4>
                  </div>
                  <div className="divide-y divide-neutral-200">
                    {milestones && milestones.length > 0 ? (
                      milestones.map((milestone) => (
                        <MilestoneItem key={milestone.id} milestone={milestone} />
                      ))
                    ) : (
                      <div className="p-4 text-center text-neutral-500">
                        No milestones found for this contract
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between">
                  <span className="inline-flex items-center text-sm">
                    <InfoIcon className="text-neutral-400 mr-1 h-4 w-4" />
                    <span className="text-neutral-500">Progress</span>
                  </span>
                  <span className="text-sm font-medium text-neutral-900">{progress}% Complete</span>
                </div>
                <div className="mt-2 w-full bg-neutral-200 rounded-full h-2.5">
                  <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <div className="flex gap-3">
            <Button variant="outline">
              <MessageSquareIcon className="h-4 w-4 mr-2" /> Message Client
            </Button>
            <Button>
              <EditIcon className="h-4 w-4 mr-2" /> Request Milestone Review
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
