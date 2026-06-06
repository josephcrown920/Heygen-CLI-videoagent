import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/AppLayout";
import { Landing } from "@/pages/Landing";
import { useAuth } from "@/hooks/useAuth";
import { Dashboard } from "@/pages/Dashboard";
import { VideoLibrary } from "@/pages/VideoLibrary";
import { CreateVideo } from "@/pages/CreateVideo";
import { CreateFromPrompt } from "@/pages/CreateFromPrompt";
import { ModelHub } from "@/pages/ModelHub";
import { GenerationStudio } from "@/pages/GenerationStudio";
import { Creations } from "@/pages/Creations";
import { CLI } from "@/pages/CLI";
import { References } from "@/pages/References";
import { ScenesProps } from "@/pages/ScenesProps";
import { Canvas } from "@/pages/Canvas";
import { Lyrics } from "@/pages/Lyrics";
import { LiveAvatar } from "@/pages/LiveAvatar";
import { SIDirector } from "@/pages/SIDirector";
import { AvatarShots } from "@/pages/AvatarShots";
import { UrbanCuts } from "@/pages/UrbanCuts";
import { LipSync } from "@/pages/LipSync";
import { AppLibrary } from "@/pages/AppLibrary";
import { ViralEngine } from "@/pages/ViralEngine";
import { GPUHub } from "@/pages/GPUHub";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/videos" component={VideoLibrary} />
        <Route path="/create" component={CreateVideo} />
        <Route path="/create/prompt" component={CreateFromPrompt} />
        <Route path="/models" component={ModelHub} />
        <Route path="/generate/:modelId" component={GenerationStudio} />
        <Route path="/creations" component={Creations} />
        <Route path="/cli" component={CLI} />
        <Route path="/references" component={References} />
        <Route path="/scenes" component={ScenesProps} />
        <Route path="/canvas" component={Canvas} />
        <Route path="/lyrics" component={Lyrics} />
        <Route path="/live-avatar" component={LiveAvatar} />
        <Route path="/si-director" component={SIDirector} />
        <Route path="/avatar-shots" component={AvatarShots} />
        <Route path="/urban-cuts" component={UrbanCuts} />
        <Route path="/lip-sync" component={LipSync} />
        <Route path="/apps" component={AppLibrary} />
        <Route path="/viral-engine" component={ViralEngine} />
        <Route path="/gpu-hub" component={GPUHub} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

export { useAuth };

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
