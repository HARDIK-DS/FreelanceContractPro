import { Milestone, MilestoneStatus } from "@shared/schema";
import { formatCurrency, formatDate, getStatusBadgeColor } from "@/lib/contracts";

interface MilestoneItemProps {
  milestone: Milestone;
}

export default function MilestoneItem({ milestone }: MilestoneItemProps) {
  const getStatusLabel = (status: MilestoneStatus): string => {
    switch(status) {
      case MilestoneStatus.NOT_STARTED:
        return "Not Started";
      case MilestoneStatus.IN_PROGRESS:
        return "In Progress";
      case MilestoneStatus.PENDING_REVIEW:
        return "Pending Review";
      case MilestoneStatus.READY_FOR_PAYMENT:
        return "Ready for Payment";
      case MilestoneStatus.COMPLETED:
        return "Completed";
      default:
        return status;
    }
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-start">
        <div>
          <h5 className="text-sm font-medium text-neutral-900">{milestone.title}</h5>
          <p className="text-xs text-neutral-500 mt-1">{milestone.description}</p>
        </div>
        <span className="text-sm font-medium text-neutral-900">{formatCurrency(milestone.amount)}</span>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(milestone.status)}`}>
          {getStatusLabel(milestone.status)}
        </span>
        <span className="text-xs text-neutral-500">
          {milestone.status === MilestoneStatus.COMPLETED 
            ? `Completed: ${formatDate(milestone.completedDate || new Date())}`
            : `Due: ${formatDate(milestone.dueDate)}`
          }
        </span>
      </div>
    </div>
  );
}
