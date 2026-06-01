import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { 
  Play, 
  Clock, 
  Trash2, 
  Download, 
  AlertCircle,
  Loader2,
} from "lucide-react";
import { 
  type Video,
  useGetVideo,
  getGetVideoQueryKey,
  useDeleteVideo,
  getListVideosQueryKey
} from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";

export function VideoCard({ video: initialVideo }: { video: Video }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const prevStatusRef = useRef(initialVideo.status);
  
  const isPolling = initialVideo.status === "pending" || initialVideo.status === "processing";

  const { data: videoData } = useGetVideo(initialVideo.id, {
    query: {
      enabled: isPolling,
      queryKey: getGetVideoQueryKey(initialVideo.id),
      refetchInterval: (query) => {
        const status = (query.state.data as Video | undefined)?.status;
        return status === "pending" || status === "processing" ? 3000 : false;
      },
      initialData: initialVideo
    }
  });

  const video = videoData || initialVideo;

  useEffect(() => {
    const prev = prevStatusRef.current;
    const current = video.status;
    if ((prev === "pending" || prev === "processing") && current !== prev) {
      queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() });
      prevStatusRef.current = current;
    } else {
      prevStatusRef.current = current;
    }
  }, [video.status, queryClient]);
  
  const deleteMutation = useDeleteVideo({
    mutation: {
      onSuccess: () => {
        toast({ title: "Video deleted" });
        queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() });
      },
      onError: () => {
        toast({ title: "Failed to delete video", variant: "destructive" });
      }
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { label: "Completed", color: "bg-green-500/10 text-green-500 border-green-500/20" };
      case "processing":
        return { label: "Processing", color: "bg-primary/10 text-primary border-primary/20" };
      case "pending":
        return { label: "Pending", color: "bg-muted text-muted-foreground border-border" };
      case "failed":
        return { label: "Failed", color: "bg-destructive/10 text-destructive border-destructive/20" };
      default:
        return { label: status, color: "" };
    }
  };

  const statusConfig = getStatusConfig(video.status);

  return (
    <div className="group bg-card border border-card-border rounded-xl overflow-hidden flex flex-col hover:border-primary/50 transition-colors shadow-sm hover:shadow-md">
      <div className="aspect-video bg-muted relative overflow-hidden flex items-center justify-center">
        {video.thumbnail_url ? (
          <img 
            src={video.thumbnail_url} 
            alt={video.title || "Video thumbnail"} 
            className="w-full h-full object-cover"
          />
        ) : video.status === "failed" ? (
          <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
            <AlertCircle className="w-8 h-8 text-destructive/50" />
            <span className="text-sm">Generation Failed</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-primary gap-3">
            <Loader2 className="w-8 h-8 animate-spin opacity-50" />
            <span className="text-xs font-medium uppercase tracking-wider">{video.status}…</span>
          </div>
        )}

        {video.video_url && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full w-14 h-14 shadow-lg"
              asChild
            >
              <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                <Play className="w-6 h-6 ml-1" />
              </a>
            </Button>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <Badge variant="outline" className={`${statusConfig.color} font-medium backdrop-blur-md`}>
            {statusConfig.label}
          </Badge>
        </div>

        {video.duration != null && (
          <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded font-medium flex items-center gap-1 backdrop-blur-md">
            <Clock className="w-3 h-3" />
            {Math.round(video.duration)}s
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-semibold text-base line-clamp-1" title={video.title || "Untitled Production"}>
            {video.title || "Untitled Production"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {video.created_at
              ? format(new Date(video.created_at * 1000), "MMM d, yyyy • h:mm a")
              : "Just now"}
          </p>
        </div>

        {video.error && (
          <div className="bg-destructive/10 text-destructive text-xs p-2 rounded-md border border-destructive/20 line-clamp-2">
            {video.error}
          </div>
        )}

        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border">
          {video.video_url && (
            <Button size="sm" variant="ghost" className="flex-1 text-xs" asChild>
              <a href={video.video_url} download>
                <Download className="w-3 h-3 mr-2" />
                Download
              </a>
            </Button>
          )}
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 ml-auto px-2"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Production?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the generated video.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => deleteMutation.mutate({ videoId: video.id })}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
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
