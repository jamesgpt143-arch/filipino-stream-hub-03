import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import MovieCard from "@/components/MovieCard";
import ChannelCard from "@/components/ChannelCard";
import { Skeleton } from "@/components/ui/skeleton";
import { channels } from "@/data/channels";

// Placeholder data for movies (Replace this with your actual API fetch later)
const DUMMY_MOVIES = [
  { id: 1, title: "Movie 1", poster_path: "/placeholder.svg", vote_average: 8.5 },
  { id: 2, title: "Movie 2", poster_path: "/placeholder.svg", vote_average: 7.2 },
  { id: 3, title: "Movie 3", poster_path: "/placeholder.svg", vote_average: 9.0 },
  { id: 4, title: "Movie 4", poster_path: "/placeholder.svg", vote_average: 6.5 },
  { id: 5, title: "Movie 5", poster_path: "/placeholder.svg", vote_average: 8.1 },
];

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
      {/* 1. New Hero Section */}
      <HeroSection />

      {/* 2. Content Sections (Horizontal Scrolling) */}
      <div className="-mt-16 relative z-10 space-y-8">
        
        {/* Live TV Channels */}
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

        {/* Trending Movies */}
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
                    poster_path={movie.poster_path}
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
