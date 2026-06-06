import { useState, useRef, type ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiPath } from "@/lib/api";
import {
  Mic, Upload, Loader2, Video, Check,
  Music, X, FileAudio,
  Sparkles, AlertCircle,
} from "lucide-react";

const AVATARS = [
  { id: "avatar-iv", name: "Avatar IV", initials: "IV", color: "bg-orange-500" },
  { id: "avatar-v", name: "Avatar V", initials: "V", color: "bg-blue-500" },
  { id: "mark", name: "Mark", initials: "M", color: "bg-green-500" },
  { id: "jay", name: "Jay", initials: "J", color: "bg-purple-500" },
  { id: "custom", name: "+ Add Avatar", initials: "+", color: "bg-muted" },
];

const SYNC_MODES = [
  { id: "auto", label: "Auto", desc: "AI picks best matching voice" },
  { id: "mirror", label: "Voice Mirror", desc: "Clone the uploaded audio voice" },
  { id: "custom", label: "Custom Voice", desc: "Select from voice library" },
];

export function LipSync() {
  const { toast } = useToast();
  const audioRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLInputElement>(null);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [syncMode, setSyncMode] = useState(SYNC_MODES[0]);
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleAudio = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setAudioFile(f);
      setDone(false);
      setResultUrl(null);
    }
  };

  const handleVideo = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setVideoFile(f);
      setDone(false);
      setResultUrl(null);
    }
  };

  const fileToDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });

  const pollResult = async (id: string) => {
    const params = new URLSearchParams({
      model_id: "fal-ai/sync-lipsync/v2",
      request_id: id,
    });

    for (let attempt = 0; attempt < 80; attempt += 1) {
      const res = await fetch(apiPath(`/api/fal/status?${params}`), { credentials: "include" });
      const data = await res.json() as { status?: string; video_url?: string | null; error?: string; logs?: { message: string }[] };
      if (!res.ok || data.error) throw new Error(data.error ?? "Lip sync status check failed");

      if (data.status === "COMPLETED") {
        if (!data.video_url) throw new Error("fal.ai completed the job but did not return a video URL.");
        return data.video_url;
      }

      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    throw new Error("Lip sync is still processing. Try again from Creations in a moment.");
  };

  const handleGenerate = async () => {
    if (!audioFile) {
      toast({ title: "Upload an audio track first", variant: "destructive" });
      return;
    }
    if (!videoFile) {
      toast({ title: "Upload a reference video", description: "fal.ai lip sync needs both audio and a face video to sync.", variant: "destructive" });
      videoRef.current?.click();
      return;
    }

    const maxBytes = 25 * 1024 * 1024;
    if (audioFile.size > maxBytes || videoFile.size > maxBytes) {
      toast({ title: "File too large for browser upload", description: "Use files under 25MB or host them at a public URL before submitting.", variant: "destructive" });
      return;
    }

    setGenerating(true);
    setDone(false);
    setResultUrl(null);
    setRequestId(null);

    try {
      const [audioUrl, videoUrl] = await Promise.all([
        fileToDataUrl(audioFile),
        fileToDataUrl(videoFile),
      ]);

      const res = await fetch(apiPath("/api/fal/submit"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model_id: "fal-ai/sync-lipsync/v2",
          inputs: {
            model: syncMode.id === "mirror" ? "lipsync-2-pro" : "lipsync-2",
            video_url: videoUrl,
            audio_url: audioUrl,
            sync_mode: "cut_off",
          },
        }),
      });
      const data = await res.json() as { request_id?: string; error?: string };
      if (!res.ok || data.error || !data.request_id) throw new Error(data.error ?? "Lip sync submit failed");

      setRequestId(data.request_id);
      toast({ title: "Lip sync queued", description: `Connected to fal.ai · ${data.request_id.slice(0, 8)}` });

      const url = await pollResult(data.request_id);
      setResultUrl(url);
      setDone(true);
      toast({ title: "Lip sync complete!", description: `${selectedAvatar.name} synced to ${audioFile.name}` });
    } catch (err) {
      toast({ title: "Lip sync failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center">
          <Mic className="w-5 h-5 text-pink-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lip Sync</h1>
          <p className="text-sm text-muted-foreground">Sync any audio to your avatar with cinematic accuracy</p>
        </div>
        <Badge variant="outline" className="ml-auto border-pink-500/30 text-pink-400 text-xs">STUDIO</Badge>
      </div>

      {/* Step 1: Audio upload */}
      <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold flex-shrink-0">1</div>
          <h2 className="font-semibold">Upload Audio Track</h2>
        </div>

        {audioFile ? (
          <div className="flex items-center gap-3 bg-pink-500/5 border border-pink-500/20 rounded-xl px-4 py-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center flex-shrink-0">
              <FileAudio className="w-5 h-5 text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{audioFile.name}</p>
              <p className="text-xs text-muted-foreground">{(audioFile.size / 1024).toFixed(0)} KB · {audioFile.type}</p>
            </div>
            <button
              onClick={() => setAudioFile(null)}
              className="text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => audioRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all group"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center group-hover:bg-pink-500/10 transition-colors">
              <Music className="w-7 h-7 text-muted-foreground group-hover:text-pink-400 transition-colors" />
            </div>
            <div className="text-center">
              <p className="font-medium text-sm">Drop your audio here</p>
              <p className="text-xs text-muted-foreground mt-1">MP3, WAV, M4A, AAC — up to 25MB</p>
            </div>
            <Button variant="outline" size="sm" className="mt-1" onClick={e => { e.stopPropagation(); audioRef.current?.click(); }}>
              <Upload className="w-3.5 h-3.5 mr-1.5" /> Select Audio
            </Button>
          </div>
        )}
        <input ref={audioRef} type="file" accept="audio/*" className="hidden" onChange={handleAudio} />
      </div>

      {/* Step 2: Avatar */}
      <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold flex-shrink-0">2</div>
          <h2 className="font-semibold">Select Avatar</h2>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {AVATARS.map(av => (
            <button
              key={av.id}
              onClick={() => setSelectedAvatar(av)}
              className={`flex flex-col items-center gap-1.5 transition-all ${
                selectedAvatar.id === av.id ? "scale-105" : "opacity-60 hover:opacity-90"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl ${av.color} flex items-center justify-center border-2 transition-colors ${
                selectedAvatar.id === av.id ? "border-primary" : "border-transparent"
              }`}>
                <span className="text-white font-bold text-sm">{av.initials}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium">{av.name}</span>
              {selectedAvatar.id === av.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3: Sync mode */}
      <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs text-primary-foreground font-bold flex-shrink-0">3</div>
          <h2 className="font-semibold">Sync Mode</h2>
        </div>

        <div className="flex flex-col gap-2">
          {SYNC_MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSyncMode(mode)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                syncMode.id === mode.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/30"
              }`}
            >
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                syncMode.id === mode.id ? "border-primary" : "border-border"
              }`}>
                {syncMode.id === mode.id && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div>
                <p className="text-sm font-medium">{mode.label}</p>
                <p className="text-xs text-muted-foreground">{mode.desc}</p>
              </div>
              {mode.id === "mirror" && (
                <Badge variant="outline" className="ml-auto text-[10px] border-pink-500/30 text-pink-400">Recommended</Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Optional: reference video */}
      <div className="bg-card border border-card-border rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground font-bold flex-shrink-0">4</div>
            <h2 className="font-semibold text-sm">Reference Video <span className="text-pink-400 font-normal">(required for backend)</span></h2>
          </div>
          {videoFile && (
            <button onClick={() => setVideoFile(null)} className="text-muted-foreground hover:text-destructive">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {videoFile ? (
          <p className="text-sm text-green-400 flex items-center gap-2">
            <Check className="w-4 h-4" /> {videoFile.name}
          </p>
        ) : (
          <button
            onClick={() => videoRef.current?.click()}
            className="text-xs text-muted-foreground border border-dashed border-border rounded-xl px-4 py-3 hover:border-primary/40 transition-colors flex items-center gap-2"
          >
            <Video className="w-3.5 h-3.5" />
            Upload face video for fal.ai lip sync
          </button>
        )}
        <input ref={videoRef} type="file" accept="video/*" className="hidden" onChange={handleVideo} />
      </div>

      {/* Generate */}
      <div className="flex flex-col gap-3">
        {done && (
          <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400">
            <Check className="w-4 h-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Lip sync complete!</p>
              <p className="text-xs opacity-80">Connected to fal.ai; your generated video is ready below.</p>
            </div>
          </div>
        )}

        {resultUrl && (
          <video src={resultUrl} controls className="w-full rounded-xl border border-green-500/20 bg-black" />
        )}

        {requestId && !done && (
          <p className="text-xs text-muted-foreground text-center">fal.ai request: <span className="font-mono">{requestId}</span></p>
        )}

        <Button
          onClick={handleGenerate}
          disabled={generating || !audioFile || !videoFile}
          className="h-12 text-sm font-bold"
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Syncing lips…</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Lip Sync Video</>
          )}
        </Button>

        {(!audioFile || !videoFile) && (
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3 h-3" /> Upload audio and a reference face video to enable backend generation
          </p>
        )}
      </div>
    </div>
  );
}
