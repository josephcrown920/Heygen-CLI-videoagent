import { useState, useMemo } from "react";
import { 
  useListVideos, 
  getListVideosQueryKey
} from "@workspace/api-client-react";
import { VideoCard } from "@/components/VideoCard";
import { Library, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PAGE_SIZE = 16;

export function VideoLibrary() {
  const [search, setSearch] = useState("");
  const [nextToken, setNextToken] = useState<string | undefined>(undefined);
  const [allVideos, setAllVideos] = useState<NonNullable<ReturnType<typeof useListVideos>["data"]>["videos"]>([]);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { data, isLoading, isFetching } = useListVideos(
    { limit: PAGE_SIZE, ...(nextToken ? { token: nextToken } : {}) },
    {
      query: {
        queryKey: getListVideosQueryKey({ limit: PAGE_SIZE, ...(nextToken ? { token: nextToken } : {}) }),
        onSuccess: (d: { videos: typeof allVideos; next_token?: string | null }) => {
          if (!hasLoadedOnce) {
            setAllVideos(d.videos ?? []);
            setHasLoadedOnce(true);
          } else {
            setAllVideos(prev => [...prev, ...(d.videos ?? [])]);
          }
        }
      }
    }
  );

  const serverNextToken = data?.next_token;

  const filteredVideos = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allVideos;
    return allVideos.filter(v => (v.title ?? "untitled production").toLowerCase().includes(q));
  }, [allVideos, search]);

  const handleLoadMore = () => {
    if (serverNextToken) {
      setNextToken(serverNextToken);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col gap-8 h-full">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Video Library</h1>
          <p className="text-muted-foreground">
            Manage and download your generated productions.
            {allVideos.length > 0 && (
              <span className="ml-2 text-sm">
                {filteredVideos.length === allVideos.length
                  ? `${allVideos.length} video${allVideos.length !== 1 ? "s" : ""}`
                  : `${filteredVideos.length} of ${allVideos.length} matching`}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search titles..."
              className="pl-9 bg-card border-card-border"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading && !hasLoadedOnce ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl h-72 animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 && !search ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center border-2 border-dashed border-border rounded-xl p-12 bg-card/50">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center text-primary mb-4">
            <Library className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold">Your library is empty</h2>
          <p className="text-muted-foreground max-w-md">
            You haven't generated any videos yet. Head over to the Director Suite or Magic Prompt to start creating.
          </p>
        </div>
      ) : filteredVideos.length === 0 && search ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center py-20">
          <Search className="w-10 h-10 text-muted-foreground/40" />
          <p className="text-lg font-medium">No results for "{search}"</p>
          <p className="text-sm text-muted-foreground">Try a different title or clear the search.</p>
          <Button variant="ghost" size="sm" onClick={() => setSearch("")}>Clear search</Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>

          {serverNextToken && !search && (
            <div className="flex justify-center pb-8">
              <Button
                variant="outline"
                className="px-8"
                onClick={handleLoadMore}
                disabled={isFetching}
              >
                {isFetching ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
