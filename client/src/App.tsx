import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import Friends from "@/pages/Friends";
import Discovery from "@/pages/Discovery";
import Settings from "@/pages/Settings";
import WatchTonight from "@/pages/WatchTonight";
import StreamingSearch from "@/pages/StreamingSearch";
import MyLists from "@/pages/MyLists";
import Layout from "@/components/Layout";
import { WatchlistProvider } from "@/components/WatchlistContext";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <WatchlistProvider>
          <Layout>
            <Route path="/" component={Dashboard} />
            <Route path="/profile" component={Profile} />
            <Route path="/friends" component={Friends} />
            <Route path="/discovery" component={Discovery} />
            <Route path="/settings" component={Settings} />
            <Route path="/watch-tonight" component={WatchTonight} />
            <Route path="/streaming-search" component={StreamingSearch} />
            <Route path="/my-lists" component={MyLists} />
          </Layout>
        </WatchlistProvider>
      )}
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
