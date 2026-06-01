import { useState } from "react";
import { 
  useListVideos, 
  getListVideosQueryKey,
  useGetCredits,
  getGetCreditsQueryKey,
  useListAvatarLooks,
  getListAvatarLooksQueryKey,
  useListVoices,
  getListVoicesQueryKey,
  useCreateVideo,
  VideoInputOrientation
} from "@workspace/api-client-react";
import { Link, useLocation } from "wouter";
import { Clapperboard, Wand2, ArrowRight, Video, Play, Loader2, RefreshCw } from "lucide-react";
import { VideoCard } from "@/components/VideoCard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQueryClient } from "@tanstack/react-query";

export function Dashboard() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [avatarId, setAvatarId] = useState<string>("");
  const [voiceId, setVoiceId] = useState<string>("");
  const [script, setScript] = useState("");
  const [orientation, setOrientation] = useState<VideoInputOrientation>("landscape");

  const { data: videosData, isLoading } = useListVideos({ limit: 4 }, {
    query: {
      queryKey: getListVideosQueryKey({ limit: 4 })
    }
  });

  const { data: credits, isRefetching: isRefetchingCredits, refetch: refetchCredits } = useGetCredits({
    query: {
      queryKey: getGetCreditsQueryKey()
    }
  });

  const { data: avatarsData } = useListAvatarLooks({ limit: 20 }, {
    query: { queryKey: getListAvatarLooksQueryKey({ limit: 20 }) }
  });

  const { data: voicesData } = useListVoices({ limit: 20 }, {
    query: { queryKey: getListVoicesQueryKey({ limit: 20 }) }
  });

  const createVideoMutation = useCreateVideo({
    mutation: {
      onSuccess: () => {
        toast({ title: "Production started", description: "Your video is being generated." });
        setScript("");
        queryClient.invalidateQueries({ queryKey: getListVideosQueryKey() });
        setLocation("/videos");
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast({ title: "Failed to create video", description: message, variant: "destructive" });
      }
    }
  });

  const handleQuickGenerate = (): void => {
    if (!avatarId) { toast({ title: "Select an avatar", variant: "destructive" }); return; }
    if (!voiceId) { toast({ title: "Select a voice", variant: "destructive" }); return; }
    if (!script.trim()) { toast({ title: "Write a script", variant: "destructive" }); return; }

    createVideoMutation.mutate({
      data: {
        avatar_id: avatarId,
        voice_id: voiceId,
        script: script.trim(),
        orientation
      }
    });
  };

  const videos = videosData?.videos || [];
  const avatars = avatarsData?.avatars || [];
  const voices = voicesData?.voices || [];

  return (
    <div className="max-w-6xl mx-auto p-8 flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight">Welcome to the Studio.</h1>
        <p className="text-muted-foreground text-lg">Ready to direct your next production?</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/create" className="group">
            <div className="h-full bg-card hover:bg-card/80 border border-card-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 flex flex-col justify-between">
              <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Clapperboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  Director Suite
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                </h3>
                <p className="text-muted-foreground text-sm">Full control. Pick an avatar, a voice, and compose your script precisely.</p>
              </div>
            </div>
          </Link>
          
          <Link href="/create/prompt" className="group">
            <div className="h-full bg-card hover:bg-card/80 border border-card-border rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-accent/5 hover:border-accent/30 flex flex-col justify-between">
              <div className="bg-accent/10 text-accent w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wand2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  Magic Prompt
                  <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-accent" />
                </h3>
                <p className="text-muted-foreground text-sm">Describe your vision and let AI automatically cast the avatar and write the script.</p>
              </div>
            </div>
          </Link>
        </div>

        <div className="lg:col-span-1 bg-card border border-card-border rounded-xl p-6 flex flex-col justify-center items-center text-center gap-4">
          <div className="w-20 h-20 rounded-full border-4 border-primary/20 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-20"></div>
            <span className="text-3xl font-bold text-primary">{credits?.remaining_credits ?? "—"}</span>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Available Credits</h3>
            <p className="text-sm text-muted-foreground">Each video generation consumes credits.</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground"
            onClick={() => refetchCredits()}
            disabled={isRefetchingCredits}
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${isRefetchingCredits ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Quick Generate Form */}
      <div className="bg-card border border-card-border rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-primary" /> Quick Generate
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select value={avatarId} onValueChange={setAvatarId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Avatar" />
            </SelectTrigger>
            <SelectContent>
              {avatars.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.name || "Unnamed Avatar"}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={voiceId} onValueChange={setVoiceId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Voice" />
            </SelectTrigger>
            <SelectContent>
              {voices.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name || "Unnamed Voice"} ({v.language})</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={orientation} onValueChange={v => setOrientation(v as VideoInputOrientation)}>
            <SelectTrigger>
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="landscape">Landscape (16:9)</SelectItem>
              <SelectItem value="portrait">Portrait (9:16)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-4">
          <Textarea 
            placeholder="Type a quick script here..." 
            className="flex-1 bg-background resize-none"
            value={script}
            onChange={(e) => setScript(e.target.value)}
            rows={2}
          />
          <Button 
            className="h-auto px-6 whitespace-nowrap" 
            onClick={handleQuickGenerate}
            disabled={createVideoMutation.isPending || !avatarId || !voiceId || !script.trim()}
          >
            {createVideoMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              "Generate"
            )}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Recent Productions</h2>
          <Link href="/videos" className="text-sm text-primary hover:underline font-medium">View Library</Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="aspect-video bg-muted animate-pulse rounded-lg border border-border" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="border border-dashed border-border rounded-xl p-12 text-center flex flex-col items-center justify-center gap-4">
            <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="text-lg font-medium">No productions yet</p>
              <p className="text-sm text-muted-foreground">Your recent videos will appear here.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {videos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
