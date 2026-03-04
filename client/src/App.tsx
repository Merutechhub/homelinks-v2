import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import Discover from "@/pages/Discover";
import BudgetBite from "@/pages/BudgetBite";
import AppLayout from "@/components/layout/AppLayout";

// Placeholder pages for the rest
const PlaceholderPage = ({ title }: { title: string }) => (
  <AppLayout>
    <div className="flex items-center justify-center h-[70vh]">
      <h1 className="text-2xl font-display font-bold text-muted-foreground">{title}</h1>
    </div>
  </AppLayout>
);

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
      <Route path="/budget-bite" component={BudgetBite} />
      <Route path="/housing">
        <PlaceholderPage title="Housing (Coming Soon)" />
      </Route>
      <Route path="/marketplace">
        <PlaceholderPage title="Marketplace (Coming Soon)" />
      </Route>
      <Route path="/profile">
        <PlaceholderPage title="Profile (Coming Soon)" />
      </Route>
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