import { useState } from "react";

const NAV = [
  { label: "Dashboard", icon: "▤" },
  { label: "SI Director", icon: "◎", badge: "AI" },
  { label: "Viral Engine", icon: "◈", badge: "NEW" },
  { label: "Avatar Shots", icon: "◉" },
  { label: "Lip Sync", icon: "◐" },
  { label: "Live Avatar", icon: "◑" },
  { label: "Model Hub", icon: "▣" },
  { label: "Creations", icon: "▦" },
];

const TILES = [
  { label: "SI Director", sub: "Full AI production pipeline", icon: "◎", color: "#818cf8", light: "rgba(129,140,248,0.12)" },
  { label: "Viral Engine", sub: "8-angle content strategy", icon: "◈", color: "#38bdf8", light: "rgba(56,189,248,0.12)" },
  { label: "Kling Omni", sub: "Next-gen video generation", icon: "◆", color: "#34d399", light: "rgba(52,211,153,0.12)" },
  { label: "Avatar Shots", sub: "Talking head cinema", icon: "◉", color: "#f472b6", light: "rgba(244,114,182,0.12)" },
  { label: "Seedream 3.0", sub: "AI image studio", icon: "◒", color: "#fb923c", light: "rgba(251,146,60,0.12)" },
  { label: "Lip Sync", sub: "Perfect audio syncing", icon: "◐", color: "#a78bfa", light: "rgba(167,139,250,0.12)" },
];

export function GlassPremium() {
  const [active, setActive] = useState(0);

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a0f1e 0%, #0f1628 50%, #0a0f1e 100%)",
      display: "flex",
      fontFamily: "'Inter', -apple-system, sans-serif",
      color: "#e2e8f0",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background orbs */}
      <div style={{ position: "fixed", top: "10%", left: "15%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: "10%", right: "10%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(56,189,248,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: "50%", right: "30%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

      {/* Sidebar */}
      <aside style={{
        width: 228,
        background: "rgba(255,255,255,0.03)",
        backdropFilter: "blur(24px)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex", flexDirection: "column", flexShrink: 0, zIndex: 10,
      }}>
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(99,102,241,0.8) 0%, rgba(168,85,247,0.8) 100%)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, fontWeight: 800, color: "#fff",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>R</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: "-0.025em", color: "#f1f5f9" }}>Regent</div>
              <div style={{ fontSize: 10, color: "rgba(148,163,184,0.7)", letterSpacing: "0.05em" }}>AI Studio Platform</div>
            </div>
          </div>
        </div>

        <nav style={{ padding: "10px 10px", flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(148,163,184,0.5)", letterSpacing: "0.08em", textTransform: "uppercase", padding: "6px 10px 8px" }}>Main Menu</div>
          {NAV.map((item, i) => (
            <button key={i} onClick={() => setActive(i)} style={{
              width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 8,
              background: active === i ? "rgba(255,255,255,0.07)" : "transparent",
              border: active === i ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 9,
              color: active === i ? "#f1f5f9" : "rgba(148,163,184,0.65)",
              fontSize: 13, fontWeight: active === i ? 600 : 400, marginBottom: 1,
              backdropFilter: active === i ? "blur(8px)" : "none",
              boxShadow: active === i ? "0 2px 12px rgba(0,0,0,0.15)" : "none",
            }}>
              <span style={{ fontSize: 14, opacity: active === i ? 1 : 0.6 }}>{item.icon}</span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span style={{
                  fontSize: 9, padding: "2px 6px", borderRadius: 4, fontWeight: 700,
                  background: item.badge === "AI" ? "rgba(99,102,241,0.2)" : "rgba(56,189,248,0.2)",
                  color: item.badge === "AI" ? "#a5b4fc" : "#7dd3fc",
                  border: `1px solid ${item.badge === "AI" ? "rgba(99,102,241,0.3)" : "rgba(56,189,248,0.3)"}`,
                }}>{item.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{
            background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, padding: "12px 14px",
          }}>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.6)", marginBottom: 5 }}>HeyGen Credits</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.02em" }}>2,840</div>
            <div style={{ marginTop: 8, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2 }}>
              <div style={{ width: "68%", height: "100%", background: "linear-gradient(90deg, #6366f1, #a78bfa)", borderRadius: 2 }} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto", zIndex: 10 }}>
        {/* Top bar */}
        <div style={{
          height: 56, display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "0 28px",
          background: "rgba(255,255,255,0.02)", backdropFilter: "blur(24px)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
          position: "sticky", top: 0, zIndex: 20,
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.02em" }}>Dashboard</div>
            <div style={{ fontSize: 11, color: "rgba(148,163,184,0.5)" }}>Welcome back, Creator</div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {["Kling Omni", "Seedance", "Gemini"].map((m, i) => (
              <span key={i} style={{
                fontSize: 11, padding: "4px 10px", borderRadius: 20,
                background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(148,163,184,0.8)", backdropFilter: "blur(8px)",
              }}>
                <span style={{ color: "#4ade80" }}>●</span> {m}
              </span>
            ))}
            <button style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              border: "1px solid rgba(255,255,255,0.15)",
              padding: "8px 18px", borderRadius: 8, color: "#fff",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              boxShadow: "0 4px 16px rgba(99,102,241,0.3)",
            }}>+ New Project</button>
          </div>
        </div>

        <div style={{ padding: "28px 28px" }}>
          {/* Hero card */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 16, padding: "32px 36px", marginBottom: 24,
            position: "relative", overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.2)",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(168,85,247,0.04) 50%, rgba(56,189,248,0.04) 100%)", borderRadius: 16 }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 12, color: "#a5b4fc", fontWeight: 600, letterSpacing: "0.06em", marginBottom: 10, textTransform: "uppercase" }}>✦ Synthetic Intelligence Director</div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.03em", lineHeight: 1.15, marginBottom: 12 }}>
                AI video production,<br />
                <span style={{ background: "linear-gradient(135deg, #818cf8, #38bdf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>fully automated.</span>
              </div>
              <div style={{ fontSize: 14, color: "rgba(148,163,184,0.7)", maxWidth: 520, lineHeight: 1.6 }}>
                One concept becomes a complete production. Scripts, shots, model selection, and HeyGen renders — all planned by AI.
              </div>
              <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
                <button style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                  border: "none", padding: "10px 24px", borderRadius: 10,
                  color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                }}>▶ Launch SI Director</button>
                <button style={{
                  background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)", padding: "10px 24px", borderRadius: 10,
                  color: "#e2e8f0", fontSize: 14, cursor: "pointer",
                }}>View Creations</button>
              </div>
            </div>
          </div>

          {/* Module grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {TILES.map((t, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12, padding: "20px 22px", cursor: "pointer",
                boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
                transition: "all 0.2s",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", inset: 0, background: t.light, borderRadius: 12 }} />
                <div style={{ position: "relative" }}>
                  <div style={{ fontSize: 26, color: t.color, marginBottom: 12, filter: `drop-shadow(0 0 6px ${t.color}60)` }}>{t.icon}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", marginBottom: 4, letterSpacing: "-0.01em" }}>{t.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(148,163,184,0.6)" }}>{t.sub}</div>
                  <div style={{ marginTop: 14, fontSize: 12, color: t.color, fontWeight: 600 }}>Open →</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
