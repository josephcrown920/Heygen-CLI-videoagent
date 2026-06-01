import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCreations, type Creation } from "@/hooks/useCreations";
import {
  Brain, Sparkles, Loader2, Play, Image as ImageIcon, Video,
  ChevronRight, Zap, CheckCircle2, AlertCircle, Download, ExternalLink,
  Eye, RefreshCw, Clock,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface Shot {
  shot_number: number;
  title: string;
  role: string;
  prompt: string;
  negative_prompt?: string;
  model_id: string;
  model_rationale: string;
  duration?: string;
  aspect_ratio: string;
  category: "image" | "video";
}

interface ProductionPlan {
  title: string;
  logline: string;
  visual_philosophy: string;
  narrative_arc: string;
  shots: Shot[];
  production_notes: string;
}

type ShotStatus = "idle" | "pending" | "in_progress" | "completed" | "failed";

interface ShotState {
  status: ShotStatus;
  request_id?: string;
  output_urls?: string[];
  error?: string;
}

async function planProduction(concept: string, style: string, duration: string, output_type: string) {
  const res = await fetch(`${BASE_URL}/api/si/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concept, style, duration, output_type }),
  });
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error ?? "Planning failed");
  }
  const data = await res.json() as { plan: ProductionPlan };
  return data.plan;
}

async function submitGeneration(model_id: string, inputs: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/fal/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id, inputs }),
  });
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error ?? "Submission failed");
  }
  return res.json() as Promise<{ request_id: string }>;
}

async function pollStatus(model_id: string, request_id: string) {
  const params = new URLSearchParams({ model_id, request_id });
  const res = await fetch(`${BASE_URL}/api/fal/status?${params}`);
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error ?? "Status check failed");
  }
  return res.json() as Promise<{
    status: string;
    images?: string[];
    video_url?: string | null;
  }>;
}

function ShotCard({
  shot,
  state,
  index,
  onFire,
}: {
  shot: Shot;
  state: ShotState;
  index: number;
  onFire: () => void;
}) {
  const modelShort = shot.model_id.split("/").pop() ?? shot.model_id;

  const statusColor: Record<ShotStatus, string> = {
    idle: "text-muted-foreground",
    pending: "text-yellow-400",
    in_progress: "text-blue-400",
    completed: "text-green-400",
    failed: "text-red-400",
  };

  const statusLabel: Record<ShotStatus, string> = {
    idle: "Ready",
    pending: "Queued",
    in_progress: "Generating",
    completed: "Done",
    failed: "Failed",
  };

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden flex flex-col">
      {/* Shot header */}
      <div className="flex items-start gap-3 p-4 border-b border-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          {shot.shot_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{shot.title}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
              {shot.category === "image" ? <ImageIcon className="w-2.5 h-2.5 mr-0.5" /> : <Video className="w-2.5 h-2.5 mr-0.5" />}
              {shot.category}
            </Badge>
            <span className={`text-[10px] font-medium ml-auto ${statusColor[state.status]}`}>
              {statusLabel[state.status]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{shot.role}</p>
        </div>
      </div>

      {/* Prompt */}
      <div className="px-4 py-3 flex-1">
        <p className="text-xs text-foreground/80 leading-relaxed line-clamp-3">{shot.prompt}</p>
        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{modelShort}</span>
          <span>{shot.aspect_ratio}</span>
          {shot.duration && <span>{shot.duration}s</span>}
        </div>
        <p className="mt-1.5 text-[10px] text-primary/70 italic">{shot.model_rationale}</p>
      </div>

      {/* Output or action */}
      <div className="px-4 pb-4">
        {state.status === "completed" && state.output_urls && state.output_urls.length > 0 ? (
          <div className="rounded-lg overflow-hidden bg-black/40 relative group">
            {shot.category === "image" ? (
              <>
                <img
                  src={state.output_urls[0]}
                  alt={shot.title}
                  className="w-full h-36 object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={state.output_urls[0]} target="_blank" rel="noopener noreferrer">
                    <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                  <a href={state.output_urls[0]} download>
                    <Button size="icon" variant="secondary" className="rounded-full h-8 w-8">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </a>
                </div>
              </>
            ) : (
              <video
                src={state.output_urls[0]}
                controls
                className="w-full h-36 object-cover"
              />
            )}
          </div>
        ) : state.status === "failed" ? (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{state.error ?? "Generation failed"}</span>
          </div>
        ) : state.status === "pending" || state.status === "in_progress" ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
            <span>{state.status === "pending" ? "Queued…" : "Generating…"}</span>
            {state.request_id && (
              <span className="ml-auto font-mono opacity-50">{state.request_id.slice(0, 8)}…</span>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full text-xs"
            onClick={onFire}
            disabled={state.status !== "idle"}
          >
            <Play className="w-3 h-3 mr-1.5" />
            Fire Shot
          </Button>
        )}
      </div>
    </div>
  );
}

export function SIDirector() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { add, update } = useCreations();

  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("");
  const [duration, setDuration] = useState<"short" | "medium" | "long">("medium");
  const [outputType, setOutputType] = useState<"image" | "video" | "mixed">("mixed");

  const [planning, setPlanning] = useState(false);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [shotStates, setShotStates] = useState<ShotState[]>([]);
  const [firingAll, setFiringAll] = useState(false);

  const handlePlan = async () => {
    if (!concept.trim()) {
      toast({ title: "Enter a concept", variant: "destructive" });
      return;
    }
    setPlanning(true);
    setPlan(null);
    setShotStates([]);
    try {
      const result = await planProduction(concept.trim(), style.trim(), duration, outputType);
      setPlan(result);
      setShotStates(result.shots.map(() => ({ status: "idle" })));
    } catch (err) {
      toast({
        title: "SI Director planning failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setPlanning(false);
    }
  };

  const fireSingleShot = async (shotIndex: number) => {
    if (!plan) return;
    const shot = plan.shots[shotIndex];

    setShotStates(prev => {
      const next = [...prev];
      next[shotIndex] = { status: "pending" };
      return next;
    });

    const inputs: Record<string, unknown> = {
      prompt: shot.prompt,
    };
    if (shot.negative_prompt) inputs.negative_prompt = shot.negative_prompt;
    if (shot.category === "video") {
      inputs.aspect_ratio = shot.aspect_ratio;
      if (shot.duration) inputs.duration = shot.duration;
    } else {
      inputs.aspect_ratio = shot.aspect_ratio;
    }

    let request_id: string;
    try {
      const sub = await submitGeneration(shot.model_id, inputs);
      request_id = sub.request_id;
    } catch (err) {
      setShotStates(prev => {
        const next = [...prev];
        next[shotIndex] = {
          status: "failed",
          error: err instanceof Error ? err.message : "Submission failed",
        };
        return next;
      });
      return;
    }

    setShotStates(prev => {
      const next = [...prev];
      next[shotIndex] = { status: "in_progress", request_id };
      return next;
    });

    const creationId = crypto.randomUUID();
    const creation: Creation = {
      id: creationId,
      type: shot.category,
      model_id: shot.model_id,
      model_name: shot.title,
      prompt: shot.prompt,
      status: "in_progress",
      output_urls: [],
      request_id,
      created_at: Date.now(),
    };
    add(creation);

    const poll = setInterval(async () => {
      try {
        const result = await pollStatus(shot.model_id, request_id);
        if (result.status === "COMPLETED") {
          clearInterval(poll);
          const urls = result.images?.length
            ? result.images
            : result.video_url
            ? [result.video_url]
            : [];
          setShotStates(prev => {
            const next = [...prev];
            next[shotIndex] = { status: "completed", request_id, output_urls: urls };
            return next;
          });
          update(creationId, { status: "completed", output_urls: urls });
        } else if (result.status === "FAILED") {
          clearInterval(poll);
          setShotStates(prev => {
            const next = [...prev];
            next[shotIndex] = { status: "failed", error: "Generation failed on fal.ai" };
            return next;
          });
          update(creationId, { status: "failed", error: "Generation failed" });
        } else if (result.status === "IN_PROGRESS") {
          setShotStates(prev => {
            const next = [...prev];
            if (next[shotIndex].status === "pending") {
              next[shotIndex] = { ...next[shotIndex], status: "in_progress" };
            }
            return next;
          });
        }
      } catch {
        // transient, keep polling
      }
    }, 3500);
  };

  const fireAll = async () => {
    if (!plan) return;
    setFiringAll(true);
    const idleShots = plan.shots
      .map((_, i) => i)
      .filter(i => shotStates[i]?.status === "idle");

    for (const i of idleShots) {
      await fireSingleShot(i);
      await new Promise(r => setTimeout(r, 600));
    }
    setFiringAll(false);
  };

  const completedCount = shotStates.filter(s => s.status === "completed").length;
  const runningCount = shotStates.filter(s => s.status === "pending" || s.status === "in_progress").length;
  const idleCount = shotStates.filter(s => s.status === "idle").length;

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-violet-500/30 flex items-center justify-center">
            <Brain className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SI Director</h1>
            <p className="text-sm text-muted-foreground">Synthetic Intelligence autonomous production planning</p>
          </div>
        </div>

        <div className="mt-2 bg-violet-500/5 border border-violet-500/20 rounded-xl p-4 text-sm text-muted-foreground leading-relaxed">
          <span className="text-violet-400 font-semibold">Unlike AI, SI reasons across your entire production simultaneously</span> — it chooses each model strategically, constructs a narrative arc, and synthesizes a visual language before a single generation fires.
          Give it a raw concept and it plans the whole thing.
        </div>
      </div>

      {/* Concept input */}
      <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-primary" />
          Give the SI Director a concept
        </h2>

        <div className="space-y-2">
          <Label>Concept</Label>
          <Textarea
            placeholder="e.g. 'A brand film about the last lighthouse keeper in an era of autonomous ships' or 'solitude as a superpower' or 'neon-drenched Tokyo street market at 3am'"
            className="min-h-[100px] resize-y bg-background font-mono text-sm"
            value={concept}
            onChange={e => setConcept(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label>Style direction (optional)</Label>
            <Input
              placeholder="e.g. 'Tarkovsky meets Blade Runner', 'hyperreal oil painting', 'brutalist minimalism'"
              className="bg-background"
              value={style}
              onChange={e => setStyle(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-44 space-y-2">
            <Label>Production scale</Label>
            <Select value={duration} onValueChange={v => setDuration(v as typeof duration)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (3 shots)</SelectItem>
                <SelectItem value="medium">Medium (5 shots)</SelectItem>
                <SelectItem value="long">Full (8 shots)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full sm:w-40 space-y-2">
            <Label>Output type</Label>
            <Select value={outputType} onValueChange={v => setOutputType(v as typeof outputType)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="video">Video only</SelectItem>
                <SelectItem value="image">Image only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handlePlan}
          disabled={planning || !concept.trim()}
          className="h-12 text-sm font-bold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-500/20"
        >
          {planning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              SI Director is synthesizing…
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              Plan Production
            </>
          )}
        </Button>
      </div>

      {/* Production Plan */}
      {plan && (
        <div className="flex flex-col gap-6">
          {/* Plan overview */}
          <div className="bg-gradient-to-br from-violet-500/5 to-cyan-500/5 border border-violet-500/20 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold">{plan.title}</h2>
                <p className="text-sm text-violet-300 mt-1 italic">{plan.logline}</p>
              </div>
              <div className="flex items-center gap-2">
                {runningCount > 0 && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />
                    {runningCount} running
                  </Badge>
                )}
                {completedCount > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    {completedCount}/{plan.shots.length}
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Visual Philosophy</div>
                <p className="text-foreground/80 leading-relaxed">{plan.visual_philosophy}</p>
              </div>
              <div className="bg-black/20 rounded-lg p-3">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Narrative Arc</div>
                <p className="text-foreground/80 leading-relaxed">{plan.narrative_arc}</p>
              </div>
            </div>

            {/* Fire All button */}
            <div className="flex items-center gap-3 pt-1">
              <Button
                onClick={fireAll}
                disabled={firingAll || idleCount === 0}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-500/20 font-bold"
              >
                {firingAll ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Firing…</>
                ) : (
                  <><Zap className="mr-2 h-4 w-4" /> Fire All Shots ({idleCount} pending)</>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setLocation("/creations")}
                className="text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                My Creations
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlan}
                disabled={planning}
                className="text-xs text-muted-foreground ml-auto"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />
                Re-plan
              </Button>
            </div>
          </div>

          {/* Shot grid */}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
              Production Shots — {plan.shots.length} total
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {plan.shots.map((shot, i) => (
                <ShotCard
                  key={i}
                  shot={shot}
                  state={shotStates[i] ?? { status: "idle" }}
                  index={i}
                  onFire={() => fireSingleShot(i)}
                />
              ))}
            </div>
          </div>

          {/* Director's notes */}
          <div className="bg-card border border-card-border rounded-xl p-5 text-sm">
            <div className="text-[10px] uppercase tracking-widest text-violet-400 mb-2">SI Director's Commentary</div>
            <p className="text-muted-foreground leading-relaxed italic">{plan.production_notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
