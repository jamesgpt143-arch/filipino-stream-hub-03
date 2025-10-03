import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import qrCodeImage from "@/assets/instapay-qr.jpg";

export const QRCodePopup = () => {
  const [open, setOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("qr-popup-hidden-date");
    const today = new Date().toDateString();
    
    if (lastShown !== today) {
      setOpen(true);
    }
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && dontShowToday) {
      const today = new Date().toDateString();
      localStorage.setItem("qr-popup-hidden-date", today);
    }
    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
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
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="dont-show-today" 
              checked={dontShowToday}
              onCheckedChange={(checked) => setDontShowToday(checked === true)}
            />
            <Label 
              htmlFor="dont-show-today" 
              className="text-sm cursor-pointer"
            >
              Don't show this today
            </Label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
