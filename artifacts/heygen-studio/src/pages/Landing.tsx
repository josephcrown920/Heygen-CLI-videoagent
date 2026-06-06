import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Zap, Video, Sparkles, CheckCircle2, ArrowRight,
  Play, Shield, Globe2, Clapperboard, Wand2, Camera,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function RegentLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rgl" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00f5ff" />
          <stop offset="100%" stopColor="#ff2fff" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="transparent" stroke="url(#rgl)" strokeWidth="1.5"/>
      <text x="7" y="24" fontFamily="Inter,Arial,sans-serif" fontWeight="900" fontSize="20" fill="url(#rgl)">R</text>
    </svg>
  );
}

const FEATURES = [
  {
    icon: Brain,
    color: "#ff2fff",
    bg: "rgba(255,47,255,0.08)",
    border: "rgba(255,47,255,0.2)",
    title: "SI Director",
    desc: "Give it a concept. It plans the full production — scripts, shots, narrative arc, visual language — then fires them all to HeyGen.",
  },
  {
    icon: Video,
    color: "#00f5ff",
    bg: "rgba(0,245,255,0.08)",
    border: "rgba(0,245,255,0.2)",
    title: "Avatar Video",
    desc: "300+ studio-quality AI avatars with natural voice synthesis. Create presenter videos in minutes, not days.",
  },
  {
    icon: Zap,
    color: "#ff6b00",
    bg: "rgba(255,107,0,0.08)",
    border: "rgba(255,107,0,0.2)",
    title: "Viral Engine",
    desc: "8 proven viral angles × your content. Generates multi-platform hooks with Kling Omni and Seedance video.",
  },
  {
    icon: Camera,
    color: "#00ff88",
    bg: "rgba(0,255,136,0.08)",
    border: "rgba(0,255,136,0.2)",
    title: "Avatar Shots",
    desc: "Cinematic shot sequences with professional direction: close-ups, wide shots, cutaways — all AI generated.",
  },
  {
    icon: Wand2,
    color: "#00f5ff",
    bg: "rgba(0,245,255,0.08)",
    border: "rgba(0,245,255,0.2)",
    title: "Magic Script",
    desc: "AI rewrites every shot's script inline. Give direction like 'make it urgent' or 'shorter, punchier' and watch it adapt.",
  },
  {
    icon: Clapperboard,
    color: "#7b2fff",
    bg: "rgba(123,47,255,0.08)",
    border: "rgba(123,47,255,0.2)",
    title: "Director Suite",
    desc: "Full creative control — pick your avatar, voice, orientation, and script. Fire individual shots or the whole production.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try Regent with no commitment.",
    cta: "Get started free",
    highlight: false,
    features: [
      "50 HeyGen credits / month",
      "3 SI Director productions",
      "fal.ai image generation",
      "CLI code generator",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    desc: "For creators who ship weekly.",
    cta: "Start Pro",
    highlight: true,
    features: [
      "500 HeyGen credits / month",
      "Unlimited SI Director runs",
      "Viral Engine — all 8 angles",
      "Avatar Shots + Urban Cuts",
      "Priority GPU queue",
      "Email support",
    ],
  },
  {
    name: "Studio",
    price: "$149",
    period: "/ month",
    desc: "For agencies and power creators.",
    cta: "Contact sales",
    highlight: false,
    features: [
      "2,000 HeyGen credits / month",
      "Everything in Pro",
      "Custom avatar training",
      "API access",
      "White-label exports",
      "Dedicated support",
    ],
  },
];

const MODELS = ["Kling Omni", "Kling 2.1 Master", "Seedance 1.0", "Seedream 3.0", "FLUX Pro", "Wan 2.1", "HeyGen", "Gemini", "Imagen 4", "Luma Ray"];

export function Landing() {
  return (
    <div className="min-h-screen text-foreground overflow-x-hidden" style={{ background: "#030309", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes pulse-glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .neon-btn-cyan {
          background: transparent;
          border: 1px solid #00f5ff;
          color: #00f5ff;
          box-shadow: 0 0 12px rgba(0,245,255,0.25), inset 0 0 12px rgba(0,245,255,0.05);
          transition: all 0.2s;
        }
        .neon-btn-cyan:hover {
          background: rgba(0,245,255,0.08);
          box-shadow: 0 0 24px rgba(0,245,255,0.4), inset 0 0 20px rgba(0,245,255,0.08);
        }
        .neon-btn-fill {
          background: linear-gradient(135deg, rgba(0,245,255,0.15) 0%, rgba(123,47,255,0.15) 100%);
          border: 1px solid rgba(0,245,255,0.5);
          color: #00f5ff;
          box-shadow: 0 0 20px rgba(0,245,255,0.2);
          transition: all 0.2s;
        }
        .neon-btn-fill:hover {
          box-shadow: 0 0 32px rgba(0,245,255,0.35);
          border-color: #00f5ff;
        }
      `}</style>

      {/* Scanline overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,245,255,0.012) 0px, rgba(0,245,255,0.012) 1px, transparent 1px, transparent 4px)",
      }} />

      {/* Ambient glows */}
      <div style={{ position: "fixed", top: "-10%", left: "20%", width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", top: "30%", right: "10%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,47,255,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* ── Nav ── */}
      <nav style={{
        borderBottom: "1px solid rgba(0,245,255,0.08)",
        background: "rgba(3,3,9,0.92)",
        backdropFilter: "blur(20px)",
        position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RegentLogo size={28} />
            <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.06em", color: "#e0e8ff" }}>REGENT</span>
            <span style={{
              fontSize: 9, padding: "2px 7px", borderRadius: 3, marginLeft: 4,
              border: "1px solid rgba(0,245,255,0.3)", color: "#00f5ff",
              fontWeight: 700, letterSpacing: "0.15em",
            }}>BETA</span>
          </div>
          <div style={{ display: "flex", gap: 28, fontSize: 12, color: "rgba(224,232,255,0.45)", letterSpacing: "0.05em" }}>
            {["FEATURES", "PRICING", "MODELS"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "inherit", textDecoration: "none", transition: "color 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#00f5ff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(224,232,255,0.45)")}>{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href={`${BASE_URL}/api/login`}>
              <button className="neon-btn-cyan" style={{ padding: "7px 18px", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                SIGN IN
              </button>
            </a>
            <a href={`${BASE_URL}/api/login`}>
              <button className="neon-btn-fill" style={{ padding: "7px 20px", borderRadius: 4, fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>
                GET STARTED
              </button>
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: "relative", padding: "100px 24px 80px", textAlign: "center", overflow: "hidden" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7, marginBottom: 24,
            padding: "5px 14px", borderRadius: 4,
            border: "1px solid rgba(255,47,255,0.3)",
            background: "rgba(255,47,255,0.06)",
            fontSize: 11, color: "#ff2fff", fontWeight: 700, letterSpacing: "0.12em",
          }}>
            <Sparkles size={11} />
            POWERED BY HEYGEN · KLING · GEMINI · FAL.AI
          </div>

          <h1 style={{ fontSize: 64, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "0 0 20px", color: "#e0e8ff" }}>
            AI video production,{" "}
            <span style={{ color: "#00f5ff", textShadow: "0 0 40px rgba(0,245,255,0.5)" }}>fully</span>{" "}
            <span style={{ color: "#ff2fff", textShadow: "0 0 40px rgba(255,47,255,0.5)" }}>automated</span>
          </h1>

          <p style={{ fontSize: 18, color: "rgba(224,232,255,0.5)", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.65 }}>
            Regent's Synthetic Intelligence plans your entire video production — scripts, shots, narrative arc — then fires them all to HeyGen and fal.ai. One concept in, finished videos out.
          </p>

          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <a href={`${BASE_URL}/api/login`}>
              <button className="neon-btn-fill" style={{ padding: "13px 32px", borderRadius: 5, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.04em" }}>
                <Play size={14} fill="currentColor" />START CREATING FREE
              </button>
            </a>
            <Link href="/si-director">
              <button className="neon-btn-cyan" style={{ padding: "13px 32px", borderRadius: 5, fontSize: 14, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.04em" }}>
                <Brain size={14} />SI DIRECTOR
              </button>
            </Link>
          </div>
          <p style={{ marginTop: 14, fontSize: 11, color: "rgba(224,232,255,0.3)", letterSpacing: "0.06em" }}>
            NO CREDIT CARD · 50 FREE HEYGEN CREDITS ON SIGNUP
          </p>
        </div>

        {/* Floating product preview */}
        <div style={{ maxWidth: 960, margin: "56px auto 0", padding: "0 24px", animation: "float 6s ease-in-out infinite" }}>
          <div style={{
            background: "rgba(3,3,12,0.95)",
            border: "1px solid rgba(0,245,255,0.15)",
            borderRadius: 10,
            boxShadow: "0 0 60px rgba(0,245,255,0.06), 0 40px 80px rgba(0,0,0,0.6)",
            overflow: "hidden",
          }}>
            {/* Window chrome */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10, padding: "10px 16px",
              borderBottom: "1px solid rgba(0,245,255,0.08)",
              background: "rgba(0,245,255,0.02)",
            }}>
              <div style={{ display: "flex", gap: 5 }}>
                {["#ff5f57","#febc2e","#28c840"].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: "50%", background: c, opacity: 0.6 }} />)}
              </div>
              <span style={{ fontSize: 11, color: "rgba(0,245,255,0.5)", fontWeight: 600, letterSpacing: "0.08em", flex: 1, textAlign: "center" }}>REGENT — SI DIRECTOR</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#00ff88", fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00ff88", display: "inline-block", animation: "pulse-glow 2s ease-in-out infinite" }} />
                3 SHOTS FIRING
              </div>
            </div>
            {/* Shot grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
              {[
                { title: "Opening Hook", status: "Done", statusColor: "#00ff88", bg: "rgba(0,255,136,0.06)", icon: "✓" },
                { title: "Core Message", status: "Rendering…", statusColor: "#00f5ff", bg: "rgba(0,245,255,0.06)", icon: null },
                { title: "Call to Action", status: "Queued", statusColor: "rgba(224,232,255,0.3)", bg: "transparent", icon: null },
              ].map((shot, i) => (
                <div key={i} style={{ padding: "20px", borderRight: i < 2 ? "1px solid rgba(0,245,255,0.06)" : "none", background: shot.bg }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", border: `1px solid ${shot.statusColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: shot.statusColor }}>{i + 1}</div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#e0e8ff", letterSpacing: "0.02em" }}>{shot.title}</span>
                    <span style={{ marginLeft: "auto", fontSize: 9, color: shot.statusColor, fontWeight: 700, letterSpacing: "0.06em" }}>{shot.status}</span>
                  </div>
                  <div style={{ height: 52, borderRadius: 5, background: `${shot.statusColor}10`, border: `1px solid ${shot.statusColor}25`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                    {i === 0 && <CheckCircle2 size={20} color="#00ff88" />}
                    {i === 1 && <div style={{ width: 18, height: 18, border: "2px solid #00f5ff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }} />}
                    {i === 2 && <Video size={20} color="rgba(224,232,255,0.15)" />}
                  </div>
                  <p style={{ fontSize: 9, color: "rgba(224,232,255,0.35)", fontFamily: "monospace", lineHeight: 1.5 }}>
                    {i === 0 ? '"The gap between where you are and where you could be…"' :
                     i === 1 ? '"Regent plans every shot. Scripts, arc, visual notes — all at once."' :
                     '"Start your first production. It takes 30 seconds."'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Model strip ── */}
      <section id="models" style={{ borderTop: "1px solid rgba(0,245,255,0.06)", borderBottom: "1px solid rgba(0,245,255,0.06)", padding: "14px 0", overflow: "hidden", background: "rgba(0,245,255,0.02)" }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite", width: "max-content" }}>
          {[...MODELS, ...MODELS].map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 24px", fontSize: 11, color: "rgba(0,245,255,0.4)", whiteSpace: "nowrap", fontWeight: 600, letterSpacing: "0.08em" }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(0,245,255,0.4)", display: "inline-block" }} />
              {m}
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" style={{ padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <div style={{ display: "inline-block", fontSize: 10, padding: "4px 12px", borderRadius: 3, border: "1px solid rgba(0,245,255,0.25)", color: "#00f5ff", fontWeight: 700, letterSpacing: "0.2em", marginBottom: 16 }}>// CAPABILITIES</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#e0e8ff", letterSpacing: "-0.025em", margin: "0 0 12px" }}>One platform. Entire pipeline.</h2>
          <p style={{ color: "rgba(224,232,255,0.4)", maxWidth: 480, margin: "0 auto", fontSize: 15 }}>From concept to finished multi-shot video — every step handled.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{
              background: f.bg,
              border: `1px solid ${f.border}`,
              borderRadius: 8, padding: "24px",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 32px ${f.color}15`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "none"; (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 6, background: `${f.color}15`, border: `1px solid ${f.color}30`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <f.icon size={18} color={f.color} />
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#e0e8ff", marginBottom: 8, letterSpacing: "0.02em" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(224,232,255,0.45)", lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SI Director spotlight ── */}
      <section style={{ padding: "60px 24px", borderTop: "1px solid rgba(0,245,255,0.06)", borderBottom: "1px solid rgba(0,245,255,0.06)", background: "rgba(0,245,255,0.015)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", gap: 80, flexWrap: "wrap" }}>
          <div style={{ flex: "1 1 400px" }}>
            <div style={{ fontSize: 10, color: "#ff2fff", letterSpacing: "0.2em", fontWeight: 700, marginBottom: 14 }}>◈ SYNTHETIC INTELLIGENCE DIRECTOR</div>
            <h2 style={{ fontSize: 36, fontWeight: 900, color: "#e0e8ff", letterSpacing: "-0.025em", lineHeight: 1.15, marginBottom: 16 }}>
              The first AI director<br />that thinks end-to-end
            </h2>
            <p style={{ color: "rgba(224,232,255,0.45)", lineHeight: 1.7, marginBottom: 24, fontSize: 14 }}>
              SI Director doesn't just generate one clip. It reads your concept, plans the narrative arc, writes every script with shot-specific direction, assigns visual language per scene, then fires the entire production to HeyGen — in one click.
            </p>
            <ul style={{ listStyle: "none", padding: 0, marginBottom: 28, display: "flex", flexDirection: "column", gap: 10 }}>
              {["Plans 3–8 shots with full narrative structure", "Writes shot-specific scripts + performance direction", "Visual notes for every scene (lighting, framing)", "Magic Script — AI rewrite any shot inline", "Powered by Gemini 2.0 Flash with multi-model fallback"].map(item => (
                <li key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(224,232,255,0.6)" }}>
                  <CheckCircle2 size={14} color="#00f5ff" style={{ flexShrink: 0 }} />{item}
                </li>
              ))}
            </ul>
            <a href={`${BASE_URL}/api/login`}>
              <button className="neon-btn-fill" style={{ padding: "11px 24px", borderRadius: 5, fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, letterSpacing: "0.04em" }}>
                <Brain size={14} />TRY SI DIRECTOR FREE <ArrowRight size={13} />
              </button>
            </a>
          </div>

          {/* Diagram */}
          <div style={{ flex: "1 1 280px", display: "flex", justifyContent: "center" }}>
            <div style={{ width: 240, height: 240, position: "relative", animation: "float 8s ease-in-out infinite" }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(255,47,255,0.15)" }} />
              <div style={{ position: "absolute", inset: 24, borderRadius: "50%", border: "1px solid rgba(0,245,255,0.1)" }} />
              <div style={{ position: "absolute", inset: "50%", transform: "translate(-50%,-50%)", width: 72, height: 72, borderRadius: 16, background: "rgba(255,47,255,0.1)", border: "1px solid rgba(255,47,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(255,47,255,0.2)" }}>
                <Brain size={32} color="#ff2fff" />
              </div>
              {[
                { icon: Video, color: "#00f5ff", label: "HeyGen", angle: 0 },
                { icon: Zap, color: "#ff6b00", label: "fal.ai", angle: 120 },
                { icon: Wand2, color: "#7b2fff", label: "Scripts", angle: 240 },
              ].map(({ icon: Icon, color, label, angle }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 96;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <div key={label} style={{
                    position: "absolute", width: 44, height: 44, borderRadius: 10,
                    border: `1px solid ${color}40`,
                    background: `${color}10`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    top: `calc(50% + ${y}px - 22px)`,
                    left: `calc(50% + ${x}px - 22px)`,
                    boxShadow: `0 0 16px ${color}20`,
                    animation: `float ${5 + angle / 60}s ease-in-out infinite`,
                  }}>
                    <Icon size={20} color={color} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{ display: "inline-block", fontSize: 10, padding: "4px 12px", borderRadius: 3, border: "1px solid rgba(255,107,0,0.25)", color: "#ff6b00", fontWeight: 700, letterSpacing: "0.2em", marginBottom: 16 }}>// PRICING</div>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#e0e8ff", letterSpacing: "-0.025em", margin: "0 0 10px" }}>Simple, transparent pricing</h2>
          <p style={{ color: "rgba(224,232,255,0.4)", fontSize: 15 }}>Start free. Scale when you're ready.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {PRICING.map(plan => (
            <div key={plan.name} style={{
              borderRadius: 10, padding: "28px", display: "flex", flexDirection: "column", gap: 20,
              border: plan.highlight ? "1px solid rgba(0,245,255,0.3)" : "1px solid rgba(0,245,255,0.08)",
              background: plan.highlight ? "rgba(0,245,255,0.04)" : "rgba(255,255,255,0.015)",
              boxShadow: plan.highlight ? "0 0 40px rgba(0,245,255,0.07)" : "none",
              position: "relative",
            }}>
              {plan.highlight && (
                <div style={{
                  position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                  fontSize: 9, padding: "4px 12px", borderRadius: 3,
                  background: "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(123,47,255,0.2))",
                  border: "1px solid rgba(0,245,255,0.4)", color: "#00f5ff",
                  fontWeight: 700, letterSpacing: "0.12em", whiteSpace: "nowrap",
                }}>MOST POPULAR</div>
              )}
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(224,232,255,0.5)", letterSpacing: "0.12em", marginBottom: 8 }}>{plan.name.toUpperCase()}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
                  <span style={{ fontSize: 40, fontWeight: 900, color: plan.highlight ? "#00f5ff" : "#e0e8ff", letterSpacing: "-0.03em", textShadow: plan.highlight ? "0 0 20px rgba(0,245,255,0.3)" : "none" }}>{plan.price}</span>
                  <span style={{ fontSize: 13, color: "rgba(224,232,255,0.4)" }}>{plan.period}</span>
                </div>
                <p style={{ fontSize: 13, color: "rgba(224,232,255,0.4)" }}>{plan.desc}</p>
              </div>
              <a href={`${BASE_URL}/api/login`} style={{ display: "block" }}>
                <button style={{
                  width: "100%", padding: "10px", borderRadius: 5, fontSize: 13, fontWeight: 700, cursor: "pointer",
                  border: plan.highlight ? "1px solid rgba(0,245,255,0.4)" : "1px solid rgba(0,245,255,0.15)",
                  background: plan.highlight ? "rgba(0,245,255,0.1)" : "transparent",
                  color: plan.highlight ? "#00f5ff" : "rgba(224,232,255,0.6)",
                  letterSpacing: "0.04em",
                  transition: "all 0.2s",
                }}>{plan.cta}</button>
              </a>
              <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "rgba(224,232,255,0.5)" }}>
                    <CheckCircle2 size={13} color={plan.highlight ? "#00f5ff" : "rgba(224,232,255,0.25)"} style={{ flexShrink: 0 }} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: "48px 24px", borderTop: "1px solid rgba(0,245,255,0.06)", borderBottom: "1px solid rgba(0,245,255,0.06)", background: "rgba(0,245,255,0.015)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }}>
          {[["300+", "HeyGen Avatars"], ["20+", "fal.ai Models"], ["8", "Viral Angles"], ["∞", "Productions"]].map(([n, l]) => (
            <div key={l}>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#00f5ff", textShadow: "0 0 20px rgba(0,245,255,0.4)", marginBottom: 4 }}>{n}</div>
              <div style={{ fontSize: 12, color: "rgba(224,232,255,0.4)", letterSpacing: "0.06em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 50%, rgba(0,245,255,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", maxWidth: 560, margin: "0 auto" }}>
          <h2 style={{ fontSize: 40, fontWeight: 900, color: "#e0e8ff", letterSpacing: "-0.03em", marginBottom: 16 }}>Start creating today</h2>
          <p style={{ color: "rgba(224,232,255,0.4)", marginBottom: 32, fontSize: 15 }}>No credit card. No wait. 50 HeyGen credits free on signup.</p>
          <a href={`${BASE_URL}/api/login`}>
            <button className="neon-btn-fill" style={{ padding: "14px 40px", borderRadius: 5, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 10, letterSpacing: "0.04em" }}>
              <Play size={15} fill="currentColor" />GET STARTED FREE
            </button>
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: "1px solid rgba(0,245,255,0.06)", padding: "24px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <RegentLogo size={20} />
            <span style={{ fontWeight: 800, fontSize: 13, color: "#e0e8ff", letterSpacing: "0.04em" }}>REGENT</span>
            <span style={{ color: "rgba(224,232,255,0.25)", fontSize: 11, marginLeft: 8 }}>AI Media Production Platform</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 11, color: "rgba(224,232,255,0.3)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Shield size={11} />Your data is private</span>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><Globe2 size={11} />Global CDN</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
