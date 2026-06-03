import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListVideos, getListVideosQueryKey } from "@workspace/api-client-react";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mic, Palette, Plus, SlidersHorizontal, Send,
  ArrowRight, Video, Brain, Scissors,
  Zap, AppWindow,
} from "lucide-react";

const FEATURE_CARDS = [
  {
    title: "Create an Avatar",
    subtitle: "Go to Avatars →",
    href: "/live-avatar",
    gradient: "from-[#c8f03c] via-[#a8d820] to-[#78b800]",
    textColor: "text-black",
    subtitleColor: "text-black/60",
  },
  {
    title: "Start from Scratch",
    subtitle: "Go to AI Studio →",
    href: "/create",
    gradient: "from-[#1c1c2e] via-[#16213e] to-[#0f3460]",
    textColor: "text-white",
    subtitleColor: "text-white/50",
  },
  {
    title: "PPT or PDF to Video",
    subtitle: "Try it now →",
    href: "/create",
    gradient: "from-[#2d1b69] via-[#1a0f40] to-[#0d0824]",
    textColor: "text-white",
    subtitleColor: "text-white/50",
  },
  {
    title: "Photo to Video",
    subtitle: "Try it now →",
    href: "/generate/fal-ai%2Fseedream-3",
    gradient: "from-[#7c1d6f] via-[#c43a8e] to-[#f06eaa]",
    textColor: "text-white",
    subtitleColor: "text-white/70",
  },
  {
    title: "Avatar Shots",
    subtitle: "Get Started →",
    href: "/avatar-shots",
    gradient: "from-[#0f2027] via-[#203a43] to-[#2c5364]",
    textColor: "text-white",
    subtitleColor: "text-white/50",
    badge: "NEW",
  },
  {
    title: "Translate any Video",
    subtitle: "Translate now →",
    href: "/apps",
    gradient: "from-[#134e5e] via-[#71b280] to-[#3a7bd5]",
    textColor: "text-white",
    subtitleColor: "text-white/60",
  },
];

const QUICK_ACTIONS = [
  { label: "Use Avatar V", href: "/avatar-shots" },
  { label: "Use Style/Brand", href: "/scenes" },
  { label: "Upload Docs", href: "/create" },
  { label: "Script to Video", href: "/create" },
];

const QUICK_TOOLS = [
  { label: "Urban Cuts", icon: Scissors, href: "/urban-cuts", color: "text-orange-400", bg: "bg-orange-500/10" },
  { label: "Lip Sync", icon: Mic, href: "/lip-sync", color: "text-pink-400", bg: "bg-pink-500/10" },
  { label: "App Library", icon: AppWindow, href: "/apps", color: "text-blue-400", bg: "bg-blue-500/10" },
  { label: "Model Hub", icon: Zap, href: "/models", color: "text-green-400", bg: "bg-green-500/10" },
];

export function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");

  const { data: videosData, isLoading } = useListVideos({ limit: 4 }, {
    query: { queryKey: getListVideosQueryKey({ limit: 4 }) }
  });

  const videos = videosData?.videos ?? [];

  const handleSubmit = () => {
    if (!prompt.trim()) {
      toast({ title: "Enter a prompt first", variant: "destructive" });
      return;
    }
    setLocation("/si-director");
  };

  return (
    <div className="flex flex-col min-h-full bg-background">

      {/* ── Hero ── */}
      <div className="relative px-4 sm:px-8 lg:px-10 pt-8 sm:pt-12 pb-6 sm:pb-10 flex flex-col items-center text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-1.5 sm:mb-2 relative">
          Say it with video
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mb-5 sm:mb-8 relative max-w-sm sm:max-w-none">
          HeyGen Studio's all-in-one SI agent for video creation.
        </p>

        {/* Prompt box */}
        <div className="w-full max-w-2xl relative bg-card border border-card-border rounded-2xl shadow-xl shadow-black/30 overflow-hidden">
          {/* Chips row */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-3 pb-2 border-b border-border overflow-x-auto scrollbar-none">
            {[
              { icon: User, label: "Auto", sub: "Avatar" },
              { icon: Mic, label: "Auto", sub: "Voice" },
              { icon: Palette, label: "Auto", sub: "Style/Brand" },
            ].map(({ icon: Icon, label, sub }) => (
              <button
                key={sub}
                className="flex items-center gap-1 sm:gap-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs text-muted-foreground transition-colors flex-shrink-0"
              >
                <Icon className="w-3 h-3" />
                <span className="font-medium">{label}</span>
                <span className="opacity-60 hidden sm:inline">{sub}</span>
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Ask for a video, an avatar, or anything in between—I can get you started."
            className="border-0 bg-transparent resize-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm min-h-[72px] sm:min-h-[80px] px-3 sm:px-4 py-3"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
          />

          <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 pb-2.5 sm:pb-3">
            <Button size="icon" variant="ghost" className="text-muted-foreground h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0">
              <Plus className="w-4 h-4" />
            </Button>
            <Button size="icon" variant="ghost" className="text-muted-foreground h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </Button>
            <Button onClick={handleSubmit} className="ml-auto rounded-full h-7 sm:h-8 px-4 sm:px-5 text-xs font-bold flex-shrink-0">
              <Send className="w-3 h-3 mr-1" /> Submit
            </Button>
          </div>
        </div>

        {/* Quick action chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4 relative px-2">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.label} href={a.href}>
              <button className="text-[11px] sm:text-xs border border-border rounded-full px-3 sm:px-4 py-1 sm:py-1.5 text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors bg-card whitespace-nowrap">
                {a.label}
              </button>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="px-4 sm:px-8 lg:px-10 pb-8 sm:pb-10 w-full max-w-6xl mx-auto">

        {/* Feature card grid — 2 cols on mobile, 3 on lg */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
          {FEATURE_CARDS.map((card) => (
            <Link key={card.title} href={card.href}>
              <div
                className={`relative group rounded-xl sm:rounded-2xl overflow-hidden h-32 sm:h-44 cursor-pointer bg-gradient-to-br ${card.gradient} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                {card.badge && (
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <Badge className="bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5">{card.badge}</Badge>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                  <h3 className={`text-sm sm:text-xl font-bold mb-0.5 leading-tight ${card.textColor}`}>{card.title}</h3>
                  <p className={`text-[10px] sm:text-xs font-medium ${card.subtitleColor}`}>{card.subtitle}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* SI Director banner */}
        <Link href="/si-director">
          <div className="group mb-5 sm:mb-8 bg-gradient-to-r from-violet-600/10 via-cyan-600/10 to-violet-600/10 border border-violet-500/20 rounded-xl sm:rounded-2xl p-3.5 sm:p-5 flex items-center gap-3 sm:gap-4 hover:border-violet-500/40 transition-all cursor-pointer">
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
              <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 flex-wrap">
                <h3 className="font-bold text-sm sm:text-base">SI Director</h3>
                <Badge variant="outline" className="text-[9px] sm:text-[10px] border-violet-500/40 text-violet-400 px-1 sm:px-1.5">SYNTHETIC INTELLIGENCE</Badge>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-none">
                Give it a concept — it plans the full production: shots, models, narrative arc, and visual language, then fires them all.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-violet-400 transition-colors flex-shrink-0" />
          </div>
        </Link>

        {/* Quick tools row — 4 cols always */}
        <div className="grid grid-cols-4 gap-2 sm:gap-3 mb-6 sm:mb-10">
          {QUICK_TOOLS.map(({ label, icon: Icon, href, color, bg }) => (
            <Link key={label} href={href}>
              <div className="group bg-card border border-card-border rounded-xl p-2.5 sm:p-4 flex flex-col items-center gap-1.5 sm:gap-2 hover:border-primary/30 transition-all cursor-pointer text-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
                </div>
                <span className="text-[10px] sm:text-xs font-medium leading-tight">{label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent productions */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold">Recent Creations</h2>
            <Link href="/videos" className="text-xs sm:text-sm text-primary hover:underline font-medium">All Projects →</Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {[1,2,3,4].map(i => <div key={i} className="aspect-video bg-muted animate-pulse rounded-xl" />)}
            </div>
          ) : videos.length === 0 ? (
            <div className="border border-dashed border-border rounded-xl sm:rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-muted flex items-center justify-center">
                <Video className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium text-sm sm:text-base">No productions yet</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Your recent videos will appear here.</p>
              </div>
              <Button size="sm" onClick={() => setLocation("/create")} className="text-xs sm:text-sm">Create your first video</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
              {videos.map(video => <VideoCard key={video.id} video={video} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
