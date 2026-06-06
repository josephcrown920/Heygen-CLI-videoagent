import { useState } from "react";

const NAV = [
  { icon: "⬛", label: "Dashboard", active: true },
  { icon: "🎬", label: "SI Director" },
  { icon: "⚡", label: "Viral Engine" },
  { icon: "👤", label: "Avatar Shots" },
  { icon: "🎵", label: "Lip Sync" },
  { icon: "🌐", label: "Live Avatar" },
  { icon: "🧠", label: "Model Hub" },
  { icon: "📽", label: "Creations" },
];

const TILES = [
  { label: "SI Director", sub: "Full production planning", color: "#c8a96e", bg: "rgba(200,169,110,0.08)", border: "rgba(200,169,110,0.25)" },
  { label: "Avatar Shots", sub: "Cinematic talking heads", color: "#e07b54", bg: "rgba(224,123,84,0.08)", border: "rgba(224,123,84,0.25)" },
  { label: "Viral Engine", sub: "8-angle content hooks", color: "#7fb3c8", bg: "rgba(127,179,200,0.08)", border: "rgba(127,179,200,0.25)" },
  { label: "Lip Sync", sub: "HeyGen sync engine", color: "#a48cc8", bg: "rgba(164,140,200,0.08)", border: "rgba(164,140,200,0.25)" },
  { label: "Lyrics Video", sub: "Animated lyrics", color: "#c87f9a", bg: "rgba(200,127,154,0.08)", border: "rgba(200,127,154,0.25)" },
  { label: "Urban Cuts", sub: "Street-style edits", color: "#6ec8a0", bg: "rgba(110,200,160,0.08)", border: "rgba(110,200,160,0.25)" },
];

export function Cinematic() {
  const [active, setActive] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      display: "flex",
      fontFamily: "'Inter', sans-serif",
      color: "#e8e0d4",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Film grain overlay */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.4,
      }} />

      {/* Vignette */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 998,
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
      }} />

      {/* Sidebar */}
      <aside style={{
        width: 220, background: "#0d0d0d", borderRight: "1px solid rgba(200,169,110,0.12)",
        display: "flex", flexDirection: "column", flexShrink: 0, position: "relative", zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px", borderBottom: "1px solid rgba(200,169,110,0.1)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 7,
              background: "linear-gradient(135deg, #c8a96e 0%, #e07b54 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 800, color: "#0a0a0a",
            }}>R</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.02em", color: "#e8e0d4" }}>REGENT</div>
              <div style={{ fontSize: 9, color: "#c8a96e", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 1 }}>AI STUDIO</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ padding: "12px 8px", flex: 1 }}>
          <div style={{ fontSize: 9, color: "rgba(200,169,110,0.5)", letterSpacing: "0.2em", textTransform: "uppercase", padding: "4px 12px 8px" }}>Production Suite</div>
          {NAV.map((item, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: "100%", textAlign: "left", padding: "8px 12px", borderRadius: 6,
              background: active === i ? "rgba(200,169,110,0.1)" : "transparent",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              color: active === i ? "#c8a96e" : "rgba(232,224,212,0.55)",
              fontSize: 13, fontWeight: active === i ? 600 : 400, marginBottom: 1,
              borderLeft: active === i ? "2px solid #c8a96e" : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <span style={{ fontSize: 14 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Credits */}
        <div style={{ padding: 12, borderTop: "1px solid rgba(200,169,110,0.1)" }}>
          <div style={{ background: "rgba(200,169,110,0.06)", border: "1px solid rgba(200,169,110,0.15)", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ fontSize: 10, color: "rgba(200,169,110,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>HeyGen Credits</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#c8a96e" }}>2,840</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 10 }}>
        {/* Top bar */}
        <div style={{
          height: 56, borderBottom: "1px solid rgba(200,169,110,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", background: "rgba(10,10,10,0.8)", backdropFilter: "blur(12px)",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#e8e0d4", letterSpacing: "-0.02em" }}>Production Dashboard</div>
            <div style={{ fontSize: 11, color: "rgba(200,169,110,0.6)" }}>Select a module to begin</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: "linear-gradient(135deg, #c8a96e, #e07b54)",
              padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              color: "#0a0a0a", cursor: "pointer", letterSpacing: "0.02em",
            }}>+ NEW PROJECT</div>
          </div>
        </div>

        {/* Hero banner */}
        <div style={{
          margin: "28px 28px 0",
          background: "linear-gradient(135deg, rgba(200,169,110,0.08) 0%, rgba(224,123,84,0.05) 100%)",
          border: "1px solid rgba(200,169,110,0.15)",
          borderRadius: 12, padding: "28px 32px",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", right: -20, top: -20, width: 200, height: 200,
            background: "radial-gradient(circle, rgba(200,169,110,0.12) 0%, transparent 70%)",
            borderRadius: "50%",
          }} />
          <div style={{ fontSize: 10, color: "#c8a96e", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>⬛ SYNTHETIC INTELLIGENCE DIRECTOR</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#e8e0d4", letterSpacing: "-0.03em", lineHeight: 1.2, marginBottom: 8 }}>
            AI video production,<br /><span style={{ color: "#c8a96e" }}>fully automated</span>
          </div>
          <div style={{ fontSize: 13, color: "rgba(232,224,212,0.55)", maxWidth: 480 }}>
            One concept in — scripts, shots, and HeyGen renders out. Powered by Kling, Seedance &amp; fal.ai.
          </div>
          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button style={{
              background: "linear-gradient(135deg, #c8a96e, #e07b54)", border: "none",
              padding: "9px 20px", borderRadius: 6, color: "#0a0a0a", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>▶ Launch SI Director</button>
            <button style={{
              background: "transparent", border: "1px solid rgba(200,169,110,0.3)",
              padding: "9px 20px", borderRadius: 6, color: "#c8a96e", fontSize: 13, cursor: "pointer",
            }}>View Creations</button>
          </div>
        </div>

        {/* Module grid */}
        <div style={{ padding: "24px 28px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {TILES.map((tile, i) => (
            <div key={i} style={{
              background: tile.bg, border: `1px solid ${tile.border}`,
              borderRadius: 10, padding: "20px 22px", cursor: "pointer",
              transition: "transform 0.15s, border-color 0.15s",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{
                position: "absolute", top: -16, right: -16, width: 80, height: 80,
                background: `radial-gradient(circle, ${tile.color}18 0%, transparent 70%)`,
                borderRadius: "50%",
              }} />
              <div style={{ fontSize: 22, marginBottom: 10 }}>
                {["🎬", "📷", "⚡", "🎤", "🎵", "✂️"][i]}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e0d4", marginBottom: 4 }}>{tile.label}</div>
              <div style={{ fontSize: 11, color: "rgba(232,224,212,0.45)" }}>{tile.sub}</div>
              <div style={{ marginTop: 14, fontSize: 11, color: tile.color, fontWeight: 600 }}>Open →</div>
            </div>
          ))}
        </div>

        {/* Status strip */}
        <div style={{ margin: "0 28px 28px", background: "rgba(200,169,110,0.04)", border: "1px solid rgba(200,169,110,0.1)", borderRadius: 8, padding: "12px 18px", display: "flex", gap: 28, alignItems: "center" }}>
          {[["Kling Master", "Ready"], ["Seedance 1.0", "Ready"], ["HeyGen", "Connected"], ["Gemini Pro", "Active"]].map(([model, status], i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
              <span style={{ width: 6, height: 6, background: "#6ec8a0", borderRadius: "50%", display: "inline-block", marginTop: 2 }} />
              <span style={{ color: "rgba(232,224,212,0.6)" }}>{model}</span>
              <span style={{ color: "#6ec8a0", fontWeight: 600 }}>{status}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
