import { useState } from "react";
import { useLocation } from "wouter";
import { useCreations, type Creation } from "@/hooks/useCreations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import {
  ImageIcon,
  Video,
  Download,
  ExternalLink,
  Trash2,
  Loader2,
  AlertCircle,
  Search,
  Layers,
  Plus,
} from "lucide-react";

function CreationCard({ creation, onDelete }: { creation: Creation; onDelete: () => void }) {
  const isRunning = creation.status === "pending" || creation.status === "in_progress";
  const isImage = creation.type === "image";
  const firstUrl = creation.output_urls[0];

  const statusColor: Record<string, string> = {
    pending: "bg-muted text-muted-foreground border-border",
    in_progress: "bg-primary/10 text-primary border-primary/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    failed: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <div className="group bg-card border border-card-border rounded-xl overflow-hidden flex flex-col hover:border-primary/40 transition-colors shadow-sm hover:shadow-md">
      {/* Preview */}
      <div className="aspect-video bg-muted relative overflow-hidden flex items-center justify-center">
        {firstUrl && isImage ? (
          <img src={firstUrl} alt={creation.prompt} className="w-full h-full object-cover" />
        ) : firstUrl && !isImage ? (
          <video src={firstUrl} className="w-full h-full object-cover" muted />
        ) : isRunning ? (
          <div className="flex flex-col items-center gap-2 text-primary">
            <Loader2 className="w-8 h-8 animate-spin opacity-60" />
            <span className="text-xs font-medium uppercase tracking-wider capitalize">{creation.status}…</span>
          </div>
        ) : creation.status === "failed" ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-8 h-8 text-destructive/50" />
            <span className="text-xs">Failed</span>
          </div>
        ) : (
          <div className="text-muted-foreground opacity-20">
            {isImage ? <ImageIcon className="w-10 h-10" /> : <Video className="w-10 h-10" />}
          </div>
        )}

        {/* Hover overlay */}
        {firstUrl && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="icon" variant="secondary" className="rounded-full h-10 w-10" asChild>
              <a href={firstUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-4 h-4" /></a>
            </Button>
            <Button size="icon" variant="secondary" className="rounded-full h-10 w-10" asChild>
              <a href={firstUrl} download><Download className="w-4 h-4" /></a>
            </Button>
          </div>
        )}

        {/* Status badge */}
        <div className="absolute top-2 left-2">
          <Badge variant="outline" className={`${statusColor[creation.status]} text-[10px] backdrop-blur-md capitalize`}>
            {creation.status.replace("_", " ")}
          </Badge>
        </div>

        {/* Type badge */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-black/50 border-white/20 text-white text-[10px] backdrop-blur-md">
            {isImage ? <ImageIcon className="w-2.5 h-2.5 mr-1" /> : <Video className="w-2.5 h-2.5 mr-1" />}
            {creation.type}
          </Badge>
        </div>

        {/* Multiple images count */}
        {creation.output_urls.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded backdrop-blur-md">
            1/{creation.output_urls.length}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-xs font-semibold text-primary mb-0.5">{creation.model_name}</p>
          <p className="text-sm line-clamp-2 text-muted-foreground" title={creation.prompt}>{creation.prompt}</p>
        </div>
        <p className="text-xs text-muted-foreground/60 mt-auto">
          {format(new Date(creation.created_at), "MMM d, yyyy · h:mm a")}
        </p>

        {creation.error && (
          <p className="text-xs text-destructive bg-destructive/10 p-2 rounded-md line-clamp-2">{creation.error}</p>
        )}

        <div className="pt-2 border-t border-border flex items-center gap-2">
          {firstUrl && (
            <Button size="sm" variant="ghost" className="flex-1 text-xs" asChild>
              <a href={firstUrl} download>
                <Download className="w-3 h-3 mr-1.5" /> Download
              </a>
            </Button>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="ml-auto px-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Creation?</AlertDialogTitle>
                <AlertDialogDescription>This removes it from your local history only.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export function Creations() {
  const [, setLocation] = useLocation();
  const { creations, remove, clear } = useCreations();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"all" | "image" | "video">("all");

  const filtered = creations
    .filter(c => tab === "all" || c.type === tab)
    .filter(c =>
      !search.trim() ||
      c.prompt.toLowerCase().includes(search.toLowerCase()) ||
      c.model_name.toLowerCase().includes(search.toLowerCase())
    );

  const imageCount = creations.filter(c => c.type === "image").length;
  const videoCount = creations.filter(c => c.type === "video").length;

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">My Creations</h1>
          <p className="text-muted-foreground">
            {creations.length === 0
              ? "Your generated images and videos will appear here."
              : `${imageCount} image${imageCount !== 1 ? "s" : ""} · ${videoCount} video${videoCount !== 1 ? "s" : ""}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setLocation("/models")} size="sm" className="gap-2">
            <Plus className="w-4 h-4" /> New Generation
          </Button>
          {creations.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-muted-foreground">Clear All</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear All Creations?</AlertDialogTitle>
                  <AlertDialogDescription>This will remove all {creations.length} creations from your local history.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={clear} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {creations.length > 0 && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Tabs value={tab} onValueChange={v => setTab(v as typeof tab)}>
            <TabsList className="bg-muted">
              <TabsTrigger value="all">All ({creations.length})</TabsTrigger>
              <TabsTrigger value="image"><ImageIcon className="w-3.5 h-3.5 mr-1.5" />Images ({imageCount})</TabsTrigger>
              <TabsTrigger value="video"><Video className="w-3.5 h-3.5 mr-1.5" />Videos ({videoCount})</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="relative w-full sm:w-64 sm:ml-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by prompt or model..."
              className="pl-9 bg-card border-card-border"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {creations.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 text-center border-2 border-dashed border-border rounded-xl p-16 bg-card/50">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center text-primary">
            <Layers className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-xl font-bold mb-2">No creations yet</h2>
            <p className="text-muted-foreground max-w-sm">
              Head to the Model Hub to generate your first image or video with Kling, Seedream, Seedance, and more.
            </p>
          </div>
          <Button onClick={() => setLocation("/models")}>
            <Plus className="w-4 h-4 mr-2" /> Go to Model Hub
          </Button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Search className="w-10 h-10 text-muted-foreground/30" />
          <p className="font-medium">No results for "{search}"</p>
          <Button variant="ghost" size="sm" onClick={() => setSearch("")}>Clear search</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
          {filtered.map(c => (
            <CreationCard key={c.id} creation={c} onDelete={() => remove(c.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
