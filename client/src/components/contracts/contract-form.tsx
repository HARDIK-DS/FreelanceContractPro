import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { createContract } from "@/lib/contracts";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ContractStatus } from "@shared/schema";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  clientId: z.coerce.number().int().positive("Client ID must be a positive number"),
  freelancerId: z.coerce.number().int().positive("Freelancer ID must be a positive number"),
  totalAmount: z.coerce.number().positive("Amount must be positive"),
  contractType: z.string().min(1, "Contract type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  termsAndConditions: z.string().min(10, "Terms and conditions must be at least 10 characters"),
});

type ContractFormValues = z.infer<typeof formSchema>;

export default function ContractForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<ContractFormValues> = {
    title: "",
    description: "",
    clientId: user?.userType === 'client' ? user.id : 0,
    freelancerId: user?.userType === 'freelancer' ? user.id : 0,
    totalAmount: 0,
    contractType: "Fixed Price",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    termsAndConditions: "",
  };
  
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });
  
  const onSubmit = async (data: ContractFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a contract",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Ensure startDate and endDate are parsed as Date objects
      const contractData = {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: ContractStatus.DRAFT,
      };
      
      await createContract(contractData);
      
      toast({
        title: "Contract created",
        description: "Your contract has been successfully created",
      });
      
      navigate("/contracts");
    } catch (error) {
      console.error("Error creating contract:", error);
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardHeader className="bg-neutral-50 px-4 py-3 border-b">
        <h2 className="text-lg font-medium text-neutral-900">Create New Contract</h2>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
              <h3 className="text-lg font-medium">Contract Details</h3>
              <Separator className="my-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Website Redesign Project" {...field} />
                      </FormControl>
                      <FormDescription>
                        Give your contract a descriptive title
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contractType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contract Type</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Fixed Price, Hourly, etc." {...field} />
                      </FormControl>
                      <FormDescription>
                        Specify the type of contract
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="totalAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Amount ($)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="e.g. 5000" {...field} />
                      </FormControl>
                      <FormDescription>
                        The total contract value
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {user?.userType === 'client' ? (
                  <FormField
                    control={form.control}
                    name="freelancerId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Freelancer ID</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter freelancer ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the ID of the freelancer
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client ID</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter client ID" {...field} />
                        </FormControl>
                        <FormDescription>
                          Enter the ID of the client
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium">Contract Description & Terms</h3>
              <Separator className="my-4" />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of the contract scope" 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="mt-6">
                <FormField
                  control={form.control}
                  name="termsAndConditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Terms and Conditions</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Outline the terms and conditions of this contract" 
                          className="min-h-[120px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Clearly specify payment terms, deliverables, and any other important conditions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="bg-neutral-50 px-4 py-4 border-t flex justify-between">
        <Button variant="outline" onClick={() => navigate("/contracts")}>
          Cancel
        </Button>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={() => form.handleSubmit((data) => onSubmit({ ...data }))()} 
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button 
            onClick={() => form.handleSubmit(onSubmit)()}
            disabled={isSubmitting}
          >
            Create Contract
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
