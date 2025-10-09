import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { UpdatePopup } from "./components/UpdatePopup";
import Homepage from "./pages/Homepage";
import Channels from "./pages/Channels";
import CustomChannels from "./pages/CustomChannels";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import TVSeries from "./pages/TVSeries";
import TVSeriesDetail from "./pages/TVSeriesDetail";
import Comments from "./pages/Comments";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { disableDevTools } from "./utils/disableDevTools";
import { useEffect } from "react";

const queryClient = new QueryClient();

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/channels" element={<Channels />} />
        <Route path="/custom-channels" element={<CustomChannels />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv-series" element={<TVSeries />} />
        <Route path="/tv-series/:id" element={<TVSeriesDetail />} />
        <Route path="/comments" element={<Comments />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  useEffect(() => {
    // Initialize developer tools protection
    disableDevTools();
    
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {});
      });
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <UpdatePopup />
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
