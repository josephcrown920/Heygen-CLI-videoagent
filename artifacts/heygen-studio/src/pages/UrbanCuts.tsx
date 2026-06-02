import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Scissors, Play, Loader2, Video, MapPin, Zap,
  Clock, ChevronRight, Sparkles, Film,
} from "lucide-react";

const URBAN_SCENES = [
  {
    id: "times-square",
    label: "Times Square",
    desc: "Neon signs, yellow cabs, midnight hustle",
    emoji: "🗽",
    gradient: "from-yellow-500/20 to-red-500/20",
    border: "border-yellow-500/30",
    modelId: "fal-ai/kling-video/v2.1/master/text-to-video",
    basePrompt: "cinematic shot of Times Square New York City at night, neon lights, yellow taxis, crowded streets, shallow depth of field, anamorphic lens flare, photorealistic",
  },
  {
    id: "tokyo-alley",
    label: "Tokyo Alley",
    desc: "Rain-slicked streets, lanterns, neon kanji",
    emoji: "🏮",
    gradient: "from-pink-500/20 to-purple-500/20",
    border: "border-pink-500/30",
    modelId: "fal-ai/kling-video/v2.1/standard/text-to-video",
    basePrompt: "cinematic shot of Tokyo alley at night, rain reflections, glowing lanterns, neon signs in Japanese, steam from manholes, cyberpunk aesthetic, 4K, photorealistic",
  },
  {
    id: "london-bridge",
    label: "London Bridge",
    desc: "Golden hour, fog, double-decker buses",
    emoji: "🌉",
    gradient: "from-amber-500/20 to-orange-500/20",
    border: "border-amber-500/30",
    modelId: "fal-ai/luma-dream-machine/ray-2-flash",
    basePrompt: "cinematic shot of London Bridge at golden hour, Thames River, double-decker red bus, morning fog, dramatic sky, film grain, anamorphic",
  },
  {
    id: "dubai-skyline",
    label: "Dubai Skyline",
    desc: "Burj Khalifa, desert sunset, luxury",
    emoji: "🏙️",
    gradient: "from-cyan-500/20 to-blue-500/20",
    border: "border-cyan-500/30",
    modelId: "fal-ai/kling-video/v2.1/master/text-to-video",
    basePrompt: "cinematic aerial shot of Dubai skyline at sunset, Burj Khalifa, golden desert light, luxury cars on highway, IMAX quality, photorealistic",
  },
  {
    id: "brooklyn-bridge",
    label: "Brooklyn Bridge",
    desc: "Dawn mist, Manhattan backdrop, grit",
    emoji: "🌁",
    gradient: "from-slate-500/20 to-blue-500/20",
    border: "border-slate-500/30",
    modelId: "fal-ai/seedance-1-0/text-to-video",
    basePrompt: "cinematic shot under Brooklyn Bridge at dawn, misty East River, Manhattan skyline in background, dramatic golden light, handheld camera feel",
  },
  {
    id: "la-sunset",
    label: "LA Sunset",
    desc: "Hollywood Hills, palm trees, haze",
    emoji: "🌴",
    gradient: "from-orange-500/20 to-pink-500/20",
    border: "border-orange-500/30",
    modelId: "fal-ai/kling-video/v2.1/standard/text-to-video",
    basePrompt: "cinematic shot of Los Angeles sunset from Hollywood Hills, palm trees silhouette, pink and orange sky, city haze, luxury neighborhood, cinematic grade",
  },
];

const CUT_STYLES = [
  { id: "whip", label: "Whip Cut", desc: "Fast directional transitions" },
  { id: "smash", label: "Smash Cut", desc: "Hard impact between scenes" },
  { id: "match", label: "Match Cut", desc: "Visual continuity across cuts" },
  { id: "jump", label: "Jump Cut", desc: "Time compression, energy" },
  { id: "fade", label: "Fade Cut", desc: "Smooth dissolves, cinematic" },
];

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

export function UrbanCuts() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedScene, setSelectedScene] = useState(URBAN_SCENES[0]);
  const [selectedCutStyle, setSelectedCutStyle] = useState(CUT_STYLES[0]);
  const [customPrompt, setCustomPrompt] = useState("");
  const [duration, setDuration] = useState<"5" | "10">("5");
  const [generating, setGenerating] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const finalPrompt = customPrompt.trim()
    ? `${selectedScene.basePrompt}, ${customPrompt.trim()}, ${selectedCutStyle.label} editing style`
    : `${selectedScene.basePrompt}, ${selectedCutStyle.label} editing style`;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/fal/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: selectedScene.modelId,
          inputs: {
            prompt: finalPrompt,
            aspect_ratio: "16:9",
            duration,
          },
        }),
      });
      const data = await res.json() as { request_id?: string; error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Submit failed");
      setRequestId(data.request_id ?? null);
      toast({
        title: "Urban Cut queued!",
        description: `${selectedScene.label} · ${selectedScene.modelId.split("/").pop()}`,
      });
      setLocation("/creations");
    } catch (err) {
      toast({
        title: "Generation failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Scissors className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Urban Cuts</h1>
          <p className="text-sm text-muted-foreground">Cinematic city scenes with film-quality AI generation</p>
        </div>
        <Badge variant="outline" className="ml-auto border-orange-500/30 text-orange-400 text-xs">BETA</Badge>
      </div>

      {/* Scene grid */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Choose Scene</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {URBAN_SCENES.map(scene => (
            <button
              key={scene.id}
              onClick={() => setSelectedScene(scene)}
              className={`relative group text-left rounded-2xl overflow-hidden border p-4 transition-all bg-gradient-to-br ${scene.gradient} ${
                selectedScene.id === scene.id
                  ? `${scene.border} ring-1 ring-primary/40 scale-[1.02]`
                  : "border-border hover:border-primary/30 hover:scale-[1.01]"
              }`}
            >
              {selectedScene.id === scene.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
              <div className="text-2xl mb-2">{scene.emoji}</div>
              <p className="font-bold text-sm">{scene.label}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{scene.desc}</p>
              <div className="mt-2 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/50 font-mono">{scene.modelId.split("/").slice(1, 3).join("/")}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cut style */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">Cut Style</h2>
        <div className="flex flex-wrap gap-2">
          {CUT_STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setSelectedCutStyle(style)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs border transition-all ${
                selectedCutStyle.id === style.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 bg-card"
              }`}
            >
              <Film className="w-3 h-3" />
              <span className="font-medium">{style.label}</span>
              <span className="opacity-60 hidden sm:inline">— {style.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt customization */}
      <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <h2 className="font-semibold text-sm">Custom Direction (optional)</h2>
        </div>
        <Textarea
          placeholder={`Add to "${selectedScene.label}" — e.g. "avatar walking through frame", "rainy night", "slow motion camera pan"...`}
          className="bg-background resize-none text-sm min-h-[80px]"
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
        />

        {/* Preview prompt */}
        <div className="bg-muted/40 rounded-xl p-3 text-xs text-muted-foreground font-mono leading-relaxed border border-border">
          <span className="text-primary/60 text-[10px] uppercase tracking-widest block mb-1">Generated Prompt</span>
          {finalPrompt}
        </div>

        {/* Duration + Generate */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            Duration:
          </div>
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

          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="ml-auto h-10 px-6 font-bold"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
            ) : (
              <><Play className="w-4 h-4 mr-2" /> Fire Urban Cut</>
            )}
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
        {[
          { icon: "🎬", label: "Cinematic models", desc: "Kling 2.1 Master, Luma Ray 2, Seedance" },
          { icon: "⚡", label: "5–10 second cuts", desc: "Optimized for social & brand video" },
          { icon: "🌆", label: "6 urban scenes", desc: "NYC, Tokyo, London, Dubai, Brooklyn, LA" },
        ].map(c => (
          <div key={c.label} className="bg-card border border-card-border rounded-xl p-4">
            <div className="text-2xl mb-1">{c.icon}</div>
            <p className="font-semibold text-sm">{c.label}</p>
            <p className="text-xs text-muted-foreground">{c.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
