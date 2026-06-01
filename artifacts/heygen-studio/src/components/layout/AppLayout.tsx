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
} from "lucide-react";
import { 
  useGetCredits,
  getGetCreditsQueryKey
} from "@workspace/api-client-react";

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { data: credits } = useGetCredits({
    query: {
      queryKey: getGetCreditsQueryKey()
    }
  });

  const heygenNav = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Library", href: "/videos", icon: Library },
    { name: "Director Suite", href: "/create", icon: Clapperboard },
    { name: "Magic Prompt", href: "/create/prompt", icon: Wand2 },
  ];

  const falNav = [
    { name: "Model Hub", href: "/models", icon: Cpu },
    { name: "My Creations", href: "/creations", icon: Layers },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-sidebar-border bg-sidebar flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 text-primary p-2 rounded-lg group-hover:bg-primary/20 transition-colors">
              <Video className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight">HeyGen Studio</span>
          </Link>
        </div>

        <div className="flex-1 py-4 px-4 flex flex-col gap-1 overflow-y-auto">
          {/* HeyGen section */}
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-2">
            HeyGen
          </div>
          {heygenNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* fal.ai section */}
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-6">
            fal.ai Models
          </div>
          {falNav.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                  active
                    ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Quick model links */}
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 mt-6">
            Quick Generate
          </div>
          {[
            { name: "Kling Nano", href: "/generate/fal-ai%2Fkling-video%2Fv1.6%2Fnano%2Ftext-to-video", icon: Video },
            { name: "Seedance 1.0", href: "/generate/fal-ai%2Fseedance-1-0%2Ftext-to-video", icon: Video },
            { name: "Seedream 3.0", href: "/generate/fal-ai%2Fseedream-3", icon: ImageIcon },
            { name: "FLUX Schnell", href: "/generate/fal-ai%2Fflux%2Fschnell", icon: ImageIcon },
          ].map((item) => {
            const active = location === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                  active
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-sidebar-border mt-auto">
          <div className="bg-card rounded-lg p-4 border border-card-border shadow-sm flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Coins className="w-4 h-4" /> HeyGen Credits
              </span>
              <span className="font-bold text-foreground">
                {credits?.remaining_credits ?? "—"}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
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
