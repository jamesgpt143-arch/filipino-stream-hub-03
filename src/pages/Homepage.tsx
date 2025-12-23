import { useEffect, useState } from "react";
import HeroSection from "@/components/HeroSection";
import ContentSection from "@/components/ContentSection";
import MovieCard from "@/components/MovieCard"; // Ensure tama ang import path
import ChannelCard from "@/components/ChannelCard"; // Ensure tama ang import path
import { Skeleton } from "@/components/ui/skeleton";
import { channels } from "@/data/channels"; // Assuming may ganito ka based sa file list

// Mock data muna kung wala pang API call sa hook
// Pwede mong palitan ng actual data fetching logic mo
const Homepage = () => {
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Filter channels para sa "Live TV" section
  const featuredChannels = channels.slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* 1. Hero Section */}
      <HeroSection />

      <div className="-mt-20 relative z-10 space-y-2">
        {/* 2. Live TV Channels Section */}
        <ContentSection title="Live TV Channels">
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="min-w-[200px] md:min-w-[280px]">
                  <Skeleton className="h-[160px] w-full rounded-xl bg-secondary" />
                </div>
              ))
            : featuredChannels.map((channel) => (
                <div key={channel.id} className="min-w-[200px] md:min-w-[280px] snap-start">
                   {/* I-wrap natin sa div para ma-control ang width sa loob ng scroll */}
                   <ChannelCard channel={channel} />
                </div>
              ))}
        </ContentSection>

        {/* 3. Trending Movies Section */}
        <ContentSection title="Trending Movies">
          {loading
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="min-w-[150px] md:min-w-[200px]">
                  <Skeleton className="h-[300px] w-full rounded-xl bg-secondary" />
                </div>
              ))
            : /* Placeholder lang 'to, palitan ng .map sa movies data mo */
              [1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="min-w-[150px] md:min-w-[200px] snap-start">
                  <MovieCard
                    id={i}
                    title={`Movie Title ${i}`}
                    poster_path="/placeholder.svg" // Replace with real path
                    vote_average={8.5}
                    release_date="2024"
                    overview="Magandang movie ito."
                  />
                </div>
              ))}
        </ContentSection>

        {/* 4. Popular TV Series Section */}
        <ContentSection title="Popular Series">
           {/* Reuse logic ng movies pero para sa TV Shows */}
           <div className="flex items-center justify-center h-40 w-full text-muted-foreground border border-dashed border-white/10 rounded-xl">
              Add your TV Series mapping here
           </div>
        </ContentSection>
      </div>
    </div>
  );
};

export default Homepage;
