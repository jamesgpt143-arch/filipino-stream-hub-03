import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
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
            Bagong Update!
          </DialogTitle>
          <DialogDescription>
            Check out the latest features we've added
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Playlist Feature</h4>
                <p className="text-sm text-muted-foreground">
                  Gumawa ng iyong sariling playlist! Mag-organize ng mga paborito mong channels mula sa IPTV at Custom Channels.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Personal Playlists</h4>
                <p className="text-sm text-muted-foreground">
                  Ang mga playlist mo ay private - ikaw lang ang makakakita nito.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Easy Management</h4>
                <p className="text-sm text-muted-foreground">
                  Madaling mag-add, mag-delete, at mag-play ng channels sa loob ng iyong playlist.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">Movie & TV Trailers</h4>
                <p className="text-sm text-muted-foreground">
                  Panoorin ang mga trailer ng movies at TV series bago mo ito i-play!
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-foreground">AI Image Generator</h4>
                <p className="text-sm text-muted-foreground">
                  Gumawa ng mga custom AI-generated images gamit ang bagong AI tool!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 animate-fade-in">
            <p className="text-sm text-foreground text-center">
              Puntahan ang <span className="font-semibold text-primary">Custom Channels</span> page at i-click ang{" "}
              <span className="font-semibold text-primary">Playlists</span> tab para magsimula!
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button onClick={handleClose} className="w-full">
            Sige, salamat!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
