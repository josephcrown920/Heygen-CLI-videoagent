import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check, Cpu, Zap, Brain, Image as ImageIcon, Video, Music, ChevronRight, Activity } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

// ─── PROVIDER DATA (from orchestration-dashboard.tsx blueprint) ───
const PROVIDERS = {
  text: [
    { name: "HuggingFace", models: ["Mistral-7B", "Llama-3-8B", "Zephyr-7B", "Phi-3-Mini"], free: true, color: "#fbbf24", hfRoute: true },
    { name: "OpenAI (SI)", models: ["gpt-4o", "gpt-4o-mini"], free: false, color: "#10a37f", note: "via SI Director" },
    { name: "Mistral", models: ["mistral-large", "nemo", "codestral"], free: false, color: "#f97316" },
    { name: "Together AI", models: ["llama-4", "deepseek-r1", "qwen-2.5"], free: false, color: "#8b5cf6" },
  ],
  image: [
    { name: "HuggingFace", models: ["FLUX Schnell", "SDXL 1.0", "SD 1.5"], free: true, color: "#fbbf24", hfRoute: true },
    { name: "fal.ai", models: ["flux-schnell", "flux-pro", "ideogram-v3"], free: false, color: "#a855f7", falRoute: true },
    { name: "Replicate", models: ["flux-schnell", "flux-dev", "sdxl"], free: false, color: "#06b6d4" },
  ],
  video: [
    { name: "fal.ai (Kling)", models: ["kling-2.1-master", "kling-nano", "kling-1.6"], free: false, color: "#a855f7", falRoute: true },
    { name: "fal.ai (Seedance)", models: ["seedance-1.0", "wan-pro"], free: false, color: "#8b5cf6", falRoute: true },
    { name: "fal.ai (WAN)", models: ["wan-pro", "luma"], free: false, color: "#6366f1", falRoute: true },
  ],
  audio: [
    { name: "ElevenLabs", models: ["multilingual-v2", "turbo-v2"], free: false, color: "#22d3ee" },
    { name: "HuggingFace", models: ["speecht5", "musicgen", "bark"], free: true, color: "#fbbf24", hfRoute: true },
  ],
} as const;

type TabType = "text" | "image" | "video" | "audio";

const CREDIT_COSTS: Record<TabType, string> = {
  text: "~1 credit / 1K tokens",
  image: "40–60 credits / image",
  video: "200 credits / sec",
  audio: "50–120 credits / min",
};

const TAB_ICONS: Record<TabType, typeof Brain> = {
  text: Brain,
  image: ImageIcon,
  video: Video,
  audio: Music,
};

const TAB_COLORS: Record<TabType, string> = {
  text: "#f97316",
  image: "#a855f7",
  video: "#ec4899",
  audio: "#22d3ee",
};

const GPU_PLATFORMS = [
  { name: "fal.ai", desc: "Serverless GPU inference. Kling, Seedance, FLUX, Wan — all wired in.", tag: "WIRED ✓", color: "#a855f7", active: true },
  { name: "HuggingFace", desc: "Open-source model hub. 500K+ models via Inference API.", tag: "WIRED ✓", color: "#fbbf24", active: true },
  { name: "Modal.com", desc: "Serverless GPU functions. Pay per second, no idle cost.", tag: "A100 / H100", color: "#00ff88", active: false },
  { name: "RunPod", desc: "REST endpoint from any GPU pod. Custom containers.", tag: "Serverless API", color: "#a855f7", active: false },
];

// ─── HF INFERENCE UI ───
const HF_TEXT_MODELS = [
  { id: "gpt-4o-mini", label: "GPT-4o Mini (fast)" },
  { id: "gpt-4o", label: "GPT-4o (powerful)" },
  { id: "meta-llama/Llama-3.1-8B-Instruct", label: "Llama 3.1 8B → gpt-4o-mini" },
  { id: "HuggingFaceH4/zephyr-7b-beta", label: "Zephyr 7B → gpt-4o-mini" },
  { id: "microsoft/Phi-3-mini-4k-instruct", label: "Phi-3 Mini → gpt-4o-mini" },
];

const HF_IMAGE_MODELS = [
  { id: "fal-ai/flux/schnell", label: "FLUX Schnell (fal.ai)" },
  { id: "fal-ai/flux-pro/v1.1", label: "FLUX Pro 1.1 (fal.ai)" },
  { id: "fal-ai/stable-diffusion-v3-medium", label: "SD3 Medium (fal.ai)" },
];

export function GPUHub() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>("text");
  const [activeProvider, setActiveProvider] = useState(0);
  const [copied, setCopied] = useState(false);

  // HF text state
  const [hfTextModel, setHfTextModel] = useState(HF_TEXT_MODELS[0].id);
  const [hfPrompt, setHfPrompt] = useState("Write a viral hook for a tech product launch.");
  const [hfMaxTokens, setHfMaxTokens] = useState("256");
  const [hfTemp, setHfTemp] = useState("0.8");
  const [hfTextResult, setHfTextResult] = useState("");
  const [hfTextLoading, setHfTextLoading] = useState(false);

  // fal.ai image state
  const [hfImageModel, setHfImageModel] = useState(HF_IMAGE_MODELS[0].id);
  const [hfImagePrompt, setHfImagePrompt] = useState("Cinematic product shot, dramatic lighting, 4K");
  const [hfImageResult, setHfImageResult] = useState<string | null>(null);
  const [hfImageLoading, setHfImageLoading] = useState(false);
  const [hfImageRequestId, setHfImageRequestId] = useState<string | null>(null);

  const providers = PROVIDERS[activeTab];
  const tabColor = TAB_COLORS[activeTab];
  const TabIcon = TAB_ICONS[activeTab];

  const exampleRequest: Record<TabType, string> = {
    text: `POST ${BASE_URL}/api/hf/text\n{\n  "model": "mistralai/Mistral-7B-Instruct-v0.3",\n  "prompt": "Write a viral hook for a product",\n  "max_new_tokens": 256,\n  "temperature": 0.8\n}`,
    image: `POST ${BASE_URL}/api/hf/image\n{\n  "model": "black-forest-labs/FLUX.1-schnell",\n  "prompt": "Cinematic portrait, dramatic lighting, 4K",\n  "width": 512,\n  "height": 512\n}`,
    video: `POST ${BASE_URL}/api/fal/submit\n{\n  "model_id": "fal-ai/kling-video/v2.1/master/text-to-video",\n  "inputs": {\n    "prompt": "...",\n    "duration": "5",\n    "aspect_ratio": "16:9"\n  }\n}`,
    audio: `POST ${BASE_URL}/api/hf/text\n{\n  "model": "facebook/musicgen-small",\n  "prompt": "80s synth, upbeat, product launch music"\n}`,
  };

  const copyRequest = () => {
    navigator.clipboard?.writeText(exampleRequest[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runHfText = async () => {
    if (!hfPrompt.trim()) return;
    setHfTextLoading(true);
    setHfTextResult("");
    try {
      const res = await fetch(`${BASE_URL}/api/hf/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: hfTextModel,
          prompt: hfPrompt,
          max_new_tokens: parseInt(hfMaxTokens) || 256,
          temperature: parseFloat(hfTemp) || 0.8,
        }),
      });
      const data = await res.json() as { text?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "HF error");
      setHfTextResult(data.text ?? "");
    } catch (err) {
      toast({ title: "HuggingFace Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setHfTextLoading(false);
    }
  };

  const runHfImage = async () => {
    if (!hfImagePrompt.trim()) return;
    setHfImageLoading(true);
    setHfImageResult(null);
    setHfImageRequestId(null);
    try {
      // Submit to fal.ai
      const submitRes = await fetch(`${BASE_URL}/api/fal/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: hfImageModel, inputs: { prompt: hfImagePrompt, image_size: "square_hd" } }),
      });
      const submitData = await submitRes.json() as { request_id?: string; error?: string };
      if (!submitRes.ok || submitData.error) throw new Error(submitData.error ?? "fal.ai submit failed");
      const requestId = submitData.request_id!;
      setHfImageRequestId(requestId);

      // Poll for result
      let attempts = 0;
      while (attempts < 30) {
        await new Promise(r => setTimeout(r, 2000));
        const statusRes = await fetch(`${BASE_URL}/api/fal/status?model_id=${encodeURIComponent(hfImageModel)}&request_id=${requestId}`);
        const statusData = await statusRes.json() as { status?: string; images?: { url: string }[]; error?: string };
        if (statusData.error) throw new Error(statusData.error);
        if (statusData.status === "COMPLETED" && statusData.images?.[0]?.url) {
          setHfImageResult(statusData.images[0].url);
          break;
        }
        if (statusData.status === "FAILED") throw new Error("Image generation failed");
        attempts++;
      }
      if (attempts >= 30) throw new Error("Timed out waiting for image");
    } catch (err) {
      toast({ title: "Image Generation Error", description: err instanceof Error ? err.message : "Failed", variant: "destructive" });
    } finally {
      setHfImageLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-purple-500/20 flex items-center justify-center">
          <Cpu className="w-5 h-5 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">GPU + AI Hub</h1>
          <p className="text-sm text-muted-foreground font-mono">Orchestrate fal.ai · HuggingFace · GPU providers from one dashboard</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-mono text-green-400 border border-green-500/25 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          LIVE
        </div>
      </div>

      {/* GPU Platform Cards */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">01 — GPU Platforms</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GPU_PLATFORMS.map(p => (
            <div
              key={p.name}
              className={`relative border rounded-xl p-3 overflow-hidden transition-all ${
                p.active ? "bg-card border-border" : "bg-card/40 border-border/40 opacity-60"
              }`}
            >
              {p.active && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: p.color }} />}
              <div className="font-bold text-sm mb-1" style={{ color: p.color }}>{p.name}</div>
              <div className="text-[10px] text-muted-foreground leading-relaxed mb-2">{p.desc}</div>
              <span className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded border" style={{
                color: p.color,
                borderColor: `${p.color}40`,
                background: `${p.color}10`,
              }}>{p.tag}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Type tabs + Provider grid */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Scan line header */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${tabColor}, transparent)` }} />

        <div className="p-5 flex flex-col gap-4">
          {/* Tabs */}
          <div className="flex gap-1 border-b border-border pb-3">
            {(Object.keys(PROVIDERS) as TabType[]).map(t => {
              const Icon = TAB_ICONS[t];
              return (
                <button
                  key={t}
                  onClick={() => { setActiveTab(t); setActiveProvider(0); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
                    activeTab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground/60"
                  }`}
                  style={activeTab === t ? { background: `${TAB_COLORS[t]}18`, color: TAB_COLORS[t] } : {}}
                >
                  <Icon className="w-3 h-3" /> {t}
                </button>
              );
            })}
          </div>

          {/* Provider grid */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-3">02 — Select Provider (fallback chain auto-activates)</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {providers.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => setActiveProvider(i)}
                  className="relative text-left p-3 border rounded-xl transition-all overflow-hidden"
                  style={{
                    background: activeProvider === i ? "#0f1117" : "#080a0f",
                    borderColor: activeProvider === i ? `${p.color}60` : "#1a1f2e",
                  }}
                >
                  {activeProvider === i && <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: p.color }} />}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold" style={{ color: activeProvider === i ? p.color : "#8892a4" }}>{p.name}</span>
                    {p.free && <Badge variant="outline" className="text-[9px] px-1 py-0 border-green-500/40 text-green-400">FREE</Badge>}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {p.models.slice(0, 2).map(m => (
                      <span key={m} className="text-[9px] text-muted-foreground/60 font-mono bg-background/60 rounded px-1 border border-border/50">{m}</span>
                    ))}
                    {p.models.length > 2 && <span className="text-[9px] text-muted-foreground/40">+{p.models.length - 2}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Fallback chain */}
          <div className="bg-background/60 border border-border/60 rounded-xl p-3">
            <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">03 — Auto Fallback Chain</p>
            <div className="flex items-center flex-wrap gap-2">
              {providers.map((p, i) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-1 rounded border" style={{
                    background: i === 0 ? `${p.color}12` : "#0a0d14",
                    borderColor: i === 0 ? `${p.color}50` : "#1a2030",
                    color: i === 0 ? p.color : "#3a4560",
                  }}>P{i + 1} {p.name}</span>
                  {i < providers.length - 1 && <span className="text-muted-foreground/30 text-xs">→</span>}
                </div>
              ))}
            </div>
            <p className="text-[9px] font-mono text-muted-foreground/40 mt-2">If P1 fails → P2 auto-fires. Zero downtime.</p>
          </div>

          {/* Credit cost + example request */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-background/60 border border-border/60 rounded-xl p-3">
              <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Credit Cost</p>
              <p className="text-xs font-mono font-semibold" style={{ color: tabColor }}>{CREDIT_COSTS[activeTab]}</p>
              <p className="text-[9px] text-muted-foreground/40 font-mono mt-2">60% profit / 40% credits split</p>
            </div>
            <div className="sm:col-span-2 bg-background/60 border border-border/60 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-3 py-2 bg-background/80 border-b border-border/60">
                <span className="text-[9px] font-mono" style={{ color: tabColor }}>example_request.json</span>
                <button onClick={copyRequest} className="text-[9px] font-mono text-muted-foreground hover:text-foreground border border-border rounded px-2 py-0.5 transition-colors flex items-center gap-1">
                  {copied ? <><Check className="w-2.5 h-2.5" /> copied</> : <><Copy className="w-2.5 h-2.5" /> copy</>}
                </button>
              </div>
              <pre className="text-[9px] font-mono text-muted-foreground/60 p-3 overflow-auto leading-relaxed whitespace-pre-wrap">{exampleRequest[activeTab]}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* HuggingFace Live Inference */}
      <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background: "#10a37f18", border: "1px solid #10a37f40" }}>🧠</div>
          <h2 className="font-semibold">AI Live Inference</h2>
          <Badge variant="outline" className="text-[9px] border-green-500/30 text-green-400">OpenAI → text</Badge>
          <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400">fal.ai → images</Badge>
        </div>

        {/* Text generation */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Text Generation</p>
          <div className="flex gap-2 flex-wrap">
            <select
              className="flex-1 min-w-0 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-amber-500/60"
              value={hfTextModel}
              onChange={e => setHfTextModel(e.target.value)}
            >
              {HF_TEXT_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <Input
              className="w-20 bg-background text-xs font-mono h-9"
              value={hfMaxTokens}
              onChange={e => setHfMaxTokens(e.target.value)}
              placeholder="tokens"
            />
            <Input
              className="w-16 bg-background text-xs font-mono h-9"
              value={hfTemp}
              onChange={e => setHfTemp(e.target.value)}
              placeholder="temp"
            />
          </div>
          <Textarea
            className="bg-background text-sm resize-none font-mono min-h-[60px]"
            value={hfPrompt}
            onChange={e => setHfPrompt(e.target.value)}
            placeholder="Prompt..."
          />
          <Button onClick={runHfText} disabled={hfTextLoading} size="sm" className="w-fit">
            {hfTextLoading ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Generating…</> : <><Zap className="w-3 h-3 mr-1.5" /> Run Text Model</>}
          </Button>
          {hfTextResult && (
            <div className="bg-background/60 border border-border rounded-xl p-3 text-xs font-mono leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {hfTextResult}
            </div>
          )}
        </div>

        <div className="border-t border-border" />

        {/* Image generation */}
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Image Generation</p>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-amber-500/60"
              value={hfImageModel}
              onChange={e => setHfImageModel(e.target.value)}
            >
              {HF_IMAGE_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          <Input
            className="bg-background text-sm h-10"
            value={hfImagePrompt}
            onChange={e => setHfImagePrompt(e.target.value)}
            placeholder="Image prompt..."
          />
          <Button onClick={runHfImage} disabled={hfImageLoading} size="sm" className="w-fit">
            {hfImageLoading ? <><Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> Generating via fal.ai…</> : <><ImageIcon className="w-3 h-3 mr-1.5" /> Generate Image</>}
          </Button>
          {hfImageLoading && hfImageRequestId && (
            <p className="text-[10px] font-mono text-muted-foreground/60">request_id: {hfImageRequestId} · polling…</p>
          )}
          {hfImageResult && (
            <div className="flex flex-col gap-2">
              <img src={hfImageResult} alt="Generated" className="rounded-xl border border-border max-h-64 object-contain bg-black" />
              <a href={hfImageResult} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline w-fit">Open full size ↗</a>
            </div>
          )}
        </div>
      </div>

      {/* All providers summary */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-4">04 — All Configured Providers</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(Object.entries(PROVIDERS) as [TabType, typeof PROVIDERS[TabType]][]).map(([type, provs]) => (
            <div key={type}>
              <div className="flex items-center gap-1.5 mb-2">
                {(() => { const Icon = TAB_ICONS[type]; return <Icon className="w-3 h-3" style={{ color: TAB_COLORS[type] }} />; })()}
                <p className="text-[9px] font-mono font-bold uppercase tracking-widest" style={{ color: TAB_COLORS[type] }}>{type}</p>
              </div>
              <div className="flex flex-col gap-1">
                {provs.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-[9px] font-mono">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-muted-foreground">{p.name}</span>
                    {p.free && <span className="text-green-400">FREE</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-border flex items-center gap-6 flex-wrap">
          <div className="text-[9px] font-mono text-muted-foreground">
            fal.ai routes: <span className="text-green-400">ACTIVE</span>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">
            HuggingFace Token: <span className="text-green-400">ACTIVE ✓</span>
          </div>
          <div className="text-[9px] font-mono text-muted-foreground">
            SI Director (OpenAI): <span className="text-green-400">ACTIVE ✓</span>
          </div>
          <Button variant="outline" size="sm" className="ml-auto text-xs h-7" asChild>
            <a href="/si-director"><Activity className="w-3 h-3 mr-1" /> SI Director <ChevronRight className="w-3 h-3 ml-1" /></a>
          </Button>
        </div>
      </div>
    </div>
  );
}
