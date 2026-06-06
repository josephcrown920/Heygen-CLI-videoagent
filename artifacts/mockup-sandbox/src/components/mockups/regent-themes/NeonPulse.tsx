import { useState, useEffect } from "react";

const NAV = [
  { icon: "◈", label: "Dashboard", active: true },
  { icon: "◉", label: "SI Director", badge: "SI" },
  { icon: "◆", label: "Viral Engine", badge: "HOT" },
  { icon: "◎", label: "Avatar Shots" },
  { icon: "◐", label: "Lip Sync" },
  { icon: "◑", label: "Live Avatar" },
  { icon: "◒", label: "Model Hub" },
  { icon: "◓", label: "Creations" },
];

const TILES = [
  { label: "SI Director", sub: "AI production planner", icon: "⬡", glow: "#00f5ff", grad: "linear-gradient(135deg,#00f5ff22,#7b2fff22)" },
  { label: "Avatar Shots", sub: "Talking head videos", icon: "⬢", glow: "#ff2fff", grad: "linear-gradient(135deg,#ff2fff22,#ff006022)" },
  { label: "Viral Engine", sub: "8-angle hooks engine", icon: "⬣", glow: "#ff6b00", grad: "linear-gradient(135deg,#ff6b0022,#ff2fff22)" },
  { label: "Kling Omni", sub: "Next-gen video model", icon: "⬤", glow: "#00ff88", grad: "linear-gradient(135deg,#00ff8822,#00f5ff22)" },
  { label: "Seedream 3.0", sub: "Image generation", icon: "◈", glow: "#7b2fff", grad: "linear-gradient(135deg,#7b2fff22,#ff2fff22)" },
  { label: "Lip Sync", sub: "Perfect audio sync", icon: "◉", glow: "#ff2fff", grad: "linear-gradient(135deg,#ff2fff22,#00f5ff22)" },
];

export function NeonPulse() {
  const [tick, setTick] = useState(0);
  const [active, setActive] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick(x => (x + 1) % 3), 800); return () => clearInterval(t); }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030309",
      display: "flex",
      fontFamily: "'Inter', monospace",
      color: "#e0e8ff",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glows */}
      <div style={{ position: "fixed", top: -100, left: "30%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,245,255,0.04) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: -100, right: "20%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,47,255,0.05) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Scanlines */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none", zIndex: 999,
        backgroundImage: "repeating-linear-gradient(0deg, rgba(0,245,255,0.015) 0px, rgba(0,245,255,0.015) 1px, transparent 1px, transparent 3px)",
      }} />

      {/* Sidebar */}
      <aside style={{
        width: 220, background: "rgba(3,3,12,0.95)", borderRight: "1px solid rgba(0,245,255,0.12)",
        display: "flex", flexDirection: "column", flexShrink: 0, position: "relative", zIndex: 10,
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ padding: "22px 18px 18px", borderBottom: "1px solid rgba(0,245,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8,
              background: "transparent",
              border: "1.5px solid #00f5ff",
              boxShadow: "0 0 12px rgba(0,245,255,0.4), inset 0 0 12px rgba(0,245,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#00f5ff",
            }}>R</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: "0.08em", color: "#e0e8ff", textShadow: "0 0 20px rgba(0,245,255,0.4)" }}>REGENT</div>
              <div style={{ fontSize: 9, color: "#00f5ff", letterSpacing: "0.25em", textTransform: "uppercase" }}>
                SYN·INT·{["◆", "◈", "◉"][tick]}
              </div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "10px 8px", flex: 1 }}>
          <div style={{ fontSize: 9, color: "rgba(0,245,255,0.4)", letterSpacing: "0.2em", padding: "4px 10px 8px" }}>// MODULES</div>
          {NAV.map((item, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 4,
              background: active === i ? "rgba(0,245,255,0.07)" : "transparent",
              border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8,
              color: active === i ? "#00f5ff" : "rgba(224,232,255,0.4)",
              fontSize: 12, fontWeight: active === i ? 700 : 400, marginBottom: 1,
              borderLeft: active === i ? "2px solid #00f5ff" : "2px solid transparent",
              boxShadow: active === i ? "inset 0 0 20px rgba(0,245,255,0.05)" : "none",
            }}>
              <span style={{ fontSize: 13, filter: active === i ? "drop-shadow(0 0 4px #00f5ff)" : "none" }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 3,
                  background: item.badge === "SI" ? "rgba(123,47,255,0.3)" : "rgba(255,107,0,0.3)",
                  color: item.badge === "SI" ? "#b47fff" : "#ff9947",
                  border: `1px solid ${item.badge === "SI" ? "rgba(123,47,255,0.5)" : "rgba(255,107,0,0.5)"}`,
                  fontWeight: 700, letterSpacing: "0.05em",
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: 10, borderTop: "1px solid rgba(0,245,255,0.08)" }}>
          <div style={{
            background: "rgba(0,245,255,0.04)", border: "1px solid rgba(0,245,255,0.15)",
            borderRadius: 6, padding: "10px 12px",
            boxShadow: "0 0 20px rgba(0,245,255,0.05)",
          }}>
            <div style={{ fontSize: 10, color: "rgba(0,245,255,0.5)", letterSpacing: "0.15em", marginBottom: 4 }}>// CREDITS</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#00f5ff", fontVariantNumeric: "tabular-nums", textShadow: "0 0 20px rgba(0,245,255,0.5)" }}>2,840</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 10 }}>
        {/* Top bar */}
        <div style={{
          height: 54, borderBottom: "1px solid rgba(0,245,255,0.07)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px", background: "rgba(3,3,12,0.9)", backdropFilter: "blur(20px)",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e0e8ff", letterSpacing: "0.04em" }}>PRODUCTION_DASHBOARD</div>
            <div style={{ display: "flex", gap: 6 }}>
              {["Kling", "Seedance", "HeyGen", "Gemini"].map((m, i) => (
                <span key={i} style={{
                  fontSize: 10, padding: "3px 8px", borderRadius: 3,
                  background: "rgba(0,255,136,0.08)", border: "1px solid rgba(0,255,136,0.2)",
                  color: "#00ff88", fontWeight: 600, letterSpacing: "0.05em",
                }}>
                  <span style={{ opacity: tick === i % 3 ? 1 : 0.4 }}>●</span> {m}
                </span>
              ))}
            </div>
          </div>
          <button style={{
            background: "transparent", border: "1px solid #00f5ff",
            padding: "7px 18px", borderRadius: 4, color: "#00f5ff", fontSize: 12, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.08em",
            boxShadow: "0 0 12px rgba(0,245,255,0.2), inset 0 0 12px rgba(0,245,255,0.05)",
          }}>[ + NEW ]</button>
        </div>

        {/* Hero */}
        <div style={{
          margin: "24px 24px 0",
          background: "linear-gradient(135deg, rgba(0,245,255,0.06) 0%, rgba(123,47,255,0.06) 100%)",
          border: "1px solid rgba(0,245,255,0.15)",
          borderRadius: 8, padding: "28px 32px", position: "relative", overflow: "hidden",
          boxShadow: "0 0 40px rgba(0,245,255,0.05)",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }} />
          <div style={{ position: "relative" }}>
            <div style={{ fontSize: 10, color: "#00f5ff", letterSpacing: "0.3em", marginBottom: 10, textTransform: "uppercase" }}>
              ◈ SYNTHETIC INTELLIGENCE — ACTIVE
            </div>
            <div style={{ fontSize: 28, fontWeight: 900, color: "#e0e8ff", lineHeight: 1.15, marginBottom: 10, letterSpacing: "-0.02em" }}>
              AI video production,<br />
              <span style={{ color: "#00f5ff", textShadow: "0 0 30px rgba(0,245,255,0.6)" }}>fully</span>{" "}
              <span style={{ color: "#ff2fff", textShadow: "0 0 30px rgba(255,47,255,0.6)" }}>automated</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(224,232,255,0.5)", maxWidth: 500 }}>
              Concept → scripts → shots → HeyGen renders. Powered by Kling Omni, Seedance, Seedream &amp; Gemini.
            </div>
            <div style={{ marginTop: 18, display: "flex", gap: 10 }}>
              <button style={{
                background: "linear-gradient(135deg, rgba(0,245,255,0.2), rgba(123,47,255,0.2))",
                border: "1px solid #00f5ff", padding: "9px 22px", borderRadius: 4,
                color: "#00f5ff", fontSize: 13, fontWeight: 700, cursor: "pointer",
                boxShadow: "0 0 20px rgba(0,245,255,0.2)",
              }}>▶ LAUNCH DIRECTOR</button>
              <button style={{
                background: "transparent", border: "1px solid rgba(255,47,255,0.3)",
                padding: "9px 22px", borderRadius: 4, color: "#ff2fff", fontSize: 13, cursor: "pointer",
              }}>VIEW OUTPUT</button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {TILES.map((t, i) => (
            <div key={i} style={{
              background: t.grad, border: `1px solid ${t.glow}22`,
              borderRadius: 6, padding: "18px 20px", cursor: "pointer",
              boxShadow: `0 0 20px ${t.glow}08`,
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}>
              <div style={{ fontSize: 24, marginBottom: 10, color: t.glow, textShadow: `0 0 12px ${t.glow}80` }}>{t.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e0e8ff", marginBottom: 3, letterSpacing: "0.02em" }}>{t.label}</div>
              <div style={{ fontSize: 11, color: "rgba(224,232,255,0.4)" }}>{t.sub}</div>
              <div style={{ marginTop: 12, fontSize: 11, color: t.glow, fontWeight: 600, letterSpacing: "0.05em" }}>→ OPEN</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
