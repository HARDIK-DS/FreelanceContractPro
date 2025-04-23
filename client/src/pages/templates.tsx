import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Redirect } from "wouter";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Template } from "@shared/schema";
import { PlusIcon, FileTextIcon, CopyIcon, SearchIcon } from "lucide-react";

// Sample templates for demonstration
const sampleTemplates: Template[] = [
  {
    id: 1,
    userId: 1,
    title: "Web Development Contract",
    description: "Standard contract for web development projects",
    content: "This is a comprehensive web development contract template...",
    isPublic: true,
  },
  {
    id: 2,
    userId: 1,
    title: "Graphic Design Agreement",
    description: "Agreement for logo and brand identity work",
    content: "This agreement outlines the terms for graphic design services...",
    isPublic: true,
  },
  {
    id: 3,
    userId: 1,
    title: "Content Writing Contract",
    description: "Contract for blog and copywriting services",
    content: "This contract covers the scope of content writing services...",
    isPublic: false,
  },
  {
    id: 4,
    userId: 2,
    title: "Mobile App Development",
    description: "Contract for iOS and Android app development",
    content: "This contract outlines the development of mobile applications...",
    isPublic: true,
  },
  {
    id: 5,
    userId: 1,
    title: "Marketing Consultation",
    description: "Marketing strategy and consultation agreement",
    content: "This agreement covers marketing consultation services...",
    isPublic: false,
  },
];

export default function Templates() {
  const { user, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }
  
  // Filter templates based on search term and tab
  const filterTemplates = (templates: Template[], isMyTemplates: boolean) => {
    let filtered = templates;
    
    if (isMyTemplates) {
      filtered = filtered.filter(template => template.userId === user.id);
    } else {
      filtered = filtered.filter(template => template.isPublic);
    }
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(term) || 
        template.description.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  };
  
  const myTemplates = filterTemplates(sampleTemplates, true);
  const publicTemplates = filterTemplates(sampleTemplates, false);
  
  const handleViewTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsViewModalOpen(true);
  };
  
  const handleCreateTemplate = () => {
    setIsCreateModalOpen(true);
  };
  
  const renderTemplateGrid = (templates: Template[]) => {
    if (!templates.length) {
      return (
        <div className="text-center py-12">
          <p className="text-neutral-500 mb-4">No templates found</p>
          <Button onClick={handleCreateTemplate}>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Template
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map(template => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="rounded-full p-2 bg-primary/10">
                <FileTextIcon className="h-4 w-4 text-primary" />
              </div>
              {template.isPublic && (
                <span className="text-xs bg-blue-100 text-blue-800 rounded-full px-2 py-1">
                  Public
                </span>
              )}
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg truncate">{template.title}</h3>
              <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{template.description}</p>
            </CardContent>
            <CardFooter className="mt-auto pt-4">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleViewTemplate(template)}
              >
                View Template
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  return (
    <>
      <Helmet>
        <title>Contract Templates | ContractPay</title>
      </Helmet>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 sm:px-0">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-neutral-900">Contract Templates</h1>
                  <p className="mt-1 text-sm text-neutral-600">Create and manage reusable contract templates</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Button onClick={handleCreateTemplate}>
                    <PlusIcon className="mr-2 h-4 w-4" />
                    New Template
                  </Button>
                </div>
              </div>
              
              <div className="mb-6">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-4 w-4" />
                  <Input
                    placeholder="Search templates..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <Tabs defaultValue="my-templates" className="w-full">
                <TabsList className="w-full max-w-md mx-auto mb-6">
                  <TabsTrigger value="my-templates" className="flex-1">
                    My Templates ({myTemplates.length})
                  </TabsTrigger>
                  <TabsTrigger value="public-templates" className="flex-1">
                    Public Templates ({publicTemplates.length})
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="my-templates" className="mt-6">
                  {renderTemplateGrid(myTemplates)}
                </TabsContent>
                
                <TabsContent value="public-templates" className="mt-6">
                  {renderTemplateGrid(publicTemplates)}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
        <Footer />
        
        {/* View Template Dialog */}
        {selectedTemplate && (
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>{selectedTemplate.title}</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Description</h4>
                  <p className="text-neutral-900">{selectedTemplate.description}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-neutral-500 mb-1">Template Content</h4>
                  <div className="border rounded-md p-4 bg-neutral-50 max-h-96 overflow-y-auto">
                    <p className="whitespace-pre-line text-neutral-900">{selectedTemplate.content}</p>
                  </div>
                </div>
              </div>
              <DialogFooter className="sm:justify-between">
                <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                  Close
                </Button>
                <div className="flex gap-3">
                  <Button variant="outline">
                    <CopyIcon className="h-4 w-4 mr-2" /> Copy to Clipboard
                  </Button>
                  <Button>
                    Use Template
                  </Button>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
        {/* Create Template Dialog */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
            </DialogHeader>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="template-title" className="block text-sm font-medium text-neutral-700 mb-1">
                  Template Title
                </label>
                <Input id="template-title" placeholder="e.g. Web Development Contract" />
              </div>
              <div>
                <label htmlFor="template-description" className="block text-sm font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <Input id="template-description" placeholder="Brief description of the template" />
              </div>
              <div>
                <label htmlFor="template-content" className="block text-sm font-medium text-neutral-700 mb-1">
                  Template Content
                </label>
                <Textarea 
                  id="template-content" 
                  placeholder="Enter the contract template content here..." 
                  className="min-h-[300px]"
                />
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="is-public" 
                  className="h-4 w-4 text-primary focus:ring-primary border-neutral-300 rounded"
                />
                <label htmlFor="is-public" className="ml-2 block text-sm text-neutral-700">
                  Make this template public
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button>
                Create Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
