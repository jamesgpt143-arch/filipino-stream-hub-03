import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navigation } from "./components/Navigation";
import Homepage from "./pages/Homepage";
import Channels from "./pages/Channels";
import Movies from "./pages/Movies";
import TVSeries from "./pages/TVSeries";
import Comments from "./pages/Comments";
import NotFound from "./pages/NotFound";
import { disableDevTools } from "./utils/disableDevTools";
import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize developer tools protection
    disableDevTools();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Navigation />
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/movies" element={<Movies />} />
          <Route path="/tv-series" element={<TVSeries />} />
          <Route path="/comments" element={<Comments />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
