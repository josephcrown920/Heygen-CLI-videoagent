import { useState, useCallback, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Music, Plus, Trash2, Copy, Edit3, Search, Mic, Video, Clock,
  ChevronDown, ChevronUp, Play, FileText, Check,
} from "lucide-react";
import { format } from "date-fns";

interface LyricLine {
  id: string;
  text: string;
  startTime?: number;  // seconds
  endTime?: number;
  note?: string;
}

interface LyricSheet {
  id: string;
  title: string;
  artist?: string;
  bpm?: number;
  key?: string;
  genre?: string;
  lines: LyricLine[];
  created_at: number;
  updated_at: number;
}

const STORAGE_KEY = "regent_lyrics";

function loadSheets(): LyricSheet[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function saveSheets(items: LyricSheet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function fmt(s?: number) {
  if (s === undefined) return "";
  const m = Math.floor(s / 60);
  const sec = (s % 60).toFixed(1).padStart(4, "0");
  return `${m}:${sec}`;
}

function parseTime(s: string): number | undefined {
  const m = s.match(/^(\d+):(\d+\.?\d*)$/);
  if (m) return parseInt(m[1]) * 60 + parseFloat(m[2]);
  if (!isNaN(parseFloat(s))) return parseFloat(s);
  return undefined;
}

function flatLyricsText(sheet: LyricSheet) {
  return sheet.lines.map(l => l.text).join("\n");
}

function lyricsToScript(sheet: LyricSheet) {
  const lines = sheet.lines.filter(l => l.text.trim());
  return lines.map((l, i) => `[${i + 1}] ${l.text}${l.note ? ` /* ${l.note} */` : ""}`).join("\n");
}

function SRTExport(sheet: LyricSheet) {
  const lines = sheet.lines.filter(l => l.text.trim() && l.startTime !== undefined && l.endTime !== undefined);
  return lines.map((l, i) => {
    const s = l.startTime!;
    const e = l.endTime!;
    const ts = (t: number) => {
      const h = Math.floor(t / 3600).toString().padStart(2, "0");
      const m = Math.floor((t % 3600) / 60).toString().padStart(2, "0");
      const sec = (t % 60).toFixed(3).replace(".", ",").padStart(6, "0");
      return `${h}:${m}:${sec}`;
    };
    return `${i + 1}\n${ts(s)} --> ${ts(e)}\n${l.text}\n`;
  }).join("\n");
}

function LineRow({ line, onChange, onDelete }: {
  line: LyricLine;
  onChange: (l: LyricLine) => void;
  onDelete: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 bg-card/50">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="text-xs text-muted-foreground/50 font-mono w-5 flex-shrink-0">♩</span>
          <input
            value={line.text}
            onChange={e => onChange({ ...line, text: e.target.value })}
            placeholder="Lyric line…"
            className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0 text-[10px] text-muted-foreground font-mono">
          {line.startTime !== undefined && (
            <span className="bg-muted/50 px-1.5 py-0.5 rounded">{fmt(line.startTime)} → {fmt(line.endTime)}</span>
          )}
        </div>
        <button onClick={() => setExpanded(e => !e)} className="text-muted-foreground/50 hover:text-muted-foreground">
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
        <button onClick={onDelete} className="text-muted-foreground/30 hover:text-destructive transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="px-3 py-2.5 border-t border-border/50 bg-muted/20 grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Start (m:ss)</Label>
            <input
              defaultValue={fmt(line.startTime)}
              onBlur={e => onChange({ ...line, startTime: parseTime(e.target.value) })}
              placeholder="0:00.0"
              className="w-full text-xs bg-background border border-input rounded px-2 py-1 font-mono text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">End (m:ss)</Label>
            <input
              defaultValue={fmt(line.endTime)}
              onBlur={e => onChange({ ...line, endTime: parseTime(e.target.value) })}
              placeholder="0:03.0"
              className="w-full text-xs bg-background border border-input rounded px-2 py-1 font-mono text-foreground outline-none focus:border-primary"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Director Note</Label>
            <input
              value={line.note ?? ""}
              onChange={e => onChange({ ...line, note: e.target.value })}
              placeholder="Whisper, pause…"
              className="w-full text-xs bg-background border border-input rounded px-2 py-1 text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SheetCard({ sheet, onOpen, onDelete }: {
  sheet: LyricSheet;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copy = async () => {
    await navigator.clipboard.writeText(flatLyricsText(sheet));
    setCopied(true);
    toast({ title: "Lyrics copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
          <Music className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{sheet.title}</h3>
          {sheet.artist && <p className="text-xs text-muted-foreground">{sheet.artist}</p>}
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {sheet.genre && <Badge variant="outline" className="text-[10px] h-4 py-0">{sheet.genre}</Badge>}
            {sheet.bpm && <Badge variant="outline" className="text-[10px] h-4 py-0">{sheet.bpm} BPM</Badge>}
            {sheet.key && <Badge variant="outline" className="text-[10px] h-4 py-0">Key: {sheet.key}</Badge>}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/30 rounded-lg p-2 font-mono">
        {flatLyricsText(sheet).slice(0, 120) || "No lyrics yet"}
      </p>

      <div className="flex items-center justify-between text-xs text-muted-foreground/60">
        <span>{sheet.lines.filter(l => l.text.trim()).length} lines</span>
        <span>{format(new Date(sheet.updated_at), "MMM d, yyyy")}</span>
      </div>

      <div className="flex gap-2 pt-1 border-t border-border">
        <Button size="sm" variant="ghost" className="flex-1 text-xs h-8" onClick={onOpen}>
          <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
        </Button>
        <Button size="sm" variant="ghost" className="text-xs h-8" onClick={copy}>
          {copied ? <Check className="w-3.5 h-3.5 mr-1.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 mr-1.5" />}
          Copy
        </Button>
        <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:text-destructive px-2" onClick={onDelete}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}

function parsePastedLyrics(text: string): LyricLine[] {
  return text.split("\n").filter(l => l.trim()).map(l => ({
    id: crypto.randomUUID(),
    text: l.trim(),
  }));
}

export function Lyrics() {
  const [sheets, setSheets] = useState<LyricSheet[]>(loadSheets);
  const [openId, setOpenId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [newDialog, setNewDialog] = useState(false);
  const [newForm, setNewForm] = useState({ title: "", artist: "", genre: "", bpm: "", key: "" });
  const [importText, setImportText] = useState("");
  const [exportDialog, setExportDialog] = useState(false);
  const { toast } = useToast();

  const openSheet = sheets.find(s => s.id === openId);

  const save = (items: LyricSheet[]) => { saveSheets(items); setSheets(items); };

  const createSheet = () => {
    if (!newForm.title.trim()) return;
    const lines = parsePastedLyrics(importText);
    const s: LyricSheet = {
      id: crypto.randomUUID(),
      title: newForm.title,
      artist: newForm.artist || undefined,
      genre: newForm.genre || undefined,
      bpm: newForm.bpm ? Number(newForm.bpm) : undefined,
      key: newForm.key || undefined,
      lines: lines.length ? lines : [{ id: crypto.randomUUID(), text: "" }],
      created_at: Date.now(),
      updated_at: Date.now(),
    };
    save([s, ...sheets]);
    setOpenId(s.id);
    setNewDialog(false);
    setNewForm({ title: "", artist: "", genre: "", bpm: "", key: "" });
    setImportText("");
  };

  const updateSheet = (patch: Partial<LyricSheet>) => {
    save(sheets.map(s => s.id === openId ? { ...s, ...patch, updated_at: Date.now() } : s));
  };

  const addLine = () => {
    if (!openSheet) return;
    updateSheet({ lines: [...openSheet.lines, { id: crypto.randomUUID(), text: "" }] });
  };

  const updateLine = (id: string, l: LyricLine) => {
    if (!openSheet) return;
    updateSheet({ lines: openSheet.lines.map(x => x.id === id ? l : x) });
  };

  const deleteLine = (id: string) => {
    if (!openSheet) return;
    updateSheet({ lines: openSheet.lines.filter(l => l.id !== id) });
  };

  const deleteSheet = (id: string) => {
    save(sheets.filter(s => s.id !== id));
    if (openId === id) setOpenId(null);
  };

  const copyAsScript = async () => {
    if (!openSheet) return;
    await navigator.clipboard.writeText(lyricsToScript(openSheet));
    toast({ title: "Copied as Regent script", description: "Paste into Director Suite or Magic Prompt." });
  };

  const downloadSRT = () => {
    if (!openSheet) return;
    const content = SRTExport(openSheet);
    if (!content.trim()) {
      toast({ title: "Add timestamps first", description: "Expand each line to set start/end times.", variant: "destructive" });
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    a.download = `${openSheet.title}.srt`;
    a.click();
  };

  const filtered = sheets.filter(s => {
    const q = search.toLowerCase();
    return !q || s.title.toLowerCase().includes(q) || s.artist?.toLowerCase().includes(q);
  });

  // Edit view
  if (openSheet) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4 border-b border-border pb-5">
          <Button variant="ghost" size="sm" onClick={() => setOpenId(null)} className="text-muted-foreground text-xs">
            ← Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{openSheet.title}</h1>
            {openSheet.artist && <p className="text-sm text-muted-foreground">{openSheet.artist}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={copyAsScript}>
              <Mic className="w-3.5 h-3.5 mr-1.5" /> Copy as Script
            </Button>
            <Button size="sm" variant="outline" onClick={downloadSRT}>
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Export SRT
            </Button>
          </div>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            ["Artist", "artist", "e.g. Artist Name"],
            ["Genre", "genre", "e.g. Hip-Hop"],
            ["BPM", "bpm", "e.g. 120"],
            ["Key", "key", "e.g. A Minor"],
          ].map(([label, key, placeholder]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs text-muted-foreground">{label}</Label>
              <Input
                value={(openSheet as unknown as Record<string, unknown>)[key] as string ?? ""}
                onChange={e => updateSheet({ [key]: e.target.value || undefined })}
                placeholder={placeholder}
                className="h-8 text-xs"
              />
            </div>
          ))}
        </div>

        {/* Lines */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Lyrics <span className="text-muted-foreground font-normal text-xs">({openSheet.lines.filter(l => l.text.trim()).length} lines)</span></Label>
            <Button size="sm" variant="ghost" onClick={addLine} className="h-8 text-xs">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Line
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            {openSheet.lines.map(l => (
              <LineRow key={l.id} line={l} onChange={nl => updateLine(l.id, nl)} onDelete={() => deleteLine(l.id)} />
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addLine} className="w-full h-9 border-dashed mt-1">
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Line
          </Button>
        </div>

        {/* Script preview */}
        <div className="bg-muted/30 border border-border rounded-xl p-4">
          <p className="text-xs font-semibold mb-2 flex items-center gap-2">
            <Mic className="w-3.5 h-3.5 text-primary" /> Regent Script Preview
          </p>
          <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
            {lyricsToScript(openSheet) || "Add some lyrics above…"}
          </pre>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Lyrics</h1>
          <p className="text-muted-foreground text-sm">Write, time, and export lyrics as avatar scripts or SRT captions.</p>
        </div>
        <Button onClick={() => setNewDialog(true)}>
          <Plus className="w-4 h-4 mr-2" /> New Lyrics
        </Button>
      </div>

      {sheets.length > 0 && (
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search lyrics…" className="pl-9 bg-card border-card-border" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {filtered.length === 0 && sheets.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
          <Music className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">No lyrics yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            Create your first lyric sheet. Paste in existing lyrics or write from scratch, then time-sync and export as SRT or Regent avatar scripts.
          </p>
          <Button onClick={() => setNewDialog(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create Lyric Sheet
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p>No lyrics match "{search}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => (
            <SheetCard key={s.id} sheet={s} onOpen={() => setOpenId(s.id)} onDelete={() => deleteSheet(s.id)} />
          ))}
        </div>
      )}

      {/* Features */}
      {sheets.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
          {[
            { icon: "📝", title: "Write & Edit", desc: "Create lyric sheets with line-by-line editing and director notes." },
            { icon: "⏱️", title: "Time-Sync", desc: "Add start/end timestamps to each line for SRT subtitle export." },
            { icon: "🎙️", title: "Avatar Scripts", desc: "Copy lyrics as a formatted script for Regent Director Suite or Magic Prompt." },
          ].map(c => (
            <div key={c.title} className="bg-card border border-card-border rounded-xl p-5 text-center">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-semibold mb-1">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* New sheet dialog */}
      <Dialog open={newDialog} onOpenChange={v => !v && setNewDialog(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>New Lyric Sheet</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2 col-span-2">
                <Label className="text-xs">Song Title *</Label>
                <Input value={newForm.title} onChange={e => setNewForm(f => ({ ...f, title: e.target.value }))} placeholder="My Song Title" autoFocus />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Artist</Label>
                <Input value={newForm.artist} onChange={e => setNewForm(f => ({ ...f, artist: e.target.value }))} placeholder="Artist name" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Genre</Label>
                <Input value={newForm.genre} onChange={e => setNewForm(f => ({ ...f, genre: e.target.value }))} placeholder="Hip-Hop, Pop…" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">BPM</Label>
                <Input type="number" value={newForm.bpm} onChange={e => setNewForm(f => ({ ...f, bpm: e.target.value }))} placeholder="120" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Key</Label>
                <Input value={newForm.key} onChange={e => setNewForm(f => ({ ...f, key: e.target.value }))} placeholder="A Minor" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Paste Existing Lyrics <span className="text-muted-foreground">(optional — one line per lyric)</span></Label>
              <Textarea
                value={importText}
                onChange={e => setImportText(e.target.value)}
                placeholder={"Verse 1:\nFirst line here\nSecond line here\n\nChorus:\nHook line goes here"}
                className="min-h-[120px] text-sm font-mono resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewDialog(false)}>Cancel</Button>
            <Button onClick={createSheet} disabled={!newForm.title.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
