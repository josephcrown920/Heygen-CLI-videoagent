import { ReactNode } from "react";
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
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: credits } = useGetCredits({
    query: { queryKey: getGetCreditsQueryKey() }
  });

  const sections: NavSection[] = [
    {
      label: "HeyGen",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
        { name: "Library", href: "/videos", icon: Library },
        { name: "Director Suite", href: "/create", icon: Clapperboard, exact: true },
        { name: "Magic Prompt", href: "/create/prompt", icon: Wand2 },
        { name: "LiveAvatar", href: "/live-avatar", icon: Radio },
      ],
    },
    {
      label: "Synthetic Intelligence",
      items: [
        { name: "SI Director", href: "/si-director", icon: Brain },
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
        { name: "Lyrics", href: "/lyrics", icon: Music },
        { name: "CLI Generator", href: "/cli", icon: Terminal },
      ],
    },
    {
      label: "Quick Generate",
      items: [
        { name: "Kling Nano", href: "/generate/fal-ai%2Fkling-video%2Fv1.6%2Fnano%2Ftext-to-video", icon: Video },
        { name: "LTX-Video", href: "/generate/fal-ai%2Fltx-video", icon: Video },
        { name: "Seedance 1.0", href: "/generate/fal-ai%2Fseedance-1-0%2Ftext-to-video", icon: Video },
        { name: "Seedream 3.0", href: "/generate/fal-ai%2Fseedream-3", icon: ImageIcon },
        { name: "FLUX Schnell", href: "/generate/fal-ai%2Fflux%2Fschnell", icon: ImageIcon },
      ],
    },
  ];

  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Video className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">HeyGen Studio</span>
          </Link>
        </div>

        <div className="flex-1 py-4 px-3 flex flex-col gap-0.5 overflow-y-auto">
          {sections.map((section, si) => (
            <div key={section.label} className={si > 0 ? "mt-5" : ""}>
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5 px-2">
                {section.label}
              </div>
              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-150 text-sm ${
                      active
                        ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-sidebar-border flex-shrink-0">
          <div className="bg-card rounded-lg p-3 border border-card-border shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Coins className="w-3.5 h-3.5" /> HeyGen Credits
              </span>
              <span className="font-bold text-sm text-foreground">
                {credits?.remaining_credits ?? "—"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
              <div
                className="bg-primary h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, (credits?.remaining_credits || 0) / 100 * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
