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

/* ── Animated tile visuals ──────────────────────────────────────── */

function AvatarVisual() {
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 w-full h-full opacity-60" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="av-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <style>{`
        @keyframes av-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes av-pulse { 0%,100%{r:22} 50%{r:24} }
        @keyframes av-ring { 0%{opacity:0.6;r:28} 100%{opacity:0;r:44} }
      `}</style>
      <circle cx="80" cy="52" r="28" fill="rgba(0,0,0,0.25)" style={{ animation: "av-float 3s ease-in-out infinite" }} />
      <circle cx="80" cy="44" r="15" fill="rgba(0,0,0,0.4)" style={{ animation: "av-float 3s ease-in-out infinite" }} />
      <ellipse cx="80" cy="70" rx="20" ry="12" fill="rgba(0,0,0,0.35)" style={{ animation: "av-float 3s ease-in-out infinite" }} />
      <circle cx="80" cy="52" r="28" fill="url(#av-glow)" style={{ animation: "av-ring 2.5s ease-out infinite" }} />
      <circle cx="80" cy="52" r="22" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: "av-float 3s ease-in-out infinite" }} />
    </svg>
  );
}

function FilmVisual() {
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="xMidYMid slice">
      <style>{`@keyframes film-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-40px)} }`}</style>
      <g style={{ animation: "film-scroll 2s linear infinite" }}>
        {[0,40,80,120,160,200].map(x => (
          <g key={x} transform={`translate(${x},20)`}>
            <rect width="32" height="80" rx="3" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
            <rect x="4" y="4" width="8" height="8" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="20" y="4" width="8" height="8" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="4" y="68" width="8" height="8" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="20" y="68" width="8" height="8" rx="1" fill="rgba(255,255,255,0.2)" />
            <rect x="3" y="16" width="26" height="48" rx="2" fill="rgba(255,255,255,0.06)" />
          </g>
        ))}
      </g>
    </svg>
  );
}

function SlidesVisual() {
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="xMidYMid slice">
      <style>{`
        @keyframes s1 { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-8px) rotate(-4deg)} }
        @keyframes s2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-5px) rotate(0deg)} }
        @keyframes s3 { 0%,100%{transform:translateY(0) rotate(4deg)} 50%{transform:translateY(-10px) rotate(4deg)} }
      `}</style>
      <g transform="translate(80,60)">
        <rect x="-35" y="-22" width="55" height="38" rx="4" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" style={{ animation: "s1 3.5s ease-in-out infinite", transformOrigin: "0 0" }} />
        <rect x="-28" y="-28" width="55" height="38" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: "s2 3s ease-in-out infinite", transformOrigin: "0 0" }} />
        <rect x="-20" y="-24" width="55" height="38" rx="4" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="1" style={{ animation: "s3 4s ease-in-out infinite", transformOrigin: "0 0" }} />
        <line x1="-12" y1="-18" x2="28" y2="-18" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" style={{ animation: "s3 4s ease-in-out infinite", transformOrigin: "0 0" }} />
        <line x1="-12" y1="-11" x2="20" y2="-11" stroke="rgba(255,255,255,0.25)" strokeWidth="1" style={{ animation: "s3 4s ease-in-out infinite", transformOrigin: "0 0" }} />
      </g>
    </svg>
  );
}

function PhotoVideoVisual() {
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 w-full h-full opacity-50" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="pv-fade" x1="0%" x2="100%" y2="0%">
          <stop offset="40%" stopColor="rgba(255,255,255,0)" />
          <stop offset="60%" stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>
      <style>{`
        @keyframes pv-morph { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pv-morph2 { 0%,100%{opacity:0.3} 50%{opacity:1} }
      `}</style>
      <rect x="10" y="25" width="62" height="70" rx="6" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: "pv-morph 3s ease-in-out infinite" }} />
      <circle cx="41" cy="52" r="14" fill="rgba(255,255,255,0.12)" style={{ animation: "pv-morph 3s ease-in-out infinite" }} />
      <rect x="88" y="25" width="62" height="70" rx="6" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" style={{ animation: "pv-morph2 3s ease-in-out infinite" }} />
      <polygon points="119,46 134,60 119,74" fill="rgba(255,255,255,0.3)" style={{ animation: "pv-morph2 3s ease-in-out infinite" }} />
      <rect x="72" y="55" width="16" height="3" rx="1.5" fill="rgba(255,255,255,0.5)" />
      <polygon points="84,51 90,57 84,63" fill="rgba(255,255,255,0.5)" />
    </svg>
  );
}

function CameraVisual() {
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 w-full h-full opacity-45" preserveAspectRatio="xMidYMid slice">
      <style>{`
        @keyframes shutter { 0%,100%{opacity:1} 45%,55%{opacity:0} }
        @keyframes lens { 0%,100%{r:22} 50%{r:18} }
        @keyframes blink { 0%,90%,100%{opacity:1} 95%{opacity:0} }
      `}</style>
      <rect x="35" y="38" width="90" height="60" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <rect x="55" y="28" width="28" height="14" rx="4" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <circle cx="80" cy="68" r="22" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.25)" strokeWidth="2" style={{ animation: "lens 4s ease-in-out infinite" }} />
      <circle cx="80" cy="68" r="14" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <circle cx="80" cy="68" r="7" fill="rgba(255,255,255,0.12)" />
      <circle cx="108" cy="50" r="5" fill="rgba(239,68,68,0.6)" style={{ animation: "blink 3s ease-in-out infinite" }} />
    </svg>
  );
}

function GlobeVisual() {
  return (
    <svg viewBox="0 0 160 120" className="absolute inset-0 w-full h-full opacity-40" preserveAspectRatio="xMidYMid slice">
      <style>{`@keyframes globe-spin { 0%{transform:translateX(0)} 100%{transform:translateX(-80px)} }`}</style>
      <circle cx="80" cy="60" r="40" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
      <ellipse cx="80" cy="60" rx="20" ry="40" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <ellipse cx="80" cy="60" rx="40" ry="15" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      <ellipse cx="80" cy="60" rx="40" ry="28" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
      <line x1="40" y1="60" x2="120" y2="60" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <line x1="80" y1="20" x2="80" y2="100" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
      <g clipPath="url(#globe-clip)">
        <clipPath id="globe-clip"><circle cx="80" cy="60" r="38" /></clipPath>
        <g style={{ animation: "globe-spin 6s linear infinite" }}>
          {["A", "B", "C", "D"].map((_, i) => (
            <text key={i} x={30 + i * 40} y="65" fontSize="8" fill="rgba(255,255,255,0.35)" fontFamily="monospace">
              {["EN", "ES", "FR", "JP"][i]}
            </text>
          ))}
        </g>
      </g>
    </svg>
  );
}

const FEATURE_CARDS = [
  {
    title: "Create an Avatar",
    subtitle: "Go to Avatars →",
    href: "/live-avatar",
    gradient: "from-[#c8f03c] via-[#a8d820] to-[#78b800]",
    textColor: "text-black",
    subtitleColor: "text-black/60",
    visual: <AvatarVisual />,
  },
  {
    title: "Start from Scratch",
    subtitle: "Go to AI Studio →",
    href: "/create",
    gradient: "from-[#1c1c2e] via-[#16213e] to-[#0f3460]",
    textColor: "text-white",
    subtitleColor: "text-white/50",
    visual: <FilmVisual />,
  },
  {
    title: "PPT or PDF to Video",
    subtitle: "Try it now →",
    href: "/create",
    gradient: "from-[#2d1b69] via-[#1a0f40] to-[#0d0824]",
    textColor: "text-white",
    subtitleColor: "text-white/50",
    visual: <SlidesVisual />,
  },
  {
    title: "Photo to Video",
    subtitle: "Try it now →",
    href: "/generate/fal-ai%2Fseedream-3",
    gradient: "from-[#7c1d6f] via-[#c43a8e] to-[#f06eaa]",
    textColor: "text-white",
    subtitleColor: "text-white/70",
    visual: <PhotoVideoVisual />,
  },
  {
    title: "Avatar Shots",
    subtitle: "Get Started →",
    href: "/avatar-shots",
    gradient: "from-[#0f2027] via-[#203a43] to-[#2c5364]",
    textColor: "text-white",
    subtitleColor: "text-white/50",
    badge: "NEW",
    visual: <CameraVisual />,
  },
  {
    title: "Translate any Video",
    subtitle: "Translate now →",
    href: "/apps",
    gradient: "from-[#134e5e] via-[#71b280] to-[#3a7bd5]",
    textColor: "text-white",
    subtitleColor: "text-white/60",
    visual: <GlobeVisual />,
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
      <style>{`
        @keyframes av-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes av-ring  { 0%{opacity:0.6;r:28} 100%{opacity:0;r:44} }
        @keyframes film-scroll { 0%{transform:translateX(0)} 100%{transform:translateX(-40px)} }
        @keyframes s1 { 0%,100%{transform:translateY(0) rotate(-4deg)} 50%{transform:translateY(-8px) rotate(-4deg)} }
        @keyframes s2 { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-5px) rotate(0deg)} }
        @keyframes s3 { 0%,100%{transform:translateY(0) rotate(4deg)} 50%{transform:translateY(-10px) rotate(4deg)} }
        @keyframes pv-morph  { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes pv-morph2 { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes shutter { 0%,100%{opacity:1} 45%,55%{opacity:0} }
        @keyframes lens { 0%,100%{r:22} 50%{r:18} }
        @keyframes blink { 0%,90%,100%{opacity:1} 95%{opacity:0} }
        @keyframes globe-spin { 0%{transform:translateX(0)} 100%{transform:translateX(-80px)} }
      `}</style>

      {/* ── Hero ── */}
      <div className="relative px-4 sm:px-8 lg:px-10 pt-8 sm:pt-12 pb-6 sm:pb-10 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute" style={{ top:"-30%", left:"5%", width:"45%", height:"110%", background:"radial-gradient(ellipse at top, rgba(59,130,246,0.45) 0%, rgba(59,130,246,0.12) 45%, transparent 75%)", transform:"rotate(-10deg)", filter:"blur(24px)" }} />
          <div className="absolute" style={{ top:"-30%", right:"3%", width:"45%", height:"110%", background:"radial-gradient(ellipse at top, rgba(239,68,68,0.42) 0%, rgba(239,68,68,0.11) 45%, transparent 75%)", transform:"rotate(10deg)", filter:"blur(24px)" }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top:"-15%", width:"55%", height:"75%", background:"radial-gradient(ellipse at top, rgba(180,80,120,0.18) 0%, transparent 65%)", filter:"blur(28px)" }} />
          <div className="absolute left-1/2 -translate-x-1/2" style={{ top:0, width:"260px", height:"3px", background:"linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.9) 30%, rgba(255,255,255,0.7) 50%, rgba(239,68,68,0.9) 70%, transparent 100%)", filter:"blur(2px)" }} />
          <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background:"linear-gradient(to bottom, transparent, hsl(222 25% 4%))" }} />
        </div>

        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-1.5 sm:mb-2 relative">
          Say it with video
        </h1>
        <p className="text-muted-foreground text-sm sm:text-base mb-5 sm:mb-8 relative max-w-sm sm:max-w-none">
          Regent's all-in-one SI agent for video creation.
        </p>

        {/* Prompt box */}
        <div className="w-full max-w-2xl relative bg-card border border-card-border rounded-2xl shadow-xl shadow-black/30 overflow-hidden">
          <div className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 pt-3 pb-2 border-b border-border overflow-x-auto scrollbar-none">
            {[
              { icon: User, label: "Auto", sub: "Avatar" },
              { icon: Mic, label: "Auto", sub: "Voice" },
              { icon: Palette, label: "Auto", sub: "Style/Brand" },
            ].map(({ icon: Icon, label, sub }) => (
              <button key={sub} className="flex items-center gap-1 sm:gap-1.5 bg-muted hover:bg-muted/80 border border-border rounded-full px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs text-muted-foreground transition-colors flex-shrink-0">
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
            <Button size="icon" variant="ghost" className="text-muted-foreground h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0"><Plus className="w-4 h-4" /></Button>
            <Button size="icon" variant="ghost" className="text-muted-foreground h-7 w-7 sm:h-8 sm:w-8 rounded-full flex-shrink-0"><SlidersHorizontal className="w-4 h-4" /></Button>
            <Button onClick={handleSubmit} className="ml-auto rounded-full h-7 sm:h-8 px-4 sm:px-5 text-xs font-bold flex-shrink-0">
              <Send className="w-3 h-3 mr-1" /> Submit
            </Button>
          </div>
        </div>

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

        {/* Feature card grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 mb-5 sm:mb-8">
          {FEATURE_CARDS.map((card) => (
            <Link key={card.title} href={card.href}>
              <div className={`relative group rounded-xl sm:rounded-2xl overflow-hidden h-32 sm:h-44 cursor-pointer bg-gradient-to-br ${card.gradient} hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg`}>
                {/* Animated visual layer */}
                {card.visual}
                {/* Overlay for legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
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

        {/* Quick tools row */}
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
