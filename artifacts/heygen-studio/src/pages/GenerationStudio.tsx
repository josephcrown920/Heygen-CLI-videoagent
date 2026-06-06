import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "wouter";
import { getModel, type Model, type ModelParam } from "@/lib/models";
import { useCreations, type Creation } from "@/hooks/useCreations";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, ImageIcon, Video, ArrowLeft, Sparkles, 
  CheckCircle2, AlertCircle, ExternalLink, Download, Clock
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

const IS_KLING_DIRECT = (id: string) => id.startsWith("kling-direct/");

async function submitGeneration(model_id: string, inputs: Record<string, unknown>): Promise<{ request_id: string }> {
  if (IS_KLING_DIRECT(model_id)) {
    const res = await fetch(`${BASE_URL}/api/kling/text-to-video`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: inputs.prompt,
        negative_prompt: inputs.negative_prompt,
        model_name: "kling-v2-master",
        aspect_ratio: inputs.aspect_ratio ?? "16:9",
        duration: String(inputs.duration ?? "5"),
        mode: inputs.mode ?? "pro",
        cfg_scale: 0.5,
      }),
    });
    if (!res.ok) {
      const err = await res.json() as { error?: string; message?: string };
      throw new Error(err.error ?? err.message ?? "Kling Omni submission failed");
    }
    const data = await res.json() as { data?: { task_id?: string }; task_id?: string };
    const task_id = data?.data?.task_id ?? data?.task_id ?? "";
    if (!task_id) throw new Error("No task ID returned from Kling");
    return { request_id: task_id };
  }

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

async function pollStatus(model_id: string, request_id: string): Promise<{
  status: string;
  images?: string[];
  video_url?: string | null;
  logs?: { message: string }[];
}> {
  if (IS_KLING_DIRECT(model_id)) {
    const res = await fetch(`${BASE_URL}/api/kling/task/${request_id}`);
    if (!res.ok) {
      const err = await res.json() as { error?: string };
      throw new Error(err.error ?? "Kling status check failed");
    }
    const data = await res.json() as {
      data?: {
        task_status?: string;
        task_result?: { videos?: { url: string }[] };
      };
    };
    const taskData = data?.data;
    const status = taskData?.task_status;
    if (status === "succeed") {
      const videoUrl = taskData?.task_result?.videos?.[0]?.url ?? null;
      return { status: "COMPLETED", video_url: videoUrl };
    }
    if (status === "failed") return { status: "FAILED" };
    return { status: "IN_QUEUE" };
  }

  const params = new URLSearchParams({ model_id, request_id });
  const res = await fetch(`${BASE_URL}/api/fal/status?${params}`);
  if (!res.ok) {
    const err = await res.json() as { error?: string };
    throw new Error(err.error ?? "Status check failed");
  }
  return res.json();
}

function ParamField({
  param,
  value,
  onChange,
}: {
  param: ModelParam;
  value: string | number | boolean;
  onChange: (v: string | number | boolean) => void;
}) {
  if (param.key === "prompt") {
    return (
      <div className="space-y-2">
        <Label>{param.label}</Label>
        <Textarea
          placeholder={param.placeholder}
          className="min-h-[120px] resize-y bg-background font-mono text-sm"
          value={value as string}
          onChange={e => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (param.type === "text") {
    return (
      <div className="space-y-2">
        <Label>{param.label}</Label>
        <Input
          placeholder={param.placeholder}
          value={value as string}
          onChange={e => onChange(e.target.value)}
          className="bg-background"
        />
      </div>
    );
  }

  if (param.type === "select") {
    return (
      <div className="space-y-2">
        <Label>{param.label}</Label>
        <Select value={String(value)} onValueChange={v => onChange(v)}>
          <SelectTrigger className="bg-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {param.options?.map(o => (
              <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (param.type === "number") {
    return (
      <div className="space-y-2">
        <Label>{param.label}</Label>
        <Input
          type="number"
          value={value as number}
          min={param.min}
          max={param.max}
          step={param.key === "guidance_scale" ? 0.5 : 1}
          onChange={e => onChange(Number(e.target.value))}
          className="bg-background"
        />
      </div>
    );
  }

  if (param.type === "boolean") {
    return (
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id={param.key}
          checked={value as boolean}
          onChange={e => onChange(e.target.checked)}
          className="w-4 h-4 accent-primary"
        />
        <Label htmlFor={param.key}>{param.label}</Label>
      </div>
    );
  }

  return null;
}

function buildInputs(model: Model, values: Record<string, string | number | boolean>): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  for (const param of model.params) {
    const v = values[param.key];
    if (v === "" || v === undefined) continue;
    // Convert numeric strings back to numbers for numeric params
    if (param.type === "number") {
      inputs[param.key] = Number(v);
    } else {
      inputs[param.key] = v;
    }
  }
  return inputs;
}

function defaultValues(model: Model): Record<string, string | number | boolean> {
  const vals: Record<string, string | number | boolean> = {};
  for (const p of model.params) {
    vals[p.key] = p.default ?? (p.type === "boolean" ? false : p.type === "number" ? 1 : "");
  }
  return vals;
}

export function GenerationStudio() {
  const params = useParams<{ modelId: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { add, update } = useCreations();

  const modelId = decodeURIComponent(params.modelId ?? "");
  const model = getModel(modelId);

  const [values, setValues] = useState<Record<string, string | number | boolean>>(() =>
    model ? defaultValues(model) : {}
  );

  // Active generation tracking
  const [activeCreation, setActiveCreation] = useState<Creation | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset values when model changes
  useEffect(() => {
    if (model) setValues(defaultValues(model));
  }, [modelId]);

  // Polling loop
  useEffect(() => {
    if (!activeCreation || !activeCreation.request_id) return;
    if (activeCreation.status === "completed" || activeCreation.status === "failed") {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const result = await pollStatus(activeCreation.model_id, activeCreation.request_id!);
        if (result.status === "COMPLETED") {
          const urls: string[] = result.images?.length
            ? result.images
            : result.video_url
            ? [result.video_url]
            : [];
          const patch: Partial<Creation> = { status: "completed", output_urls: urls };
          update(activeCreation.id, patch);
          setActiveCreation(prev => prev ? { ...prev, ...patch } : null);
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (result.status === "FAILED") {
          const patch: Partial<Creation> = { status: "failed", error: "Generation failed on fal.ai" };
          update(activeCreation.id, patch);
          setActiveCreation(prev => prev ? { ...prev, ...patch } : null);
          if (pollRef.current) clearInterval(pollRef.current);
        } else if (result.status === "IN_PROGRESS" && activeCreation.status === "pending") {
          const patch: Partial<Creation> = { status: "in_progress" };
          update(activeCreation.id, patch);
          setActiveCreation(prev => prev ? { ...prev, ...patch } : null);
        }
      } catch (err) {
        // transient error — keep polling
        console.error("poll error", err);
      }
    }, 3000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [activeCreation?.id, activeCreation?.request_id, activeCreation?.status]);

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <AlertCircle className="w-12 h-12 text-muted-foreground/40" />
        <p className="text-lg font-medium">Model not found</p>
        <Button variant="outline" onClick={() => setLocation("/models")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Model Hub
        </Button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = values["prompt"] as string | undefined;
    if (!prompt?.trim()) {
      toast({ title: "Enter a prompt", variant: "destructive" });
      return;
    }

    const id = crypto.randomUUID();
    const creation: Creation = {
      id,
      type: model.category,
      model_id: model.id,
      model_name: model.name,
      prompt: String(prompt),
      status: "pending",
      output_urls: [],
      created_at: Date.now(),
    };

    try {
      const inputs = buildInputs(model, values);
      const { request_id } = await submitGeneration(model.id, inputs);
      creation.request_id = request_id;
      add(creation);
      setActiveCreation(creation);
    } catch (err) {
      toast({
        title: "Failed to start generation",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const isRunning = activeCreation && (activeCreation.status === "pending" || activeCreation.status === "in_progress");

  return (
    <div className="max-w-6xl mx-auto p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/models")} className="text-muted-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: model.providerColor + "20" }}
        >
          {model.category === "image"
            ? <ImageIcon className="w-6 h-6" style={{ color: model.providerColor }} />
            : <Video className="w-6 h-6" style={{ color: model.providerColor }} />}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{model.name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full border text-muted-foreground border-border">
              {model.category === "image" ? "Image" : "Video"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground" style={{ color: model.providerColor }}>
            {model.provider}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setLocation("/creations")}>
          My Creations
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Form */}
        <div className="w-full lg:w-1/2">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="bg-card border border-card-border rounded-xl p-6 flex flex-col gap-5">
              <h3 className="font-semibold border-b border-border pb-2">Generation Settings</h3>
              {model.params.map(param => (
                <ParamField
                  key={param.key}
                  param={param}
                  value={values[param.key] ?? (param.default ?? "")}
                  onChange={v => setValues(prev => ({ ...prev, [param.key]: v }))}
                />
              ))}
            </div>

            <Button
              type="submit"
              className="h-14 text-base font-bold shadow-lg shadow-primary/20"
              disabled={!!isRunning}
            >
              {isRunning ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Generate
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Right: Result */}
        <div className="w-full lg:w-1/2">
          <div className="bg-card border border-card-border rounded-xl overflow-hidden h-full min-h-[400px] flex flex-col">
            {!activeCreation ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 p-8 text-muted-foreground">
                {model.category === "image"
                  ? <ImageIcon className="w-16 h-16 opacity-20" />
                  : <Video className="w-16 h-16 opacity-20" />}
                <div>
                  <p className="font-medium">Your generation will appear here</p>
                  <p className="text-sm mt-1">Fill in the settings and hit Generate to start.</p>
                </div>
              </div>
            ) : activeCreation.status === "pending" || activeCreation.status === "in_progress" ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-5 p-8">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-20" />
                </div>
                <div className="text-center">
                  <p className="font-semibold capitalize">
                    {activeCreation.status === "pending" ? "Queued…" : "Generating…"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {model.category === "video" ? "Video generation takes 1–3 minutes." : "Image generation takes a few seconds."}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
                  <Clock className="w-3 h-3" />
                  Request ID: {activeCreation.request_id?.slice(0, 12)}…
                </div>
              </div>
            ) : activeCreation.status === "failed" ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                <AlertCircle className="w-12 h-12 text-destructive/60" />
                <div>
                  <p className="font-semibold text-destructive">Generation Failed</p>
                  <p className="text-sm text-muted-foreground mt-1">{activeCreation.error ?? "Something went wrong."}</p>
                </div>
                <Button variant="outline" onClick={() => setActiveCreation(null)}>Try Again</Button>
              </div>
            ) : activeCreation.output_urls.length > 0 ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Generation Complete</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto text-xs"
                    onClick={() => setActiveCreation(null)}
                  >
                    New Generation
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                  {model.category === "image" ? (
                    <div className={`grid gap-3 ${activeCreation.output_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                      {activeCreation.output_urls.map((url, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden bg-muted aspect-video">
                          <img src={url} alt={`Generation ${i + 1}`} className="w-full h-full object-contain" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" asChild>
                              <a href={url} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
                            </Button>
                            <Button size="icon" variant="secondary" className="rounded-full h-9 w-9" asChild>
                              <a href={url} download><Download className="w-4 h-4" /></a>
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-lg overflow-hidden bg-black">
                      <video
                        src={activeCreation.output_urls[0]}
                        controls
                        autoPlay
                        className="w-full"
                        style={{ maxHeight: "480px" }}
                      />
                    </div>
                  )}

                  <div className="flex gap-2 flex-wrap mt-2">
                    {activeCreation.output_urls.map((url, i) => (
                      <Button key={i} size="sm" variant="outline" className="text-xs" asChild>
                        <a href={url} download>
                          <Download className="w-3 h-3 mr-1.5" />
                          Download {activeCreation.output_urls.length > 1 ? `#${i + 1}` : ""}
                        </a>
                      </Button>
                    ))}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs ml-auto"
                      onClick={() => setLocation("/creations")}
                    >
                      View All Creations
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Model description */}
      <div className="bg-muted/40 border border-border rounded-xl p-5 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground mr-2">About {model.name}:</span>
        {model.description}
      </div>
    </div>
  );
}
