import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import { PWAInstallPrompt } from "./components/PWAInstallPrompt";
import { UpdatePopup } from "./components/UpdatePopup";

import Homepage from "./pages/Homepage";
import Channels from "./pages/Channels";
import CustomChannels from "./pages/CustomChannels";
import Movies from "./pages/Movies";
import MovieDetail from "./pages/MovieDetail";
import TVSeries from "./pages/TVSeries";
import TVSeriesDetail from "./pages/TVSeriesDetail";
import Anime from "./pages/Anime";
import AnimeDetail from "./pages/AnimeDetail";
import Comments from "./pages/Comments";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login"; // Keep Login for Admin access
import { disableDevTools } from "./utils/disableDevTools";
import { useEffect } from "react";
import { CommentsWidget } from "./components/CommentsWidget";
import { AnnouncementBar } from "./components/AnnouncementBar";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    disableDevTools();
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
        
        <BrowserRouter>
          {/* TINANGGAL NA NATIN ANG AUTH GUARD WRAPPER */}
          <AnnouncementBar />
          <Navigation />
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route path="/channels" element={<Channels />} />
            <Route path="/custom-channels" element={<CustomChannels />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/movie/:id" element={<MovieDetail />} />
            <Route path="/tv-series" element={<TVSeries />} />
            <Route path="/tv-series/:id" element={<TVSeriesDetail />} />
            <Route path="/anime" element={<Anime />} />
            <Route path="/anime/:id" element={<AnimeDetail />} />
            <Route path="/comments" element={<Comments />} />
            <Route path="/login" element={<Login />} /> {/* Admin Entrance */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CommentsWidget />
        </BrowserRouter>

      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
