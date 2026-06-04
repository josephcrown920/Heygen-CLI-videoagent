import { useState, useMemo, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
  useListAvatarLooks, getListAvatarLooksQueryKey,
  useListVoices, getListVoicesQueryKey,
} from "@workspace/api-client-react";
import {
  Brain, Sparkles, Loader2, Play, Video, ChevronRight, Zap,
  CheckCircle2, AlertCircle, ExternalLink, Eye, RefreshCw,
  User, Mic, Info, Clapperboard, Pencil, X, Wand2, Image as ImageIcon,
  RotateCcw, LayoutGrid, Film, ArrowDown,
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

/* ─── Types ─────────────────────────────────────────────────────── */

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
type ImageStatus = "idle" | "generating" | "done" | "failed";

interface ShotState {
  status: ShotStatus;
  video_id?: string;
  video_url?: string;
  thumbnail_url?: string;
  error?: string;
  script_override?: string;
  image_status?: ImageStatus;
  image_url?: string;
}

/* ─── API helpers ────────────────────────────────────────────────── */

async function planProduction(concept: string, style: string, duration: string, output_type: string) {
  const res = await fetch(`${BASE_URL}/api/si/plan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ concept, style, duration, output_type }),
  });
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Planning failed");
  return res.json() as Promise<{ plan: ProductionPlan; model_used?: string; provider_used?: string }>;
}

async function rewriteScript(payload: {
  shot_title: string; shot_role: string; current_script: string;
  performance_notes?: string; production_title?: string; direction?: string;
}) {
  const res = await fetch(`${BASE_URL}/api/si/rewrite-script`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Rewrite failed");
  return res.json() as Promise<{ script: string }>;
}

async function submitFal(model_id: string, inputs: Record<string, unknown>) {
  const res = await fetch(`${BASE_URL}/api/fal/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model_id, inputs }),
  });
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Submission failed");
  return res.json() as Promise<{ request_id: string }>;
}

async function pollFal(model_id: string, request_id: string) {
  const params = new URLSearchParams({ model_id, request_id });
  const res = await fetch(`${BASE_URL}/api/fal/status?${params}`);
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Poll failed");
  return res.json() as Promise<{ status: string; images?: string[]; video_url?: string | null }>;
}

async function submitHeyGen(avatarId: string, voiceId: string, shot: Shot, scriptOverride?: string) {
  const res = await fetch(`${BASE_URL}/api/heygen/videos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      avatar_id: avatarId, voice_id: voiceId,
      script: scriptOverride ?? shot.script,
      title: shot.title, orientation: shot.orientation,
    }),
  });
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Submission failed");
  return res.json() as Promise<{ video_id: string }>;
}

async function pollHeyGen(videoId: string) {
  const res = await fetch(`${BASE_URL}/api/heygen/videos/${videoId}`);
  if (!res.ok) throw new Error(((await res.json()) as { error?: string }).error ?? "Poll failed");
  return res.json() as Promise<{
    id: string; status: string;
    video_url?: string | null; thumbnail_url?: string | null; error?: string | null;
  }>;
}

/* ─── MagicScript inline editor (shared by both views) ──────────── */

function MagicScriptPanel({
  shot, state, planTitle, onScriptChange, onClose,
}: {
  shot: Shot; state: ShotState; planTitle: string;
  onScriptChange: (s: string) => void; onClose: () => void;
}) {
  const [editText, setEditText] = useState(state.script_override ?? shot.script);
  const [direction, setDirection] = useState("");
  const [rewriting, setRewriting] = useState(false);
  const { toast } = useToast();

  const handleRewrite = async () => {
    setRewriting(true);
    try {
      const data = await rewriteScript({
        shot_title: shot.title, shot_role: shot.role, current_script: editText,
        performance_notes: shot.performance_notes, production_title: planTitle,
        direction: direction.trim() || undefined,
      });
      setEditText(data.script);
      toast({ title: "Script rewritten", description: "Review it and apply when ready." });
    } catch (err) {
      toast({ title: "Rewrite failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setRewriting(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 bg-background/80 rounded-lg p-3 border border-violet-500/30">
      <Textarea
        value={editText}
        onChange={e => setEditText(e.target.value)}
        className="text-xs font-mono bg-background resize-none min-h-[80px] border-border"
        placeholder="Script…"
      />
      <Input
        value={direction}
        onChange={e => setDirection(e.target.value)}
        placeholder="Direction (optional) — e.g. 'shorter', 'more urgent', 'make it a question'"
        className="text-xs bg-background h-7 border-border"
      />
      <div className="flex gap-1.5">
        <Button size="sm" variant="outline" className="flex-1 text-xs h-7 gap-1" onClick={handleRewrite} disabled={rewriting}>
          {rewriting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3 text-violet-400" />}
          {rewriting ? "Rewriting…" : "AI Rewrite"}
        </Button>
        <Button size="sm" className="flex-1 text-xs h-7" onClick={() => { onScriptChange(editText.trim() || shot.script); onClose(); }}>
          <CheckCircle2 className="w-3 h-3 mr-1" />Apply
        </Button>
        <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={onClose}>
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

/* ─── Grid shot card ─────────────────────────────────────────────── */

function ShotCard({
  shot, state, planTitle, canFire, onFire, onScriptChange, onImageGen,
}: {
  shot: Shot; state: ShotState; planTitle: string; canFire: boolean;
  onFire: () => void; onScriptChange: (s: string) => void; onImageGen: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [scriptExpanded, setScriptExpanded] = useState(false);
  const isModified = !!state.script_override && state.script_override !== shot.script;
  const activeScript = state.script_override ?? shot.script;

  const statusColor: Record<ShotStatus, string> = {
    idle: "text-muted-foreground", pending: "text-yellow-400",
    in_progress: "text-blue-400", completed: "text-green-400", failed: "text-red-400",
  };
  const statusLabel: Record<ShotStatus, string> = {
    idle: canFire ? "Ready" : "Needs cast", pending: "Submitting…",
    in_progress: "Generating…", completed: "Done", failed: "Failed",
  };

  return (
    <div className="bg-card border border-card-border rounded-xl overflow-hidden flex flex-col">
      <div className="flex items-start gap-3 p-4 border-b border-border">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">{shot.shot_number}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm truncate">{shot.title}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0 capitalize">{shot.orientation}</Badge>
            {shot.estimated_duration_seconds && <Badge variant="outline" className="text-[10px] px-1.5 py-0 flex-shrink-0">~{shot.estimated_duration_seconds}s</Badge>}
            {isModified && <Badge className="text-[10px] px-1.5 py-0 flex-shrink-0 bg-amber-600 border-0">edited</Badge>}
            <span className={`text-[10px] font-medium ml-auto ${statusColor[state.status]}`}>{statusLabel[state.status]}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">{shot.role}</p>
        </div>
      </div>

      <div className="px-4 pt-3 flex-1">
        {editOpen ? (
          <MagicScriptPanel shot={shot} state={state} planTitle={planTitle} onScriptChange={onScriptChange} onClose={() => setEditOpen(false)} />
        ) : (
          <div>
            <p className={`text-xs text-foreground/80 leading-relaxed font-mono ${scriptExpanded ? "" : "line-clamp-4"}`}>"{activeScript}"</p>
            <div className="flex items-center gap-2 mt-1.5">
              {activeScript.length > 160 && (
                <button onClick={() => setScriptExpanded(!scriptExpanded)} className="text-[10px] text-primary/70 hover:text-primary">
                  {scriptExpanded ? "Collapse" : "Read more"}
                </button>
              )}
              <div className="flex gap-1 ml-auto">
                {isModified && (
                  <button onClick={() => onScriptChange(shot.script)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                    <RotateCcw className="w-2.5 h-2.5" />reset
                  </button>
                )}
                <button onClick={() => setEditOpen(true)} className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-0.5">
                  <Pencil className="w-2.5 h-2.5" />{isModified ? "Edit" : "Magic Script"}
                </button>
              </div>
            </div>
            <div className="mt-2 space-y-1">
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
        )}
      </div>

      {!editOpen && (
        <div className="px-4 pt-2">
          {state.image_status === "done" && state.image_url ? (
            <div className="relative group rounded-lg overflow-hidden bg-black/30 mb-2">
              <img src={state.image_url} alt="companion" className="w-full h-20 object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a href={state.image_url} target="_blank" rel="noopener noreferrer">
                  <Button size="icon" variant="secondary" className="rounded-full h-7 w-7"><ExternalLink className="w-3 h-3" /></Button>
                </a>
              </div>
              <Badge className="absolute bottom-1 left-1 text-[9px] bg-cyan-700 border-0">flux-pro</Badge>
            </div>
          ) : state.image_status === "generating" ? (
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground bg-muted/40 rounded-lg px-2 py-1.5 mb-2">
              <Loader2 className="w-3 h-3 animate-spin flex-shrink-0" /><span>Generating image…</span>
            </div>
          ) : state.image_status === "failed" ? (
            <div className="flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 rounded-lg px-2 py-1.5 mb-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />Image failed
            </div>
          ) : (
            <button onClick={onImageGen} className="text-[10px] text-cyan-400/70 hover:text-cyan-300 flex items-center gap-1 mb-2">
              <ImageIcon className="w-3 h-3" />Generate companion image (flux-pro)
            </button>
          )}
        </div>
      )}

      <div className="px-4 pb-4">
        {state.status === "completed" && state.video_url ? (
          <div className="rounded-lg overflow-hidden bg-black/40 relative group">
            {state.thumbnail_url ? (
              <img src={state.thumbnail_url} alt={shot.title} className="w-full h-28 object-cover" />
            ) : (
              <div className="w-full h-28 flex items-center justify-center text-muted-foreground bg-muted/40"><Video className="w-8 h-8 opacity-30" /></div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a href={state.video_url} target="_blank" rel="noopener noreferrer">
                <Button size="icon" variant="secondary" className="rounded-full h-9 w-9"><ExternalLink className="w-4 h-4" /></Button>
              </a>
            </div>
            <Badge className="absolute bottom-2 left-2 text-[9px] bg-green-600 border-0">HeyGen · Done</Badge>
          </div>
        ) : state.status === "completed" ? (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />Processing — check Library shortly
          </div>
        ) : state.status === "failed" ? (
          <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /><span>{state.error ?? "Generation failed"}</span>
          </div>
        ) : state.status === "pending" || state.status === "in_progress" ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/60 rounded-lg px-3 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin flex-shrink-0" />
            <span>{state.status === "pending" ? "Submitting to HeyGen…" : "HeyGen is rendering…"}</span>
            {state.video_id && <span className="ml-auto font-mono opacity-40">{state.video_id.slice(0, 8)}…</span>}
          </div>
        ) : (
          <Button size="sm" className="w-full text-xs" onClick={onFire} disabled={!canFire || editOpen}>
            <Play className="w-3 h-3 mr-1.5" />{canFire ? "Fire Shot" : "Cast first"}
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── Storyboard row ─────────────────────────────────────────────── */

function StoryboardRow({
  shot, state, planTitle, index, total, canFire, onFire, onScriptChange, onImageGen,
}: {
  shot: Shot; state: ShotState; planTitle: string; index: number; total: number; canFire: boolean;
  onFire: () => void; onScriptChange: (s: string) => void; onImageGen: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const isModified = !!state.script_override && state.script_override !== shot.script;
  const activeScript = state.script_override ?? shot.script;
  const isLast = index === total - 1;

  const statusColor: Record<ShotStatus, string> = {
    idle: "bg-muted-foreground/30", pending: "bg-yellow-500",
    in_progress: "bg-blue-500", completed: "bg-green-500", failed: "bg-red-500",
  };

  return (
    <div className="flex gap-4">
      {/* Timeline spine */}
      <div className="flex flex-col items-center flex-shrink-0 w-10">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${
          state.status === "completed" ? "border-green-500 bg-green-500/10 text-green-400" :
          state.status === "failed" ? "border-red-500 bg-red-500/10 text-red-400" :
          state.status === "in_progress" || state.status === "pending" ? "border-blue-500 bg-blue-500/10 text-blue-400" :
          "border-muted-foreground/30 bg-muted/20 text-muted-foreground"
        }`}>
          {state.status === "completed" ? <CheckCircle2 className="w-4 h-4" /> :
           state.status === "in_progress" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
           shot.shot_number}
        </div>
        {!isLast && <div className="w-px flex-1 mt-1 bg-border min-h-[24px]" />}
        {!isLast && (
          <ArrowDown className="w-3 h-3 text-muted-foreground/30 -mt-1 mb-1" />
        )}
      </div>

      {/* Card body */}
      <div className="flex-1 mb-6">
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image frame */}
            <div className="lg:w-64 flex-shrink-0 bg-black/30 flex items-center justify-center relative overflow-hidden">
              {state.image_status === "done" && state.image_url ? (
                <div className="relative group w-full h-full min-h-[140px]">
                  <img src={state.image_url} alt={shot.title} className="w-full h-full object-cover min-h-[140px]" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <a href={state.image_url} target="_blank" rel="noopener noreferrer">
                      <Button size="icon" variant="secondary" className="rounded-full h-8 w-8"><ExternalLink className="w-3.5 h-3.5" /></Button>
                    </a>
                  </div>
                  <Badge className="absolute bottom-2 left-2 text-[9px] bg-cyan-700 border-0">flux-pro</Badge>
                </div>
              ) : state.image_status === "generating" ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted-foreground min-h-[140px]">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <p className="text-[10px]">Generating…</p>
                </div>
              ) : (
                <button
                  onClick={onImageGen}
                  className="flex flex-col items-center justify-center gap-2 py-10 w-full min-h-[140px] text-muted-foreground/40 hover:text-cyan-400 hover:bg-cyan-500/5 transition-colors group"
                >
                  <ImageIcon className="w-7 h-7" />
                  <span className="text-[10px] text-center px-3 group-hover:text-cyan-300">
                    {state.image_status === "failed" ? "Retry image" : "Generate frame\nflux-pro"}
                  </span>
                </button>
              )}

              {/* Video thumbnail overlay */}
              {state.status === "completed" && state.video_url && state.thumbnail_url && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <a href={state.video_url} target="_blank" rel="noopener noreferrer">
                    <div className="w-12 h-12 rounded-full bg-green-500/80 flex items-center justify-center hover:bg-green-400 transition-colors">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </a>
                  <Badge className="absolute bottom-2 right-2 text-[9px] bg-green-600 border-0">HeyGen Done</Badge>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col gap-3">
              {/* Title row */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{shot.title}</span>
                    {isModified && <Badge className="text-[9px] px-1.5 py-0 bg-amber-600 border-0">edited</Badge>}
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{shot.orientation}</Badge>
                    {shot.estimated_duration_seconds && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">~{shot.estimated_duration_seconds}s</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{shot.role}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className={`w-2 h-2 rounded-full ${statusColor[state.status]}`} />
                </div>
              </div>

              {/* Script + edit */}
              {editOpen ? (
                <MagicScriptPanel shot={shot} state={state} planTitle={planTitle} onScriptChange={onScriptChange} onClose={() => setEditOpen(false)} />
              ) : (
                <div className="bg-black/20 rounded-lg px-4 py-3 relative">
                  <p className="text-sm text-foreground/90 leading-relaxed font-mono italic">"{activeScript}"</p>
                  <div className="flex items-center gap-2 mt-2">
                    {isModified && (
                      <button onClick={() => onScriptChange(shot.script)} className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-0.5">
                        <RotateCcw className="w-2.5 h-2.5" />reset
                      </button>
                    )}
                    <button onClick={() => setEditOpen(true)} className="text-[10px] text-violet-400 hover:text-violet-300 flex items-center gap-1 ml-auto">
                      <Wand2 className="w-3 h-3" />Magic Script
                    </button>
                  </div>
                </div>
              )}

              {/* Notes row */}
              <div className="flex flex-col sm:flex-row gap-2 text-xs">
                {shot.performance_notes && (
                  <div className="flex-1 bg-violet-500/5 border border-violet-500/15 rounded-lg px-3 py-2">
                    <div className="text-[9px] uppercase tracking-widest text-violet-400 mb-1 flex items-center gap-1"><Mic className="w-2.5 h-2.5" />Performance</div>
                    <p className="text-muted-foreground italic text-xs">{shot.performance_notes}</p>
                  </div>
                )}
                {shot.visual_notes && (
                  <div className="flex-1 bg-cyan-500/5 border border-cyan-500/15 rounded-lg px-3 py-2">
                    <div className="text-[9px] uppercase tracking-widest text-cyan-400 mb-1 flex items-center gap-1"><Video className="w-2.5 h-2.5" />Visual</div>
                    <p className="text-muted-foreground text-xs">{shot.visual_notes}</p>
                  </div>
                )}
              </div>

              {/* Action row */}
              <div className="flex items-center gap-2 mt-auto pt-1 border-t border-border/50">
                {state.status === "idle" ? (
                  <Button size="sm" className="text-xs h-8" onClick={onFire} disabled={!canFire}>
                    <Play className="w-3 h-3 mr-1.5" />{canFire ? "Fire Shot" : "Cast first"}
                  </Button>
                ) : state.status === "pending" || state.status === "in_progress" ? (
                  <div className="flex items-center gap-2 text-xs text-blue-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {state.status === "pending" ? "Submitting…" : "HeyGen rendering…"}
                  </div>
                ) : state.status === "completed" ? (
                  <div className="flex items-center gap-1.5 text-xs text-green-400">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {state.video_url ? (
                      <a href={state.video_url} target="_blank" rel="noopener noreferrer" className="hover:underline">View video</a>
                    ) : "Check Library"}
                  </div>
                ) : state.status === "failed" ? (
                  <div className="flex items-center gap-1.5 text-xs text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />{state.error ?? "Failed"}
                    <Button size="sm" variant="outline" className="text-xs h-7 ml-2" onClick={onFire} disabled={!canFire}>Retry</Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────────────────── */

export function SIDirector() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [concept, setConcept] = useState("");
  const [style, setStyle] = useState("");
  const [duration, setDuration] = useState<"short" | "medium" | "long">("medium");
  const [outputType, setOutputType] = useState<"brand" | "promo" | "explainer" | "documentary" | "social">("brand");

  const [selectedAvatarId, setSelectedAvatarId] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  const [showCasting, setShowCasting] = useState(false);

  const [planning, setPlanning] = useState(false);
  const [plan, setPlan] = useState<ProductionPlan | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [shotStates, setShotStates] = useState<ShotState[]>([]);
  const [firingAll, setFiringAll] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "storyboard">("grid");

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
    return q ? allVoices.filter(v =>
      (v.name ?? "").toLowerCase().includes(q) || (v.language ?? "").toLowerCase().includes(q)
    ) : allVoices;
  }, [allVoices, voiceSearch]);

  const selectedAvatar = allAvatars.find(a => a.id === selectedAvatarId);
  const selectedVoice = allVoices.find(v => v.id === selectedVoiceId);
  const canFire = !!selectedAvatarId && !!selectedVoiceId;

  const updateShot = useCallback((index: number, patch: Partial<ShotState>) => {
    setShotStates(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }, []);

  const handlePlan = async () => {
    if (!concept.trim()) { toast({ title: "Enter a concept", variant: "destructive" }); return; }
    setPlanning(true); setPlan(null); setShotStates([]); setModelUsed(null);
    try {
      const data = await planProduction(concept.trim(), style.trim(), duration, outputType);
      setPlan(data.plan);
      setShotStates(data.plan.shots.map(() => ({ status: "idle" })));
      if (data.model_used) setModelUsed(`${data.provider_used ?? ""}/${data.model_used}`);
      if (!canFire) setShowCasting(true);
    } catch (err) {
      toast({ title: "Planning failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setPlanning(false);
    }
  };

  const fireSingleShot = useCallback(async (index: number) => {
    if (!plan || !canFire) return;
    const shot = plan.shots[index];
    const scriptOverride = shotStates[index]?.script_override;
    updateShot(index, { status: "pending" });

    let video_id: string;
    try {
      const sub = await submitHeyGen(selectedAvatarId, selectedVoiceId, shot, scriptOverride);
      video_id = sub.video_id;
    } catch (err) {
      updateShot(index, { status: "failed", error: err instanceof Error ? err.message : "Submission failed" });
      return;
    }

    updateShot(index, { status: "in_progress", video_id });

    const poll = setInterval(async () => {
      try {
        const result = await pollHeyGen(video_id);
        if (result.status === "completed") {
          clearInterval(poll);
          updateShot(index, { status: "completed", video_url: result.video_url ?? undefined, thumbnail_url: result.thumbnail_url ?? undefined });
          toast({ title: `Shot ${shot.shot_number} ready`, description: shot.title });
        } else if (result.status === "failed") {
          clearInterval(poll);
          updateShot(index, { status: "failed", error: result.error ?? "HeyGen failed" });
        }
      } catch { /* transient */ }
    }, 5000);
  }, [plan, canFire, shotStates, selectedAvatarId, selectedVoiceId, updateShot, toast]);

  const fireImageForShot = useCallback(async (index: number) => {
    if (!plan) return;
    const shot = plan.shots[index];
    const prompt = shot.visual_notes || `${shot.title}: ${shot.role}`;
    updateShot(index, { image_status: "generating" });

    let request_id: string;
    try {
      const sub = await submitFal("fal-ai/flux-pro/v1.1", {
        prompt, image_size: shot.orientation === "portrait" ? "portrait_4_3" : "landscape_4_3", num_images: 1,
      });
      request_id = sub.request_id;
    } catch (err) {
      updateShot(index, { image_status: "failed" });
      toast({ title: "Image generation failed", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
      return;
    }

    const poll = setInterval(async () => {
      try {
        const result = await pollFal("fal-ai/flux-pro/v1.1", request_id);
        if (result.status === "COMPLETED") {
          clearInterval(poll);
          updateShot(index, { image_status: "done", image_url: result.images?.[0] });
        } else if (result.status === "FAILED") {
          clearInterval(poll);
          updateShot(index, { image_status: "failed" });
        }
      } catch { /* transient */ }
    }, 3500);
  }, [plan, updateShot, toast]);

  const fireAll = async () => {
    if (!plan || !canFire) return;
    setFiringAll(true);
    const idleIndexes = plan.shots.map((_, i) => i).filter(i => shotStates[i]?.status === "idle");
    for (const i of idleIndexes) { void fireSingleShot(i); await new Promise(r => setTimeout(r, 800)); }
    setFiringAll(false);
  };

  const completedCount = shotStates.filter(s => s.status === "completed").length;
  const runningCount = shotStates.filter(s => s.status === "pending" || s.status === "in_progress").length;
  const idleCount = shotStates.filter(s => s.status === "idle").length;
  const imagesReady = shotStates.filter(s => s.image_status === "done").length;

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
          <span className="text-violet-400 font-semibold">SI Director thinks across your entire production at once</span> — writes every script, plans the narrative arc, sets tone per shot. Tweak with <span className="text-amber-400 font-medium">Magic Script</span>, visualize with <span className="text-cyan-400 font-medium">flux-pro frames</span>, review in <span className="text-emerald-400 font-medium">Storyboard view</span>, then fire all to HeyGen.
        </div>
      </div>

      {/* Step 1 */}
      <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-5">
        <h2 className="font-semibold text-base flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-primary" />1. Give SI Director a concept
        </h2>
        <div className="space-y-2">
          <Label>Concept</Label>
          <Textarea
            placeholder="e.g. 'why we built this product' or 'the gap between where you are and where you could be'"
            className="min-h-[90px] resize-y bg-background font-mono text-sm"
            value={concept} onChange={e => setConcept(e.target.value)}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-2">
            <Label>Style direction (optional)</Label>
            <Input placeholder="e.g. 'direct to camera, no-nonsense', 'warm and aspirational'" className="bg-background" value={style} onChange={e => setStyle(e.target.value)} />
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
        <Button onClick={handlePlan} disabled={planning || !concept.trim()}
          className="h-12 text-sm font-bold bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-500/20">
          {planning ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />SI Director is writing your production…</>
                    : <><Brain className="mr-2 h-4 w-4" />Plan Production</>}
        </Button>
      </div>

      {/* Step 2 — Cast */}
      {plan && (
        <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <ChevronRight className="w-4 h-4 text-primary" />2. Cast your avatar & voice
            </h2>
            {canFire && <Badge className="bg-green-600 border-0 text-xs gap-1.5"><CheckCircle2 className="w-3 h-3" />Cast confirmed</Badge>}
          </div>

          {(selectedAvatar || selectedVoice) && (
            <div className="flex items-center gap-3 bg-muted/40 rounded-lg px-4 py-2.5 text-sm">
              {selectedAvatar && (
                <div className="flex items-center gap-2">
                  {selectedAvatar.preview_image_url
                    ? <img src={selectedAvatar.preview_image_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                    : <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"><User className="w-3.5 h-3.5" /></div>}
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
              <button onClick={() => setShowCasting(!showCasting)} className="ml-auto text-xs text-primary hover:underline">
                {showCasting ? "Collapse" : "Change"}
              </button>
            </div>
          )}

          {(showCasting || !canFire) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5"><User className="w-3.5 h-3.5" />Avatar</Label>
                <div className="border border-border rounded-xl overflow-hidden bg-background h-52">
                  <div className="p-2 border-b border-border">
                    <Input placeholder="Search avatars…" className="h-7 text-xs bg-muted border-0" value={avatarSearch} onChange={e => setAvatarSearch(e.target.value)} />
                  </div>
                  <ScrollArea className="h-40">
                    <div className="p-2 grid grid-cols-3 gap-2">
                      {loadingAvatars ? [...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />) :
                        filteredAvatars.map(avatar => (
                          <div key={avatar.id} onClick={() => setSelectedAvatarId(avatar.id)}
                            className={`cursor-pointer relative rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] bg-muted ${selectedAvatarId === avatar.id ? "border-primary" : "border-transparent hover:border-primary/40"}`}>
                            {avatar.preview_image_url ? <img src={avatar.preview_image_url} alt={avatar.name ?? ""} className="w-full h-full object-cover" /> :
                              <div className="w-full h-full flex items-center justify-center"><User className="w-5 h-5 opacity-20" /></div>}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-1.5">
                              <p className="text-white text-[9px] truncate">{avatar.name}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label className="flex items-center gap-1.5"><Mic className="w-3.5 h-3.5" />Voice</Label>
                <div className="border border-border rounded-xl overflow-hidden bg-background h-52">
                  <div className="p-2 border-b border-border">
                    <Input placeholder="Search voices…" className="h-7 text-xs bg-muted border-0" value={voiceSearch} onChange={e => setVoiceSearch(e.target.value)} />
                  </div>
                  <ScrollArea className="h-40">
                    <div className="p-2 flex flex-col gap-1">
                      {loadingVoices ? [...Array(5)].map((_, i) => <div key={i} className="h-10 bg-muted animate-pulse rounded-lg" />) :
                        filteredVoices.map(voice => (
                          <div key={voice.id} onClick={() => setSelectedVoiceId(voice.id)}
                            className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border transition-all text-xs ${selectedVoiceId === voice.id ? "border-primary bg-primary/5" : "border-transparent hover:border-border bg-muted/30"}`}>
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
                {modelUsed && <p className="text-[10px] text-muted-foreground/50 mt-1">Written by {modelUsed}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                {imagesReady > 0 && (
                  <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 text-xs gap-1">
                    <ImageIcon className="w-2.5 h-2.5" />{imagesReady} frames
                  </Badge>
                )}
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
              <Button onClick={fireAll} disabled={firingAll || idleCount === 0 || !canFire}
                className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 shadow-lg shadow-violet-500/20 font-bold">
                {firingAll ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Firing…</>
                           : <><Zap className="mr-2 h-4 w-4" />{canFire ? `Fire All Shots (${idleCount})` : "Cast first"}</>}
              </Button>
              <Button variant="outline" onClick={() => setLocation("/videos")} className="text-xs">
                <Eye className="w-3.5 h-3.5 mr-1.5" />Library
              </Button>
              <Button variant="outline" onClick={() => setLocation("/create")} className="text-xs">
                <Clapperboard className="w-3.5 h-3.5 mr-1.5" />Director Suite
              </Button>

              {/* View toggle */}
              <div className="ml-auto flex items-center gap-1 bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />Grid
                </button>
                <button
                  onClick={() => setViewMode("storyboard")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${viewMode === "storyboard" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <Film className="w-3.5 h-3.5" />Storyboard
                </button>
              </div>

              <Button variant="ghost" size="sm" onClick={handlePlan} disabled={planning} className="text-xs text-muted-foreground">
                <RefreshCw className="w-3 h-3 mr-1.5" />Re-plan
              </Button>
            </div>
          </div>

          {/* ── Grid view ── */}
          {viewMode === "grid" && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-3">
                Production Shots — {plan.shots.length} total
                <span className="text-[10px] normal-case font-normal text-muted-foreground/60">
                  <span className="text-amber-400">Magic Script</span> to edit · <span className="text-cyan-400">flux-pro</span> for reference frames
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {plan.shots.map((shot, i) => (
                  <ShotCard
                    key={i} shot={shot} state={shotStates[i] ?? { status: "idle" }}
                    planTitle={plan.title} canFire={canFire}
                    onFire={() => fireSingleShot(i)}
                    onScriptChange={script => updateShot(i, { script_override: script })}
                    onImageGen={() => fireImageForShot(i)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* ── Storyboard view ── */}
          {viewMode === "storyboard" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Film className="w-4 h-4 text-emerald-400" />Storyboard — {plan.shots.length} shots
                </h3>
                <p className="text-[10px] text-muted-foreground/60">
                  Click image placeholders to generate <span className="text-cyan-400">flux-pro</span> reference frames
                </p>
              </div>
              <div className="flex flex-col">
                {plan.shots.map((shot, i) => (
                  <StoryboardRow
                    key={i} shot={shot} state={shotStates[i] ?? { status: "idle" }}
                    planTitle={plan.title} index={i} total={plan.shots.length} canFire={canFire}
                    onFire={() => fireSingleShot(i)}
                    onScriptChange={script => updateShot(i, { script_override: script })}
                    onImageGen={() => fireImageForShot(i)}
                  />
                ))}
              </div>
            </div>
          )}

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
