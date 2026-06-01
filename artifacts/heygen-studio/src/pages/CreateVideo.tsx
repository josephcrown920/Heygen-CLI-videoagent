import { useState, useRef, useMemo } from "react";
import { useLocation } from "wouter";
import { 
  useListAvatarLooks, 
  getListAvatarLooksQueryKey,
  useListVoices,
  getListVoicesQueryKey,
  useCreateVideo,
  VideoInputOrientation
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Play, Volume2, Clapperboard, Loader2, Image as ImageIcon, Search } from "lucide-react";

export function CreateVideo() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [script, setScript] = useState("");
  const [title, setTitle] = useState("");
  const [orientation, setOrientation] = useState<VideoInputOrientation>("landscape");
  const [avatarSearch, setAvatarSearch] = useState("");
  const [voiceSearch, setVoiceSearch] = useState("");
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  const { data: avatarsData, isLoading: isLoadingAvatars } = useListAvatarLooks({}, {
    query: { queryKey: getListAvatarLooksQueryKey() }
  });

  const { data: voicesData, isLoading: isLoadingVoices } = useListVoices({}, {
    query: { queryKey: getListVoicesQueryKey() }
  });

  const createVideoMutation = useCreateVideo({
    mutation: {
      onSuccess: () => {
        toast({ title: "Production started", description: "Your video is being generated." });
        setLocation("/videos");
      },
      onError: (err: unknown) => {
        const message = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
        toast({ title: "Failed to create video", description: message, variant: "destructive" });
      }
    }
  });

  const allAvatars = avatarsData?.avatars || [];
  const allVoices = voicesData?.voices || [];

  const filteredAvatars = useMemo(() => {
    const q = avatarSearch.trim().toLowerCase();
    if (!q) return allAvatars;
    return allAvatars.filter(a => (a.name ?? "").toLowerCase().includes(q));
  }, [allAvatars, avatarSearch]);

  const filteredVoices = useMemo(() => {
    const q = voiceSearch.trim().toLowerCase();
    if (!q) return allVoices;
    return allVoices.filter(v =>
      (v.name ?? "").toLowerCase().includes(q) ||
      (v.language ?? "").toLowerCase().includes(q)
    );
  }, [allVoices, voiceSearch]);

  const handlePlayVoice = (voiceId: string, url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      if (playingVoiceId === voiceId) {
        setPlayingVoiceId(null);
        return;
      }
    }
    
    const audio = new Audio(url);
    audioRef.current = audio;
    
    audio.onended = () => setPlayingVoiceId(null);
    audio.onerror = () => {
      setPlayingVoiceId(null);
      toast({ title: "Preview unavailable", variant: "destructive" });
    };
    
    audio.play().then(() => {
      setPlayingVoiceId(voiceId);
    }).catch(() => {
      setPlayingVoiceId(null);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAvatarId) {
      toast({ title: "Select an avatar", variant: "destructive" });
      return;
    }
    if (!selectedVoiceId) {
      toast({ title: "Select a voice", variant: "destructive" });
      return;
    }
    if (!script.trim()) {
      toast({ title: "Write a script", variant: "destructive" });
      return;
    }

    createVideoMutation.mutate({
      data: {
        avatar_id: selectedAvatarId,
        voice_id: selectedVoiceId,
        script: script.trim(),
        title: title.trim() || undefined,
        orientation
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-8 h-full flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-border pb-6">
        <div className="bg-primary/10 p-3 rounded-xl text-primary">
          <Clapperboard className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Director Suite</h1>
          <p className="text-muted-foreground">Compose your scene with precision.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
        {/* Left Column: Selections */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6 overflow-hidden">
          <Tabs defaultValue="avatar" className="flex flex-col h-full">
            <TabsList className="grid w-full grid-cols-2 bg-muted p-1 rounded-lg">
              <TabsTrigger value="avatar" className="rounded-md">
                1. Cast Actor
                {selectedAvatarId && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-primary inline-block" />
                )}
              </TabsTrigger>
              <TabsTrigger value="voice" className="rounded-md">
                2. Select Voice
                {selectedVoiceId && (
                  <span className="ml-2 w-2 h-2 rounded-full bg-primary inline-block" />
                )}
              </TabsTrigger>
            </TabsList>
            
            <div className="flex-1 mt-4 overflow-hidden border border-border rounded-xl bg-card">
              <TabsContent value="avatar" className="h-full m-0 p-0 flex flex-col">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search avatars..."
                      className="pl-9 h-8 text-sm bg-background"
                      value={avatarSearch}
                      onChange={e => setAvatarSearch(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {isLoadingAvatars ? (
                      [...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-lg" />)
                    ) : filteredAvatars.length === 0 ? (
                      <div className="col-span-3 py-8 text-center text-sm text-muted-foreground">No avatars match "{avatarSearch}"</div>
                    ) : filteredAvatars.map(avatar => (
                      <div 
                        key={avatar.id}
                        onClick={() => setSelectedAvatarId(avatar.id)}
                        className={`cursor-pointer group relative rounded-lg overflow-hidden border-2 transition-all aspect-[3/4] bg-muted ${
                          selectedAvatarId === avatar.id ? "border-primary shadow-md shadow-primary/20" : "border-transparent hover:border-primary/50"
                        }`}
                      >
                        {avatar.preview_image_url ? (
                          <img src={avatar.preview_image_url} alt={avatar.name || "Avatar"} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <ImageIcon className="w-8 h-8 opacity-20" />
                          </div>
                        )}
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                          <p className="text-white text-sm font-medium truncate">{avatar.name || "Unnamed"}</p>
                          <p className="text-white/70 text-xs capitalize">{avatar.gender || "Unknown"}</p>
                        </div>
                        {selectedAvatarId === avatar.id && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-primary rounded-full flex items-center justify-center border-2 border-background">
                            <div className="w-2 h-2 bg-background rounded-full" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
              
              <TabsContent value="voice" className="h-full m-0 p-0 flex flex-col">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or language..."
                      className="pl-9 h-8 text-sm bg-background"
                      value={voiceSearch}
                      onChange={e => setVoiceSearch(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <div className="p-4 flex flex-col gap-2">
                    {isLoadingVoices ? (
                      [...Array(6)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />)
                    ) : filteredVoices.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">No voices match "{voiceSearch}"</div>
                    ) : filteredVoices.map(voice => (
                      <div 
                        key={voice.id}
                        onClick={() => setSelectedVoiceId(voice.id)}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedVoiceId === voice.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 bg-background"
                        }`}
                      >
                        <div>
                          <p className="font-medium">{voice.name || "Unnamed Voice"}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {voice.language || "Unknown"} • {voice.gender || "Any"}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {voice.preview_audio_url && (
                            <Button 
                              type="button"
                              variant="ghost" 
                              size="icon" 
                              className={`rounded-full h-8 w-8 ${playingVoiceId === voice.id ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : ""}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayVoice(voice.id, voice.preview_audio_url!);
                              }}
                            >
                              {playingVoiceId === voice.id ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4 ml-0.5" />}
                            </Button>
                          )}
                          <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${selectedVoiceId === voice.id ? "border-primary bg-primary" : "border-muted-foreground/30"}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right Column: Script & Settings */}
        <div className="w-full lg:w-1/2 flex flex-col gap-6">
          <div className="space-y-4 bg-card border border-card-border p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold text-lg border-b border-border pb-2">3. The Script</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Production Title (Optional)</Label>
              <Input 
                id="title" 
                placeholder="e.g. Q3 Earnings Update" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="script">Dialogue Script</Label>
                <span className="text-xs text-muted-foreground">{script.length} chars</span>
              </div>
              <Textarea 
                id="script" 
                placeholder="Hello team, today we'll be discussing..." 
                className="min-h-[180px] resize-y bg-background font-mono text-sm"
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
            </div>
            
            <div className="space-y-3 pt-4 border-t border-border">
              <Label>Format</Label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${orientation === "landscape" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                  onClick={() => setOrientation("landscape")}
                >
                  <div className="w-12 h-8 border-2 border-current rounded mx-auto mb-2 opacity-80" />
                  <span className="text-sm font-medium">Landscape (16:9)</span>
                </div>
                <div 
                  className={`border rounded-lg p-4 cursor-pointer text-center transition-all ${orientation === "portrait" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/50 text-muted-foreground"}`}
                  onClick={() => setOrientation("portrait")}
                >
                  <div className="w-8 h-12 border-2 border-current rounded mx-auto mb-2 opacity-80" />
                  <span className="text-sm font-medium">Portrait (9:16)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto">
            {(!selectedAvatarId || !selectedVoiceId) && (
              <p className="text-xs text-muted-foreground text-center mb-3">
                {!selectedAvatarId && !selectedVoiceId
                  ? "Select an avatar and a voice to continue"
                  : !selectedAvatarId
                  ? "Select an avatar to continue"
                  : "Select a voice to continue"}
              </p>
            )}
            <Button 
              type="submit" 
              className="w-full h-14 text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              disabled={createVideoMutation.isPending}
            >
              {createVideoMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Rolling Action…
                </>
              ) : (
                <>
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Generate Video
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
