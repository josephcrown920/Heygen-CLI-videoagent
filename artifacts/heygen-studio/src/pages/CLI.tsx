import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, Zap, Play, Square, ChevronRight } from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL?.replace(/\/$/, "") ?? "";

type Platform = "fal" | "heygen";
type Workload = "text-to-image" | "text-to-video" | "avatar-video";

interface Config {
  platform: Platform;
  workload: Workload;
  model: string;
  prompt: string;
  avatarId: string;
  voiceId: string;
  extra: string;
}

const WORKLOAD_MODELS: Record<string, string[]> = {
  "text-to-image": [
    "fal-ai/flux-pro/v1.1",
    "fal-ai/flux/schnell",
    "fal-ai/seedream-3",
    "fal-ai/recraft-v3",
    "fal-ai/ideogram/v3",
  ],
  "text-to-video": [
    "fal-ai/kling-video/v2.1/master/text-to-video",
    "fal-ai/seedance-1-0/text-to-video",
    "fal-ai/ltx-video",
    "fal-ai/wan/v2.1/1.3b/text-to-video",
    "fal-ai/hunyuan-video",
  ],
  "avatar-video": ["heygen-avatar"],
};

const SYNTAX_COLORS: [RegExp, string][] = [
  [/\b(import|from|def|class|return|if|elif|else|while|for|in|not|and|or|True|False|None|as|with|try|except|print)\b/g, "#a78bfa"],
  [/(["'])((?:\\.|(?!\1)[^\\])*)\1/g, "#fbbf24"],
  [/#.*/g, "#4b5563"],
  [/\b(\d+\.?\d*)\b/g, "#4ade80"],
];

function highlight(code: string): string {
  const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped
    .replace(/#.*/gm, m => `<span style="color:#4b5563">${m}</span>`)
    .replace(/\b(import|from|def|class|return|if|elif|else|while|for|in|not|and|or|True|False|None|as|with|try|except|print)\b/g,
      m => `<span style="color:#a78bfa">${m}</span>`)
    .replace(/(["'])((?:\\.|(?!\1)[^\\])*)\1/g,
      (_, q, s) => `<span style="color:#fbbf24">${q}${s}${q}</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, m => `<span style="color:#4ade80">${m}</span>`);
}

function generateCode(cfg: Config): string {
  const { platform, workload, model, prompt, avatarId, voiceId, extra } = cfg;

  if (platform === "fal") {
    const isVideo = workload === "text-to-video";
    if (isVideo) {
      return `#!/usr/bin/env python3
# fal.ai Video — ${model}
# pip install fal-client

import fal_client, os

def on_update(update):
    if hasattr(update, "logs"):
        for log in update.logs:
            print("[LOG]", log["message"])

result = fal_client.subscribe(
    "${model}",
    arguments={
        "prompt": "${prompt || "A beautiful cinematic scene"}",
        "aspect_ratio": "16:9",
        "duration": "5",${extra ? `\n        ${extra},` : ""}
    },
    with_logs=True,
    on_queue_update=on_update,
)

print("Video URL:", result["video"]["url"])`;
    }
    return `#!/usr/bin/env python3
# fal.ai Image — ${model}
# pip install fal-client

import fal_client, os

result = fal_client.run(
    "${model}",
    arguments={
        "prompt": "${prompt || "A stunning photorealistic image"}",
        "image_size": "landscape_4_3",
        "num_images": 1,${extra ? `\n        ${extra},` : ""}
    },
)

for img in result["images"]:
    print("Image URL:", img["url"])`;
  }

  if (platform === "heygen") {
    return `#!/usr/bin/env python3
# HeyGen Avatar Video
# pip install requests

import requests, os, time

HEYGEN_KEY = os.environ.get("HEYGEN_API_KEY", "YOUR_KEY")
BASE = "https://api.heygen.com"

resp = requests.post(
    f"{BASE}/v2/video/generate",
    headers={"X-Api-Key": HEYGEN_KEY, "Content-Type": "application/json"},
    json={
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": "${avatarId || "YOUR_AVATAR_ID"}",
                "avatar_style": "normal"
            },
            "voice": {
                "type": "text",
                "input_text": "${prompt || "Hello! This is your AI avatar."}",
                "voice_id": "${voiceId || "YOUR_VOICE_ID"}"
            }
        }],
        "dimension": {"width": 1920, "height": 1080}
    }
)
video_id = resp.json()["data"]["video_id"]
print("Queued:", video_id)

while True:
    r = requests.get(
        f"{BASE}/v1/video_status.get?video_id={video_id}",
        headers={"X-Api-Key": HEYGEN_KEY}
    ).json()["data"]
    print("Status:", r["status"])
    if r["status"] == "completed":
        print("URL:", r["video_url"])
        break
    elif r["status"] == "failed":
        print("Error:", r)
        break
    time.sleep(5)`;
  }

  return "# Select a platform above.";
}

type LogLine = { ts: string; text: string; type: "info" | "success" | "error" | "url" | "dim" };

function ts() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export function CLI() {
  const [cfg, setCfg] = useState<Config>({
    platform: "fal",
    workload: "text-to-image",
    model: "fal-ai/flux-pro/v1.1",
    prompt: "",
    avatarId: "",
    voiceId: "",
    extra: "",
  });

  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState<LogLine[]>([]);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const addLog = (text: string, type: LogLine["type"] = "info") => {
    setLogs(prev => [...prev, { ts: ts(), text, type }]);
  };

  const stop = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = null;
    setRunning(false);
    addLog("Job stopped by user.", "dim");
  };

  const update = (k: keyof Config, v: string) => {
    setCfg(prev => {
      const next = { ...prev, [k]: v };
      if (k === "workload") {
        next.model = WORKLOAD_MODELS[v]?.[0] ?? "";
        if (v === "avatar-video") next.platform = "heygen";
        else next.platform = "fal";
      }
      return next;
    });
    setShowCode(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(generateCode(cfg));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const run = async () => {
    if (!cfg.prompt.trim()) { addLog("Error: prompt is required.", "error"); return; }
    setRunning(true);
    setOutputUrl(null);
    setLogs([]);
    addLog(`$ regent run --platform ${cfg.platform} --model ${cfg.model}`, "dim");
    addLog(`Prompt: "${cfg.prompt}"`, "dim");
    addLog("Submitting job…", "info");

    if (cfg.platform === "fal") {
      const inputs: Record<string, unknown> = { prompt: cfg.prompt };
      if (cfg.workload === "text-to-image") {
        inputs.image_size = "landscape_4_3";
        inputs.num_images = 1;
      } else if (cfg.workload === "text-to-video") {
        inputs.aspect_ratio = "16:9";
        inputs.duration = "5";
      }

      let request_id: string;
      try {
        const res = await fetch(`${BASE_URL}/api/fal/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model_id: cfg.model, inputs }),
        });
        const data = await res.json() as { request_id?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        request_id = data.request_id!;
        addLog(`Job queued. request_id=${request_id}`, "info");
      } catch (err) {
        addLog(`Submission failed: ${err instanceof Error ? err.message : String(err)}`, "error");
        setRunning(false);
        return;
      }

      let ticks = 0;
      pollRef.current = setInterval(async () => {
        ticks++;
        try {
          const params = new URLSearchParams({ model_id: cfg.model, request_id });
          const res = await fetch(`${BASE_URL}/api/fal/status?${params}`);
          const data = await res.json() as { status: string; images?: string[]; video_url?: string | null };

          if (data.status === "IN_QUEUE" && ticks % 3 === 1) addLog("IN_QUEUE — waiting for GPU…", "dim");
          else if (data.status === "IN_PROGRESS" && ticks % 3 === 1) addLog("IN_PROGRESS — generating…", "info");

          if (data.status === "COMPLETED") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            const url = data.images?.[0] ?? data.video_url ?? null;
            if (url) {
              addLog(`✓ Completed in ${ticks * 3.5 | 0}s`, "success");
              addLog(`Output: ${url}`, "url");
              setOutputUrl(url);
            } else {
              addLog("Completed but no output URL found.", "error");
            }
            setRunning(false);
          } else if (data.status === "FAILED") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            addLog("Job failed on fal.ai.", "error");
            setRunning(false);
          }
        } catch { /* transient */ }
      }, 3500);
    }

    if (cfg.platform === "heygen") {
      if (!cfg.avatarId.trim() || !cfg.voiceId.trim()) {
        addLog("Error: Avatar ID and Voice ID are required for HeyGen.", "error");
        setRunning(false);
        return;
      }
      let video_id: string;
      try {
        const res = await fetch(`${BASE_URL}/api/heygen/videos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            avatar_id: cfg.avatarId,
            voice_id: cfg.voiceId,
            script: cfg.prompt,
            orientation: "landscape",
          }),
        });
        const data = await res.json() as { video_id?: string; error?: string };
        if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
        video_id = data.video_id!;
        addLog(`HeyGen job queued. video_id=${video_id}`, "info");
      } catch (err) {
        addLog(`Submission failed: ${err instanceof Error ? err.message : String(err)}`, "error");
        setRunning(false);
        return;
      }

      let ticks = 0;
      pollRef.current = setInterval(async () => {
        ticks++;
        try {
          const res = await fetch(`${BASE_URL}/api/heygen/videos/${video_id}`);
          const data = await res.json() as { status: string; video_url?: string | null; error?: string | null };

          if (ticks % 3 === 1) addLog(`Status: ${data.status}`, "dim");

          if (data.status === "completed") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            addLog(`✓ Completed in ~${ticks * 5 | 0}s`, "success");
            if (data.video_url) {
              addLog(`Output: ${data.video_url}`, "url");
              setOutputUrl(data.video_url);
            }
            setRunning(false);
          } else if (data.status === "failed") {
            clearInterval(pollRef.current!);
            pollRef.current = null;
            addLog(`Failed: ${data.error ?? "unknown"}`, "error");
            setRunning(false);
          }
        } catch { /* transient */ }
      }, 5000);
    }
  };

  const code = generateCode(cfg);
  const isHeygen = cfg.platform === "heygen" || cfg.workload === "avatar-video";
  const models = WORKLOAD_MODELS[cfg.workload] ?? [];

  const logColor: Record<LogLine["type"], string> = {
    info: "text-blue-400",
    success: "text-green-400",
    error: "text-red-400",
    url: "text-cyan-300 underline cursor-pointer",
    dim: "text-muted-foreground/60",
  };

  return (
    <div className="max-w-5xl mx-auto p-8 flex flex-col gap-6" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-5">
        <div className="bg-green-500/10 border border-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center">
          <Terminal className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">Regent CLI</h1>
          <p className="text-sm text-muted-foreground font-sans mt-0.5">Configure and fire jobs — runs live through the API, no copy-paste needed</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          LIVE
        </div>
      </div>

      {/* Config */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-3 bg-muted/40 border-b border-border text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          <ChevronRight className="w-3 h-3" />Configure Job
        </div>
        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Workload</Label>
            <Select value={cfg.workload} onValueChange={v => update("workload", v)}>
              <SelectTrigger className="bg-background font-mono text-sm h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-to-image">Text → Image (fal.ai)</SelectItem>
                <SelectItem value="text-to-video">Text → Video (fal.ai)</SelectItem>
                <SelectItem value="avatar-video">Avatar Video (HeyGen)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isHeygen && (
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Model</Label>
              <Select value={cfg.model} onValueChange={v => update("model", v)}>
                <SelectTrigger className="bg-background font-mono text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {models.map(m => (
                    <SelectItem key={m} value={m} className="font-mono text-xs">{m.split("/").slice(-1)[0]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {isHeygen && (
            <>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Avatar ID</Label>
                <Input
                  placeholder="e.g. Monica_in_Black_Circle"
                  value={cfg.avatarId}
                  onChange={e => update("avatarId", e.target.value)}
                  className="bg-background font-mono text-xs h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Voice ID</Label>
                <Input
                  placeholder="e.g. 1bd001e7e50f421d891986aad5158bc8"
                  value={cfg.voiceId}
                  onChange={e => update("voiceId", e.target.value)}
                  className="bg-background font-mono text-xs h-9"
                />
              </div>
            </>
          )}

          {!isHeygen && (
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Extra Params (optional)</Label>
              <Input
                placeholder={`"seed": 42, "num_steps": 30`}
                value={cfg.extra}
                onChange={e => update("extra", e.target.value)}
                className="bg-background font-mono text-xs h-9"
              />
            </div>
          )}

          <div className="space-y-2 col-span-full">
            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">
              {isHeygen ? "Script" : "Prompt"}
            </Label>
            <Textarea
              placeholder={isHeygen
                ? "The script your avatar will deliver…"
                : cfg.workload === "text-to-image"
                  ? "A stunning photorealistic image of…"
                  : "A cinematic scene showing…"}
              value={cfg.prompt}
              onChange={e => update("prompt", e.target.value)}
              className="bg-background font-mono text-sm min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex items-center gap-3">
        <Button
          onClick={run}
          disabled={running || !cfg.prompt.trim()}
          className="h-10 px-6 font-bold bg-green-500 hover:bg-green-400 text-black gap-2"
        >
          {running ? <><span className="w-2 h-2 bg-black rounded-full animate-pulse" />Running…</> : <><Play className="w-4 h-4 fill-black" />Run</>}
        </Button>

        {running && (
          <Button variant="outline" onClick={stop} className="h-10 gap-2 text-red-400 border-red-500/30 hover:border-red-500/60">
            <Square className="w-3.5 h-3.5 fill-current" />Stop
          </Button>
        )}

        <button
          onClick={() => setShowCode(!showCode)}
          className="text-xs text-muted-foreground hover:text-foreground ml-auto"
        >
          {showCode ? "Hide code" : "View generated code"}
        </button>
      </div>

      {/* Terminal output */}
      <div className="bg-[#0a0c10] border border-border rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/50">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
          </div>
          <span className="text-[10px] text-muted-foreground/60 ml-2 font-mono">regent-cli — output</span>
          {running && <span className="ml-auto text-[10px] text-green-400 font-mono animate-pulse">● running</span>}
        </div>

        <div className="p-4 min-h-[180px] max-h-[360px] overflow-y-auto font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-muted-foreground/40">Configure a job above and click Run to execute it live.</p>
          ) : (
            logs.map((line, i) => (
              <div key={i} className="flex gap-3 leading-relaxed">
                <span className="text-muted-foreground/30 flex-shrink-0 select-none">{line.ts}</span>
                {line.type === "url" ? (
                  <a href={line.text} target="_blank" rel="noopener noreferrer" className={logColor[line.type]}>
                    {line.text}
                  </a>
                ) : (
                  <span className={logColor[line.type]}>{line.text}</span>
                )}
              </div>
            ))
          )}
          <div ref={logsEndRef} />
        </div>

        {/* Output preview */}
        {outputUrl && (
          <div className="border-t border-border/50 p-4">
            <p className="text-[10px] uppercase tracking-widest text-green-400 mb-3">Output</p>
            {cfg.workload === "text-to-image" ? (
              <img src={outputUrl} alt="output" className="rounded-lg max-h-64 object-contain" />
            ) : (
              <video src={outputUrl} controls className="rounded-lg max-h-64 w-full" />
            )}
            <a
              href={outputUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs text-cyan-400 hover:underline"
            >
              Open in new tab →
            </a>
          </div>
        )}
      </div>

      {/* Generated code (collapsible) */}
      {showCode && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
            <span className="text-[10px] text-muted-foreground font-mono">
              {cfg.platform}_script.py
            </span>
            <button
              onClick={copy}
              className={`flex items-center gap-1.5 text-xs px-3 py-1 rounded border transition-colors ${copied ? "border-green-500/40 text-green-400" : "border-border text-muted-foreground hover:border-green-500/40 hover:text-green-400"}`}
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <div className="overflow-x-auto bg-[#0a0c10]">
            <pre
              className="p-5 text-xs leading-relaxed text-[#e8ecf4]"
              dangerouslySetInnerHTML={{ __html: highlight(code) }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
