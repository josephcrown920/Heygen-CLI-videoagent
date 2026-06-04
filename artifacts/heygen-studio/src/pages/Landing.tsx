import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Zap, Video, Sparkles, CheckCircle2, ArrowRight,
  Play, Star, Shield, Globe2, Clapperboard, Wand2, Camera,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

function RegentLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="rgl" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#ef4444" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="7" fill="url(#rgl)" />
      <text x="7" y="24" fontFamily="Inter,Arial,sans-serif" fontWeight="800" fontSize="20" fill="white">R</text>
    </svg>
  );
}

const FEATURES = [
  {
    icon: Brain,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    title: "SI Director",
    desc: "Give it a concept. It plans the full production — scripts, shots, narrative arc, visual language — then fires them all to HeyGen.",
  },
  {
    icon: Video,
    color: "text-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    title: "Avatar Video",
    desc: "300+ studio-quality AI avatars with natural voice synthesis. Create presenter videos in minutes, not days.",
  },
  {
    icon: Zap,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    title: "Viral Engine",
    desc: "8 proven viral angles × your content. Generates multi-platform hooks with Kling and Seedance video.",
  },
  {
    icon: Camera,
    color: "text-pink-400",
    bg: "bg-pink-500/10 border-pink-500/20",
    title: "Avatar Shots",
    desc: "Cinematic shot sequences with professional direction: close-ups, wide shots, cutaways — all AI generated.",
  },
  {
    icon: Wand2,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10 border-cyan-500/20",
    title: "Magic Script",
    desc: "AI rewrites every shot's script inline. Give direction like 'make it urgent' or 'shorter, punchier' and watch it adapt.",
  },
  {
    icon: Clapperboard,
    color: "text-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    title: "Director Suite",
    desc: "Full creative control — pick your avatar, voice, orientation, and script. fire individual shots or the whole production.",
  },
];

const PRICING = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    desc: "Try Regent with no commitment.",
    cta: "Get started free",
    ctaVariant: "outline" as const,
    features: [
      "50 HeyGen credits / month",
      "3 SI Director productions",
      "fal.ai image generation",
      "CLI code generator",
      "Community support",
    ],
    highlight: false,
  },
  {
    name: "Pro",
    price: "$49",
    period: "/ month",
    desc: "For creators who ship weekly.",
    cta: "Start Pro",
    ctaVariant: "default" as const,
    features: [
      "500 HeyGen credits / month",
      "Unlimited SI Director runs",
      "Viral Engine — all 8 angles",
      "Avatar Shots + Urban Cuts",
      "Priority GPU queue",
      "Email support",
    ],
    highlight: true,
  },
  {
    name: "Studio",
    price: "$149",
    period: "/ month",
    desc: "For agencies and power creators.",
    cta: "Contact sales",
    ctaVariant: "outline" as const,
    features: [
      "2,000 HeyGen credits / month",
      "Everything in Pro",
      "Custom avatar training",
      "API access",
      "White-label exports",
      "Dedicated support",
    ],
    highlight: false,
  },
];

const MODELS = ["flux-pro", "kling-master", "seedance", "hunyuan", "wan-2.1", "ideogram"];

export function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes pulse-slow { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes beam-pulse { 0%,100%{opacity:0.5} 50%{opacity:0.9} }
        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes orbit { from{transform:rotate(var(--start)) translateX(52px) rotate(calc(-1*var(--start)))} to{transform:rotate(calc(var(--start)+360deg)) translateX(52px) rotate(calc(-1*(var(--start)+360deg)))} }
      `}</style>

      {/* ── Nav ── */}
      <nav className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <RegentLogo size={30} />
            <span className="font-bold text-lg tracking-tight">Regent</span>
            <Badge variant="outline" className="text-[10px] ml-1 border-primary/30 text-primary">BETA</Badge>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#models" className="hover:text-foreground transition-colors">Models</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={`${BASE_URL}/api/login`}>
              <Button variant="ghost" size="sm" className="text-sm">Sign in</Button>
            </a>
            <a href={`${BASE_URL}/api/login`}>
              <Button size="sm" className="text-sm bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-500 hover:to-red-400 border-0">
                Get started free
              </Button>
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden pt-20 pb-28">
        {/* Background beams */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-[10%] w-[40%] h-[70%]"
            style={{ background: "radial-gradient(ellipse at top, rgba(59,130,246,0.35) 0%, transparent 70%)", filter: "blur(32px)", animation: "beam-pulse 4s ease-in-out infinite" }} />
          <div className="absolute top-0 right-[8%] w-[40%] h-[70%]"
            style={{ background: "radial-gradient(ellipse at top, rgba(239,68,68,0.3) 0%, transparent 70%)", filter: "blur(32px)", animation: "beam-pulse 4s ease-in-out infinite 2s" }} />
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(120,40,200,0.15) 0%, transparent 60%)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <Badge className="mb-6 bg-violet-500/10 text-violet-400 border-violet-500/30 text-xs px-3 py-1 gap-1.5">
            <Sparkles className="w-3 h-3" />Powered by HeyGen · fal.ai · Cerebras
          </Badge>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-none mb-6">
            AI video production,{" "}
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-red-400 bg-clip-text text-transparent">
              fully automated
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Regent's Synthetic Intelligence plans your entire video production — scripts, shots, narrative arc — then fires them all to HeyGen and fal.ai. One concept in, finished videos out.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`${BASE_URL}/api/login`}>
              <Button size="lg" className="h-13 px-8 text-base font-bold bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-500 hover:to-red-400 border-0 shadow-2xl shadow-blue-500/20 gap-2">
                <Play className="w-4 h-4 fill-white" />Start creating free
              </Button>
            </a>
            <Link href="/si-director">
              <Button size="lg" variant="outline" className="h-13 px-8 text-base gap-2">
                <Brain className="w-4 h-4" />See SI Director
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground/60">No credit card required · 50 free HeyGen credits on signup</p>
        </div>

        {/* Floating product preview */}
        <div className="relative max-w-5xl mx-auto mt-16 px-6">
          <div className="bg-card border border-card-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden"
            style={{ animation: "float 6s ease-in-out infinite" }}>
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500/60" /><div className="w-3 h-3 rounded-full bg-yellow-500/60" /><div className="w-3 h-3 rounded-full bg-green-500/60" /></div>
              <span className="text-xs text-muted-foreground ml-2 font-mono">Regent — SI Director</span>
              <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 font-mono"><span className="w-1.5 h-1.5 rounded-full bg-green-400" />3 shots firing</div>
            </div>
            <div className="grid grid-cols-3 gap-0">
              {["Opening Hook", "Core Message", "Call to Action"].map((title, i) => (
                <div key={i} className={`p-5 border-r last:border-r-0 border-border ${i === 1 ? "bg-violet-500/5" : ""}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${i === 1 ? "border-violet-500 text-violet-400 bg-violet-500/10" : i === 0 ? "border-green-500 text-green-400 bg-green-500/10" : "border-blue-500 text-blue-400 bg-blue-500/10"}`}>{i + 1}</div>
                    <span className="text-xs font-semibold">{title}</span>
                    {i === 0 && <span className="ml-auto text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full">Done</span>}
                    {i === 1 && <span className="ml-auto text-[9px] text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-full animate-pulse">Rendering…</span>}
                    {i === 2 && <span className="ml-auto text-[9px] text-muted-foreground">Queued</span>}
                  </div>
                  <div className={`h-16 rounded-lg mb-3 flex items-center justify-center ${i === 0 ? "bg-green-500/10 border border-green-500/20" : i === 1 ? "bg-blue-500/10 border border-blue-500/20" : "bg-muted/40 border border-border"}`}>
                    {i === 0 ? <CheckCircle2 className="w-6 h-6 text-green-400" /> :
                     i === 1 ? <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" /> :
                     <Video className="w-6 h-6 text-muted-foreground/30" />}
                  </div>
                  <p className="text-[9px] text-muted-foreground font-mono leading-relaxed line-clamp-2">
                    {i === 0 ? '"The gap between where you are and where you could be…"' :
                     i === 1 ? '"Regent plans every shot. Scripts, narrative arc, visual notes — all at once."' :
                     '"Start your first production today. It takes 30 seconds."'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Model strip ── */}
      <section id="models" className="border-y border-border/50 py-5 overflow-hidden bg-muted/20">
        <div className="flex" style={{ animation: "marquee 18s linear infinite", width: "max-content" }}>
          {[...MODELS, ...MODELS].map((m, i) => (
            <div key={i} className="flex items-center gap-2 px-6 text-xs text-muted-foreground/60 whitespace-nowrap">
              <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
              <span className="font-mono">{m}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs">Everything you need</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">One platform, entire production pipeline</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">From concept to finished multi-shot video — Regent handles every step so you can focus on the idea.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(f => (
            <div key={f.title} className={`bg-card border border-card-border rounded-2xl p-6 hover:border-primary/30 transition-all group`}>
              <div className={`w-11 h-11 rounded-xl ${f.bg} border flex items-center justify-center mb-4`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-bold text-base mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SI Director spotlight ── */}
      <section className="py-20 bg-gradient-to-br from-violet-500/5 via-background to-cyan-500/5 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <Badge className="mb-4 bg-violet-500/10 text-violet-400 border-violet-500/30 text-xs gap-1.5">
              <Brain className="w-3 h-3" />Synthetic Intelligence
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight mb-5 leading-tight">
              The first AI director<br />that thinks end-to-end
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6 max-w-md">
              SI Director doesn't just generate one clip. It reads your concept, plans the narrative arc, writes every script with shot-specific direction, assigns visual language per scene, then fires the entire production to HeyGen — in one click.
            </p>
            <ul className="space-y-3 mb-8">
              {["Plans 3–8 shots with narrative structure", "Writes shot-specific scripts + performance direction", "Visual notes for every scene (lighting, framing)", "Magic Script — AI rewrite any shot inline", "Storyboard view with flux-pro reference frames"].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-violet-400 flex-shrink-0" />{item}
                </li>
              ))}
            </ul>
            <a href={`${BASE_URL}/api/login`}>
              <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0 gap-2 shadow-lg shadow-violet-500/20">
                <Brain className="w-4 h-4" />Try SI Director free <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </a>
          </div>
          <div className="flex-1 relative">
            {/* Orbit diagram */}
            <div className="w-56 h-56 mx-auto relative" style={{ animation: "float 8s ease-in-out infinite" }}>
              <div className="absolute inset-0 rounded-full border border-violet-500/20" />
              <div className="absolute inset-6 rounded-full border border-cyan-500/15" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/40 flex items-center justify-center shadow-2xl shadow-violet-500/20">
                  <Brain className="w-9 h-9 text-violet-400" />
                </div>
              </div>
              {[
                { icon: Video, label: "HeyGen", color: "#3b82f6", angle: 0 },
                { icon: Zap, label: "fal.ai", color: "#f59e0b", angle: 120 },
                { icon: Wand2, label: "Scripts", color: "#a855f7", angle: 240 },
              ].map(({ icon: Icon, label, color, angle }) => {
                const rad = (angle * Math.PI) / 180;
                const r = 90;
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;
                return (
                  <div key={label} className="absolute w-10 h-10 rounded-xl border flex items-center justify-center shadow-lg"
                    style={{ top: `calc(50% + ${y}px - 20px)`, left: `calc(50% + ${x}px - 20px)`, background: `${color}15`, borderColor: `${color}40`, animation: `float ${5 + angle / 60}s ease-in-out infinite` }}>
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" className="py-24 max-w-5xl mx-auto px-6">
        <div className="text-center mb-14">
          <Badge className="mb-4 bg-amber-500/10 text-amber-400 border-amber-500/30 text-xs">Pricing</Badge>
          <h2 className="text-4xl font-bold tracking-tight mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground">Start free. Scale when you're ready.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING.map(plan => (
            <div key={plan.name} className={`rounded-2xl p-7 flex flex-col gap-5 border transition-all ${
              plan.highlight
                ? "bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border-violet-500/40 shadow-xl shadow-violet-500/10 relative"
                : "bg-card border-card-border"
            }`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-violet-600 to-cyan-600 text-white border-0 text-xs px-3 py-1">Most popular</Badge>
                </div>
              )}
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">{plan.name}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-muted-foreground">{plan.desc}</p>
              </div>
              <a href={`${BASE_URL}/api/login`} className="block">
                <Button variant={plan.ctaVariant} className={`w-full ${plan.highlight ? "bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 border-0" : ""}`}>
                  {plan.cta}
                </Button>
              </a>
              <ul className="space-y-2.5">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? "text-violet-400" : "text-muted-foreground/60"}`} />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ── Social proof ── */}
      <section className="py-16 border-y border-border/50 bg-muted/20">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[["300+", "HeyGen Avatars"], ["20+", "fal.ai Models"], ["8", "Viral Angles"], ["∞", "Productions"]].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent mb-1">{n}</div>
              <div className="text-sm text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(59,130,246,0.12) 0%, transparent 70%)" }} />
        </div>
        <div className="relative max-w-xl mx-auto px-6">
          <h2 className="text-4xl font-extrabold tracking-tight mb-5">Start creating today</h2>
          <p className="text-muted-foreground mb-8">No credit card. No wait. 50 HeyGen credits free on signup.</p>
          <a href={`${BASE_URL}/api/login`}>
            <Button size="lg" className="px-10 h-14 text-base font-bold bg-gradient-to-r from-blue-600 to-red-500 hover:from-blue-500 hover:to-red-400 border-0 shadow-2xl shadow-blue-500/20 gap-2">
              <Play className="w-4 h-4 fill-white" />Get started free
            </Button>
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/50 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <RegentLogo size={22} />
            <span className="font-bold text-sm">Regent</span>
            <span className="text-muted-foreground/50 text-xs ml-2">AI Media Production Platform</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground/60">
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Your data is private</span>
            <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" />Global CDN</span>
            <span className="flex items-center gap-1"><Star className="w-3 h-3" />Production-grade</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
