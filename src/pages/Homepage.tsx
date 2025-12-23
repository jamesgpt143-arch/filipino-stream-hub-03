import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import MovieCard from "@/components/MovieCard";
import ChannelCard from "@/components/ChannelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { channels } from "@/data/channels";

// Note: Siguraduhin na may movie data ka dito or fetched from API
// For demo purposes, magha-hardcode muna tayo ng dummy movies
const DUMMY_MOVIES = Array(10).fill(null).map((_, i) => ({
  id: i + 1,
  title: `Sample Movie ${i + 1}`,
  poster_path: null, // Magfa-fallback sa placeholder
  vote_average: 8.5,
  release_date: "2024-01-01",
  overview: "This is a sample movie description."
}));

const Homepage = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const featuredChannels = channels.slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. Hero Section (Featured Content) */}
      <HeroSection />

      {/* Content Wrapper - Negative margin para pumatong sa Hero */}
      <div className="-mt-16 relative z-10 space-y-6">
        
        {/* 2. Live TV Channels (Horizontal Scroll) */}
        <ContentSection title="Watch Live TV">
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="min-w-[200px] md:min-w-[260px]">
                  <Skeleton className="h-[160px] w-full rounded-xl bg-secondary/50" />
                </div>
              ))
            : featuredChannels.map((channel) => (
                <div key={channel.id} className="min-w-[200px] md:min-w-[260px] snap-start">
                   <ChannelCard channel={channel} />
                </div>
              ))}
        </ContentSection>

        {/* 3. Trending Movies (Horizontal Scroll) */}
        <ContentSection title="Trending Now">
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="min-w-[160px] md:min-w-[220px]">
                  <Skeleton className="h-[300px] w-full rounded-xl bg-secondary/50" />
                </div>
              ))
            : DUMMY_MOVIES.map((movie) => (
                <div key={movie.id} className="min-w-[160px] md:min-w-[220px] snap-start">
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    poster_path={movie.poster_path || ""}
                    vote_average={movie.vote_average}
                  />
                </div>
              ))}
        </ContentSection>

         {/* 4. More Movies (Just to show spacing) */}
         <ContentSection title="New Releases">
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="min-w-[160px] md:min-w-[220px]">
                  <Skeleton className="h-[300px] w-full rounded-xl bg-secondary/50" />
                </div>
              ))
            : DUMMY_MOVIES.slice(0, 5).map((movie) => (
                <div key={movie.id} className="min-w-[160px] md:min-w-[220px] snap-start">
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    poster_path={movie.poster_path || ""}
                    vote_average={movie.vote_average}
                  />
                </div>
              ))}
        </ContentSection>
      </div>
    </div>
  );
};

export default Homepage;
