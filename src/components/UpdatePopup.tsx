import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const UpdatePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const UPDATE_VERSION = "v2.1"; // Change this when you have new updates

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("lastSeenUpdate");
    if (lastSeenVersion !== UPDATE_VERSION) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("lastSeenUpdate", UPDATE_VERSION);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Sparkles className="h-6 w-6 text-primary" />
            New Update!
          </DialogTitle>
          <DialogDescription>
            Check out the latest features we've added
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Added Channel</h4>
                <p className="text-sm text-muted-foreground">
                 &Flix
                  <br />
                 I Heart Movies
                  <br />
                 Heart Of Asia
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Movie & TV Trailers</h4>
                <p className="text-sm text-muted-foreground">
                  Watch trailers of movies and TV series before you play them!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">AI Image Generator</h4>
                <p className="text-sm text-muted-foreground">
                  Create custom AI-generated images using the new AI tool!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleClose} className="w-full">
            Got it, thanks!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
