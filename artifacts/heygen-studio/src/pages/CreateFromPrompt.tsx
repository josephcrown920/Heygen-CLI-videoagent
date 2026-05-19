import { useState } from "react";
import { useLocation } from "wouter";
import { useCreateVideoFromPrompt } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Wand2, Sparkles, Loader2 } from "lucide-react";

export function CreateFromPrompt() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState("");

  const createAgentMutation = useCreateVideoFromPrompt({
    mutation: {
      onSuccess: () => {
        toast({ title: "Magic production started", description: "AI is crafting your video." });
        setLocation("/videos");
      },
      onError: () => {
        toast({ title: "Generation failed", variant: "destructive" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }

    createAgentMutation.mutate({
      data: {
        prompt: prompt.trim()
      }
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-8 h-full flex flex-col gap-8 justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-4 bg-accent/10 rounded-full text-accent mb-4 ring-8 ring-accent/5">
          <Wand2 className="w-12 h-12" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Magic Prompt</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Describe the video you want. The AI will automatically cast the perfect avatar, select a matching voice, write the script, and generate the scene.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-card rounded-xl border border-border shadow-2xl p-2">
            <Textarea
              placeholder="A professional welcoming new employees to the company, speaking in a warm, enthusiastic tone..."
              className="min-h-[250px] text-lg leading-relaxed p-6 bg-transparent border-0 focus-visible:ring-0 resize-none"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            type="submit" 
            size="lg"
            className="h-16 px-10 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg shadow-accent/20 transition-all hover:scale-105"
            disabled={createAgentMutation.isPending || !prompt.trim()}
          >
            {createAgentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                Conjuring Magic...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-6 w-6" />
                Generate with AI
              </>
            )}
          </Button>
        </div>
      </form>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 text-center border-t border-border pt-12">
        <div>
          <div className="text-primary font-bold mb-2">1. Casting</div>
          <p className="text-sm text-muted-foreground">AI picks the best suited avatar look based on your description.</p>
        </div>
        <div>
          <div className="text-accent font-bold mb-2">2. Voice</div>
          <p className="text-sm text-muted-foreground">Selects a professional voice that matches the tone of your prompt.</p>
        </div>
        <div>
          <div className="text-primary font-bold mb-2">3. Script</div>
          <p className="text-sm text-muted-foreground">Writes a compelling script and orchestrates the final generation.</p>
        </div>
      </div>
    </div>
  );
}
