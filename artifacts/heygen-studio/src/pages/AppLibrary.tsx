import { useState } from "react";
import { useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, Video, Mic, Scissors, Languages, Zap,
  UserSquare, FileText, BarChart2, RefreshCw, Layers, Brain,
  ArrowRight, Star,
} from "lucide-react";

type AppTab = "all" | "create" | "enhance" | "edit";

interface AppItem {
  id: string;
  name: string;
  desc: string;
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  href: string;
  badge?: string;
  tab: AppTab[];
}

const APPS: AppItem[] = [
  {
    id: "si-director",
    name: "SI Director",
    desc: "Synthetic Intelligence autonomous production planning — give it a concept, it plans and fires the whole production.",
    icon: Brain,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/10",
    href: "/si-director",
    badge: "SI",
    tab: ["all", "create"],
  },
  {
    id: "ai-studio",
    name: "AI Studio",
    desc: "Create and produce professional avatar videos with full studio controls.",
    icon: Video,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/10",
    href: "/create",
    tab: ["all", "create"],
  },
  {
    id: "avatar-shots",
    name: "Avatar Shots",
    desc: "Record cinematic, film-quality shots of your avatar with AI-powered scenes.",
    icon: UserSquare,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    href: "/avatar-shots",
    badge: "NEW",
    tab: ["all", "create"],
  },
  {
    id: "urban-cuts",
    name: "Urban Cuts",
    desc: "Generate cinematic city scenes — NYC, Tokyo, London, Dubai and more with AI models.",
    icon: Scissors,
    iconColor: "text-orange-400",
    iconBg: "bg-orange-500/10",
    href: "/urban-cuts",
    badge: "NEW",
    tab: ["all", "create"],
  },
  {
    id: "lip-sync",
    name: "Lip Sync",
    desc: "Sync any audio track to your avatar with cinematic accuracy and voice mirroring.",
    icon: Mic,
    iconColor: "text-pink-400",
    iconBg: "bg-pink-500/10",
    href: "/lip-sync",
    badge: "NEW",
    tab: ["all", "create", "enhance"],
  },
  {
    id: "model-hub",
    name: "AI Video Generator",
    desc: "Create AI-generated video clips using 15 state-of-the-art video models.",
    icon: Zap,
    iconColor: "text-yellow-400",
    iconBg: "bg-yellow-500/10",
    href: "/models",
    badge: "NEW",
    tab: ["all", "create"],
  },
  {
    id: "translate",
    name: "Translate Videos",
    desc: "Convert any video into 125+ languages with accurate lip sync.",
    icon: Languages,
    iconColor: "text-cyan-400",
    iconBg: "bg-cyan-500/10",
    href: "/apps",
    tab: ["all", "enhance"],
  },
  {
    id: "highlights",
    name: "Instant Highlights V2",
    desc: "Add a longer video and AI will create shortened clips using the most relevant info.",
    icon: Star,
    iconColor: "text-amber-400",
    iconBg: "bg-amber-500/10",
    href: "/apps",
    badge: "NEW",
    tab: ["all", "edit"],
  },
  {
    id: "upscale",
    name: "Upscale Video",
    desc: "Create high-resolution outputs from your existing videos.",
    icon: RefreshCw,
    iconColor: "text-teal-400",
    iconBg: "bg-teal-500/10",
    href: "/apps",
    tab: ["all", "enhance"],
  },
  {
    id: "ppt-video",
    name: "PPT/PDF to Video",
    desc: "Transform your presentations and documents into engaging avatar videos.",
    icon: FileText,
    iconColor: "text-indigo-400",
    iconBg: "bg-indigo-500/10",
    href: "/create",
    tab: ["all", "create"],
  },
  {
    id: "batch",
    name: "Batch Mode",
    desc: "Create multiple avatar videos at once from a spreadsheet.",
    icon: Layers,
    iconColor: "text-purple-400",
    iconBg: "bg-purple-500/10",
    href: "/apps",
    tab: ["all", "create"],
  },
  {
    id: "analytics",
    name: "Analytics",
    desc: "Track views, engagement, and performance across all your videos.",
    icon: BarChart2,
    iconColor: "text-green-400",
    iconBg: "bg-green-500/10",
    href: "/apps",
    tab: ["all"],
  },
];

const FEATURED = [
  {
    id: "ai-video",
    title: "AI Video Generator",
    subtitle: "Create now →",
    href: "/models",
    gradient: "from-amber-600 via-orange-500 to-yellow-400",
  },
  {
    id: "lip-sync",
    title: "Lip Sync",
    subtitle: "Create now →",
    href: "/lip-sync",
    gradient: "from-slate-800 via-slate-700 to-blue-800",
  },
  {
    id: "urban-cuts",
    title: "Urban Cuts",
    subtitle: "Create now →",
    href: "/urban-cuts",
    gradient: "from-orange-700 via-red-600 to-pink-500",
  },
];

const TABS: { id: AppTab; label: string }[] = [
  { id: "all", label: "All Apps" },
  { id: "create", label: "Create" },
  { id: "enhance", label: "Enhance" },
  { id: "edit", label: "Edit" },
];

export function AppLibrary() {
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<AppTab>("all");
  const [search, setSearch] = useState("");

  const filtered = APPS.filter(app => {
    const matchesTab = tab === "all" ? true : app.tab.includes(tab);
    const matchesSearch = !search.trim() || app.name.toLowerCase().includes(search.toLowerCase()) || app.desc.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">App Library</h1>
        <p className="text-sm text-muted-foreground">Use Regent apps to up-level your creative process</p>
      </div>

      {/* Featured */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Featured Apps</h2>
        <div className="flex flex-col gap-3">
          {FEATURED.map(f => (
            <button
              key={f.id}
              onClick={() => setLocation(f.href)}
              className={`group relative rounded-2xl overflow-hidden h-36 text-left bg-gradient-to-r ${f.gradient} hover:scale-[1.01] transition-all duration-200 shadow-lg`}
            >
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-xl font-bold text-white">{f.title}</h3>
                <p className="text-sm text-white/70 flex items-center gap-1 mt-0.5">
                  {f.subtitle} <ArrowRight className="w-3 h-3" />
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex items-center gap-3 border-b border-border pb-3 flex-wrap">
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                tab === t.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            className="pl-8 h-8 text-xs w-48 bg-card"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* App list */}
      <div className="flex flex-col gap-1">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No apps match "{search}"</p>
          </div>
        ) : (
          filtered.map(app => (
            <button
              key={app.id}
              onClick={() => setLocation(app.href)}
              className="group flex items-center gap-4 px-4 py-4 rounded-2xl hover:bg-card border border-transparent hover:border-card-border transition-all text-left"
            >
              <div className={`w-12 h-12 rounded-2xl ${app.iconBg} flex items-center justify-center flex-shrink-0`}>
                <app.icon className={`w-5 h-5 ${app.iconColor}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm">{app.name}</span>
                  {app.badge && (
                    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                      app.badge === "SI"
                        ? "border-violet-500/40 text-violet-400"
                        : "border-primary/40 text-primary"
                    }`}>
                      {app.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{app.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-muted-foreground transition-colors flex-shrink-0" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
