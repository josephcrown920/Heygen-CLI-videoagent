import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { useListAvatarLooks, getListAvatarLooksQueryKey, useListVoices, getListVoicesQueryKey } from "@workspace/api-client-react";
import {
  Brain, Sparkles, Loader2, Play, Video,
  ChevronRight, Zap, CheckCircle2, AlertCircle, ExternalLink,
  Eye, RefreshCw, User, Mic, Info, Clapperboard,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

interface Shot {
  shot_number: number;
  title: string;
  role: string;
  script: string;
  performance_notes: string;
  visual_notes: string;
  orientation: "landscape" | "portrait";
  estimated_duration_seconds?: number;
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
  video_id?: string;
  video_url?: string;
  thumbnail_url?: string;
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
  const data = await res.json() as { plan: ProductionPlan; model_used?: string; provider_used?: string };
  return data;
}

async function submitHeyGenVideo(avatarId: string, voiceId: string, shot: Shot) {
  const res = await fetch(`${BASE_URL}/api/heygen/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      avatar_id: avatarId,
      voice_id: voiceId,
      script: shot.script,
      title: shot.title,
      orientation: shot.orientation,
    }),
  });
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error ?? "Submission failed");
  }
  return res.json() as Promise<{ video_id: string; status: string }>;
}

async function pollHeyGenVideo(videoId: string) {
  const res = await fetch(`${BASE_URL}/api/heygen/videos/${videoId}`);
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error ?? "Status check failed");
  }
  return res.json() as Promise<{
    id: string;
    status: string;
    video_url?: string | null;
    thumbnail_url?: string | null;
    error?: string | null;
  }>;
}

function ShotCard({
  shot, state, onFire, canFire,
}: {
  shot: Shot;
  state: ShotState;
  onFire: () => void;
  canFire: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const statusColor: Record<ShotStatus, string> = {
    idle: "text-muted-foreground",
    pending: "text-yellow-400",
    in_progress: "text-blue-400",
    completed: "text-green-400",
    failed: "text-red-400",
  };

  const statusLabel: Record<ShotStatus, string> = {
    idle: canFire ? "Ready" : "Select avatar & voice",
    pending: "Submitting…",
    in_progress: "Generating…",
    completed: "Done",
    failed: "Failed",
  };

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-start gap-3 p-4 border-b border-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
          {shot.shot_number}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{shot.title}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0 capitalize">
              {shot.orientation}
            </Badge>
            {shot.estimated_duration_seconds && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                ~{shot.estimated_duration_seconds}s
              </Badge>
            )}
            <span className={`text-[10px] font-medium ml-auto ${statusColor[state.status]}`}>
              {statusLabel[state.status]}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{shot.role}</p>
        </div>
      </div>

      {/* Script */}
      <div className="px-4 py-3 flex-1">
        <p className={`text-xs text-foreground/80 leading-relaxed font-mono ${expanded ? "" : "line-clamp-4"}`}>
          "{shot.script}"
        </p>
        {shot.script.length > 180 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-[10px] text-primary/70 mt-1 hover:text-primary"
          >
            {expanded ? "Show less" : "Show full script"}
          </button>
        )}

        {/* Notes */}
        <div className="mt-3 space-y-1.5">
          {shot.performance_notes && (
            <div className="flex gap-1.5 text-[10px] text-muted-foreground">
              <Mic className="w-3 h-3 flex-shrink-0 mt-0.5 text-violet-400" />
              <span className="italic">{shot.performance_notes}</span>
            </div>
          )}
          {shot.visual_notes && (
            <div className="flex gap-1.5 text-[10px] text-muted-foreground">
              <Video className="w-3 h-3 flex-shrink-0 mt-0.5 text-cyan-400" />
              <span>{shot.visual_notes}</span>
            </div>
          )}
        </div>
      </div>

      {/* Output / Action */}
      <div className="px-4 pb-4">
        {state.status === "completed" && state.video_url ? (
          <div className="rounded-lg overflow-hidden bg-black/40 relative group">
            {state.thumbnail_url ? (
              <img src={state.thumbnail_url} alt={shot.title} className="w-full h-36 object-cover" />
            ) : (
              <div className="w-full h-36 flex items-center justify-center text-muted-foreground bg-muted/40">
                <Video className="w-8 h-8 opacity-30" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={state.video_url} target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="secondary" className="rounded-full h-9 w-9">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            </div>
            <div className="absolute bottom-2 left-2">
              <Badge className="text-[9px] bg-green-600 border-0">Ready to view</Badge>
            </div>
          </div>
        ) : state.status === "completed" && !state.video_url ? (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Processing — check Library in a moment</span>
          </div>
        ) : state.status === "failed" ? (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{state.error ?? "Generation failed"}</span>
          </div>
        ) : state.status === "pending" || state.status === "in_progress" ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
            <span>{state.status === "pending" ? "Submitting to HeyGen…" : "HeyGen is generating…"}</span>
            {state.video_id && (
              <span className="ml-auto font-mono opacity-50">{state.video_id.slice(0, 8)}…</span>
            )}
          </div>
        ) : (
          <Button
            size="sm"
            className="w-full text-xs"
            onClick={onFire}
            disabled={!canFire}
          >
            <Play className="w-3 h-3 mr-1.5" />
            {canFire ? "Fire Shot" : "Select avatar & voice first"}
          </Button>
        )}
      </div>
    </div>
  );
}

export function SIDirector() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Concept inputs
  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("");
  const [duration, setDuration] = useState<"short" | "medium" | "long">("medium");
  const [outputType, setOutputType] = useState<"brand" | "promo" | "explainer" | "documentary" | "social">("brand");

  // Avatar / voice selection
  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [showCasting, setShowCasting] = useState(false);

  // Plan state
  const [planning, setPlanning] = useState(false);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [shotStates, setShotStates] = useState<ShotState[]>([]);
  const [firingAll, setFiringAll] = useState(false);

  const { data: avatarsData, isLoading: loadingAvatars } = useListAvatarLooks({}, {
    query: { queryKey: getListAvatarLooksQueryKey() },
  });
  const { data: voicesData, isLoading: loadingVoices } = useListVoices({}, {
    query: { queryKey: getListVoicesQueryKey() },
  });

  const allAvatars = avatarsData?.avatars ?? [];
  const allVoices = voicesData?.voices ?? [];

  const filteredAvatars = useMemo(() => {
    const q = avatarSearch.trim().toLowerCase();
    return q ? allAvatars.filter(a => (a.name ?? "").toLowerCase().includes(q)) : allAvatars;
  }, [allAvatars, avatarSearch]);

  const filteredVoices = useMemo(() => {
    const q = voiceSearch.trim().toLowerCase();
    return q ? allVoices.filter(v => (v.name ?? "").toLowerCase().includes(q) || (v.language ?? "").toLowerCase().includes(q)) : allVoices;
  }, [allVoices, voiceSearch]);

  const selectedAvatar = allAvatars.find(a => a.id === selectedAvatarId);
  const selectedVoice = allVoices.find(v => v.id === selectedVoiceId);
  const canFire = !!selectedAvatarId && !!selectedVoiceId;

  const handlePlan = async () => {
    if (!concept.trim()) {
      toast({ title: "Enter a concept", variant: "destructive" });
      return;
    }
    setPlanning(true);
    setPlan(null);
    setShotStates([]);
    setModelUsed(null);
    try {
      const result = await planProduction(concept.trim(), style.trim(), duration, outputType);
      setPlan(result.plan);
      setShotStates(result.plan.shots.map(() => ({ status: "idle" })));
      if (result.model_used) setModelUsed(`${result.provider_used ?? ""}/${result.model_used}`);
      if (!canFire) setShowCasting(true);
    } catch (err) {
      toast({
        title: "Planning failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setPlanning(false);
    }
  };

  const fireSingleShot = async (shotIndex: number) => {
    if (!plan || !canFire) return;
    const shot = plan.shots[shotIndex];

    setShotStates(prev => {
      const next = [...prev];
      next[shotIndex] = { status: "pending" };
      return next;
    });

    let video_id: string;
    try {
      const sub = await submitHeyGenVideo(selectedAvatarId, selectedVoiceId, shot);
      video_id = sub.video_id;
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
      next[shotIndex] = { status: "in_progress", video_id };
      return next;
    });

    const poll = setInterval(async () => {
      try {
        const result = await pollHeyGenVideo(video_id);
        if (result.status === "completed") {
          clearInterval(poll);
          setShotStates(prev => {
            const next = [...prev];
            next[shotIndex] = {
              status: "completed",
              video_id,
              video_url: result.video_url ?? undefined,
              thumbnail_url: result.thumbnail_url ?? undefined,
            };
            return next;
          });
          toast({ title: `Shot ${shot.shot_number} ready`, description: shot.title });
        } else if (result.status === "failed") {
          clearInterval(poll);
          setShotStates(prev => {
            const next = [...prev];
            next[shotIndex] = { status: "failed", video_id, error: result.error ?? "Generation failed" };
            return next;
          });
        }
      } catch {
        // transient error, keep polling
      }
    }, 5000);
  };

  const fireAll = async () => {
    if (!plan || !canFire) return;
    setFiringAll(true);
    const idleIndexes = plan.shots.map((_, i) => i).filter(i => shotStates[i]?.status === "idle");
    for (const i of idleIndexes) {
      await fireSingleShot(i);
      await new Promise(r => setTimeout(r, 800));
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
          <span className="text-violet-400 font-semibold">SI Director thinks across your entire production at once</span> — it writes every script, plans the narrative arc, sets tone per shot, and sequences the emotional journey before anything fires. Give it a raw concept and it builds the whole thing.
        </div>
      </div>

      {/* Step 1 — Concept */}
      <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-primary" />
          1. Give SI Director a concept
        </h2>

        <div className="space-y-2">
          <Label>Concept</Label>
          <Textarea
            placeholder="e.g. 'A brand film about the last lighthouse keeper in an era of autonomous ships' or 'why we built this product' or 'the gap between where you are and where you could be'"
            className="min-h-[90px] resize-y bg-background font-mono text-sm"
            value={concept}
            onChange={e => setConcept(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label>Style direction (optional)</Label>
            <Input
              placeholder="e.g. 'cinematic and intimate', 'direct to camera, no-nonsense', 'warm and aspirational'"
              className="bg-background"
              value={style}
              onChange={e => setStyle(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48 space-y-2">
            <Label>Production type</Label>
            <Select value={outputType} onValueChange={v => setOutputType(v as typeof outputType)}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="brand">Brand story</SelectItem>
                <SelectItem value="promo">Promo / launch</SelectItem>
                <SelectItem value="explainer">Explainer</SelectItem>
                <SelectItem value="documentary">Documentary</SelectItem>
                <SelectItem value="social">Social / short-form</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-full sm:w-44 space-y-2">
            <Label>Scale</Label>
            <Select value={duration} onValueChange={v => setDuration(v as typeof duration)}>
              <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="short">Short (3 shots)</SelectItem>
                <SelectItem value="medium">Medium (5 shots)</SelectItem>
                <SelectItem value="long">Full (8 shots)</SelectItem>
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
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />SI Director is writing your production…</>
          ) : (
            <><Brain className="mr-2 h-4 w-4" />Plan Production</>
          )}
        </Button>
      </div>

      {/* Step 2 — Cast (shown after plan is ready) */}
      {plan && (
        <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />
              2. Cast your avatar & voice
            </h2>
            {canFire && (
              <Badge className="bg-green-600 border-0 text-xs gap-1.5">
                <CheckCircle2 className="w-3 h-3" />
                Cast confirmed
              </Badge>
            )}
          </div>

          {/* Current selection summary */}
          {(selectedAvatar || selectedVoice) && (
            <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-2.5 text-sm">
              {selectedAvatar && (
                <div className="flex items-center gap-2">
                  {selectedAvatar.preview_image_url ? (
                    <img src={selectedAvatar.preview_image_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><User className="w-3.5 h-3.5" /></div>
                  )}
                  <span className="font-medium">{selectedAvatar.name}</span>
                </div>
              )}
              {selectedAvatar && selectedVoice && <span className="text-muted-foreground">+</span>}
              {selectedVoice && (
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium">{selectedVoice.name}</span>
                  <span className="text-xs text-muted-foreground capitalize">{selectedVoice.language}</span>
                </div>
              )}
              <button
                onClick={() => setShowCasting(!showCasting)}
                className="ml-auto text-xs text-primary hover:underline"
              >
                {showCasting ? "Collapse" : "Change"}
              </button>
            </div>
          )}

          {/* Expand/collapse casting panel */}
          {(showCasting || !canFire) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Avatar picker */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Avatar</Label>
                <div className="border border-border rounded-xl overflow-hidden bg-background h-52">
                  <div className="p-2 border-b border-border">
                    <Input
                      placeholder="Search avatars…"
                      className="h-7 text-xs bg-muted border-0"
                      value={avatarSearch}
                      onChange={e => setAvatarSearch(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-40">
                    <div className="p-2 grid grid-cols-3 gap-2">
                      {loadingAvatars ? (
                        [...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />)
                      ) : filteredAvatars.map(avatar => (
                        <div
                          key={avatar.id}
                          onClick={() => { setSelectedAvatarId(avatar.id); }}
                          className={`cursor-pointer relative rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] bg-muted ${selectedAvatarId === avatar.id ? "border-primary" : "border-transparent hover:border-primary/40"}`}
                        >
                          {avatar.preview_image_url ? (
                            <img src={avatar.preview_image_url} alt={avatar.name ?? ""} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><User className="w-5 h-5 opacity-20" /></div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-1.5">
                            <p className="text-white text-[9px] truncate">{avatar.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              {/* Voice picker */}
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" />Voice</Label>
                <div className="border border-border rounded-xl overflow-hidden bg-background h-52">
                  <div className="p-2 border-b border-border">
                    <Input
                      placeholder="Search voices…"
                      className="h-7 text-xs bg-muted border-0"
                      value={voiceSearch}
                      onChange={e => setVoiceSearch(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-40">
                    <div className="p-2 flex flex-col gap-1">
                      {loadingVoices ? (
                        [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />)
                      ) : filteredVoices.map(voice => (
                        <div
                          key={voice.id}
                          onClick={() => setSelectedVoiceId(voice.id)}
                          className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs ${selectedVoiceId === voice.id ? "border-primary bg-primary/5" : "border-transparent hover:border-border bg-muted/30"}`}
                        >
                          <Mic className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate">{voice.name}</span>
                          <span className="text-muted-foreground capitalize ml-auto flex-shrink-0">{voice.language}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Production plan */}
      {plan && (
        <div className="flex flex-col gap-6">
          {/* Overview */}
          <div className="bg-gradient-to-br from-violet-500/5 to-cyan-500/5 border border-violet-500/20 rounded-xl p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h2 className="text-xl font-bold">{plan.title}</h2>
                <p className="text-sm text-violet-300 mt-1 italic">{plan.logline}</p>
                {modelUsed && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1">Written by {modelUsed}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {runningCount > 0 && (
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 text-xs gap-1">
                    <Loader2 className="w-2.5 h-2.5 animate-spin" />{runningCount} running
                  </Badge>
                )}
                {completedCount > 0 && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/30 text-xs gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />{completedCount}/{plan.shots.length}
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

            <div className="flex items-center gap-3 pt-1 flex-wrap">
              <Button
                onClick={fireAll}
                disabled={firingAll || idleCount === 0 || !canFire}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-500/20 font-bold"
              >
                {firingAll ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Firing…</>
                ) : (
                  <><Zap className="mr-2 h-4 w-4" />
                    {canFire ? `Fire All Shots (${idleCount})` : "Select avatar & voice to fire"}</>
                )}
              </Button>

              <Button variant="outline" onClick={() => setLocation("/videos")} className="text-xs">
                <Eye className="w-3.5 h-3.5 mr-1.5" />Library
              </Button>

              <Button variant="outline" onClick={() => setLocation("/create")} className="text-xs">
                <Clapperboard className="w-3.5 h-3.5 mr-1.5" />Director Suite
              </Button>

              <Button
                variant="ghost" size="sm" onClick={handlePlan} disabled={planning}
                className="text-xs text-muted-foreground ml-auto"
              >
                <RefreshCw className="w-3 h-3 mr-1.5" />Re-plan
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
                  onFire={() => fireSingleShot(i)}
                  canFire={canFire}
                />
              ))}
            </div>
          </div>

          {/* Director's notes */}
          <div className="bg-card border border-card-border rounded-xl p-5 text-sm">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-violet-400 mb-2">
              <Sparkles className="w-3 h-3" />SI Director's Commentary
            </div>
            <p className="text-muted-foreground leading-relaxed italic">{plan.production_notes}</p>
          </div>
        </div>
      )}
    </div>
  );
}
