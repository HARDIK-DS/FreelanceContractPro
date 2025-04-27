import { jsPDF } from "jspdf";
import { Contract, Milestone, User, EscrowPayment } from '@shared/schema';

/**
 * Generate an invoice for completed milestones
 * @param contract The contract for which to generate an invoice
 * @param milestones Completed milestones to include in the invoice
 * @param client Client information
 * @param freelancer Freelancer information
 * @param payments Associated escrow payments
 * @returns Base64 encoded PDF invoice
 */
export async function generateInvoice(
  contract: Contract,
  milestones: Milestone[],
  client: User,
  freelancer: User,
  payments: EscrowPayment[]
): Promise<string> {
  try {
    // Create a new PDF document
    const doc = new jsPDF();
    
    // Add company/platform logo and header
    doc.setFontSize(20);
    doc.text("SmartFlow Invoice", 105, 15, { align: "center" });
    
    // Add invoice number and date
    doc.setFontSize(10);
    const invoiceNumber = `INV-${Date.now().toString().substring(0, 10)}`;
    const today = new Date().toLocaleDateString();
    doc.text(`Invoice Number: ${invoiceNumber}`, 150, 30, { align: "right" });
    doc.text(`Date: ${today}`, 150, 35, { align: "right" });
    
    // Add freelancer information
    doc.setFontSize(12);
    doc.text("From:", 20, 50);
    doc.setFontSize(10);
    doc.text(`${freelancer.fullName}`, 20, 55);
    doc.text(`ID: ${freelancer.id}`, 20, 60);
    doc.text(`Email: ${freelancer.email}`, 20, 65);
    
    // Add client information
    doc.setFontSize(12);
    doc.text("To:", 20, 80);
    doc.setFontSize(10);
    doc.text(`${client.fullName}`, 20, 85);
    doc.text(`ID: ${client.id}`, 20, 90);
    doc.text(`Email: ${client.email}`, 20, 95);
    
    // Add contract information
    doc.setFontSize(12);
    doc.text("Contract Details:", 20, 110);
    doc.setFontSize(10);
    doc.text(`Contract ID: ${contract.id}`, 20, 115);
    doc.text(`Contract Title: ${contract.title}`, 20, 120);
    doc.text(`Contract Type: ${contract.contractType}`, 20, 125);
    doc.text(`Start Date: ${new Date(contract.startDate).toLocaleDateString()}`, 20, 130);
    doc.text(`End Date: ${new Date(contract.endDate).toLocaleDateString()}`, 20, 135);
    
    // Add milestone table header
    doc.setFillColor(240, 240, 240);
    doc.rect(20, 145, 170, 8, "F");
    doc.setFontSize(10);
    doc.text("Milestone", 25, 150);
    doc.text("Description", 60, 150);
    doc.text("Completion Date", 110, 150);
    doc.text("Amount", 160, 150, { align: "right" });
    
    // Add milestone details
    let y = 158;
    let total = 0;
    
    milestones.forEach((milestone, index) => {
      // Alternate row colors for readability
      if (index % 2 === 1) {
        doc.setFillColor(245, 245, 245);
        doc.rect(20, y - 5, 170, 8, "F");
      }
      
      doc.text(`#${milestone.id}`, 25, y);
      
      // Handle long descriptions with wrapping
      const description = milestone.title.length > 25 
        ? `${milestone.title.substring(0, 22)}...` 
        : milestone.title;
      
      doc.text(description, 60, y);
      
      const completionDate = milestone.completedDate 
        ? new Date(milestone.completedDate).toLocaleDateString() 
        : "Not completed";
      
      doc.text(completionDate, 110, y);
      doc.text(`$${milestone.amount.toFixed(2)}`, 160, y, { align: "right" });
      
      total += milestone.amount;
      y += 10;
    });
    
    // Add total
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(12);
    doc.text("Total Amount:", 120, y);
    doc.text(`$${total.toFixed(2)}`, 160, y, { align: "right" });
    
    // Add payment information
    y += 20;
    doc.setFontSize(12);
    doc.text("Payment Information:", 20, y);
    y += 8;
    doc.setFontSize(10);
    
    payments.forEach(payment => {
      doc.text(`Payment ID: ${payment.id}`, 20, y);
      doc.text(`Method: ${payment.paymentMethod}`, 80, y);
      
      const depositDate = payment.depositedAt 
        ? new Date(payment.depositedAt).toLocaleDateString() 
        : "Not deposited";
      
      const releaseDate = payment.releasedAt 
        ? new Date(payment.releasedAt).toLocaleDateString() 
        : "Not released";
      
      doc.text(`Deposited: ${depositDate}`, 120, y);
      y += 5;
      doc.text(`Released: ${releaseDate}`, 120, y);
      y += 10;
    });
    
    // Add footer with tax information
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        "This document serves as an official receipt of payment for services rendered as detailed above.",
        105, 280, { align: "center" }
      );
      doc.text(`Page ${i} of ${pageCount}`, 105, 285, { align: "center" });
    }
    
    // Return the PDF as base64 string
    return doc.output('datauristring');
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Failed to generate invoice');
  }
}

/**
 * Generate earnings insights report
 * @param freelancerId Freelancer ID to generate insights for
 * @param startDate Start date for the report period
 * @param endDate End date for the report period
 * @param contracts Completed contracts in the period
 * @param milestones Completed milestones in the period
 * @returns Earnings insights object
 */
export function generateEarningsInsights(
  freelancerId: number,
  startDate: Date,
  endDate: Date,
  contracts: Contract[],
  milestones: Milestone[]
): {
  totalEarned: number;
  averagePerContract: number;
  monthlyBreakdown: Array<{ month: string; earned: number }>;
  contractTypeBreakdown: Array<{ type: string; count: number; totalValue: number }>;
  taxEstimate: {
    estimatedTaxableIncome: number;
    estimatedTaxDue: number; // Very simplified calculation
  };
  performanceMetrics: {
    averageContractValue: number;
    contractsCompleted: number;
    milestonesCompleted: number;
    averageMilestoneValue: number;
  };
} {
  // Filter milestones to include only those completed in the date range
  const periodMilestones = milestones.filter(milestone => {
    if (!milestone.completedDate) return false;
    const completionDate = new Date(milestone.completedDate);
    return completionDate >= startDate && completionDate <= endDate;
  });
  
  // Calculate total earned
  const totalEarned = periodMilestones.reduce((sum, milestone) => sum + milestone.amount, 0);
  
  // Calculate average per contract
  const contractIds = new Set(periodMilestones.map(m => m.contractId));
  const averagePerContract = contractIds.size > 0 ? totalEarned / contractIds.size : 0;
  
  // Generate monthly breakdown
  const monthlyData: Record<string, number> = {};
  periodMilestones.forEach(milestone => {
    if (!milestone.completedDate) return;
    
    const date = new Date(milestone.completedDate);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = 0;
    }
    
    monthlyData[monthYear] += milestone.amount;
  });
  
  const monthlyBreakdown = Object.entries(monthlyData).map(([month, earned]) => ({
    month,
    earned
  })).sort((a, b) => a.month.localeCompare(b.month));
  
  // Generate contract type breakdown
  const contractTypeData: Record<string, { count: number; totalValue: number }> = {};
  
  for (const contract of contracts) {
    const type = contract.contractType;
    
    if (!contractTypeData[type]) {
      contractTypeData[type] = { count: 0, totalValue: 0 };
    }
    
    contractTypeData[type].count += 1;
    
    // Sum the milestone amounts for this contract
    const contractMilestones = periodMilestones.filter(m => m.contractId === contract.id);
    const contractValue = contractMilestones.reduce((sum, m) => sum + m.amount, 0);
    
    contractTypeData[type].totalValue += contractValue;
  }
  
  const contractTypeBreakdown = Object.entries(contractTypeData).map(([type, data]) => ({
    type,
    count: data.count,
    totalValue: data.totalValue
  }));
  
  // Simple tax estimation (very simplified, not financial advice)
  const estimatedTaxableIncome = totalEarned * 0.8; // Assuming 20% deductible expenses
  const estimatedTaxDue = estimatedTaxableIncome * 0.25; // Simple 25% tax rate assumption
  
  // Performance metrics
  const performanceMetrics = {
    averageContractValue: averagePerContract,
    contractsCompleted: contractIds.size,
    milestonesCompleted: periodMilestones.length,
    averageMilestoneValue: periodMilestones.length > 0 
      ? totalEarned / periodMilestones.length 
      : 0
  };
  
  return {
    totalEarned,
    averagePerContract,
    monthlyBreakdown,
    contractTypeBreakdown,
    taxEstimate: {
      estimatedTaxableIncome,
      estimatedTaxDue
    },
    performanceMetrics
  };
}