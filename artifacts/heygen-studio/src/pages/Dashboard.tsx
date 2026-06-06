import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useListVideos, getListVideosQueryKey } from "@workspace/api-client-react";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mic, Palette, Plus, SlidersHorizontal, Send,
  ArrowRight, Video, Brain, Scissors,
  Zap, AppWindow, Camera, Layers, Cpu,
} from "lucide-react";

const NEON = {
  cyan: "#00f5ff",
  magenta: "#ff2fff",
  green: "#00ff88",
  orange: "#ff6b00",
  purple: "#7b2fff",
};

const FEATURE_CARDS = [
  {
    title: "SI Director",
    subtitle: "Full AI production →",
    href: "/si-director",
    glow: NEON.magenta,
    bg: "rgba(255,47,255,0.07)",
    border: "rgba(255,47,255,0.2)",
    icon: Brain,
    badge: "SI",
  },
  {
    title: "Viral Engine",
    subtitle: "8-angle content →",
    href: "/viral-engine",
    glow: NEON.orange,
    bg: "rgba(255,107,0,0.07)",
    border: "rgba(255,107,0,0.2)",
    icon: Zap,
    badge: "HOT",
  },
  {
    title: "Avatar Shots",
    subtitle: "Cinematic heads →",
    href: "/avatar-shots",
    glow: NEON.cyan,
    bg: "rgba(0,245,255,0.07)",
    border: "rgba(0,245,255,0.2)",
    icon: Camera,
    badge: "NEW",
  },
  {
    title: "Kling Omni",
    subtitle: "Generate video →",
    href: "/generate/kling-direct%2Fv2-master-omni",
    glow: NEON.green,
    bg: "rgba(0,255,136,0.07)",
    border: "rgba(0,255,136,0.2)",
    icon: Video,
    badge: "OMNI",
  },
  {
    title: "Seedream 3.0",
    subtitle: "Image studio →",
    href: "/generate/fal-ai%2Fseedream-3",
    glow: NEON.purple,
    bg: "rgba(123,47,255,0.07)",
    border: "rgba(123,47,255,0.2)",
    icon: Layers,
    badge: "TOP",
  },
  {
    title: "Model Hub",
    subtitle: "20+ AI models →",
    href: "/models",
    glow: NEON.cyan,
    bg: "rgba(0,245,255,0.05)",
    border: "rgba(0,245,255,0.12)",
    icon: Cpu,
  },
];

const QUICK_ACTIONS = [
  { label: "Script to Video", href: "/si-director" },
  { label: "Viral Hook", href: "/viral-engine" },
  { label: "Avatar Shot", href: "/avatar-shots" },
  { label: "Image Gen", href: "/generate/fal-ai%2Fseedream-3" },
];

const QUICK_TOOLS = [
  { label: "Urban Cuts", icon: Scissors, href: "/urban-cuts", color: NEON.orange },
  { label: "Lip Sync", icon: Mic, href: "/lip-sync", color: NEON.magenta },
  { label: "App Library", icon: AppWindow, href: "/apps", color: NEON.cyan },
  { label: "Creations", icon: Layers, href: "/creations", color: NEON.green },
];

const BADGE_COLORS: Record<string, string> = {
  SI: NEON.magenta,
  HOT: NEON.orange,
  NEW: NEON.cyan,
  OMNI: NEON.green,
  TOP: NEON.purple,
};

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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", color: "#e0e8ff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes pulse-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .dash-card:hover { transform: translateY(-1px); }
        .quick-tool:hover { background: rgba(0,245,255,0.06) !important; border-color: rgba(0,245,255,0.2) !important; }
      `}</style>

      {/* ── Hero ── */}
      <div style={{ position: "relative", padding: "48px 32px 32px", textAlign: "center", overflow: "hidden" }}>
        {/* Ambient glows */}
        <div style={{ position: "absolute", top: "-40%", left: "10%", width: "40%", height: "120%", background: "radial-gradient(ellipse at top, rgba(0,245,255,0.12) 0%, transparent 70%)", filter: "blur(32px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "-40%", right: "8%", width: "40%", height: "120%", background: "radial-gradient(ellipse at top, rgba(255,47,255,0.10) 0%, transparent 70%)", filter: "blur(32px)", pointerEvents: "none" }} />
        {/* Top beam */}
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 280, height: 2, background: "linear-gradient(90deg, transparent, #00f5ff, transparent)", filter: "blur(2px)", pointerEvents: "none" }} />

        <div style={{ position: "relative", maxWidth: 640, margin: "0 auto" }}>
          <div style={{ fontSize: 10, color: NEON.cyan, letterSpacing: "0.25em", fontWeight: 700, marginBottom: 12, opacity: 0.6 }}>
            ◈ SYNTHETIC INTELLIGENCE STUDIO
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginBottom: 8, lineHeight: 1.15 }}>
            <span style={{ color: NEON.cyan, textShadow: `0 0 30px ${NEON.cyan}60` }}>Say it.</span>{" "}
            <span style={{ color: "#e0e8ff" }}>Regent ships it.</span>
          </h1>
          <p style={{ color: "rgba(224,232,255,0.4)", fontSize: 14, marginBottom: 28, lineHeight: 1.65 }}>
            One concept → full video production. Scripts, shots, renders, all fired automatically.
          </p>

          {/* Prompt box */}
          <div style={{
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,245,255,0.12)",
            borderRadius: 8, overflow: "hidden", boxShadow: "0 0 40px rgba(0,245,255,0.04)",
            maxWidth: 560, margin: "0 auto",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 12px", borderBottom: "1px solid rgba(0,245,255,0.06)", overflowX: "auto" }}>
              {[
                { icon: User, label: "Auto Avatar" },
                { icon: Mic, label: "Auto Voice" },
                { icon: Palette, label: "Auto Style" },
              ].map(({ icon: Icon, label }) => (
                <button key={label} style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
                  borderRadius: 20, background: "rgba(0,245,255,0.05)", border: "1px solid rgba(0,245,255,0.12)",
                  fontSize: 11, color: "rgba(0,245,255,0.6)", cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                }}>
                  <Icon style={{ width: 11, height: 11 }} />{label}
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Describe your video concept — Regent's SI will plan and fire the whole production..."
              style={{ border: 0, background: "transparent", resize: "none", minHeight: 80, padding: "12px 14px", fontSize: 13, color: "#e0e8ff", outline: "none", fontFamily: "inherit" }}
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(); }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px" }}>
              <button style={{ padding: 6, borderRadius: 4, background: "transparent", border: "none", cursor: "pointer", color: "rgba(0,245,255,0.4)" }}>
                <Plus style={{ width: 15, height: 15 }} />
              </button>
              <button style={{ padding: 6, borderRadius: 4, background: "transparent", border: "none", cursor: "pointer", color: "rgba(0,245,255,0.4)" }}>
                <SlidersHorizontal style={{ width: 15, height: 15 }} />
              </button>
              <button
                onClick={handleSubmit}
                style={{
                  marginLeft: "auto", display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 18px", borderRadius: 5, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.3)",
                  color: NEON.cyan, letterSpacing: "0.04em",
                  boxShadow: "0 0 12px rgba(0,245,255,0.1)",
                }}
              >
                <Send style={{ width: 12, height: 12 }} /> SUBMIT
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginTop: 16 }}>
            {QUICK_ACTIONS.map(a => (
              <Link key={a.label} href={a.href}>
                <button style={{
                  fontSize: 11, padding: "5px 14px", borderRadius: 20,
                  background: "transparent", border: "1px solid rgba(0,245,255,0.1)",
                  color: "rgba(224,232,255,0.45)", cursor: "pointer", transition: "all 0.15s",
                  letterSpacing: "0.03em",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.3)"; (e.currentTarget as HTMLElement).style.color = NEON.cyan; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,245,255,0.1)"; (e.currentTarget as HTMLElement).style.color = "rgba(224,232,255,0.45)"; }}
                >{a.label}</button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: "0 28px 40px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>

        {/* Module grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {FEATURE_CARDS.map(card => (
            <Link key={card.title} href={card.href}>
              <div className="dash-card" style={{
                background: card.bg,
                border: `1px solid ${card.border}`,
                borderRadius: 8, padding: "18px 20px", cursor: "pointer",
                transition: "transform 0.2s, box-shadow 0.2s",
                position: "relative", overflow: "hidden",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 24px ${card.glow}15`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `radial-gradient(circle, ${card.glow}12 0%, transparent 70%)` }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 6, background: `${card.glow}15`, border: `1px solid ${card.glow}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <card.icon style={{ width: 17, height: 17, color: card.glow }} />
                  </div>
                  {card.badge && (
                    <span style={{
                      fontSize: 8, padding: "2px 6px", borderRadius: 2, fontWeight: 800,
                      background: `${BADGE_COLORS[card.badge]}15`,
                      color: BADGE_COLORS[card.badge],
                      border: `1px solid ${BADGE_COLORS[card.badge]}30`,
                      letterSpacing: "0.06em",
                    }}>{card.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e8ff", marginBottom: 4, letterSpacing: "0.01em" }}>{card.title}</div>
                <div style={{ fontSize: 11, color: card.glow, fontWeight: 600, opacity: 0.8 }}>{card.subtitle}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* SI Director banner */}
        <Link href="/si-director">
          <div style={{
            marginBottom: 20, background: "rgba(255,47,255,0.04)",
            border: "1px solid rgba(255,47,255,0.15)",
            borderRadius: 8, padding: "16px 20px",
            display: "flex", alignItems: "center", gap: 16, cursor: "pointer",
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,47,255,0.3)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 0 24px rgba(255,47,255,0.07)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,47,255,0.15)"; (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 8, background: "rgba(255,47,255,0.1)", border: "1px solid rgba(255,47,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 0 16px rgba(255,47,255,0.15)" }}>
              <Brain style={{ width: 22, height: 22, color: NEON.magenta }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#e0e8ff" }}>SI Director</span>
                <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 2, background: "rgba(255,47,255,0.1)", border: "1px solid rgba(255,47,255,0.25)", color: NEON.magenta, fontWeight: 700, letterSpacing: "0.1em" }}>SYNTHETIC INTELLIGENCE</span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(224,232,255,0.4)", lineHeight: 1.5 }}>
                Give it a concept — it plans the full production: shots, models, narrative arc, and visual language, then fires them all.
              </p>
            </div>
            <ArrowRight style={{ width: 16, height: 16, color: "rgba(255,47,255,0.5)", flexShrink: 0 }} />
          </div>
        </Link>

        {/* Quick tools */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 32 }}>
          {QUICK_TOOLS.map(({ label, icon: Icon, href, color }) => (
            <Link key={label} href={href}>
              <div className="quick-tool" style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,245,255,0.07)",
                borderRadius: 7, padding: "14px 10px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                cursor: "pointer", transition: "all 0.15s", textAlign: "center",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 6, background: `${color}12`, border: `1px solid ${color}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 17, height: 17, color }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "rgba(224,232,255,0.55)", letterSpacing: "0.02em" }}>{label}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent productions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: "#e0e8ff", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              // Recent Creations
            </h2>
            <Link href="/videos" style={{ fontSize: 12, color: NEON.cyan, textDecoration: "none", fontWeight: 600, letterSpacing: "0.04em", opacity: 0.7 }}>
              All Projects →
            </Link>
          </div>
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {[1,2,3,4].map(i => <div key={i} style={{ aspectRatio: "16/9", background: "rgba(0,245,255,0.04)", borderRadius: 7, border: "1px solid rgba(0,245,255,0.06)", animation: "pulse 2s ease-in-out infinite" }} />)}
            </div>
          ) : videos.length === 0 ? (
            <div style={{ border: "1px dashed rgba(0,245,255,0.12)", borderRadius: 8, padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,245,255,0.06)", border: "1px solid rgba(0,245,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Video style={{ width: 22, height: 22, color: "rgba(0,245,255,0.4)" }} />
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#e0e8ff", marginBottom: 4 }}>No productions yet</p>
                <p style={{ fontSize: 12, color: "rgba(224,232,255,0.35)" }}>Your recent videos will appear here.</p>
              </div>
              <Button size="sm" onClick={() => setLocation("/create")} style={{ fontSize: 12, background: "rgba(0,245,255,0.1)", border: "1px solid rgba(0,245,255,0.25)", color: NEON.cyan }}>
                Create your first video
              </Button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
              {videos.map(video => <VideoCard key={video.id} video={video} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
