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
  LogIn,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  useGetCredits,
  getGetCreditsQueryKey
} from "@workspace/api-client-react";

function RegentLogo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="rgrad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f5ff"/>
          <stop offset="100%" stopColor="#ff2fff"/>
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="transparent" stroke="url(#rgrad)" strokeWidth="1.5"/>
      <text x="7" y="24" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="20" fill="url(#rgrad)">R</text>
    </svg>
  );
}

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
      { name: "Viral Engine", href: "/viral-engine", icon: FlameKindling, badge: "HOT" },
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
      { name: "Kling Omni", href: "/generate/kling-direct%2Fv2-master-omni", icon: Video, badge: "OMNI" },
      { name: "Seedance 1.0", href: "/generate/fal-ai%2Fseedance-1-0%2Ftext-to-video", icon: Video },
      { name: "Seedream 3.0", href: "/generate/fal-ai%2Fseedream-3", icon: ImageIcon, badge: "TOP" },
      { name: "FLUX Schnell", href: "/generate/fal-ai%2Fflux%2Fschnell", icon: ImageIcon },
    ],
  },
];

const BADGE_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  SI:   { bg: "rgba(255,47,255,0.12)", color: "#ff2fff", border: "rgba(255,47,255,0.3)" },
  HOT:  { bg: "rgba(255,107,0,0.12)", color: "#ff6b00", border: "rgba(255,107,0,0.3)" },
  NEW:  { bg: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "rgba(0,245,255,0.25)" },
  OMNI: { bg: "rgba(0,255,136,0.1)", color: "#00ff88", border: "rgba(0,255,136,0.25)" },
  TOP:  { bg: "rgba(0,245,255,0.1)", color: "#00f5ff", border: "rgba(0,245,255,0.25)" },
};

function SidebarContent({
  location,
  onNavigate,
  credits,
  user,
  login,
  logout,
}: {
  location: string;
  onNavigate?: () => void;
  credits?: { remaining_credits?: number } | null;
  user?: { firstName: string | null; email: string | null; profileImageUrl: string | null } | null;
  login: () => void;
  logout: () => void;
}) {
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location === href;
    return location.startsWith(href);
  };

  return (
    <>
      <div style={{ flex: 1, padding: "10px 8px", display: "flex", flexDirection: "column", gap: 2, overflowY: "auto" }}>
        {sections.map((section, si) => (
          <div key={section.label} style={{ marginTop: si > 0 ? 16 : 0 }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(0,245,255,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 10px 6px" }}>
              // {section.label}
            </div>
            {section.items.map((item) => {
              const active = isActive(item.href, item.exact);
              const badge = item.badge ? BADGE_STYLES[item.badge] : null;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  style={{
                    display: "flex", alignItems: "center", gap: 9,
                    padding: "7px 10px", borderRadius: 4, marginBottom: 1,
                    textDecoration: "none", fontSize: 12, cursor: "pointer",
                    background: active ? "rgba(0,245,255,0.07)" : "transparent",
                    borderLeft: active ? "2px solid #00f5ff" : "2px solid transparent",
                    color: active ? "#00f5ff" : "rgba(224,232,255,0.45)",
                    fontWeight: active ? 700 : 400,
                    boxShadow: active ? "inset 0 0 20px rgba(0,245,255,0.04)" : "none",
                    transition: "all 0.12s",
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.04)";
                      (e.currentTarget as HTMLElement).style.color = "rgba(224,232,255,0.75)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "rgba(224,232,255,0.45)";
                    }
                  }}
                >
                  <item.icon style={{ width: 14, height: 14, flexShrink: 0, filter: active ? "drop-shadow(0 0 4px #00f5ff)" : "none" }} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                  {item.badge && !active && badge && (
                    <span style={{
                      fontSize: 8, padding: "2px 5px", borderRadius: 2, fontWeight: 800,
                      background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`,
                      letterSpacing: "0.05em", flexShrink: 0,
                    }}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ padding: "10px 10px", borderTop: "1px solid rgba(0,245,255,0.07)", flexShrink: 0, display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Credits */}
        <div style={{
          background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.12)",
          borderRadius: 5, padding: "9px 11px", display: "flex", alignItems: "center", gap: 8,
        }}>
          <Coins style={{ width: 13, height: 13, color: "rgba(0,245,255,0.5)", flexShrink: 0 }} />
          <span style={{ fontSize: 11, color: "rgba(224,232,255,0.4)", flex: 1 }}>Credits</span>
          <span style={{ fontWeight: 800, fontSize: 14, color: "#00f5ff", fontVariantNumeric: "tabular-nums", textShadow: "0 0 12px rgba(0,245,255,0.4)" }}>
            {credits?.remaining_credits ?? "—"}
          </span>
        </div>

        {/* User */}
        {user ? (
          <button
            onClick={logout}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "7px 10px", borderRadius: 4, fontSize: 12,
              background: "transparent", border: "none", cursor: "pointer",
              color: "rgba(224,232,255,0.4)", transition: "all 0.12s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.04)"; (e.currentTarget as HTMLElement).style.color = "rgba(224,232,255,0.7)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(224,232,255,0.4)"; }}
          >
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} alt="" style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: "1px solid rgba(0,245,255,0.2)" }} />
            ) : (
              <User style={{ width: 14, height: 14, flexShrink: 0 }} />
            )}
            <span style={{ flex: 1, textAlign: "left", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.firstName ?? user.email ?? "Account"}
            </span>
            <LogOut style={{ width: 12, height: 12, flexShrink: 0 }} />
          </button>
        ) : (
          <button
            onClick={login}
            style={{
              display: "flex", alignItems: "center", gap: 8, width: "100%",
              padding: "8px 12px", borderRadius: 4, fontSize: 12, fontWeight: 700,
              background: "rgba(0,245,255,0.08)", border: "1px solid rgba(0,245,255,0.25)",
              color: "#00f5ff", cursor: "pointer", letterSpacing: "0.04em",
              boxShadow: "0 0 12px rgba(0,245,255,0.08)",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.14)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(0,245,255,0.15)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,245,255,0.08)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(0,245,255,0.08)"; }}
          >
            <LogIn style={{ width: 13, height: 13, flexShrink: 0 }} />
            <span style={{ flex: 1, textAlign: "left" }}>SIGN IN</span>
          </button>
        )}
      </div>
    </>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, login, logout } = useAuth();

  const { data: credits } = useGetCredits({
    query: { queryKey: getGetCreditsQueryKey() }
  });

  useEffect(() => {
    setDrawerOpen(false);
  }, [location]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  const sidebarProps = { location, credits, user, login, logout };

  const SIDEBAR_STYLES: React.CSSProperties = {
    width: 220,
    background: "rgba(3,3,12,0.98)",
    borderRight: "1px solid rgba(0,245,255,0.07)",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: "#030309", overflow: "hidden", color: "#e0e8ff" }}>

      {/* Scanline overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,245,255,0.01) 0px, rgba(0,245,255,0.01) 1px, transparent 1px, transparent 4px)",
      }} />

      {/* Desktop sidebar */}
      <aside className="hidden md:flex" style={{ ...SIDEBAR_STYLES, flexDirection: "column" }}>
        <div style={{ height: 54, display: "flex", alignItems: "center", padding: "0 14px", borderBottom: "1px solid rgba(0,245,255,0.07)", flexShrink: 0 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <RegentLogo size={26} />
            <div>
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: "0.08em", color: "#e0e8ff" }}>REGENT</div>
              <div style={{ fontSize: 9, color: "rgba(0,245,255,0.45)", letterSpacing: "0.15em" }}>SYN·INT·STUDIO</div>
            </div>
          </Link>
        </div>
        <SidebarContent {...sidebarProps} />
      </aside>

      {/* Mobile drawer backdrop */}
      {drawerOpen && (
        <div className="fixed inset-0 z-40 md:hidden" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-50 md:hidden flex flex-col"
        style={{
          ...SIDEBAR_STYLES,
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease-in-out",
        }}
      >
        <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", borderBottom: "1px solid rgba(0,245,255,0.07)", flexShrink: 0 }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <RegentLogo size={24} />
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", color: "#e0e8ff" }}>REGENT</span>
          </Link>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{ padding: 6, borderRadius: 4, background: "transparent", border: "none", cursor: "pointer", color: "rgba(224,232,255,0.4)" }}
          >
            <X style={{ width: 16, height: 16 }} />
          </button>
        </div>
        <SidebarContent {...sidebarProps} onNavigate={() => setDrawerOpen(false)} />
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}>

        {/* Mobile top bar */}
        <div className="md:hidden" style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 16px", height: 54, borderBottom: "1px solid rgba(0,245,255,0.07)", background: "rgba(3,3,12,0.98)", flexShrink: 0 }}>
          <button
            onClick={() => setDrawerOpen(true)}
            style={{ padding: 6, borderRadius: 4, background: "transparent", border: "none", cursor: "pointer", color: "rgba(224,232,255,0.5)" }}
          >
            <Menu style={{ width: 18, height: 18 }} />
          </button>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <RegentLogo size={22} />
            <span style={{ fontWeight: 800, fontSize: 12, letterSpacing: "0.08em", color: "#e0e8ff" }}>REGENT</span>
          </Link>
        </div>

        <main style={{ flex: 1, overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
