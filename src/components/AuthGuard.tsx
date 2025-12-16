import { useEffect, useState } from 'react';
import { Login } from '@/pages/Login';
import { useToast } from '@/hooks/use-toast';
import { useLocation, useNavigate } from 'react-router-dom';

// 12 Hours in Milliseconds
const SESSION_DURATION = 12 * 60 * 60 * 1000; 

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = () => {
      const storedExpiry = localStorage.getItem('flame_session_expiry');
      const now = Date.now();

      // 1. CHECK IF RETURNING FROM CUTY (Success Login)
      const params = new URLSearchParams(location.search);
      if (params.get('auth') === 'success') {
        // Set new expiry (Now + 12 Hours)
        const newExpiry = now + SESSION_DURATION;
        localStorage.setItem('flame_session_expiry', newExpiry.toString());
        
        setIsAuthenticated(true);
        setIsChecking(false);
        
        // Clean URL (remove ?auth=success)
        window.history.replaceState({}, '', window.location.pathname);
        
        toast({
          title: "Access Granted! 🔓",
          description: "You have 12 hours of unlimited streaming.",
          className: "bg-green-600 text-white border-none"
        });
        return;
      }

      // 2. CHECK EXISTING SESSION
      if (storedExpiry && parseInt(storedExpiry) > now) {
        // Valid pa
        setIsAuthenticated(true);
      } else {
        // Expired na o wala pang session
        if (storedExpiry) {
            // Kung may expiry date pero luma na, ibig sabihin expired na talaga
            localStorage.removeItem('flame_session_expiry');
            toast({
                title: "Session Expired",
                description: "Your 12-hour pass has ended. Please login again.",
                variant: "destructive"
            });
        }
        setIsAuthenticated(false);
      }
      setIsChecking(false);
    };

    checkAuth();
  }, [location, toast]);

  // Habang nagche-check pa, loading muna (optional, pwede ring blank)
  if (isChecking) return null;

  // Kung hindi authenticated, ipakita ang Login Page
  if (!isAuthenticated) {
    return <Login />;
  }

  // Kung authenticated, ipakita ang App (Children)
  return <>{children}</>;
};
