import { 
  useListVideos, 
  getListVideosQueryKey
} from "@workspace/api-client-react";
import { VideoCard } from "@/components/VideoCard";
import { Library, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function VideoLibrary() {
  const { data, isLoading } = useListVideos({}, {
    query: {
      queryKey: getListVideosQueryKey()
    }
  });

  const videos = data?.videos || [];

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8 h-full">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Video Library</h1>
          <p className="text-muted-foreground">Manage and download your generated productions.</p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search titles..." className="pl-9 bg-card border-card-border" />
          </div>
          <Button variant="outline" size="icon" className="border-card-border bg-card">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-card border border-border rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-border rounded-xl p-12 bg-card/50">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center text-primary mb-4">
            <Library className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Your library is empty</h2>
          <p className="text-muted-foreground max-w-md">
            You haven't generated any videos yet. Head over to the Director Suite or Magic Prompt to start creating.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
          {videos.map(video => (
            <VideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
