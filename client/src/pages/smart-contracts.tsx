import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  CheckCircleIcon,
  CopyIcon,
  ArrowRightIcon,
  LoaderIcon,
  ShieldIcon,
  ExternalLinkIcon,
  AlertTriangleIcon,
  LockIcon,
  BoxIcon, // Using BoxIcon instead of CubeIcon which doesn't exist
} from "lucide-react";

// Create Ethereum icon component since it's not in lucide-react
const EthereumIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="24"
    height="24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2L3 12.2 12 16 21 12.2 12 2z" />
    <path d="M3 12.2L12 22 21 12.2" />
    <path d="M12 16L12 22" />
    <path d="M8 8.5L12 2 16 8.5" />
  </svg>
);

interface Contract {
  id: number;
  title: string;
  clientId: number;
  freelancerId: number;
  status: string;
  totalAmount: number;
}

interface BlockchainContract {
  id: number;
  contractId: number;
  contractAddress: string;
  network: string;
  deployedAt: string;
}

export default function SmartContracts() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("deployments");
  const [selectedContract, setSelectedContract] = useState<number | null>(null);
  
  // Contract data
  const { data: contracts = [], isLoading: contractsLoading } = useQuery({
    queryKey: ['/api/contracts'],
    enabled: !!user
  });
  
  // Blockchain contract data
  const { data: blockchainContracts = [], isLoading: blockchainContractsLoading } = useQuery({
    queryKey: ['/api/blockchain-contracts'],
    enabled: !!user
  });
  
  // Deploy smart contract mutation
  const deployMutation = useMutation({
    mutationFn: async (contractId: number) => {
      return await apiRequest('POST', '/api/blockchain-contracts', { contractId });
    },
    onSuccess: () => {
      toast({
        title: "Smart Contract Deployed",
        description: "The smart contract has been successfully deployed to the blockchain.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/blockchain-contracts'] });
    },
    onError: (error) => {
      toast({
        title: "Deployment Failed",
        description: "Failed to deploy smart contract. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Mock blockchain transactions (in production, this would come from an API)
  const mockTransactions = [
    {
      id: 1,
      type: "deposit",
      txHash: "0x8a5bc17b88156761744a5c5a758182b3423c5277dc3a341df3a9aa4b8d7827c1",
      from: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      amount: "2.5",
      status: "confirmed",
      timestamp: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      type: "milestone",
      txHash: "0x5d7de84557883d65e6e67c8c89cae684082f2da36edcb4b1e9ff0dca2f42b7b0",
      from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      to: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
      amount: "0.8",
      status: "confirmed",
      milestone: "Initial Design Mockups",
      timestamp: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      type: "deposit",
      txHash: "0x3c428d2fc50a41b47c2a6c65cc2a0f73d2e81f8fcbaf63271c5441de18b1dbb5",
      from: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B",
      to: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
      amount: "1.2",
      status: "pending",
      timestamp: new Date(new Date().getTime() - 12 * 60 * 60 * 1000)
    }
  ];
  
  // Mock blockchain contract details (in production, this would come from an API)
  const mockContractDetails = {
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    network: "Ethereum",
    totalDeposited: "3.7",
    totalReleased: "0.8",
    currentBalance: "2.9",
    deployedAt: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
    lastActivity: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
    milestones: [
      {
        id: 1,
        title: "Initial Design Mockups",
        amount: "0.8",
        status: "completed",
        releaseDate: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: 2,
        title: "Frontend Implementation",
        amount: "1.2",
        status: "funded",
        releaseDate: null
      },
      {
        id: 3,
        title: "Backend Integration",
        amount: "1.5",
        status: "pending",
        releaseDate: null
      }
    ]
  };

  // Handle contract deployment
  const handleDeployContract = async (contractId: number) => {
    deployMutation.mutate(contractId);
  };
  
  // Check if a contract has a blockchain deployment
  const hasBlockchainDeployment = (contractId: number) => {
    if (!blockchainContracts) return false;
    return blockchainContracts.some((bc: BlockchainContract) => bc.contractId === contractId);
  };
  
  // Get blockchain contract for a given contract ID
  const getBlockchainContract = (contractId: number) => {
    if (!blockchainContracts) return null;
    return blockchainContracts.find((bc: BlockchainContract) => bc.contractId === contractId);
  };
  
  // Format blockchain address for display
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  const renderDeployments = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Contracts</CardTitle>
            <CardDescription>
              Deploy smart contracts for secure escrow and automated payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {contractsLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoaderIcon className="h-8 w-8 animate-spin text-neutral-400" />
              </div>
            ) : contracts && contracts.length > 0 ? (
              <div className="space-y-4">
                {contracts.map((contract: Contract) => (
                  <div 
                    key={contract.id} 
                    className="border border-neutral-200 rounded-lg p-4 transition-colors hover:bg-neutral-50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{contract.title}</h3>
                        <p className="text-sm text-neutral-500 mt-1">
                          Total Value: ${contract.totalAmount.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        {hasBlockchainDeployment(contract.id) ? (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                            <CheckCircleIcon className="h-3 w-3 mr-1" />
                            Deployed
                          </Badge>
                        ) : (
                          <Button 
                            size="sm" 
                            onClick={() => handleDeployContract(contract.id)}
                            disabled={deployMutation.isPending && selectedContract === contract.id}
                          >
                            {deployMutation.isPending && selectedContract === contract.id ? (
                              <>
                                <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                                Deploying...
                              </>
                            ) : (
                              <>
                                <BoxIcon className="h-4 w-4 mr-2" />
                                Deploy Contract
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {hasBlockchainDeployment(contract.id) && (
                      <div className="mt-4 pt-4 border-t border-neutral-100">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className="flex flex-col">
                              <span className="text-xs text-neutral-500">Contract Address</span>
                              <span className="text-sm font-medium flex items-center">
                                <EthereumIcon className="h-3 w-3 mr-1" />
                                {formatAddress(getBlockchainContract(contract.id)?.contractAddress || '')}
                                <button 
                                  className="ml-1 text-neutral-400 hover:text-neutral-700" 
                                  onClick={() => {
                                    navigator.clipboard.writeText(getBlockchainContract(contract.id)?.contractAddress || '');
                                    toast({
                                      title: "Address Copied",
                                      description: "Contract address copied to clipboard",
                                    });
                                  }}
                                >
                                  <CopyIcon className="h-3 w-3" />
                                </button>
                              </span>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedContract(contract.id)}
                          >
                            <ArrowRightIcon className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-neutral-500">No contracts found.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {selectedContract && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center">
                    <ShieldIcon className="h-5 w-5 mr-2 text-primary" />
                    Smart Contract Details
                  </CardTitle>
                  <CardDescription>
                    Contract #{selectedContract} on {mockContractDetails.network} Network
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/address/${mockContractDetails.address}`, '_blank')}
                >
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  View on Etherscan
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-blue-800">Total Deposited</h3>
                  <p className="text-2xl font-bold text-blue-900 mt-1 flex items-center">
                    <EthereumIcon className="h-5 w-5 mr-1 text-blue-700" />
                    {mockContractDetails.totalDeposited} ETH
                  </p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-green-800">Total Released</h3>
                  <p className="text-2xl font-bold text-green-900 mt-1 flex items-center">
                    <EthereumIcon className="h-5 w-5 mr-1 text-green-700" />
                    {mockContractDetails.totalReleased} ETH
                  </p>
                </div>
                
                <div className="bg-amber-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-amber-800">Current Balance</h3>
                  <p className="text-2xl font-bold text-amber-900 mt-1 flex items-center">
                    <EthereumIcon className="h-5 w-5 mr-1 text-amber-700" />
                    {mockContractDetails.currentBalance} ETH
                  </p>
                </div>
              </div>
              
              <h3 className="font-semibold text-md mb-3">Milestone Status</h3>
              <div className="space-y-3 mb-6">
                {mockContractDetails.milestones.map((milestone, index) => (
                  <div 
                    key={index}
                    className="border border-neutral-200 rounded-lg p-3 flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium text-sm">{milestone.title}</h4>
                      <div className="flex items-center mt-1">
                        <EthereumIcon className="h-3 w-3 mr-1 text-neutral-500" />
                        <span className="text-sm text-neutral-700">{milestone.amount} ETH</span>
                      </div>
                    </div>
                    <div>
                      {milestone.status === 'completed' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Released
                        </Badge>
                      ) : milestone.status === 'funded' ? (
                        <Button size="sm">
                          <LockIcon className="h-3 w-3 mr-1" />
                          Release Payment
                        </Button>
                      ) : (
                        <Badge variant="outline">Pending Funding</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <h3 className="font-semibold text-md mb-3">Contract Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  Deposit Funds
                </Button>
                <Button variant="outline" className="w-full">
                  Create Dispute
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };
  
  const renderTransactions = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blockchain Transactions</CardTitle>
            <CardDescription>
              Track all your contract-related blockchain transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Transaction Hash</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-neutral-500">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="py-3 px-4">
                        <Badge 
                          variant="outline" 
                          className={`${
                            tx.type === 'deposit' 
                              ? 'bg-blue-50 border-blue-200 text-blue-800' 
                              : 'bg-green-50 border-green-200 text-green-800'
                          }`}
                        >
                          {tx.type === 'deposit' ? 'Deposit' : 'Milestone Payment'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <EthereumIcon className="h-3 w-3 mr-1 text-neutral-500" />
                          <span className="font-medium">{tx.amount} ETH</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <span className="text-sm">{formatAddress(tx.txHash)}</span>
                          <button 
                            className="ml-1 text-neutral-400 hover:text-neutral-700" 
                            onClick={() => {
                              navigator.clipboard.writeText(tx.txHash);
                              toast({
                                title: "Copied",
                                description: "Transaction hash copied to clipboard",
                              });
                            }}
                          >
                            <CopyIcon className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {tx.status === 'confirmed' ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircleIcon className="h-4 w-4 mr-1" />
                            Confirmed
                          </span>
                        ) : (
                          <span className="flex items-center text-amber-600">
                            <LoaderIcon className="h-4 w-4 mr-1 animate-spin" />
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-neutral-500">
                        {tx.timestamp.toLocaleDateString()} {tx.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  
  const renderSettings = () => {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Blockchain Settings</CardTitle>
            <CardDescription>
              Configure your blockchain and wallet settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-3">Wallet Connection</h3>
                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="bg-neutral-100">
                    <EthereumIcon className="h-4 w-4 mr-2" />
                    Ethereum
                  </Badge>
                  <span className="text-sm text-neutral-700">Not Connected</span>
                  <Button size="sm" className="ml-auto">
                    Connect Wallet
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Default Network</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-primary rounded-lg p-3 bg-primary/5 flex items-center">
                    <input type="radio" id="ethereum" name="network" className="mr-2" checked readOnly />
                    <label htmlFor="ethereum" className="text-sm font-medium">Ethereum</label>
                  </div>
                  <div className="border border-neutral-200 rounded-lg p-3 flex items-center">
                    <input type="radio" id="polygon" name="network" className="mr-2" />
                    <label htmlFor="polygon" className="text-sm font-medium">Polygon</label>
                  </div>
                  <div className="border border-neutral-200 rounded-lg p-3 flex items-center">
                    <input type="radio" id="arbitrum" name="network" className="mr-2" />
                    <label htmlFor="arbitrum" className="text-sm font-medium">Arbitrum</label>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium mb-3">Gas Settings</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxFee">Max Fee (Gwei)</Label>
                      <Input id="maxFee" type="number" defaultValue="30" />
                    </div>
                    <div>
                      <Label htmlFor="maxPriority">Max Priority Fee (Gwei)</Label>
                      <Input id="maxPriority" type="number" defaultValue="2" />
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start">
                      <AlertTriangleIcon className="h-5 w-5 text-amber-600 mr-2 mt-0.5" />
                      <p className="text-sm text-amber-800">
                        Gas prices affect how quickly your transactions are processed. Higher gas prices mean faster confirmations but more expensive transactions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>Save Settings</Button>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Smart Contracts | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900 flex items-center">
                    <BoxIcon className="h-6 w-6 mr-2 text-primary" />
                    Smart Contracts
                  </h1>
                  <p className="mt-1 text-sm text-neutral-600">Deploy and manage blockchain-based escrow smart contracts</p>
                </div>
              </div>
              
              <Tabs defaultValue="deployments" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="deployments" className="flex items-center">
                    <BoxIcon className="h-4 w-4 mr-2" />
                    Deployments
                  </TabsTrigger>
                  <TabsTrigger value="transactions" className="flex items-center">
                    <ArrowRightIcon className="h-4 w-4 mr-2" />
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center">
                    <ShieldIcon className="h-4 w-4 mr-2" />
                    Settings
                  </TabsTrigger>
                </TabsList>
                <div className="mt-6">
                  <TabsContent value="deployments">
                    {renderDeployments()}
                  </TabsContent>
                  <TabsContent value="transactions">
                    {renderTransactions()}
                  </TabsContent>
                  <TabsContent value="settings">
                    {renderSettings()}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}