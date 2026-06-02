import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  User, Mic, Upload, Play, ChevronDown, Loader2,
  Video, Sparkles, ToggleLeft, ToggleRight, Check,
  Monitor, Smartphone, Camera,
} from "lucide-react";

const SCENES = [
  { id: "urban-nyc", label: "Urban NYC", emoji: "🌆", desc: "Times Square, city streets, neon" },
  { id: "studio", label: "Studio White", emoji: "🎬", desc: "Clean studio, professional" },
  { id: "cinematic", label: "Cinematic Dark", emoji: "🌑", desc: "Dramatic lighting, film noir" },
  { id: "nature", label: "Nature Vista", emoji: "🌿", desc: "Open outdoors, landscapes" },
  { id: "office", label: "Modern Office", emoji: "💼", desc: "Corporate, clean workspace" },
  { id: "abstract", label: "Abstract FX", emoji: "✨", desc: "AI-generated background" },
];

const AVATARS = [
  { id: "avatar-iv", name: "Avatar IV", initials: "IV", color: "bg-orange-500" },
  { id: "avatar-v", name: "Avatar V", initials: "V", color: "bg-blue-500" },
  { id: "mark", name: "Mark", initials: "M", color: "bg-green-500" },
  { id: "jay", name: "Jay", initials: "J", color: "bg-purple-500" },
];

const VOICES = ["Zubenelgenubi", "Mark", "Emma", "Noah", "Aria"];

type Tab = "presenter" | "cinematic";
type Orientation = "portrait" | "landscape";
type Quality = "720p" | "1080p" | "4K";

export function AvatarShots() {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<Tab>("cinematic");
  const [script, setScript] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]);
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0]);
  const [selectedScene, setSelectedScene] = useState(SCENES[0]);
  const [customMotion, setCustomMotion] = useState("");
  const [expressive, setExpressive] = useState(true);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [quality, setQuality] = useState<Quality>("720p");
  const [voiceMirror, setVoiceMirror] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [audioFile, setAudioFile] = useState<File | null>(null);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setAudioFile(f);
  };

  const handleGenerate = () => {
    if (!script.trim() && !audioFile) {
      toast({ title: "Add a script or upload audio", variant: "destructive" });
      return;
    }
    setGenerating(true);
    toast({ title: "Avatar shot queued", description: `${selectedAvatar.name} · ${selectedScene.label} scene` });
    setTimeout(() => setGenerating(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 sm:p-8 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Camera className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Avatar Shots</h1>
            <p className="text-sm text-muted-foreground">Cinematic, film-quality shots with AI-powered scenes</p>
          </div>
          <Badge className="ml-auto bg-primary/10 text-primary border-primary/20 text-xs">NEW</Badge>
        </div>
      </div>

      {/* Main card */}
      <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-border px-6 pt-4 gap-6">
          {(["presenter", "cinematic"] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Avatar + Script area */}
          <div className="flex gap-4">
            {/* Avatar selector */}
            <div className="flex flex-col gap-2 w-28 flex-shrink-0">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-muted border border-border flex items-center justify-center relative">
                <div className={`w-full h-full ${selectedAvatar.color} flex items-center justify-center`}>
                  <span className="text-white text-2xl font-bold">{selectedAvatar.initials}</span>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {AVATARS.map(av => (
                  <button
                    key={av.id}
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-6 h-6 rounded-full ${av.color} flex items-center justify-center transition-all ${
                      selectedAvatar.id === av.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : "opacity-60 hover:opacity-100"
                    }`}
                    title={av.name}
                  >
                    <span className="text-white text-[9px] font-bold">{av.initials}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Script */}
            <div className="flex-1 flex flex-col gap-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">VIDEO SCRIPT</div>

              {audioFile ? (
                <div className="flex items-center gap-3 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                  <Play className="w-4 h-4 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{audioFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(audioFile.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button onClick={() => setAudioFile(null)} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ) : (
                <Textarea
                  placeholder="Type your script, or upload/record audio below..."
                  className="flex-1 min-h-[100px] bg-background resize-none text-sm"
                  value={script}
                  onChange={e => setScript(e.target.value)}
                />
              )}

              {/* Voice mirror toggle */}
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceMirror}
                  onChange={e => setVoiceMirror(e.target.checked)}
                  className="accent-primary"
                />
                Voice Mirroring
                <span className="text-[10px] opacity-60">— match audio voice to avatar</span>
              </label>
            </div>
          </div>

          {/* Scene selector */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">SCENE / BACKGROUND</div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {SCENES.map(scene => (
                <button
                  key={scene.id}
                  onClick={() => setSelectedScene(scene)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-xl border text-xs transition-all ${
                    selectedScene.id === scene.id
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <span className="text-lg">{scene.emoji}</span>
                  <span className="font-medium leading-tight text-center">{scene.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom motion */}
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              APPLY CUSTOM MOTION
              <Badge variant="outline" className="text-[9px] px-1 py-0">BETA</Badge>
            </div>
            <Textarea
              placeholder="e.g. lean in, look at camera, thumbs up at the end..."
              className="bg-background text-sm resize-none min-h-[60px]"
              value={customMotion}
              onChange={e => setCustomMotion(e.target.value)}
            />
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <button onClick={() => setExpressive(v => !v)} className="flex items-center gap-1.5">
                {expressive
                  ? <ToggleRight className="w-8 h-8 text-primary" />
                  : <ToggleLeft className="w-8 h-8 text-muted-foreground" />}
              </button>
              <span className="text-sm font-medium">More expressive</span>
            </label>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-3 flex-wrap border-t border-border pt-4">
            {/* Avatar */}
            <button className="flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg px-3 py-2 hover:border-primary/40 transition-colors">
              <div className={`w-4 h-4 rounded-full ${selectedAvatar.color} flex items-center justify-center`}>
                <span className="text-[8px] text-white font-bold">{selectedAvatar.initials}</span>
              </div>
              {selectedAvatar.name}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Motion */}
            <button className="flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg px-3 py-2 hover:border-primary/40 transition-colors">
              <Sparkles className="w-3 h-3" />
              Motion
            </button>

            {/* Voice */}
            <button className="flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg px-3 py-2 hover:border-primary/40 transition-colors">
              <Mic className="w-3 h-3" />
              {selectedVoice}
            </button>

            {/* Upload audio */}
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 text-xs bg-muted border border-border rounded-lg px-3 py-2 hover:border-primary/40 transition-colors"
            >
              <Upload className="w-3 h-3" />
              Upload Audio
            </button>
            <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />

            {/* Orientation */}
            <div className="flex items-center gap-1 ml-auto">
              <button
                onClick={() => setOrientation("portrait")}
                className={`p-1.5 rounded border transition-colors ${orientation === "portrait" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOrientation("landscape")}
                className={`p-1.5 rounded border transition-colors ${orientation === "landscape" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>

              {/* Quality */}
              <button className="flex items-center gap-1 text-xs bg-muted border border-border rounded-lg px-2.5 py-1.5 hover:border-primary/40 transition-colors ml-1">
                {quality} <ChevronDown className="w-3 h-3" />
              </button>

              {/* Generate */}
              <Button
                onClick={handleGenerate}
                disabled={generating}
                size="sm"
                className="ml-2 rounded-full h-8 w-8 p-0"
              >
                {generating
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Play className="w-3.5 h-3.5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Creations placeholder */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Creations</h2>
          <button className="text-sm text-primary hover:underline">All Projects →</button>
        </div>
        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-muted-foreground">
          <Video className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Your avatar shots will appear here</p>
        </div>
      </div>
    </div>
  );
}
