import { useEffect, useCallback } from 'react';

interface UseTVNavigationOptions {
  onUp?: () => void;
  onDown?: () => void;
  onLeft?: () => void;
  onRight?: () => void;
  onEnter?: () => void;
  onBack?: () => void;
}

export const useTVNavigation = ({
  onUp,
  onDown,
  onLeft,
  onRight,
  onEnter,
  onBack,
}: UseTVNavigationOptions) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        onUp?.();
        break;
      case 'ArrowDown':
        e.preventDefault();
        onDown?.();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        onLeft?.();
        break;
      case 'ArrowRight':
        e.preventDefault();
        onRight?.();
        break;
      case 'Enter':
        e.preventDefault();
        onEnter?.();
        break;
      case 'Backspace':
      case 'Escape':
        e.preventDefault();
        onBack?.();
        break;
    }
  }, [onUp, onDown, onLeft, onRight, onEnter, onBack]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
