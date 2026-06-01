import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import {
  MousePointer2, Type, Square, Image as ImageIcon, Trash2,
  Download, Copy, ChevronUp, ChevronDown, Eye, EyeOff, Lock,
  Unlock, Plus, Grid, Palette, AlignCenter, AlignLeft, AlignRight,
  Layers, ZoomIn, ZoomOut, RotateCcw,
} from "lucide-react";

type ToolType = "select" | "text" | "rect" | "image";
type ElementType = "text" | "rect" | "image";

interface CanvasEl {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  // text
  text?: string;
  fontSize?: number;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right";
  color?: string;
  // rect
  backgroundColor?: string;
  borderColor?: string;
  borderRadius?: number;
  // image
  src?: string;
  objectFit?: "cover" | "contain";
  // common
  opacity: number;
  locked: boolean;
  visible: boolean;
  zIndex: number;
  label?: string;
}

const DEFAULT_CANVAS = { width: 1920, height: 1080 };

const CANVAS_PRESETS = [
  { label: "16:9 (1920×1080)", w: 1920, h: 1080 },
  { label: "9:16 (1080×1920)", w: 1080, h: 1920 },
  { label: "1:1 (1080×1080)", w: 1080, h: 1080 },
  { label: "4:3 (1440×1080)", w: 1440, h: 1080 },
  { label: "Twitter Banner (1500×500)", w: 1500, h: 500 },
  { label: "YouTube Thumbnail (1280×720)", w: 1280, h: 720 },
];

function uid() { return crypto.randomUUID(); }

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)); }

function ElementRenderer({ el, scale, selected, onSelect }: {
  el: CanvasEl;
  scale: number;
  selected: boolean;
  onSelect: () => void;
}) {
  if (!el.visible) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    left: el.x * scale,
    top: el.y * scale,
    width: el.width * scale,
    height: el.height * scale,
    opacity: el.opacity / 100,
    zIndex: el.zIndex,
    outline: selected ? "2px solid #6366f1" : "none",
    outlineOffset: "1px",
    cursor: el.locked ? "default" : "move",
    userSelect: "none",
    borderRadius: el.type === "rect" ? (el.borderRadius ?? 0) * scale : undefined,
    overflow: "hidden",
  };

  if (el.type === "rect") {
    return (
      <div
        style={{ ...style, backgroundColor: el.backgroundColor ?? "#6366f1", border: el.borderColor ? `2px solid ${el.borderColor}` : undefined }}
        onMouseDown={e => { e.stopPropagation(); onSelect(); }}
      />
    );
  }

  if (el.type === "text") {
    return (
      <div
        style={{
          ...style,
          color: el.color ?? "#ffffff",
          fontSize: (el.fontSize ?? 32) * scale,
          fontWeight: el.fontWeight ?? "bold",
          textAlign: el.textAlign ?? "center",
          display: "flex",
          alignItems: "center",
          justifyContent: el.textAlign === "left" ? "flex-start" : el.textAlign === "right" ? "flex-end" : "center",
          wordBreak: "break-word",
          lineHeight: 1.25,
          padding: 4 * scale,
        }}
        onMouseDown={e => { e.stopPropagation(); onSelect(); }}
      >
        {el.text || "Text"}
      </div>
    );
  }

  if (el.type === "image" && el.src) {
    return (
      <div style={style} onMouseDown={e => { e.stopPropagation(); onSelect(); }}>
        <img
          src={el.src}
          alt={el.label ?? "image"}
          style={{ width: "100%", height: "100%", objectFit: el.objectFit ?? "cover", display: "block" }}
          draggable={false}
        />
      </div>
    );
  }

  return (
    <div
      style={{ ...style, background: "#333", display: "flex", alignItems: "center", justifyContent: "center", color: "#666", fontSize: 12 * scale }}
      onMouseDown={e => { e.stopPropagation(); onSelect(); }}
    >
      Image
    </div>
  );
}

export function Canvas() {
  const { toast } = useToast();
  const [elements, setElements] = useState<CanvasEl[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [tool, setTool] = useState<ToolType>("select");
  const [canvasSize, setCanvasSize] = useState(DEFAULT_CANVAS);
  const [bgColor, setBgColor] = useState("#1a1a2e");
  const [showGrid, setShowGrid] = useState(false);
  const [zoom, setZoom] = useState(40); // % of original
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, elX: 0, elY: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, elW: 0, elH: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  const scale = zoom / 100;
  const selected = elements.find(e => e.id === selectedId) ?? null;

  const updateEl = useCallback((id: string, patch: Partial<CanvasEl>) => {
    setElements(prev => prev.map(e => e.id === id ? { ...e, ...patch } : e));
  }, []);

  const addElement = useCallback((type: ElementType, extra: Partial<CanvasEl> = {}) => {
    const maxZ = elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
    const base: CanvasEl = {
      id: uid(),
      type,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 100,
      width: type === "text" ? 400 : 300,
      height: type === "text" ? 80 : 200,
      opacity: 100,
      locked: false,
      visible: true,
      zIndex: maxZ + 1,
      ...extra,
    };
    if (type === "text") {
      base.text = "Your Text";
      base.fontSize = 48;
      base.fontWeight = "bold";
      base.textAlign = "center";
      base.color = "#ffffff";
    } else if (type === "rect") {
      base.backgroundColor = "#6366f1";
      base.borderRadius = 8;
    }
    setElements(prev => [...prev, base]);
    setSelectedId(base.id);
    setTool("select");
    return base;
  }, [elements]);

  // Mouse drag for moving elements
  const handleElMouseDown = useCallback((e: React.MouseEvent, id: string) => {
    if (tool !== "select") return;
    const el = elements.find(x => x.id === id);
    if (!el || el.locked) return;
    setSelectedId(id);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, elX: el.x, elY: el.y });
    e.preventDefault();
  }, [elements, tool]);

  useEffect(() => {
    if (!isDragging) return;
    const move = (e: MouseEvent) => {
      if (!selectedId) return;
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      updateEl(selectedId, {
        x: Math.round(clamp(dragStart.elX + dx, 0, canvasSize.width)),
        y: Math.round(clamp(dragStart.elY + dy, 0, canvasSize.height)),
      });
    };
    const up = () => setIsDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [isDragging, dragStart, selectedId, scale, canvasSize]);

  // Resize (bottom-right handle)
  useEffect(() => {
    if (!isResizing) return;
    const move = (e: MouseEvent) => {
      if (!selectedId) return;
      const dx = (e.clientX - resizeStart.x) / scale;
      const dy = (e.clientY - resizeStart.y) / scale;
      updateEl(selectedId, {
        width: Math.round(Math.max(40, resizeStart.elW + dx)),
        height: Math.round(Math.max(24, resizeStart.elH + dy)),
      });
    };
    const up = () => setIsResizing(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
  }, [isResizing, resizeStart, selectedId, scale]);

  const handleCanvasClick = () => {
    if (tool === "text") {
      addElement("text");
    } else if (tool === "rect") {
      addElement("rect");
    } else {
      setSelectedId(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      addElement("image", { src: reader.result as string, width: 500, height: 350, label: file.name });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements(prev => prev.filter(e => e.id !== selectedId));
    setSelectedId(null);
  };

  const reorder = (id: string, dir: "up" | "down") => {
    setElements(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex);
      const idx = sorted.findIndex(e => e.id === id);
      if (dir === "up" && idx < sorted.length - 1) {
        const tmp = sorted[idx].zIndex;
        sorted[idx] = { ...sorted[idx], zIndex: sorted[idx + 1].zIndex };
        sorted[idx + 1] = { ...sorted[idx + 1], zIndex: tmp };
      } else if (dir === "down" && idx > 0) {
        const tmp = sorted[idx].zIndex;
        sorted[idx] = { ...sorted[idx], zIndex: sorted[idx - 1].zIndex };
        sorted[idx - 1] = { ...sorted[idx - 1], zIndex: tmp };
      }
      return sorted;
    });
  };

  const exportPNG = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const sorted = [...elements].filter(e => e.visible).sort((a, b) => a.zIndex - b.zIndex);
    for (const el of sorted) {
      ctx.save();
      ctx.globalAlpha = el.opacity / 100;
      if (el.type === "rect") {
        ctx.fillStyle = el.backgroundColor ?? "#6366f1";
        const r = el.borderRadius ?? 0;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, r);
        ctx.fill();
        if (el.borderColor) {
          ctx.strokeStyle = el.borderColor;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      } else if (el.type === "text") {
        ctx.fillStyle = el.color ?? "#ffffff";
        const fSize = el.fontSize ?? 48;
        ctx.font = `${el.fontWeight ?? "bold"} ${fSize}px sans-serif`;
        ctx.textAlign = el.textAlign ?? "center";
        ctx.textBaseline = "middle";
        const cx = el.textAlign === "left" ? el.x + 8 : el.textAlign === "right" ? el.x + el.width - 8 : el.x + el.width / 2;
        const lines = (el.text ?? "").split("\n");
        lines.forEach((line, i) => {
          ctx.fillText(line, cx, el.y + el.height / 2 + (i - lines.length / 2 + 0.5) * fSize * 1.25);
        });
      } else if (el.type === "image" && el.src) {
        await new Promise<void>(res => {
          const img = new Image();
          img.onload = () => {
            if (el.objectFit === "contain") {
              const scale = Math.min(el.width / img.naturalWidth, el.height / img.naturalHeight);
              const w = img.naturalWidth * scale;
              const h = img.naturalHeight * scale;
              ctx.drawImage(img, el.x + (el.width - w) / 2, el.y + (el.height - h) / 2, w, h);
            } else {
              ctx.drawImage(img, el.x, el.y, el.width, el.height);
            }
            res();
          };
          img.onerror = () => res();
          img.src = el.src!;
        });
      }
      ctx.restore();
    }
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas-export.png";
    a.click();
    toast({ title: "Canvas exported as PNG" });
  }, [elements, canvasSize, bgColor, toast]);

  const sortedEls = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex h-full bg-background overflow-hidden">
      {/* Left toolbar */}
      <div className="w-14 border-r border-border bg-card flex flex-col items-center py-4 gap-2 flex-shrink-0">
        {([
          ["select", MousePointer2, "Select (V)"],
          ["text", Type, "Text (T)"],
          ["rect", Square, "Rectangle (R)"],
        ] as [ToolType, React.ElementType, string][]).map(([t, Icon, label]) => (
          <Button
            key={t}
            size="icon"
            variant={tool === t ? "default" : "ghost"}
            className="w-10 h-10"
            title={label}
            onClick={() => setTool(t)}
          >
            <Icon className="w-4 h-4" />
          </Button>
        ))}
        <Button
          size="icon"
          variant="ghost"
          className="w-10 h-10"
          title="Add Image"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="w-4 h-4" />
        </Button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

        <div className="mt-auto flex flex-col gap-2">
          <Button size="icon" variant="ghost" className="w-10 h-10" title="Toggle Grid" onClick={() => setShowGrid(g => !g)}>
            <Grid className="w-4 h-4" className={showGrid ? "text-primary" : ""} />
          </Button>
          <Button size="icon" variant="ghost" className="w-10 h-10" title="Export PNG" onClick={exportPNG}>
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 overflow-auto bg-[#0a0c10] relative flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3 py-1.5 text-xs text-muted-foreground mb-2">
            <button onClick={() => setZoom(z => Math.max(10, z - 10))}><ZoomOut className="w-3.5 h-3.5" /></button>
            <span className="w-10 text-center font-mono">{zoom}%</span>
            <button onClick={() => setZoom(z => Math.min(150, z + 10))}><ZoomIn className="w-3.5 h-3.5" /></button>
            <button onClick={() => setZoom(40)} className="ml-1 hover:text-foreground transition-colors"><RotateCcw className="w-3 h-3" /></button>
          </div>

          {/* Canvas */}
          <div
            ref={containerRef}
            className="relative overflow-hidden flex-shrink-0 shadow-2xl"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              backgroundColor: bgColor,
              backgroundImage: showGrid
                ? `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`
                : "none",
              backgroundSize: showGrid ? `${40 * scale}px ${40 * scale}px` : undefined,
              cursor: tool === "select" ? "default" : "crosshair",
            }}
            onClick={handleCanvasClick}
          >
            {elements.map(el => (
              <div
                key={el.id}
                style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%" }}
                onMouseDown={e => handleElMouseDown(e, el.id)}
              >
                <ElementRenderer
                  el={el}
                  scale={scale}
                  selected={selectedId === el.id}
                  onSelect={() => setSelectedId(el.id)}
                />
                {/* Resize handle */}
                {selectedId === el.id && !el.locked && (
                  <div
                    style={{
                      position: "absolute",
                      left: (el.x + el.width) * scale - 5,
                      top: (el.y + el.height) * scale - 5,
                      width: 10,
                      height: 10,
                      background: "#6366f1",
                      border: "2px solid white",
                      borderRadius: 2,
                      cursor: "se-resize",
                      zIndex: el.zIndex + 1000,
                    }}
                    onMouseDown={e => {
                      e.stopPropagation();
                      setIsResizing(true);
                      setResizeStart({ x: e.clientX, y: e.clientY, elW: el.width, elH: el.height });
                    }}
                  />
                )}
              </div>
            ))}

            {elements.length === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/30 gap-3">
                <Layers className="w-12 h-12" />
                <div className="text-sm text-center">
                  <p>Click a tool on the left to add elements</p>
                  <p className="text-xs mt-1">T = Text · R = Rectangle · 🖼 = Image</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-[10px] text-muted-foreground/40 font-mono">
            {canvasSize.width} × {canvasSize.height} px
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div className="w-64 border-l border-border bg-card flex flex-col overflow-hidden flex-shrink-0">
        {/* Tabs: Properties / Layers */}
        <div className="flex border-b border-border">
          <button className="flex-1 px-3 py-2.5 text-xs font-medium text-primary border-b-2 border-primary">Properties</button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Canvas settings */}
          <div className="p-3 border-b border-border">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Canvas</p>
            <div className="space-y-2">
              <div className="space-y-1">
                <Label className="text-xs">Size Preset</Label>
                <select
                  className="w-full text-xs bg-background border border-input rounded px-2 py-1.5 text-foreground"
                  onChange={e => {
                    const p = CANVAS_PRESETS[Number(e.target.value)];
                    if (p) setCanvasSize({ width: p.w, height: p.h });
                  }}
                >
                  {CANVAS_PRESETS.map((p, i) => <option key={i} value={i}>{p.label}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs flex-1">Background</Label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={e => setBgColor(e.target.value)}
                  className="w-8 h-7 rounded border border-input cursor-pointer bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* Element properties */}
          {selected ? (
            <div className="p-3 space-y-3">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Element</p>

              <div className="grid grid-cols-2 gap-2">
                {[["X", "x"], ["Y", "y"], ["W", "width"], ["H", "height"]].map(([label, key]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">{label}</Label>
                    <Input
                      type="number"
                      value={Math.round(selected[key as keyof CanvasEl] as number)}
                      onChange={e => updateEl(selected.id, { [key]: Number(e.target.value) })}
                      className="h-7 text-xs px-2"
                      disabled={selected.locked}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Opacity: {selected.opacity}%</Label>
                <Slider
                  value={[selected.opacity]}
                  onValueChange={([v]) => updateEl(selected.id, { opacity: v })}
                  min={0} max={100} step={1}
                  disabled={selected.locked}
                />
              </div>

              {selected.type === "text" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-xs">Text</Label>
                    <textarea
                      value={selected.text ?? ""}
                      onChange={e => updateEl(selected.id, { text: e.target.value })}
                      className="w-full text-xs bg-background border border-input rounded px-2 py-1.5 text-foreground resize-none min-h-[60px] outline-none focus:border-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Font Size</Label>
                      <Input
                        type="number"
                        value={selected.fontSize ?? 48}
                        onChange={e => updateEl(selected.id, { fontSize: Number(e.target.value) })}
                        className="h-7 text-xs px-2"
                        min={8} max={400}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">Color</Label>
                      <input type="color" value={selected.color ?? "#ffffff"}
                        onChange={e => updateEl(selected.id, { color: e.target.value })}
                        className="w-full h-7 rounded border border-input cursor-pointer bg-transparent" />
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {(["left", "center", "right"] as const).map(a => (
                      <Button key={a} size="icon" variant={selected.textAlign === a ? "default" : "ghost"} className="w-8 h-7"
                        onClick={() => updateEl(selected.id, { textAlign: a })}>
                        {a === "left" ? <AlignLeft className="w-3.5 h-3.5" /> : a === "center" ? <AlignCenter className="w-3.5 h-3.5" /> : <AlignRight className="w-3.5 h-3.5" />}
                      </Button>
                    ))}
                  </div>
                </>
              )}

              {selected.type === "rect" && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Fill</Label>
                    <input type="color" value={selected.backgroundColor ?? "#6366f1"}
                      onChange={e => updateEl(selected.id, { backgroundColor: e.target.value })}
                      className="w-full h-7 rounded border border-input cursor-pointer bg-transparent" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">Radius</Label>
                    <Input type="number" value={selected.borderRadius ?? 0}
                      onChange={e => updateEl(selected.id, { borderRadius: Number(e.target.value) })}
                      className="h-7 text-xs px-2" min={0} max={200} />
                  </div>
                </div>
              )}

              {selected.type === "image" && (
                <div className="space-y-1">
                  <Label className="text-xs">Object Fit</Label>
                  <select
                    value={selected.objectFit ?? "cover"}
                    onChange={e => updateEl(selected.id, { objectFit: e.target.value as "cover" | "contain" })}
                    className="w-full text-xs bg-background border border-input rounded px-2 py-1.5 text-foreground"
                  >
                    <option value="cover">Cover</option>
                    <option value="contain">Contain</option>
                  </select>
                </div>
              )}

              <div className="flex gap-1 pt-1 border-t border-border flex-wrap">
                <Button size="icon" variant="ghost" className="w-8 h-7" title="Move up" onClick={() => reorder(selected.id, "up")}><ChevronUp className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="w-8 h-7" title="Move down" onClick={() => reorder(selected.id, "down")}><ChevronDown className="w-3.5 h-3.5" /></Button>
                <Button size="icon" variant="ghost" className="w-8 h-7" title={selected.visible ? "Hide" : "Show"} onClick={() => updateEl(selected.id, { visible: !selected.visible })}>
                  {selected.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="w-8 h-7" title={selected.locked ? "Unlock" : "Lock"} onClick={() => updateEl(selected.id, { locked: !selected.locked })}>
                  {selected.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </Button>
                <Button size="icon" variant="ghost" className="w-8 h-7 text-destructive hover:text-destructive ml-auto" onClick={deleteSelected}>
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 text-xs text-muted-foreground text-center py-8">
              Select an element to edit its properties
            </div>
          )}

          {/* Layers list */}
          {elements.length > 0 && (
            <div className="border-t border-border">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 py-2">Layers ({elements.length})</p>
              <div className="flex flex-col">
                {sortedEls.map(el => (
                  <button
                    key={el.id}
                    onClick={() => setSelectedId(el.id)}
                    className={`flex items-center gap-2 px-3 py-2 text-xs transition-colors ${
                      selectedId === el.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    {el.type === "text" ? <Type className="w-3 h-3 flex-shrink-0" /> :
                      el.type === "image" ? <ImageIcon className="w-3 h-3 flex-shrink-0" /> :
                      <Square className="w-3 h-3 flex-shrink-0" />}
                    <span className="truncate flex-1 text-left">
                      {el.type === "text" ? (el.text?.slice(0, 20) || "Text") : el.label || el.type}
                    </span>
                    {!el.visible && <EyeOff className="w-3 h-3 text-muted-foreground/40" />}
                    {el.locked && <Lock className="w-3 h-3 text-muted-foreground/40" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="border-t border-border p-3 flex gap-2">
          <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={exportPNG}>
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export PNG
          </Button>
          <Button size="sm" variant="ghost" className="text-xs h-8 text-destructive hover:text-destructive px-2"
            onClick={() => { setElements([]); setSelectedId(null); }}>
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
}
