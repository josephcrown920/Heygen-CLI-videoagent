import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Copy, Check, Video, Zap, Wifi, Code2, ArrowRight, ExternalLink,
  ChevronDown, ChevronUp, Radio, Users, Monitor, Mic,
} from "lucide-react";

type CodeLang = "javascript" | "python" | "curl";

function CodeBlock({ code, lang = "javascript" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-[#0a0c10] border border-border rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/20 border-b border-border">
        <span className="text-xs font-mono text-muted-foreground">{lang}</span>
        <button onClick={copy} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors ${copied ? "border-green-500/40 text-green-400" : "border-border text-muted-foreground hover:border-green-500/40 hover:text-green-400"}`}>
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <pre className="p-5 text-xs leading-relaxed overflow-x-auto font-mono text-[#e8ecf4] whitespace-pre">{code}</pre>
    </div>
  );
}

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/30 transition-colors gap-4">
        <span className="font-medium text-sm">{q}</span>
        {open ? <ChevronUp className="w-4 h-4 flex-shrink-0 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
      </button>
      {open && <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">{a}</div>}
    </div>
  );
}

const SESSION_CREATE_JS = `// HeyGen Streaming Avatar — Session Setup
// npm install @heygen/streaming-avatar

import StreamingAvatar, { AvatarQuality, StreamingEvents } from "@heygen/streaming-avatar";

const avatar = new StreamingAvatar({ token: "YOUR_ACCESS_TOKEN" });

// 1. Create session
const sessionData = await avatar.createStartAvatar({
  quality: AvatarQuality.High,
  avatarName: "YOUR_AVATAR_ID",
  voice: {
    voiceId: "YOUR_VOICE_ID",
    rate: 1.0,
    emotion: "Friendly",
  },
  language: "en",
  disableIdleTimeout: false,
});

// 2. Bind to video element
const videoEl = document.getElementById("avatar-video");
avatar.on(StreamingEvents.STREAM_READY, (event) => {
  videoEl.srcObject = event.detail;
  videoEl.play();
});

// 3. Speak text in real-time
await avatar.speak({
  text: "Hello! I am your live streaming avatar.",
  taskType: "talk",
});

// 4. Clean up
await avatar.stopAvatar();`;

const SESSION_CREATE_PY = `# HeyGen Live Avatar — REST API
# pip install requests

import requests, os

KEY = os.environ["HEYGEN_API_KEY"]
BASE = "https://api.heygen.com"

# 1. Get streaming token (valid 1 hour)
token_resp = requests.post(
    f"{BASE}/v1/streaming.create_token",
    headers={"X-Api-Key": KEY},
)
token = token_resp.json()["data"]["token"]
print("Token:", token[:20], "...")

# 2. Create live avatar session
session_resp = requests.post(
    f"{BASE}/v1/streaming.new",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={
        "avatar_id": "YOUR_AVATAR_ID",
        "quality": "high",
        "voice": {"voice_id": "YOUR_VOICE_ID"},
    }
)
session = session_resp.json()["data"]
session_id = session["session_id"]
sdp_offer = session["sdp"]
print("Session ID:", session_id)

# 3. Exchange ICE / SDP using your WebRTC client
# Then send speak commands:
speak_resp = requests.post(
    f"{BASE}/v1/streaming.task",
    headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    json={"session_id": session_id, "text": "Hello from Python!", "task_type": "talk"}
)
print(speak_resp.json())`;

const REACT_COMPONENT = `// React Component for Live Avatar
import { useEffect, useRef, useState } from "react";
import StreamingAvatar, { StreamingEvents, AvatarQuality } from "@heygen/streaming-avatar";

export function LiveAvatarPlayer({ token, avatarId, voiceId }) {
  const videoRef = useRef(null);
  const avatarRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [text, setText] = useState("");

  const connect = async () => {
    const av = new StreamingAvatar({ token });
    avatarRef.current = av;

    await av.createStartAvatar({
      quality: AvatarQuality.High,
      avatarName: avatarId,
      voice: { voiceId },
    });

    av.on(StreamingEvents.STREAM_READY, ({ detail }) => {
      videoRef.current.srcObject = detail;
      videoRef.current.play();
      setConnected(true);
    });

    av.on(StreamingEvents.STREAM_DISCONNECTED, () => setConnected(false));
  };

  const speak = async () => {
    if (!avatarRef.current || !text.trim()) return;
    setSpeaking(true);
    await avatarRef.current.speak({ text, taskType: "talk" });
    setSpeaking(false);
  };

  return (
    <div>
      <video ref={videoRef} autoPlay playsInline muted={false} />
      {!connected
        ? <button onClick={connect}>Connect Avatar</button>
        : <>
            <input value={text} onChange={e => setText(e.target.value)} />
            <button onClick={speak} disabled={speaking}>
              {speaking ? "Speaking…" : "Speak"}
            </button>
          </>
      }
    </div>
  );
}`;

const MIGRATION_CHECKLIST = [
  { id: "1", label: "Get Regent API key from dashboard", done: false },
  { id: "2", label: "Choose a compatible avatar from Regent library", done: false },
  { id: "3", label: "Generate access token (POST /v1/streaming.create_token)", done: false },
  { id: "4", label: "Set up WebRTC signaling with Regent SDP offer", done: false },
  { id: "5", label: "Bind avatar stream to <video> element", done: false },
  { id: "6", label: "Implement speak() for real-time TTS", done: false },
  { id: "7", label: "Add interrupt support (avatar.interrupt())", done: false },
  { id: "8", label: "Handle stream disconnect + reconnect", done: false },
  { id: "9", label: "Test with different voices and languages", done: false },
  { id: "10", label: "Deploy and monitor via Regent usage dashboard", done: false },
];

export function LiveAvatar() {
  const { toast } = useToast();
  const [lang, setLang] = useState<CodeLang>("javascript");
  const [checklist, setChecklist] = useState(
    MIGRATION_CHECKLIST.map(i => ({ ...i }))
  );

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(i => i.id === id ? { ...i, done: !i.done } : i));
  };

  const done = checklist.filter(i => i.done).length;

  return (
    <div className="max-w-4xl mx-auto p-8 flex flex-col gap-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 w-12 h-12 rounded-xl flex items-center justify-center">
            <Radio className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LiveAvatar</h1>
            <p className="text-muted-foreground text-sm">Real-time streaming avatars powered by Regent WebRTC</p>
          </div>
          <Badge variant="outline" className="ml-auto border-green-500/30 text-green-400 text-xs">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5 animate-pulse" />
            LIVE
          </Badge>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Zap, label: "Latency", value: "<300ms", color: "text-yellow-400" },
          { icon: Wifi, label: "Protocol", value: "WebRTC", color: "text-blue-400" },
          { icon: Users, label: "Concurrent", value: "Unlimited*", color: "text-green-400" },
          { icon: Monitor, label: "Quality", value: "Up to 4K", color: "text-purple-400" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-card border border-card-border rounded-xl p-4 text-center">
            <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
            <p className="text-lg font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </div>
        ))}
      </div>

      {/* Migration Checklist */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Migration Checklist</h2>
          <span className="text-sm text-muted-foreground">{done}/{checklist.length} complete</span>
        </div>
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="h-1 bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${(done / checklist.length) * 100}%` }}
            />
          </div>
          <div className="divide-y divide-border">
            {checklist.map((item) => (
              <button
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="w-full flex items-center gap-4 px-5 py-3.5 text-left hover:bg-muted/30 transition-colors"
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.done ? "border-green-500 bg-green-500" : "border-border"
                }`}>
                  {item.done && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm transition-colors ${item.done ? "line-through text-muted-foreground" : ""}`}>
                  {item.label}
                </span>
                <span className="ml-auto text-xs text-muted-foreground/50 font-mono">{item.id.padStart(2, "0")}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div>
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <h2 className="text-xl font-bold">Code Examples</h2>
          <div className="flex gap-2">
            {(["javascript", "python"] as CodeLang[]).map(l => (
              <Button
                key={l}
                size="sm"
                variant={lang === l ? "default" : "outline"}
                onClick={() => setLang(l)}
                className="text-xs capitalize"
              >
                {l}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-5">
          {lang === "javascript" ? (
            <>
              <div>
                <p className="text-sm font-semibold mb-2">1. Session Setup</p>
                <CodeBlock code={SESSION_CREATE_JS} lang="javascript" />
              </div>
              <div>
                <p className="text-sm font-semibold mb-2">2. React Component</p>
                <CodeBlock code={REACT_COMPONENT} lang="jsx" />
              </div>
            </>
          ) : (
            <CodeBlock code={SESSION_CREATE_PY} lang="python" />
          )}
        </div>
      </div>

      {/* Architecture */}
      <div>
        <h2 className="text-xl font-bold mb-4">Architecture Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: "Auth Token", desc: "Exchange your API key for a short-lived streaming token (1 hour TTL) from HeyGen's token endpoint.", icon: "🔑" },
            { step: "2", title: "WebRTC Session", desc: "Create an avatar session. HeyGen returns an SDP offer — your browser exchanges ICE candidates to establish P2P media.", icon: "📡" },
            { step: "3", title: "Real-Time Interaction", desc: "Send speak(), interrupt(), and stop() commands. The avatar responds in <300ms with lip-synced, expressive motion.", icon: "⚡" },
          ].map(c => (
            <div key={c.step} className="bg-card border border-card-border rounded-xl p-5">
              <div className="text-2xl mb-3">{c.icon}</div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-[10px] h-5">{c.step}</Badge>
                <h3 className="font-semibold text-sm">{c.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
        <div className="flex flex-col gap-2">
          {[
            {
              q: "What is the minimum latency I can expect?",
              a: "HeyGen LiveAvatar typically delivers first-frame latency under 300ms on a stable connection. End-to-end (speak to lip-sync) is 150–300ms depending on TTS model and network conditions.",
            },
            {
              q: "Can I use my own custom avatar?",
              a: "Yes. You can train a custom Instant Avatar from as little as 2 minutes of video footage, or use Photorealistic Avatar for higher fidelity. Both work with the streaming API.",
            },
            {
              q: "What languages are supported?",
              a: "HeyGen supports 40+ languages for live streaming avatars, including English, Spanish, French, German, Chinese, Japanese, Korean, Arabic, and more — all with natural lip-sync.",
            },
            {
              q: "How do I migrate from a competitor's live avatar platform?",
              a: "The main changes are: (1) swap their SDK for @heygen/streaming-avatar, (2) replace their auth flow with HeyGen's token endpoint, (3) update the SDP/ICE exchange to use HeyGen's session API. The WebRTC media binding (\`srcObject\`) is identical.",
            },
            {
              q: "Does it work on mobile browsers?",
              a: "Yes. HeyGen uses standard WebRTC which is supported on iOS Safari 11+ and Android Chrome. Some older mobile browsers may require a STUN/TURN relay for NAT traversal.",
            },
          ].map(faq => (
            <FAQ key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Ready to integrate LiveAvatar?</h3>
          <p className="text-sm text-muted-foreground">Install the SDK and start streaming in minutes.</p>
          <code className="text-xs bg-muted px-3 py-1.5 rounded-md font-mono mt-2 inline-block">
            npm install @heygen/streaming-avatar
          </code>
        </div>
        <Button asChild>
          <a href="https://docs.heygen.com/docs/streaming-avatar-sdk-reference" target="_blank" rel="noopener noreferrer">
            Full SDK Docs <ExternalLink className="w-4 h-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
}
