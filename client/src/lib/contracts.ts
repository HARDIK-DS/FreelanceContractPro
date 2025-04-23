import { Contract, InsertContract, Milestone, InsertMilestone, ContractStatus, MilestoneStatus } from "@shared/schema";
import { apiRequest } from "./queryClient";
import { queryClient } from "./queryClient";

// Contract API functions
export async function createContract(contractData: InsertContract): Promise<Contract> {
  const res = await apiRequest("POST", "/api/contracts", contractData);
  const contract = await res.json();
  queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
  return contract;
}

export async function updateContractStatus(id: number, status: ContractStatus): Promise<Contract> {
  const res = await apiRequest("PATCH", `/api/contracts/${id}/status`, { status });
  const contract = await res.json();
  queryClient.invalidateQueries({ queryKey: ['/api/contracts'] });
  queryClient.invalidateQueries({ queryKey: ['/api/contracts', id.toString()] });
  return contract;
}

// Milestone API functions
export async function createMilestone(milestoneData: InsertMilestone): Promise<Milestone> {
  const res = await apiRequest("POST", "/api/milestones", milestoneData);
  const milestone = await res.json();
  queryClient.invalidateQueries({ queryKey: ['/api/contracts', milestone.contractId.toString(), 'milestones'] });
  return milestone;
}

export async function updateMilestoneStatus(id: number, status: MilestoneStatus): Promise<Milestone> {
  const res = await apiRequest("PATCH", `/api/milestones/${id}/status`, { status });
  const milestone = await res.json();
  queryClient.invalidateQueries({ queryKey: ['/api/contracts', milestone.contractId.toString(), 'milestones'] });
  return milestone;
}

export async function completeMilestone(id: number): Promise<Milestone> {
  const res = await apiRequest("POST", `/api/milestones/${id}/complete`);
  const milestone = await res.json();
  queryClient.invalidateQueries({ queryKey: ['/api/contracts', milestone.contractId.toString(), 'milestones'] });
  queryClient.invalidateQueries({ queryKey: ['/api/stats'] });
  return milestone;
}

// Format currency helper function
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date helper function
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Get contract progress percentage
export function getContractProgress(milestones: Milestone[]): number {
  if (!milestones.length) return 0;
  
  const completedCount = milestones.filter(m => 
    m.status === MilestoneStatus.COMPLETED
  ).length;
  
  return Math.round((completedCount / milestones.length) * 100);
}

// Get status badge color based on status
export function getStatusBadgeColor(status: ContractStatus | MilestoneStatus): string {
  switch(status) {
    case ContractStatus.ACTIVE:
    case MilestoneStatus.IN_PROGRESS:
      return "bg-green-100 text-green-800";
    case ContractStatus.PENDING:
    case MilestoneStatus.PENDING_REVIEW:
      return "bg-yellow-100 text-yellow-800";
    case ContractStatus.COMPLETED:
    case MilestoneStatus.COMPLETED:
      return "bg-blue-100 text-blue-800";
    case ContractStatus.CANCELLED:
      return "bg-red-100 text-red-800";
    case MilestoneStatus.READY_FOR_PAYMENT:
      return "bg-purple-100 text-purple-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}
