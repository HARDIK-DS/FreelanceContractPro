import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Contracts from "@/pages/contracts";
import NewContract from "@/pages/contracts/new";
import Payments from "@/pages/payments";
import Templates from "@/pages/templates";
import Home from "@/pages/home";
import { useAuth } from "@/lib/auth";

function Router() {
  const { user, isLoading } = useAuth();

  // If auth is loading, don't render routes yet
  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>;
  }

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/contracts" component={Contracts} />
      <Route path="/contracts/new" component={NewContract} />
      <Route path="/payments" component={Payments} />
      <Route path="/templates" component={Templates} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
