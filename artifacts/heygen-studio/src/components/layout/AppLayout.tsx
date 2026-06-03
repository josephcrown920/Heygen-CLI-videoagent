import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  Clapperboard,
  LayoutDashboard,
  Library,
  Wand2,
  Coins,
  Video,
  Layers,
  Cpu,
  ImageIcon,
  Terminal,
  BookImage,
  Palette,
  Music,
  Radio,
  PenLine,
  Brain,
  Scissors,
  Mic,
  AppWindow,
  Camera,
  FlameKindling,
  ServerCog,
  Menu,
  X,
} from "lucide-react";
import {
  useGetCredits,
  getGetCreditsQueryKey
} from "@workspace/api-client-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  exact?: boolean;
  badge?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    label: "Regent",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
      { name: "Library", href: "/videos", icon: Library },
      { name: "Director Suite", href: "/create", icon: Clapperboard, exact: true },
      { name: "Magic Prompt", href: "/create/prompt", icon: Wand2 },
      { name: "LiveAvatar", href: "/live-avatar", icon: Radio },
      { name: "App Library", href: "/apps", icon: AppWindow },
    ],
  },
  {
    label: "Synthetic Intelligence",
    items: [
      { name: "SI Director", href: "/si-director", icon: Brain, badge: "SI" },
    ],
  },
  {
    label: "Create",
    items: [
      { name: "Viral Engine", href: "/viral-engine", icon: FlameKindling, badge: "NEW" },
      { name: "Avatar Shots", href: "/avatar-shots", icon: Camera, badge: "NEW" },
      { name: "Urban Cuts", href: "/urban-cuts", icon: Scissors, badge: "NEW" },
      { name: "Lip Sync", href: "/lip-sync", icon: Mic, badge: "NEW" },
      { name: "Lyrics Video", href: "/lyrics", icon: Music },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { name: "GPU + AI Hub", href: "/gpu-hub", icon: ServerCog, badge: "NEW" },
    ],
  },
  {
    label: "fal.ai Models",
    items: [
      { name: "Model Hub", href: "/models", icon: Cpu },
      { name: "My Creations", href: "/creations", icon: Layers },
    ],
  },
  {
    label: "Creator Tools",
    items: [
      { name: "Canvas", href: "/canvas", icon: PenLine },
      { name: "Scenes & Props", href: "/scenes", icon: Palette },
      { name: "Reference Images", href: "/references", icon: BookImage },
      { name: "CLI Generator", href: "/cli", icon: Terminal },
    ],
  },
  {
    label: "Quick Generate",
    items: [
      { name: "Kling Nano", href: "/generate/fal-ai%2Fkling-video%2Fv1.6%2Fnano%2Ftext-to-video", icon: Video },
      { name: "Seedance 1.0", href: "/generate/fal-ai%2Fseedance-1-0%2Ftext-to-video", icon: Video },
      { name: "FLUX Schnell", href: "/generate/fal-ai%2Fflux%2Fschnell", icon: ImageIcon },
      { name: "Imagen 4", href: "/generate/fal-ai%2Fimagen4%2Fpreview", icon: ImageIcon },
    ],
  },
];

const badgeColors: Record<string, string> = {
  SI: "bg-violet-500/20 text-violet-400",
  NEW: "bg-primary/20 text-primary",
};

function SidebarContent({
  location,
  onNavigate,
  credits,
}: {
  location: string;
  onNavigate?: () => void;
  credits?: { remaining_credits?: number } | null;
}) {
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <>
      <div className="flex-1 py-3 px-2 flex flex-col gap-0.5 overflow-y-auto">
        {sections.map((section, si) => (
          <div key={section.label} className={si > 0 ? "mt-4" : ""}>
            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1 px-2">
              {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-md transition-all duration-150 text-sm ${
                    active
                      ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate flex-1 text-sm">{item.name}</span>
                  {item.badge && !active && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${badgeColors[item.badge] ?? "bg-muted text-muted-foreground"}`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-sidebar-border flex-shrink-0">
        <div className="bg-card rounded-lg p-2.5 border border-card-border flex items-center gap-2">
          <Coins className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground flex-1 truncate">Regent Credits</span>
          <span className="font-bold text-sm text-foreground flex-shrink-0">
            {credits?.remaining_credits ?? "—"}
          </span>
        </div>
      </div>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data: credits } = useGetCredits({
    query: { queryKey: getGetCreditsQueryKey() }
  });

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  // Lock body scroll when drawer open on mobile
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">

      {/* ── Desktop sidebar (md+) ── */}
      <aside className="hidden md:flex w-56 lg:w-64 border-r border-sidebar-border bg-sidebar flex-col flex-shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-sidebar-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Video className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">Regent</span>
          </Link>
        </div>
        <SidebarContent location={location} credits={credits} />
      </aside>

      {/* ── Mobile drawer backdrop ── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── Mobile drawer (slides in from left) ── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-sidebar border-r border-sidebar-border flex flex-col md:hidden transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-sidebar-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
              <Video className="w-4 h-4" />
            </div>
            <span className="font-bold text-base tracking-tight">Regent</span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SidebarContent location={location} onNavigate={() => setDrawerOpen(false)} credits={credits} />
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 h-14 border-b border-border bg-sidebar flex-shrink-0">
          <button
            onClick={() => setDrawerOpen(true)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
              <Video className="w-4 h-4" />
            </div>
            <span className="font-bold text-sm tracking-tight">Regent</span>
          </Link>
        </div>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
