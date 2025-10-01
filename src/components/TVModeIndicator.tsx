import { useState, useEffect } from 'react';
import { Tv, X } from 'lucide-react';
import { Button } from './ui/button';

export const TVModeIndicator = () => {
  const [showHint, setShowHint] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if user is on a large screen (likely TV)
    const isLargeScreen = window.innerWidth >= 1280;
    const hasSeenHint = localStorage.getItem('tv-hint-dismissed');
    
    if (isLargeScreen && !hasSeenHint && !dismissed) {
      setShowHint(true);
    }
  }, [dismissed]);

  const handleDismiss = () => {
    localStorage.setItem('tv-hint-dismissed', 'true');
    setDismissed(true);
    setShowHint(false);
  };

  if (!showHint) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border-2 border-accent rounded-lg shadow-elegant p-6 z-50 max-w-md animate-in slide-in-from-bottom-5">
      <div className="flex items-start gap-4">
        <div className="bg-accent p-3 rounded-lg">
          <Tv className="w-6 h-6 text-accent-foreground" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground mb-2">
            Smart TV Mode Active
          </h3>
          <p className="text-sm text-muted-foreground mb-3">
            Gamitin ang arrow keys sa remote para mag-navigate:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 mb-4">
            <li>• ↑↓←→ - Navigate items</li>
            <li>• Enter - Select/Play</li>
            <li>• Back/Esc - Return</li>
          </ul>
          <Button 
            onClick={handleDismiss} 
            size="sm" 
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Got it!
          </Button>
        </div>
      </div>
    </div>
  );
};
