import { useState, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Upload, Search, Image as ImageIcon, Copy, Check, Trash2, Tag, Plus, X, FolderOpen } from "lucide-react";
import { format } from "date-fns";

export interface ReferenceImage {
  id: string;
  name: string;
  src: string;         // base64 data URL
  tags: string[];
  width: number;
  height: number;
  size: number;        // bytes
  created_at: number;
}

const STORAGE_KEY = "heygen_reference_images";

function loadRefs(): ReferenceImage[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveRefs(items: ReferenceImage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function useReferences() {
  const [refs, setRefs] = useState<ReferenceImage[]>(loadRefs);

  const add = useCallback((items: ReferenceImage[]) => {
    setRefs(prev => {
      const next = [...items, ...prev];
      saveRefs(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setRefs(prev => {
      const next = prev.filter(r => r.id !== id);
      saveRefs(next);
      return next;
    });
  }, []);

  const updateTags = useCallback((id: string, tags: string[]) => {
    setRefs(prev => {
      const next = prev.map(r => r.id === id ? { ...r, tags } : r);
      saveRefs(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    saveRefs([]);
    setRefs([]);
  }, []);

  return { refs, add, remove, updateTags, clear };
}

function readFileAsDataURL(file: File): Promise<{ src: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = reader.result as string;
      const img = new Image();
      img.onload = () => resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function TagEditor({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const t = input.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setInput("");
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 bg-background border border-border rounded-lg min-h-9">
      {tags.map(t => (
        <Badge key={t} variant="secondary" className="text-[10px] h-5 gap-1 pr-1">
          {t}
          <button onClick={() => onChange(tags.filter(x => x !== t))} className="hover:text-destructive transition-colors">
            <X className="w-2.5 h-2.5" />
          </button>
        </Badge>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
        placeholder={tags.length === 0 ? "Add tags…" : ""}
        className="flex-1 min-w-16 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
      />
    </div>
  );
}

function RefCard({ ref: r, onDelete, onTagsChange }: {
  ref: ReferenceImage;
  onDelete: () => void;
  onTagsChange: (t: string[]) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(r.src);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group bg-card border border-card-border rounded-xl overflow-hidden flex flex-col hover:border-primary/40 transition-colors">
      <div className="aspect-video bg-muted relative overflow-hidden">
        <img src={r.src} alt={r.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            onClick={copy}
            className="bg-card/90 hover:bg-card text-foreground p-2 rounded-lg transition-colors"
            title="Copy base64 URL"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="bg-card/90 hover:bg-destructive text-foreground hover:text-destructive-foreground p-2 rounded-lg transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete reference image?</AlertDialogTitle>
                <AlertDialogDescription>This removes "{r.name}" from your library. It cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono backdrop-blur-md">
          {r.width}×{r.height}
        </div>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate flex-1" title={r.name}>{r.name}</p>
          <span className="text-[10px] text-muted-foreground">{formatBytes(r.size)}</span>
        </div>

        {editing ? (
          <div className="flex flex-col gap-2">
            <TagEditor tags={r.tags} onChange={onTagsChange} />
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(false)}>Done</Button>
          </div>
        ) : (
          <div className="flex items-center gap-1 flex-wrap min-h-5">
            {r.tags.length > 0
              ? r.tags.slice(0, 3).map(t => (
                  <Badge key={t} variant="secondary" className="text-[10px] h-4 py-0">{t}</Badge>
                ))
              : <span className="text-[10px] text-muted-foreground/50">No tags</span>}
            <button
              onClick={() => setEditing(true)}
              className="ml-auto text-muted-foreground/50 hover:text-primary transition-colors"
            >
              <Tag className="w-3 h-3" />
            </button>
          </div>
        )}

        <p className="text-[10px] text-muted-foreground/50 font-mono">
          {format(new Date(r.created_at), "MMM d, yyyy")}
        </p>
      </div>
    </div>
  );
}

export function References() {
  const { refs, add, remove, updateTags, clear } = useReferences();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const allTags = Array.from(new Set(refs.flatMap(r => r.tags))).sort();

  const filtered = refs.filter(r => {
    const q = search.toLowerCase();
    const matchesSearch = !q || r.name.toLowerCase().includes(q) || r.tags.some(t => t.includes(q));
    const matchesTag = !activeTag || r.tags.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  const processFiles = async (files: File[]) => {
    const valid = files.filter(f => f.type.startsWith("image/"));
    if (!valid.length) {
      toast({ title: "No valid images", description: "Please upload image files (PNG, JPG, WebP, etc.)", variant: "destructive" });
      return;
    }
    const items: ReferenceImage[] = [];
    for (const file of valid) {
      try {
        const { src, width, height } = await readFileAsDataURL(file);
        items.push({
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          src,
          tags: [],
          width,
          height,
          size: file.size,
          created_at: Date.now(),
        });
      } catch {
        toast({ title: `Failed to load ${file.name}`, variant: "destructive" });
      }
    }
    if (items.length) {
      add(items);
      toast({ title: `Added ${items.length} reference image${items.length > 1 ? "s" : ""}` });
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    await processFiles(Array.from(e.dataTransfer.files));
  };

  const handleInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) await processFiles(Array.from(e.target.files));
    e.target.value = "";
  };

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Reference Images</h1>
          <p className="text-muted-foreground text-sm">
            {refs.length === 0 ? "Upload images to use as visual references for generation." : `${refs.length} image${refs.length !== 1 ? "s" : ""} in your library`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleInput} />
          <Button onClick={() => inputRef.current?.click()}>
            <Plus className="w-4 h-4 mr-2" /> Upload Images
          </Button>
          {refs.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon" className="text-muted-foreground"><Trash2 className="w-4 h-4" /></Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All References?</AlertDialogTitle>
                  <AlertDialogDescription>This removes all {refs.length} reference images permanently.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clear} className="bg-destructive text-destructive-foreground">Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
          dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
        }`}
      >
        <FolderOpen className={`w-10 h-10 mx-auto mb-3 transition-colors ${dragging ? "text-primary" : "text-muted-foreground/30"}`} />
        <p className="font-medium text-sm">Drop images here or click to upload</p>
        <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP, GIF — stored locally in your browser</p>
      </div>

      {refs.length > 0 && (
        <>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or tag..."
                className="pl-9 bg-card border-card-border"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {allTags.map(t => (
                  <Badge
                    key={t}
                    variant={activeTag === t ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setActiveTag(activeTag === t ? null : t)}
                  >
                    {t}
                  </Badge>
                ))}
                {activeTag && (
                  <button className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1" onClick={() => setActiveTag(null)}>
                    <X className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>No images match your filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(r => (
                <RefCard
                  key={r.id}
                  ref={r}
                  onDelete={() => remove(r.id)}
                  onTagsChange={tags => updateTags(r.id, tags)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {refs.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {[
            { icon: "🎭", title: "Style References", desc: "Upload images of visual styles, color palettes, or aesthetic references to guide your generations." },
            { icon: "👤", title: "Character References", desc: "Save character designs, face references, or outfit inspirations for consistent video creation." },
            { icon: "🌆", title: "Scene References", desc: "Collect environment, background, and lighting references for scene-accurate generations." },
          ].map(c => (
            <div key={c.title} className="bg-card border border-card-border rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
