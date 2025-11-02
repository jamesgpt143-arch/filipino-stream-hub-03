import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import promoLoadImage from "@/assets/promo-load.png";

export const DonateButton = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 hover:from-primary/20 hover:to-secondary/20">
          💰 Donate
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-center">Support the Stream</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          <img 
            src={promoLoadImage} 
            alt="Promo Load Options" 
            className="w-full max-w-md object-contain rounded-lg border"
          />
          <div className="text-center space-y-2">
            <p className="text-sm font-medium">
              Mode of payment: GCash
            </p>
            <a 
              href="https://web.facebook.com/james.benavides.921" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline inline-block"
            >
              Message us on Facebook
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};