import { useState } from "react";
import { useLocation } from "wouter";
import { ALL_MODELS, IMAGE_MODELS, VIDEO_MODELS, type Model } from "@/lib/models";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ImageIcon, Video, Zap, Star } from "lucide-react";

function ModelCard({ model, onClick }: { model: Model; onClick: () => void }) {
  const badgeColors: Record<string, string> = {
    TOP: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    NEW: "bg-green-500/20 text-green-400 border-green-500/30",
    FAST: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    PRO: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };

  return (
    <button
      onClick={onClick}
      className="group text-left bg-card border border-card-border rounded-xl p-5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200 flex flex-col gap-3"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
            style={{ backgroundColor: model.providerColor + "30", color: model.providerColor }}
          >
            {model.category === "image" ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </div>
          <span className="text-xs text-muted-foreground truncate" style={{ color: model.providerColor }}>
            {model.provider}
          </span>
        </div>
        {model.badge && (
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${badgeColors[model.badge] ?? ""}`}>
            {model.badge === "FAST" && <Zap className="w-2.5 h-2.5 mr-0.5" />}
            {model.badge === "TOP" && <Star className="w-2.5 h-2.5 mr-0.5" />}
            {model.badge}
          </Badge>
        )}
      </div>

      <div>
        <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{model.name}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{model.description}</p>
      </div>

      <div className="mt-auto pt-2 border-t border-border">
        <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Generate →
        </span>
      </div>
    </button>
  );
}

export function ModelHub() {
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "image" | "video">("all");

  const base = tab === "all" ? ALL_MODELS : tab === "image" ? IMAGE_MODELS : VIDEO_MODELS;
  const filtered = search.trim()
    ? base.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.provider.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase())
      )
    : base;

  const handleSelect = (model: Model) => {
    setLocation(`/generate/${encodeURIComponent(model.id)}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Model Hub</h1>
        <p className="text-muted-foreground">
          {IMAGE_MODELS.length} image models · {VIDEO_MODELS.length} video models — powered by fal.ai
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All ({ALL_MODELS.length})</TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="w-3.5 h-3.5 mr-1.5" />
              Image ({IMAGE_MODELS.length})
            </TabsTrigger>
            <TabsTrigger value="video">
              <Video className="w-3.5 h-3.5 mr-1.5" />
              Video ({VIDEO_MODELS.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative w-full sm:w-72 sm:ml-auto">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search models..."
            className="pl-9 bg-card border-card-border"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
          <Search className="w-10 h-10 text-muted-foreground/30" />
          <p className="font-medium">No models match "{search}"</p>
          <button className="text-sm text-primary hover:underline" onClick={() => setSearch("")}>Clear search</button>
        </div>
      ) : (
        <>
          {(tab === "all" || tab === "video") && (
            <div className="flex flex-col gap-4">
              {tab === "all" && <h2 className="text-lg font-semibold flex items-center gap-2"><Video className="w-4 h-4 text-primary" /> Video Models</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(tab === "all" ? VIDEO_MODELS : filtered).filter(m => m.category === "video").map(model => (
                  <ModelCard key={model.id} model={model} onClick={() => handleSelect(model)} />
                ))}
              </div>
            </div>
          )}

          {(tab === "all" || tab === "image") && (
            <div className="flex flex-col gap-4">
              {tab === "all" && <h2 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="w-4 h-4 text-accent" /> Image Models</h2>}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(tab === "all" ? IMAGE_MODELS : filtered).filter(m => m.category === "image").map(model => (
                  <ModelCard key={model.id} model={model} onClick={() => handleSelect(model)} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
