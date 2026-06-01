import { useState, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Check, Plus, Search, Edit3, Trash2, Sparkles, X } from "lucide-react";

export type SceneCategory = "environment" | "outfit" | "prop" | "lighting" | "urban";

export interface ScenePreset {
  id: string;
  name: string;
  category: SceneCategory;
  description: string;
  promptFragment: string;  // injected into generation prompts
  emoji: string;
  tags: string[];
  isCustom?: boolean;
  created_at?: number;
}

const BUILTIN_SCENES: ScenePreset[] = [
  // ── Urban / Street ──────────────────────────────────────────────────────────
  { id: "urban-street", name: "City Street", category: "urban", emoji: "🏙️", description: "Busy urban street scene with neon signs, traffic, and city atmosphere.", promptFragment: "busy urban city street, neon signs, concrete sidewalk, cinematic urban atmosphere, bokeh city lights", tags: ["city", "urban", "night", "street"] },
  { id: "urban-rooftop", name: "Rooftop", category: "urban", emoji: "🌆", description: "Dramatic rooftop view overlooking the cityscape at golden hour.", promptFragment: "urban rooftop overlooking skyline, golden hour light, city buildings in background, dramatic cinematic look", tags: ["rooftop", "skyline", "golden-hour"] },
  { id: "urban-subway", name: "Subway", category: "urban", emoji: "🚇", description: "Underground subway station with atmospheric lighting and motion blur.", promptFragment: "underground subway station, fluorescent lighting, motion blur of trains, gritty urban atmosphere", tags: ["subway", "underground", "city"] },
  { id: "urban-alley", name: "Alley", category: "urban", emoji: "🌃", description: "Cinematic back alley with dramatic lighting and moody atmosphere.", promptFragment: "cinematic back alley, brick walls, dramatic overhead lighting, shallow depth of field, noir atmosphere", tags: ["alley", "night", "cinematic"] },
  { id: "urban-cuts-hiphop", name: "Urban Cuts (Hip-Hop)", category: "urban", emoji: "🎤", description: "Dynamic hip-hop style urban environment with fast cuts and vibrant energy.", promptFragment: "dynamic hip-hop urban scene, vibrant colors, street art murals, basketball court, energetic atmosphere, music video style", tags: ["hip-hop", "urban-cuts", "music-video", "street-art"] },
  { id: "urban-downtown", name: "Downtown Plaza", category: "urban", emoji: "🏢", description: "Modern downtown plaza with glass towers and urban landscaping.", promptFragment: "modern downtown plaza, glass skyscrapers reflecting sky, urban greenery, professional atmosphere", tags: ["downtown", "modern", "professional"] },

  // ── Environments ──────────────────────────────────────────────────────────
  { id: "env-studio", name: "Studio", category: "environment", emoji: "🎬", description: "Professional photo/video studio with seamless backdrop.", promptFragment: "professional studio setup, seamless white backdrop, soft box lighting, clean minimal background", tags: ["studio", "professional", "clean"] },
  { id: "env-forest", name: "Forest", category: "environment", emoji: "🌲", description: "Lush green forest with dappled sunlight through the canopy.", promptFragment: "lush green forest, sunlight filtering through tree canopy, mossy ground, magical bokeh light particles", tags: ["nature", "forest", "outdoor"] },
  { id: "env-beach", name: "Beach", category: "environment", emoji: "🏖️", description: "Tropical beach with crystal water and golden sand.", promptFragment: "tropical beach, crystal clear turquoise water, golden sand, palm trees, bright sunny day, paradise atmosphere", tags: ["beach", "tropical", "sunny"] },
  { id: "env-mountains", name: "Mountains", category: "environment", emoji: "🏔️", description: "Majestic mountain landscape with dramatic peaks and clouds.", promptFragment: "majestic mountain landscape, dramatic snow-capped peaks, epic clouds, cinematic wide angle, awe-inspiring vista", tags: ["mountains", "epic", "nature"] },
  { id: "env-desert", name: "Desert", category: "environment", emoji: "🏜️", description: "Vast desert with rolling sand dunes and warm golden light.", promptFragment: "vast desert landscape, rolling sand dunes, warm golden hour light, minimal horizon, cinematic composition", tags: ["desert", "minimal", "warm"] },
  { id: "env-office", name: "Modern Office", category: "environment", emoji: "💼", description: "Sleek modern office with floor-to-ceiling windows and city views.", promptFragment: "sleek modern office space, floor-to-ceiling windows, city skyline view, clean minimalist design, professional setting", tags: ["office", "professional", "modern"] },
  { id: "env-cyberpunk", name: "Cyberpunk City", category: "environment", emoji: "🔮", description: "Futuristic neon-lit cyberpunk cityscape with rain and atmosphere.", promptFragment: "futuristic cyberpunk city, neon lights reflecting on wet streets, rain, towering megastructures, blade runner aesthetic", tags: ["cyberpunk", "futuristic", "sci-fi", "neon"] },

  // ── Outfits ────────────────────────────────────────────────────────────────
  { id: "outfit-formal", name: "Business Formal", category: "outfit", emoji: "👔", description: "Sharp professional suit for corporate and formal content.", promptFragment: "wearing professional business suit, crisp white shirt, silk tie, polished shoes, executive appearance", tags: ["formal", "professional", "business"] },
  { id: "outfit-casual", name: "Street Casual", category: "outfit", emoji: "👟", description: "Modern casual streetwear for everyday authentic content.", promptFragment: "wearing modern casual streetwear, clean sneakers, relaxed but stylish outfit, contemporary fashion", tags: ["casual", "streetwear", "modern"] },
  { id: "outfit-urban-street", name: "Urban Street Style", category: "outfit", emoji: "🧢", description: "Hip-hop inspired urban fashion with hoodies, chains, and caps.", promptFragment: "wearing urban streetwear, oversized hoodie, gold chain, snapback cap, cargo pants, fresh sneakers, hip-hop fashion", tags: ["urban", "hip-hop", "streetwear", "urban-cuts"] },
  { id: "outfit-luxury", name: "Luxury Fashion", category: "outfit", emoji: "💎", description: "High-end designer luxury fashion and accessories.", promptFragment: "wearing high-end luxury designer fashion, expensive jewelry, tailored silhouette, fashion editorial look", tags: ["luxury", "fashion", "designer"] },
  { id: "outfit-athlete", name: "Athletic / Sportswear", category: "outfit", emoji: "🏃", description: "Performance athletic wear for sports and fitness content.", promptFragment: "wearing modern athletic sportswear, performance fabric, dynamic fit, sport brand gear", tags: ["athletic", "sport", "fitness"] },
  { id: "outfit-traditional", name: "Traditional / Cultural", category: "outfit", emoji: "👘", description: "Traditional or cultural attire for authentic heritage content.", promptFragment: "wearing traditional cultural clothing, authentic heritage garments, ceremonial attire", tags: ["traditional", "cultural", "heritage"] },

  // ── Lighting ───────────────────────────────────────────────────────────────
  { id: "light-golden", name: "Golden Hour", category: "lighting", emoji: "🌅", description: "Warm golden hour sunlight for cinematic natural beauty.", promptFragment: "golden hour lighting, warm orange-golden sun, long shadows, cinematic magic hour, film photography look", tags: ["golden-hour", "warm", "cinematic"] },
  { id: "light-neon", name: "Neon / Club", category: "lighting", emoji: "🎆", description: "Vibrant neon and colored lighting for night scene atmosphere.", promptFragment: "neon light atmosphere, vibrant colored lighting, purple blue pink neon glow, night club vibes", tags: ["neon", "night", "colorful"] },
  { id: "light-studio-soft", name: "Studio Soft Box", category: "lighting", emoji: "💡", description: "Professional soft box studio lighting, even and flattering.", promptFragment: "soft box studio lighting, even illumination, flattering fill light, professional photography setup, no harsh shadows", tags: ["studio", "professional", "soft"] },
  { id: "light-dramatic", name: "Dramatic / Chiaroscuro", category: "lighting", emoji: "🕯️", description: "High contrast dramatic lighting with deep shadows.", promptFragment: "dramatic chiaroscuro lighting, high contrast, deep shadows, single key light, cinematic intensity", tags: ["dramatic", "contrast", "cinematic"] },

  // ── Props ──────────────────────────────────────────────────────────────────
  { id: "prop-mic", name: "Microphone", category: "prop", emoji: "🎙️", description: "Professional microphone for music or podcast content.", promptFragment: "holding professional condenser microphone, recording setup, audio equipment visible", tags: ["mic", "music", "podcast"] },
  { id: "prop-book", name: "Books / Reading", category: "prop", emoji: "📚", description: "Books, reading, and intellectual setting props.", promptFragment: "surrounded by books, reading glasses, intellectual setting, warm library atmosphere", tags: ["books", "education", "intellectual"] },
  { id: "prop-laptop", name: "Laptop / Tech", category: "prop", emoji: "💻", description: "Modern laptop and tech gadgets for professional content.", promptFragment: "with modern laptop and tech devices, coding setup, multiple screens, modern workspace", tags: ["tech", "work", "digital"] },
  { id: "prop-gym", name: "Gym Equipment", category: "prop", emoji: "🏋️", description: "Gym weights and fitness equipment for workout content.", promptFragment: "gym setting with weights and fitness equipment, workout environment, athletic studio", tags: ["gym", "fitness", "workout"] },
];

const STORAGE_KEY = "heygen_scene_presets";

function loadCustom(): ScenePreset[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveCustom(items: ScenePreset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const CATEGORY_LABELS: Record<SceneCategory, string> = {
  environment: "Environments",
  urban: "Urban / Street",
  outfit: "Outfits",
  lighting: "Lighting",
  prop: "Props",
};

const CATEGORY_COLORS: Record<SceneCategory, string> = {
  environment: "bg-green-500/10 text-green-400 border-green-500/20",
  urban: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  outfit: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  lighting: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  prop: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

function PresetCard({ preset, onCopy, onEdit, onDelete }: {
  preset: ScenePreset;
  onCopy: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preset.promptFragment);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-card border border-card-border rounded-xl p-4 flex flex-col gap-3 hover:border-primary/40 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{preset.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-sm">{preset.name}</h3>
            {preset.isCustom && (
              <Badge variant="outline" className="text-[10px] py-0 px-1.5">Custom</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">{preset.description}</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-2.5 border border-border/50">
        <p className="text-[11px] text-muted-foreground font-mono leading-relaxed line-clamp-2" title={preset.promptFragment}>
          {preset.promptFragment}
        </p>
      </div>

      <div className="flex flex-wrap gap-1">
        {preset.tags.map(t => (
          <Badge key={t} variant="outline" className="text-[10px] py-0 px-1.5 h-4">{t}</Badge>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-1 border-t border-border">
        <Button
          size="sm"
          variant="ghost"
          className="flex-1 h-7 text-xs"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3 mr-1.5 text-green-500" /> : <Copy className="w-3 h-3 mr-1.5" />}
          {copied ? "Copied!" : "Copy Prompt"}
        </Button>
        {preset.isCustom && onEdit && (
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit}>
            <Edit3 className="w-3.5 h-3.5" />
          </Button>
        )}
        {preset.isCustom && onDelete && (
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function EditDialog({
  preset,
  open,
  onClose,
  onSave,
}: {
  preset: Partial<ScenePreset> | null;
  open: boolean;
  onClose: () => void;
  onSave: (p: ScenePreset) => void;
}) {
  const [form, setForm] = useState<Partial<ScenePreset>>(preset ?? {});

  const upd = (k: keyof ScenePreset, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    if (!form.name?.trim() || !form.promptFragment?.trim()) return;
    onSave({
      id: form.id ?? crypto.randomUUID(),
      name: form.name,
      category: (form.category as SceneCategory) ?? "environment",
      description: form.description ?? "",
      promptFragment: form.promptFragment,
      emoji: form.emoji ?? "✨",
      tags: typeof form.tags === "string"
        ? (form.tags as unknown as string).split(",").map((t: string) => t.trim()).filter(Boolean)
        : form.tags ?? [],
      isCustom: true,
      created_at: form.created_at ?? Date.now(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{form.id ? "Edit Preset" : "New Scene Preset"}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label className="text-xs">Emoji</Label>
              <Input value={form.emoji ?? ""} onChange={e => upd("emoji", e.target.value)} className="text-center text-xl" />
            </div>
            <div className="col-span-3 space-y-2">
              <Label className="text-xs">Name</Label>
              <Input value={form.name ?? ""} onChange={e => upd("name", e.target.value)} placeholder="e.g. Urban Street Night" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Category</Label>
            <select
              value={form.category ?? "environment"}
              onChange={e => upd("category", e.target.value)}
              className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm text-foreground"
            >
              {(Object.keys(CATEGORY_LABELS) as SceneCategory[]).map(c => (
                <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Description</Label>
            <Input value={form.description ?? ""} onChange={e => upd("description", e.target.value)} placeholder="Brief description" />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Prompt Fragment <span className="text-muted-foreground">(injected into generation prompts)</span></Label>
            <Textarea
              value={form.promptFragment ?? ""}
              onChange={e => upd("promptFragment", e.target.value)}
              placeholder="cinematic urban street, neon lights, wet pavement..."
              className="min-h-[80px] text-sm font-mono resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Tags <span className="text-muted-foreground">(comma-separated)</span></Label>
            <Input
              value={Array.isArray(form.tags) ? form.tags.join(", ") : (form.tags ?? "")}
              onChange={e => upd("tags", e.target.value as unknown as string)}
              placeholder="urban, night, cinematic"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name?.trim() || !form.promptFragment?.trim()}>
            {form.id ? "Save Changes" : "Create Preset"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ScenesProps() {
  const [custom, setCustom] = useState<ScenePreset[]>(loadCustom);
  const [tab, setTab] = useState<SceneCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Partial<ScenePreset> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const all = [...BUILTIN_SCENES, ...custom];

  const filtered = all.filter(p => {
    const matchesTab = tab === "all" || p.category === tab;
    const q = search.toLowerCase();
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.tags.some(t => t.includes(q));
    return matchesTab && matchesSearch;
  });

  const savePreset = (p: ScenePreset) => {
    setCustom(prev => {
      const idx = prev.findIndex(x => x.id === p.id);
      const next = idx >= 0 ? prev.map((x, i) => i === idx ? p : x) : [p, ...prev];
      saveCustom(next);
      return next;
    });
  };

  const deletePreset = (id: string) => {
    setCustom(prev => {
      const next = prev.filter(p => p.id !== id);
      saveCustom(next);
      return next;
    });
  };

  const openNew = () => { setEditing({}); setDialogOpen(true); };
  const openEdit = (p: ScenePreset) => { setEditing(p); setDialogOpen(true); };
  const closeDialog = () => { setEditing(null); setDialogOpen(false); };

  const counts = (Object.keys(CATEGORY_LABELS) as SceneCategory[]).reduce((acc, c) => {
    acc[c] = all.filter(p => p.category === c).length;
    return acc;
  }, {} as Record<SceneCategory, number>);

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Scenes &amp; Props</h1>
          <p className="text-muted-foreground text-sm">Prompt fragments for environments, outfits, and props. Click any card to copy.</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> New Preset
        </Button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={tab === "all" ? "default" : "outline"}
          className="cursor-pointer px-3 py-1 text-xs"
          onClick={() => setTab("all")}
        >
          All ({all.length})
        </Badge>
        {(Object.keys(CATEGORY_LABELS) as SceneCategory[]).map(c => (
          <Badge
            key={c}
            variant={tab === c ? "default" : "outline"}
            className={`cursor-pointer px-3 py-1 text-xs ${tab !== c ? CATEGORY_COLORS[c] : ""}`}
            onClick={() => setTab(c)}
          >
            {CATEGORY_LABELS[c]} ({counts[c]})
          </Badge>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search scenes, outfits, props..."
          className="pl-9 bg-card border-card-border"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Usage hint */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm flex gap-3 items-start">
        <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-medium">How to use: </span>
          <span className="text-muted-foreground">Copy a prompt fragment and paste it into your image or video generation prompt to apply that scene, outfit, or lighting style.</span>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No presets match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <PresetCard
              key={p.id}
              preset={p}
              onCopy={() => toast({ title: `Copied "${p.name}" prompt`, description: "Paste it into your generation prompt." })}
              onEdit={p.isCustom ? () => openEdit(p) : undefined}
              onDelete={p.isCustom ? () => deletePreset(p.id) : undefined}
            />
          ))}
        </div>
      )}

      <EditDialog
        preset={editing}
        open={dialogOpen}
        onClose={closeDialog}
        onSave={savePreset}
      />
    </div>
  );
}
