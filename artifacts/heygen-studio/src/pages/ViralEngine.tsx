import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Zap, RefreshCw, Copy, Check, Loader2,
  ChevronRight, Sparkles, Video, Image as ImageIcon,
  FlameKindling, Music, Cpu, Download, FileJson, FileText,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

// ─── HOOK TEMPLATES (ported from viral_content_engine.py) ───
const HOOKS: Record<string, string[]> = {
  curiosity: [
    "I wasn't expecting to love this {product} this much.",
    "This {product} hits different.",
    "If you get it, you get it.",
    "POV: you finally found the {product} that actually works.",
    "I tested 47 {product}s. This one broke the scale.",
    "Nobody talks about this {product} feature.",
    "The {product} you didn't know you needed.",
    "Wait... this {product} does WHAT?",
    "I thought it was overhyped until I tried it.",
    "Hidden gem {product} that deserves more hype.",
  ],
  transformation: [
    "My {workflow} before vs after this {product}.",
    "This {product} changed how I {action} forever.",
    "From {bad_state} to {good_state} in {timeframe}.",
    "I used to {old_way}. Now I {new_way}.",
    "The glow-up your {setup} deserves.",
    "Level up your {category} game instantly.",
    "The upgrade that actually matters.",
  ],
  social_proof: [
    "{number} people asked me about this {product} today.",
    "The {product} that broke the group chat.",
    "Every {expert} I know uses this.",
    "This {product} sold out {number} times.",
    "The reviews don't lie on this one.",
    "The {product} that went viral for a reason.",
  ],
  pain_point: [
    "Tired of {problem}? This {product} fixes that.",
    "Stop wasting money on {bad_alternative}.",
    "The {product} that solved my {pain}.",
    "Finally, a {product} that doesn't {frustration}.",
    "No more {annoyance}. Just {benefit}.",
  ],
  aspirational: [
    "This is the {product} your future self will thank you for.",
    "Invest in your {category}. Start here.",
    "The {product} that makes you look like you know what you're doing.",
    "Professional-grade {product} without the pro price.",
    "Your {setup} deserves better.",
    "This {product} just hits different at {time_of_day}.",
  ],
  urgency: [
    "This {product} won't stay in stock.",
    "If you're seeing this, it's still available.",
    "Limited drop. No cap.",
    "Get it before the algorithm hides it again.",
    "The {product} that's selling out while you scroll.",
  ],
  relatable: [
    "Me pretending I need another {product}...",
    "Adulting is hard. This {product} makes it easier.",
    "The {product} I bought at 2am and don't regret.",
    "Just a {product} doing {product} things.",
  ],
  feature_focus: [
    "The {feature} on this {product} is everything.",
    "So effortless. So {adjective}.",
    "The {feature} alone is worth it.",
    "This {feature} changed the game.",
    "Zero {negative}. All {positive}.",
  ],
};

const TECH_VOCAB: Record<string, string[]> = {
  workflow: ["setup", "desk setup", "WFH setup", "gaming rig", "streaming setup"],
  action: ["work", "game", "stream", "edit", "code", "create"],
  bad_state: ["cluttered desk", "laggy setup", "cable hell", "wrist pain"],
  good_state: ["clean desk", "zero lag", "cable-free", "ergonomic bliss"],
  timeframe: ["one week", "3 days", "a session", "one setup"],
  old_way: ["used wired everything", "had cable spaghetti", "struggled with bad audio"],
  new_way: ["go wireless", "have a clean desk", "sound like a pro"],
  setup: ["desk", "workspace", "battlestation", "rig"],
  category: ["tech", "setup", "workspace", "gear"],
  number: ["12", "8", "5", "20+"],
  expert: ["streamer", "editor", "developer", "designer", "gamer"],
  problem: ["cable clutter", "bad audio", "wrist pain", "slow workflow"],
  bad_alternative: ["cheap knockoffs", "overpriced brands", "basic gear"],
  pain: ["wrist pain", "audio issues", "cable management"],
  frustration: ["break after 3 months", "lag", "die mid-stream"],
  annoyance: ["charging cables", "background noise", "desk clutter"],
  benefit: ["wireless freedom", "studio sound", "clean aesthetic"],
  time_of_day: ["midnight", "5am", "your 9-5", "grind hours"],
  event: ["the meeting", "the stream", "the coffee shop"],
  feature: ["battery life", "latency", "build quality", "RGB", "noise canceling"],
  adjective: ["clean", "smooth", "crisp", "premium"],
  negative: ["lag", "noise", "clutter", "friction"],
  positive: ["flow", "silence", "space", "speed"],
};

const MUSIC_VOCAB: Record<string, string[]> = {
  workflow: ["production", "mixing", "beatmaking", "sound design", "live set"],
  action: ["produce", "mix", "perform", "create", "jam"],
  bad_state: ["flat mixes", "boring beats", "cluttered project", "inspiration block"],
  good_state: ["rich mixes", "fire beats", "organized sessions", "full sound"],
  timeframe: ["one session", "a weekend", "one track", "the first try"],
  old_way: ["used stock sounds", "mixed in headphones", "programmed everything"],
  new_way: ["use analog warmth", "mix on monitors", "play it live"],
  setup: ["studio", "bedroom studio", "live rig", "production desk"],
  category: ["music", "production", "gear", "studio"],
  number: ["30", "15", "100+", "50"],
  expert: ["producer", "engineer", "DJ", "sound designer"],
  problem: ["thin mixes", "boring sounds", "latency", "cluttered workflow"],
  bad_alternative: ["pirate plugins", "cheap gear", "stock presets"],
  pain: ["writer's block", "bad monitoring", "CPU overload"],
  frustration: ["crash mid-session", "sound digital", "lack character"],
  annoyance: ["latency", "CPU spikes", "cable noise"],
  benefit: ["zero latency", "analog warmth", "infinite inspiration"],
  time_of_day: ["3am", "golden hour", "the late night session"],
  event: ["the gig", "the session", "the cypher", "the studio"],
  feature: ["filter sweep", "saturation", "compression", "sequencer"],
  adjective: ["warm", "punchy", "wide", "deep", "crispy"],
  negative: ["mud", "harshness", "flatness", "digital sheen"],
  positive: ["warmth", "punch", "width", "depth", "character"],
};

// ─── VIDEO PROMPT TEMPLATES ───
const SEEDANCE_PROMPTS: Record<string, string[]> = {
  tech: [
    "A sleek {product} on a minimalist desk, soft natural light from window, cinematic slow pan, clean aesthetic, product showcase, 4K, photorealistic",
    "Close-up of hands using {product}, shallow depth of field, warm desk lamp lighting, macro detail shot, premium feel, 4K",
    "Overhead shot of {product} on organized desk, flat lay style, clean lines, neutral tones, tech aesthetic, 4K",
    "Person typing on {product} at golden hour, silhouette with backlight, cinematic mood, productivity vibe, 4K",
    "{product} unboxing, hands removing from packaging, soft box lighting, satisfying peel, premium unboxing, 4K",
    "Night desk setup with {product}, RGB ambient lighting, dark moody aesthetic, gamer/streamer vibe, 4K",
    "{product} detail shot, rotating slowly on white background, studio lighting, product photography style, 4K",
    "POV shot using {product}, first-person perspective, screen glow on face, immersive experience, 4K",
  ],
  music: [
    "Hands playing {product} in dim studio, warm tungsten lighting, intimate close-up, creative process, 4K, film grain",
    "{product} on vintage desk surrounded by gear, overhead shot, organized chaos, producer aesthetic, 4K",
    "Close-up of {product} knobs being turned, shallow depth of field, moody blue lighting, tactile detail, 4K",
    "Person producing with {product} at 3am, laptop glow, dark room, creative solitude, cinematic, 4K",
    "{product} in professional studio, rack focus between gear, clean signal chain, pro audio aesthetic, 4K",
    "Live performance with {product}, stage lights, crowd energy, dynamic movement, concert feel, 4K",
    "Time-lapse of beatmaking with {product}, hands moving fast, creative flow state, energetic, 4K",
    "{product} detail macro shot, circuit boards, analog warmth visible, technical beauty, 4K",
  ],
};

const KLING_PROMPTS: Record<string, string[]> = {
  tech: [
    "A person using {product} at their desk, smooth camera movement, natural lighting, lifestyle tech video, realistic, high quality",
    "Unboxing {product}, excited reaction, bright modern room, authentic feel, social media style, high quality",
    "Desk tour featuring {product}, walkthrough style, clean aesthetic, influencer video format, realistic",
    "Comparison: old gear vs {product}, side by side, honest review style, natural lighting, high quality",
    "{product} setup tutorial, step by step, helpful energy, home office background, realistic, clear",
    "Daily routine with {product}, morning to night montage, lifestyle integration, smooth transitions",
    "Travel with {product}, packing into bag, on-the-go lifestyle, portable showcase, realistic",
    "{product} in coffee shop, remote work scene, ambient background, productivity aesthetic, realistic",
  ],
  music: [
    "Producer using {product} in home studio, vlog style, authentic creative process, natural lighting, realistic",
    "{product} sound demo, fingers on controls, reaction to sound, studio environment, high quality",
    "Beatmaking session with {product}, energetic movement, creative flow, bedroom studio, realistic, raw",
    "{product} review, honest opinions, gear talk, studio background, influencer style, authentic",
    "Live jam with {product}, spontaneous performance, intimate venue, crowd reaction, realistic, energetic",
    "Studio session with {product}, collaborative energy, multiple producers, creative discussion, realistic",
    "Sampling with {product}, found sounds, creative process, urban exploration, artistic, realistic",
    "{product} in action at gig, stage perspective, dynamic lighting, performance energy, high quality",
  ],
};

// ─── MODELS ───
type ModelChoice = "kling-master" | "kling-nano" | "seedance" | "seedance-img2vid" | "flux-schnell";
const MODELS: { id: ModelChoice; label: string; falId: string; type: "video" | "image"; badge?: string }[] = [
  { id: "kling-master", label: "Kling 2.1 Master", falId: "fal-ai/kling-video/v2.1/master/text-to-video", type: "video", badge: "PREMIUM" },
  { id: "kling-nano", label: "Kling Nano", falId: "fal-ai/kling-video/v1.6/nano/text-to-video", type: "video", badge: "FAST" },
  { id: "seedance", label: "Seedance 1.0", falId: "fal-ai/seedance-1-0/text-to-video", type: "video" },
  { id: "flux-schnell", label: "FLUX Schnell", falId: "fal-ai/flux/schnell", type: "image", badge: "IMAGE" },
];

type Category = "tech" | "music";
type Angle = keyof typeof HOOKS;

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function fillTemplate(template: string, product: string, vocab: Record<string, string[]>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    if (key === "product") return product;
    const options = vocab[key];
    return options ? pick(options) : `[${key}]`;
  });
}

function generateHooks(product: string, angle: Angle, category: Category, count = 6): string[] {
  const vocab = category === "tech" ? TECH_VOCAB : MUSIC_VOCAB;
  const templates = HOOKS[angle] ?? [];
  const results: string[] = [];
  const used = new Set<number>();
  while (results.length < Math.min(count, templates.length)) {
    let idx: number;
    do { idx = Math.floor(Math.random() * templates.length); } while (used.has(idx));
    used.add(idx);
    results.push(fillTemplate(templates[idx], product, vocab));
  }
  return results;
}

function generateVideoPrompt(product: string, category: Category, modelType: "kling" | "seedance"): string {
  const templates = modelType === "seedance" ? SEEDANCE_PROMPTS[category] : KLING_PROMPTS[category];
  return fillTemplate(pick(templates), product, category === "tech" ? TECH_VOCAB : MUSIC_VOCAB);
}

// ─── POLLING HOOK ───
type JobStatus = "idle" | "queued" | "IN_PROGRESS" | "COMPLETED" | "FAILED";

interface JobResult {
  status: JobStatus;
  videoUrl: string | null;
  images: string[];
  log: string;
}

// ─── COMPONENT ───
const ANGLE_LABELS: Record<Angle, string> = {
  curiosity: "🔮 Curiosity",
  transformation: "🔄 Transformation",
  social_proof: "🏆 Social Proof",
  pain_point: "😤 Pain Point",
  aspirational: "🚀 Aspirational",
  urgency: "⚡ Urgency",
  relatable: "😂 Relatable",
  feature_focus: "🔬 Feature Focus",
};

export function ViralEngine() {
  const { toast } = useToast();
  const [category, setCategory] = useState<Category>("tech");
  const [product, setProduct] = useState("");
  const [angle, setAngle] = useState<Angle>("curiosity");
  const [hooks, setHooks] = useState<string[]>([]);
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [videoPrompt, setVideoPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ModelChoice>("kling-master");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  // Job state
  const [jobStatus, setJobStatus] = useState<JobStatus>("idle");
  const [jobRequestId, setJobRequestId] = useState<string | null>(null);
  const [jobModelId, setJobModelId] = useState<string | null>(null);
  const [result, setResult] = useState<JobResult | null>(null);
  const [pollTimer, setPollTimer] = useState<NodeJS.Timeout | null>(null);

  const model = MODELS.find(m => m.id === selectedModel)!;

  const handleGenerateHooks = () => {
    if (!product.trim()) {
      toast({ title: "Enter a product name first", variant: "destructive" });
      return;
    }
    const generated = generateHooks(product.trim(), angle, category, 8);
    setHooks(generated);
    setSelectedHook(generated[0] ?? null);
    // auto-generate video prompt
    const promptType = selectedModel.startsWith("seedance") ? "seedance" : "kling";
    setVideoPrompt(generateVideoPrompt(product.trim(), category, promptType));
  };

  const handleRegenPrompt = () => {
    if (!product.trim()) return;
    const promptType = selectedModel.startsWith("seedance") ? "seedance" : "kling";
    setVideoPrompt(generateVideoPrompt(product.trim(), category, promptType));
  };

  const copyHook = async (hook: string, idx: number) => {
    await navigator.clipboard.writeText(hook);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  // Polling
  const poll = useCallback(async (falModelId: string, reqId: string) => {
    try {
      const params = new URLSearchParams({ model_id: falModelId, request_id: reqId });
      const res = await fetch(`${BASE_URL}/api/fal/status?${params}`);
      const data = await res.json() as {
        status?: string;
        images?: string[];
        video_url?: string | null;
        logs?: { message: string }[];
        error?: string;
      };

      if (!res.ok || data.error) {
        setJobStatus("FAILED");
        setResult({ status: "FAILED", videoUrl: null, images: [], log: data.error ?? "Poll failed" });
        return;
      }

      const status = (data.status ?? "IN_PROGRESS") as JobStatus;

      if (status === "COMPLETED") {
        setJobStatus("COMPLETED");
        setResult({
          status: "COMPLETED",
          videoUrl: data.video_url ?? null,
          images: data.images ?? [],
          log: "Generation complete!",
        });
      } else {
        setJobStatus(status);
        const timer = setTimeout(() => poll(falModelId, reqId), 3000);
        setPollTimer(timer);
      }
    } catch {
      setJobStatus("FAILED");
      setResult({ status: "FAILED", videoUrl: null, images: [], log: "Network error during poll" });
    }
  }, []);

  useEffect(() => {
    return () => { if (pollTimer) clearTimeout(pollTimer); };
  }, [pollTimer]);

  const handleFire = async () => {
    if (!videoPrompt.trim()) {
      toast({ title: "Generate a video prompt first", variant: "destructive" });
      return;
    }

    setJobStatus("queued");
    setResult(null);

    const falModelId = model.falId;
    const inputs: Record<string, unknown> = {
      prompt: videoPrompt,
      aspect_ratio: "16:9",
    };
    if (model.type === "video") inputs.duration = duration;

    try {
      const res = await fetch(`${BASE_URL}/api/fal/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_id: falModelId, inputs }),
      });
      const data = await res.json() as { request_id?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Submit failed");

      const reqId = data.request_id!;
      setJobRequestId(reqId);
      setJobModelId(falModelId);
      setJobStatus("IN_PROGRESS");
      toast({ title: "Job queued!", description: `${model.label} · ${reqId.slice(0, 8)}…` });
      poll(falModelId, reqId);
    } catch (err) {
      setJobStatus("FAILED");
      toast({ title: "Failed to submit job", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    }
  };

  const isRunning = jobStatus === "queued" || jobStatus === "IN_PROGRESS";

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-pink-500/20 flex items-center justify-center">
          <FlameKindling className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Viral Content Engine</h1>
          <p className="text-sm text-muted-foreground">300+ hook variations → Kling & Seedance video prompts → fire directly to fal.ai</p>
        </div>
        <Badge variant="outline" className="ml-auto border-orange-500/30 text-orange-400 text-xs">Kling + Seedance</Badge>
      </div>

      {/* Step 1 — Product Setup */}
      <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">1</div>
          <h2 className="font-semibold">Product & Category</h2>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Input
            placeholder="Product name — e.g. keyboard, synth, headphones..."
            className="flex-1 min-w-0 bg-background text-sm h-10"
            value={product}
            onChange={e => setProduct(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleGenerateHooks()}
          />
          <div className="flex gap-1">
            {(["tech", "music"] as Category[]).map(c => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-xs font-medium transition-all ${
                  category === c ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                {c === "tech" ? <Cpu className="w-3 h-3" /> : <Music className="w-3 h-3" />}
                {c === "tech" ? "Tech" : "Music"}
              </button>
            ))}
          </div>
        </div>

        {/* Hook angle picker */}
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Hook Angle</p>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(HOOKS) as Angle[]).map(a => (
              <button
                key={a}
                onClick={() => setAngle(a)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                  angle === a ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40 bg-card"
                }`}
              >
                {ANGLE_LABELS[a]}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleGenerateHooks} disabled={!product.trim()} className="w-fit">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate Hooks
        </Button>
      </div>

      {/* Step 2 — Hook Selection */}
      {hooks.length > 0 && (
        <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">2</div>
            <h2 className="font-semibold">Pick Your Hook</h2>
            <button
              onClick={handleGenerateHooks}
              className="ml-auto text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Regenerate
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {hooks.map((hook, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHook(hook)}
                className={`group flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedHook === hook ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                }`}
              >
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  selectedHook === hook ? "border-primary" : "border-border"
                }`}>
                  {selectedHook === hook && <div className="w-2 h-2 rounded-full bg-primary" />}
                </div>
                <span className="text-sm flex-1 text-left">{hook}</span>
                <button
                  onClick={e => { e.stopPropagation(); copyHook(hook, idx); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-muted"
                >
                  {copiedIdx === idx ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-muted-foreground" />}
                </button>
              </button>
            ))}
          </div>

          {selectedHook && (
            <div className="flex items-center gap-2 mt-1 text-xs text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
              <Check className="w-3.5 h-3.5" /> Hook selected — scroll down to fire the video
            </div>
          )}
        </div>
      )}

      {/* Step 3 — Model + Prompt */}
      {hooks.length > 0 && (
        <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold">3</div>
            <h2 className="font-semibold">Video Model & Prompt</h2>
          </div>

          {/* Model selector */}
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Choose Model</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedModel(m.id);
                    if (product.trim()) {
                      const promptType = m.id.startsWith("seedance") ? "seedance" : "kling";
                      setVideoPrompt(generateVideoPrompt(product.trim(), category, promptType));
                    }
                  }}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs transition-all ${
                    selectedModel === m.id ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/30 text-muted-foreground"
                  }`}
                >
                  {m.type === "video" ? <Video className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                  <span className="font-medium text-center leading-tight">{m.label}</span>
                  {m.badge && (
                    <Badge variant="outline" className={`text-[9px] px-1 py-0 ${
                      m.badge === "PREMIUM" ? "border-amber-500/40 text-amber-400" :
                      m.badge === "FAST" ? "border-green-500/40 text-green-400" :
                      "border-blue-500/40 text-blue-400"
                    }`}>{m.badge}</Badge>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Video prompt */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Video Prompt</p>
              <button
                onClick={handleRegenPrompt}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Regen
              </button>
            </div>
            <Textarea
              className="bg-background text-sm resize-none min-h-[100px] font-mono"
              value={videoPrompt}
              onChange={e => setVideoPrompt(e.target.value)}
              placeholder="Auto-generated prompt will appear here..."
            />
            <p className="text-[10px] text-muted-foreground">Edit freely — this is the exact prompt sent to {model.label}.</p>
          </div>

          {/* Duration (video only) */}
          {model.type === "video" && (
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground font-medium">Duration:</p>
              {(["5", "10"] as const).map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    duration === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {d}s
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 4 — Fire & Result */}
      {hooks.length > 0 && (
        <div className="flex flex-col gap-4">
          {/* Fire button */}
          <Button
            onClick={handleFire}
            disabled={isRunning || !videoPrompt.trim()}
            className="h-12 text-sm font-bold w-full relative overflow-hidden"
            size="lg"
          >
            {isRunning ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating on {model.label}…</>
            ) : (
              <><Zap className="w-4 h-4 mr-2" /> Fire to {model.label}<ChevronRight className="w-4 h-4 ml-1" /></>
            )}
          </Button>

          {/* Status bar */}
          {jobStatus !== "idle" && (
            <div className={`rounded-2xl border p-4 flex flex-col gap-3 transition-all ${
              jobStatus === "COMPLETED" ? "bg-green-500/5 border-green-500/20" :
              jobStatus === "FAILED" ? "bg-destructive/5 border-destructive/20" :
              "bg-primary/5 border-primary/20"
            }`}>
              <div className="flex items-center gap-2">
                {isRunning && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                {jobStatus === "COMPLETED" && <Check className="w-4 h-4 text-green-400" />}
                {jobStatus === "FAILED" && <span className="text-destructive text-sm">✕</span>}
                <span className="text-sm font-medium">
                  {isRunning ? `Processing on ${model.label}…` :
                   jobStatus === "COMPLETED" ? "Generation complete!" :
                   "Generation failed"}
                </span>
                {jobRequestId && (
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">{jobRequestId.slice(0, 12)}…</span>
                )}
              </div>

              {isRunning && (
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="h-full bg-primary rounded-full animate-[pulse_2s_ease-in-out_infinite] w-3/4" />
                </div>
              )}

              {/* Result display */}
              {result?.videoUrl && (
                <div className="flex flex-col gap-2">
                  <video
                    src={result.videoUrl}
                    controls
                    autoPlay
                    loop
                    className="w-full rounded-xl border border-border max-h-96 object-contain bg-black"
                  />
                  <a
                    href={result.videoUrl}
                    download
                    className="flex items-center gap-2 text-xs text-primary hover:underline w-fit"
                    target="_blank" rel="noopener noreferrer"
                  >
                    <Download className="w-3 h-3" /> Download video
                  </a>
                </div>
              )}

              {result?.images && result.images.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {result.images.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`result-${i}`} className="rounded-xl border border-border w-full object-cover" />
                      <a
                        href={url}
                        download
                        target="_blank" rel="noopener noreferrer"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/60 rounded-lg p-1.5 transition-opacity"
                      >
                        <Download className="w-3 h-3 text-white" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campaign summary + export */}
          {selectedHook && videoPrompt && (
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Campaign Summary</p>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      const platforms = ["TikTok", "Instagram Reels", "YouTube Shorts", "X"];
                      const hashtags = category === "tech"
                        ? ["#TechTok", "#DeskSetup", "#WorkFromHome", "#GadgetReview", "#TechReview"]
                        : ["#MusicProducer", "#BeatMaker", "#HomeStudio", "#MusicGear", "#ProducerLife"];
                      const cta = pick(["Link in bio 👆", "Comment below ⬇️", "Follow for more 🔥", "Save this 📌", "Drop a ❤️ if this hits"]);
                      const pkg = {
                        generated_at: new Date().toISOString(),
                        product,
                        category,
                        hook_angle: angle,
                        hook: selectedHook,
                        cta,
                        hashtags,
                        video_prompt: videoPrompt,
                        model: model.falId,
                        duration_seconds: duration,
                        platforms,
                        all_hooks: hooks,
                      };
                      const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `campaign-${product.replace(/\s+/g, "-").toLowerCase()}.json`;
                      a.click(); URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1 text-xs border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    <FileJson className="w-3 h-3" /> JSON
                  </button>
                  <button
                    onClick={() => {
                      const hashtags = category === "tech"
                        ? "#TechTok #DeskSetup #WorkFromHome #GadgetReview #TechReview"
                        : "#MusicProducer #BeatMaker #HomeStudio #MusicGear #ProducerLife";
                      const cta = pick(["Link in bio 👆", "Comment below ⬇️", "Follow for more 🔥", "Save this 📌"]);
                      const rows = [
                        ["Field", "Value"],
                        ["Product", product],
                        ["Category", category],
                        ["Hook Angle", angle],
                        ["Hook", `"${selectedHook}"`],
                        ["CTA", cta],
                        ["Hashtags", hashtags],
                        ["Video Prompt", `"${videoPrompt}"`],
                        ["Model", model.falId],
                        ["Duration", `${duration}s`],
                        ["Platforms", "TikTok,Instagram Reels,YouTube Shorts,X"],
                        ...hooks.map((h, i) => [`Hook ${i + 1}`, `"${h}"`]),
                      ];
                      const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
                      const blob = new Blob([csv], { type: "text/csv" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url; a.download = `campaign-${product.replace(/\s+/g, "-").toLowerCase()}.csv`;
                      a.click(); URL.revokeObjectURL(url);
                    }}
                    className="flex items-center gap-1 text-xs border border-border rounded-lg px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors"
                  >
                    <FileText className="w-3 h-3" /> CSV
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 flex-shrink-0 text-xs">Hook</span>
                  <span className="text-xs italic">"{selectedHook}"</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 flex-shrink-0 text-xs">Platforms</span>
                  <div className="flex flex-wrap gap-1">
                    {["TikTok", "Reels", "Shorts", "X"].map(p => (
                      <span key={p} className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-primary/20 text-primary/80 bg-primary/5">{p}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 flex-shrink-0 text-xs">Tags</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {category === "tech" ? "#TechTok #DeskSetup #GadgetReview" : "#MusicProducer #BeatMaker #HomeStudio"}
                  </span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 flex-shrink-0 text-xs">Model</span>
                  <span className="text-xs font-mono">{model.falId}</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-muted-foreground w-20 flex-shrink-0 text-xs">Prompt</span>
                  <span className="text-xs font-mono text-primary line-clamp-2">{videoPrompt}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Explainer when empty */}
      {hooks.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { emoji: "🎣", label: "8 Hook Angles", desc: "Curiosity, Transformation, Social Proof, Pain Point, Aspirational, Urgency, Relatable, Feature Focus" },
            { emoji: "🎬", label: "Kling + Seedance", desc: "Kling for authentic lifestyle shots · Seedance for cinematic product photography" },
            { emoji: "⚡", label: "One-click fire", desc: "Select a hook, pick a model, hit Fire — job goes straight to fal.ai queue and polls live" },
          ].map(c => (
            <div key={c.label} className="bg-card border border-card-border rounded-xl p-4 text-center">
              <div className="text-2xl mb-2">{c.emoji}</div>
              <p className="font-semibold text-sm mb-1">{c.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
