import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Sparkles, Download } from "lucide-react";

const AIImageGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-image', {
        body: { prompt }
      });

      if (error) throw error;

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
        toast.success("Image generated successfully!");
      } else {
        throw new Error("No image URL received");
      }
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error(error.message || "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `ai-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Image downloaded!");
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Image Generator
          </h1>
          <p className="text-muted-foreground">
            Gumawa ng kahanga-hangang larawan gamit ang AI
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Describe ang gusto mong larawan
            </label>
            <Textarea
              placeholder="Halimbawa: A beautiful sunset over mountains with vibrant colors..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] resize-none"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Image
              </>
            )}
          </Button>
        </div>

        {imageUrl && (
          <div className="space-y-4 animate-fade-in">
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              <img
                src={imageUrl}
                alt="AI Generated"
                className="w-full h-auto"
              />
            </div>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Image
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIImageGenerator;
