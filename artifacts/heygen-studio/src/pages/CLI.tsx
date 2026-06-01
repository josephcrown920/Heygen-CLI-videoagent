import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Terminal, Cpu, Code2, Zap } from "lucide-react";

type Platform = "fal" | "heygen" | "modal" | "runpod";
type Workload = "text-to-image" | "text-to-video" | "avatar-video" | "magic-prompt" | "custom";

interface Config {
  platform: Platform;
  workload: Workload;
  model: string;
  apiKey: string;
  prompt: string;
  extra: string;
}

const PLATFORM_META: Record<Platform, { label: string; color: string; tag: string; desc: string }> = {
  fal: { label: "fal.ai", color: "#a855f7", tag: "SERVERLESS", desc: "Fastest GPU inference. Pay per request, no idle cost." },
  heygen: { label: "HeyGen API", color: "#3b82f6", tag: "MANAGED", desc: "Managed avatar video API with credits-based billing." },
  modal: { label: "Modal.com", color: "#4ade80", tag: "A100/H100", desc: "Serverless GPU functions. Pythonic deploy in seconds." },
  runpod: { label: "RunPod", color: "#f59e0b", tag: "PODS", desc: "Custom GPU pods via REST. Any container, any model." },
};

const WORKLOAD_MODELS: Record<Workload, string[]> = {
  "text-to-image": ["fal-ai/flux-pro/v1.1", "fal-ai/flux/schnell", "fal-ai/seedream-3", "fal-ai/recraft-v3", "fal-ai/ideogram/v3"],
  "text-to-video": ["fal-ai/kling-video/v2.1/master/text-to-video", "fal-ai/ltx-video", "fal-ai/seedance-1-0/text-to-video", "fal-ai/hunyuan-video", "fal-ai/wan/v2.1/1.3b/text-to-video"],
  "avatar-video": ["HeyGen Director Suite", "HeyGen Magic Prompt"],
  "magic-prompt": ["HeyGen Magic Prompt"],
  custom: ["custom/model-id"],
};

function generateCode(cfg: Config): string {
  const { platform, workload, model, apiKey, prompt, extra } = cfg;

  if (platform === "fal") {
    const isAsync = workload === "text-to-video";
    if (isAsync) {
      return `#!/usr/bin/env python3
# fal.ai Async Video Generation — ${model}
# pip install fal-client

import fal_client, os, time

FAL_KEY = os.environ.get("FAL_API_KEY", "${apiKey || "YOUR_FAL_KEY"}")

def on_queue_update(update):
    if isinstance(update, fal_client.InProgress):
        for log in update.logs:
            print("[LOG]", log["message"])

result = fal_client.subscribe(
    "${model}",
    arguments={
        "prompt": "${prompt || "A beautiful cinematic scene"}",
        "aspect_ratio": "16:9",
        "duration": "5",
        ${extra ? `# Extra params:\n        ${extra}` : ""}
    },
    with_logs=True,
    on_queue_update=on_queue_update,
)

video_url = result["video"]["url"]
print("Video URL:", video_url)
`;
    }
    return `#!/usr/bin/env python3
# fal.ai Image Generation — ${model}
# pip install fal-client

import fal_client, os

FAL_KEY = os.environ.get("FAL_API_KEY", "${apiKey || "YOUR_FAL_KEY"}")

result = fal_client.run(
    "${model}",
    arguments={
        "prompt": "${prompt || "A stunning photorealistic image"}",
        "image_size": "landscape_4_3",
        "num_images": 1,
        ${extra ? `# Extra params:\n        ${extra}` : ""}
    },
)

for img in result["images"]:
    print("Image URL:", img["url"])
`;
  }

  if (platform === "heygen") {
    if (workload === "avatar-video") {
      return `#!/usr/bin/env python3
# HeyGen Avatar Video Generation
# pip install requests

import requests, os, time

HEYGEN_KEY = os.environ.get("HEYGEN_API_KEY", "${apiKey || "YOUR_HEYGEN_KEY"}")
BASE = "https://api.heygen.com"

# 1. Create video
resp = requests.post(
    f"{BASE}/v2/video/generate",
    headers={"X-Api-Key": HEYGEN_KEY, "Content-Type": "application/json"},
    json={
        "video_inputs": [{
            "character": {
                "type": "avatar",
                "avatar_id": "YOUR_AVATAR_ID",
                "avatar_style": "normal"
            },
            "voice": {
                "type": "text",
                "input_text": "${prompt || "Welcome to my video! This is generated with HeyGen."}",
                "voice_id": "YOUR_VOICE_ID"
            }
        }],
        "dimension": {"width": 1920, "height": 1080}
    }
)
video_id = resp.json()["data"]["video_id"]
print("Video ID:", video_id)

# 2. Poll status
while True:
    status_resp = requests.get(
        f"{BASE}/v1/video_status.get?video_id={video_id}",
        headers={"X-Api-Key": HEYGEN_KEY}
    )
    status = status_resp.json()["data"]["status"]
    print("Status:", status)
    if status == "completed":
        print("Video URL:", status_resp.json()["data"]["video_url"])
        break
    elif status == "failed":
        print("Failed:", status_resp.json())
        break
    time.sleep(5)
`;
    }
    if (workload === "magic-prompt") {
      return `#!/usr/bin/env python3
# HeyGen AI Studio — Text-to-Video (Magic Prompt)
# pip install requests

import requests, os, time

HEYGEN_KEY = os.environ.get("HEYGEN_API_KEY", "${apiKey || "YOUR_HEYGEN_KEY"}")

resp = requests.post(
    "https://api.heygen.com/v2/video/generate",
    headers={"X-Api-Key": HEYGEN_KEY, "Content-Type": "application/json"},
    json={
        "video_inputs": [{
            "character": {"type": "avatar", "avatar_id": "YOUR_AVATAR_ID", "avatar_style": "normal"},
            "voice": {
                "type": "text",
                "input_text": "${prompt || "Hello! I am your AI avatar, powered by HeyGen."}",
                "voice_id": "YOUR_VOICE_ID",
                "speed": 1.0
            },
            "background": {"type": "color", "value": "#FFFFFF"}
        }],
        "dimension": {"width": 1280, "height": 720},
        "aspect_ratio": "16:9"
    }
)
print(resp.json())
`;
    }
  }

  if (platform === "modal") {
    return `# Modal.com GPU Deployment — ${model}
# pip install modal && modal setup

import modal

app = modal.App("heygen-studio-inference")

image = (
    modal.Image.debian_slim()
    .pip_install("fal-client", "torch", "transformers", "accelerate")
)

@app.function(
    image=image,
    gpu="A100",
    secrets=[modal.Secret.from_name("fal-api-key")],
    timeout=600,
)
def run_inference(prompt: str):
    import fal_client
    result = fal_client.run(
        "${model}",
        arguments={"prompt": prompt, "image_size": "landscape_4_3"},
    )
    return result

@app.local_entrypoint()
def main():
    result = run_inference.remote("${prompt || "A beautiful AI-generated image"}")
    print(result)
`;
  }

  if (platform === "runpod") {
    return `#!/usr/bin/env python3
# RunPod Serverless — ${model}
# pip install runpod requests

import requests, os

RUNPOD_KEY = os.environ.get("RUNPOD_API_KEY", "${apiKey || "YOUR_RUNPOD_KEY"}")
ENDPOINT_ID = "YOUR_ENDPOINT_ID"

resp = requests.post(
    f"https://api.runpod.io/v2/{ENDPOINT_ID}/run",
    headers={"Authorization": f"Bearer {RUNPOD_KEY}"},
    json={
        "input": {
            "model": "${model}",
            "prompt": "${prompt || "A stunning AI-generated scene"}",
            ${extra ? `# Extra: ${extra}` : ""}
        }
    }
)
job = resp.json()
print("Job ID:", job["id"])

# Poll result
import time
while True:
    status = requests.get(
        f"https://api.runpod.io/v2/{ENDPOINT_ID}/status/{job['id']}",
        headers={"Authorization": f"Bearer {RUNPOD_KEY}"},
    ).json()
    print("Status:", status["status"])
    if status["status"] == "COMPLETED":
        print("Output:", status["output"])
        break
    elif status["status"] == "FAILED":
        print("Error:", status.get("error"))
        break
    time.sleep(3)
`;
  }

  return "# Select a platform and workload above to generate code.";
}

const SYNTAX_COLORS: [RegExp, string][] = [
  [/^(import|from|def|class|return|if|elif|else|while|for|in|not|and|or|True|False|None|as|with|try|except|print)\b/gm, "#a78bfa"],
  [/(["'`])((?:\\.|(?!\1)[^\\])*)\1/g, "#fbbf24"],
  [/#.*/g, "#4b5563"],
  [/\b(\d+\.?\d*)\b/g, "#4ade80"],
];

function highlight(code: string): string {
  // Very basic syntax highlighting via dangerouslySetInnerHTML
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .replace(/#.*/gm, m => `<span style="color:#4b5563">${m}</span>`)
    .replace(/\b(import|from|def|class|return|if|elif|else|while|for|in|not|and|or|True|False|None|as|with|try|except|print)\b/g,
      m => `<span style="color:#a78bfa">${m}</span>`)
    .replace(/(["'])((?:\\.|(?!\1)[^\\])*)\1/g,
      (_, q, s) => `<span style="color:#fbbf24">${q}${s}${q}</span>`)
    .replace(/\b(\d+\.?\d*)\b/g, m => `<span style="color:#4ade80">${m}</span>`);
}

export function CLI() {
  const [cfg, setCfg] = useState<Config>({
    platform: "fal",
    workload: "text-to-image",
    model: "fal-ai/flux-pro/v1.1",
    apiKey: "",
    prompt: "",
    extra: "",
  });
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const code = generated ? generateCode(cfg) : "";

  const copy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const update = (k: keyof Config, v: string) => {
    setCfg(prev => {
      const next = { ...prev, [k]: v };
      if (k === "workload") {
        next.model = WORKLOAD_MODELS[v as Workload]?.[0] ?? "";
      }
      return next;
    });
    setGenerated(false);
  };

  const meta = PLATFORM_META[cfg.platform];

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col gap-8" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="bg-green-500/10 border border-green-500/20 w-12 h-12 rounded-xl flex items-center justify-center">
          <Terminal className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">CLI Code Generator</h1>
          <p className="text-sm text-muted-foreground font-sans mt-0.5">Generate ready-to-run Python scripts for any platform</p>
        </div>
        <div className="ml-auto flex items-center gap-2 text-xs text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          READY
        </div>
      </div>

      {/* Platform Selection */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">01 — Select Platform</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.keys(PLATFORM_META) as Platform[]).map(p => {
            const m = PLATFORM_META[p];
            const active = cfg.platform === p;
            return (
              <button
                key={p}
                onClick={() => update("platform", p)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  active
                    ? "border-border bg-card/80"
                    : "border-border/50 bg-card/20 hover:border-border hover:bg-card/40"
                }`}
                style={active ? { borderTopColor: m.color, borderTopWidth: 2 } : {}}
              >
                <div className="font-bold text-sm mb-1" style={{ color: active ? m.color : undefined, fontFamily: "Syne, sans-serif" }}>{m.label}</div>
                <div className="text-xs text-muted-foreground leading-relaxed mb-2">{m.desc}</div>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5" style={active ? { color: m.color, borderColor: m.color + "40" } : {}}>
                  {m.tag}
                </Badge>
              </button>
            );
          })}
        </div>
      </div>

      {/* Config */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">02 — Configure Job</p>
        <div className="bg-card border border-border rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Workload Type</Label>
            <Select value={cfg.workload} onValueChange={v => update("workload", v)}>
              <SelectTrigger className="bg-background font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text-to-image">Text-to-Image</SelectItem>
                <SelectItem value="text-to-video">Text-to-Video</SelectItem>
                <SelectItem value="avatar-video">Avatar Video (HeyGen)</SelectItem>
                <SelectItem value="magic-prompt">Magic Prompt (HeyGen)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Model / Endpoint</Label>
            <Select value={cfg.model} onValueChange={v => update("model", v)}>
              <SelectTrigger className="bg-background font-mono text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKLOAD_MODELS[cfg.workload].map(m => (
                  <SelectItem key={m} value={m} className="font-mono text-xs">{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">API Key (optional)</Label>
            <Input
              type="password"
              placeholder="Leave blank to use env var"
              value={cfg.apiKey}
              onChange={e => update("apiKey", e.target.value)}
              className="bg-background font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Extra Params (key=value)</Label>
            <Input
              placeholder='e.g. "duration": "10", "seed": 42'
              value={cfg.extra}
              onChange={e => update("extra", e.target.value)}
              className="bg-background font-mono text-sm"
            />
          </div>

          <div className="space-y-2 col-span-full">
            <Label className="text-xs uppercase tracking-wider text-muted-foreground">Prompt / Payload</Label>
            <Textarea
              placeholder="Enter your prompt or payload..."
              value={cfg.prompt}
              onChange={e => update("prompt", e.target.value)}
              className="bg-background font-mono text-sm min-h-[80px] resize-none"
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        className="h-12 text-sm font-bold bg-green-500 hover:bg-green-400 text-black"
        onClick={() => setGenerated(true)}
      >
        <Zap className="w-4 h-4 mr-2" />
        Generate Launch Code
      </Button>

      {/* Output */}
      {generated && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-3">
              <Code2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {cfg.platform === "fal" || cfg.platform === "heygen" ? "generated_script.py" :
                  cfg.platform === "modal" ? "modal_deploy.py" : "runpod_job.py"}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {cfg.platform.toUpperCase()} · {cfg.workload.replace(/-/g, " ")}
              </span>
              <button
                onClick={copy}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${
                  copied
                    ? "border-green-500/40 text-green-400"
                    : "border-border text-muted-foreground hover:border-green-500/40 hover:text-green-400"
                }`}
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-[#0a0c10]">
            <pre
              className="p-5 text-xs leading-relaxed text-[#e8ecf4]"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
              dangerouslySetInnerHTML={{ __html: highlight(code) }}
            />
          </div>

          <div className="flex flex-wrap gap-4 px-4 py-2.5 bg-muted/30 border-t border-border">
            {[
              ["Platform", meta.label],
              ["Workload", cfg.workload.replace(/-/g, " ")],
              ["Model", cfg.model.split("/").pop() ?? cfg.model],
            ].map(([k, v]) => (
              <span key={k} className="text-[10px] text-muted-foreground">
                {k}: <span className="text-green-400">{v}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      {generated && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-2.5 bg-muted/50 border-b border-border text-xs text-muted-foreground uppercase tracking-widest">
            Next Steps
          </div>
          <ol className="p-5 space-y-3 list-none">
            {[
              ["Install dependencies", `pip install ${cfg.platform === "fal" ? "fal-client" : cfg.platform === "modal" ? "modal" : cfg.platform === "runpod" ? "runpod requests" : "requests"}`],
              ["Set your API key", `export ${cfg.platform === "fal" ? "FAL_API_KEY" : cfg.platform === "heygen" ? "HEYGEN_API_KEY" : cfg.platform === "runpod" ? "RUNPOD_API_KEY" : "MODAL_TOKEN_ID"}=your_key_here`],
              ["Run the script", "python generated_script.py"],
            ].map(([step, cmd], i) => (
              <li key={i} className="flex gap-4 text-sm text-muted-foreground">
                <span className="text-green-400 text-xs mt-0.5 font-mono">0{i + 1}</span>
                <span>
                  {step}: <code className="bg-muted px-1.5 py-0.5 rounded text-xs text-foreground">{cmd}</code>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
