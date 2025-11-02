import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import qrCodeImage from "@/assets/instapay-qr.jpg";

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
            src={qrCodeImage} 
            alt="InstaPay QR Code for Donations" 
            className="w-64 h-64 object-contain rounded-lg border"
          />
          <p className="text-sm text-muted-foreground text-center">
            Scan the QR code with your InstaPay app to donate
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};