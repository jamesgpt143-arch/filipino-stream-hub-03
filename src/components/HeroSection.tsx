import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";

const HeroSection = () => {
  return (
    <div className="relative h-[80vh] w-full overflow-hidden">
      {/* Background Image Placeholder - Palitan mo ng dynamic image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('https://image.tmdb.org/t/p/original/path-to-your-image.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl space-y-4 pt-20">
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider border border-primary/20">
            Featured Today
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none">
            Movie Title Here
          </h1>
          <p className="text-lg text-white/70 line-clamp-3 md:text-xl max-w-xl">
            Sample description ng movie. Ito ay isang maaksyong palabas na puno ng drama at suspense. Panoorin ngayon sa FilipinoHub.
          </p>
          <div className="flex items-center gap-3 pt-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white gap-2 rounded-full px-8 h-12 text-lg">
              <Play className="fill-current w-5 h-5" /> Watch Now
            </Button>
            <Button size="lg" variant="secondary" className="gap-2 rounded-full px-8 h-12 text-lg backdrop-blur-sm bg-white/10 hover:bg-white/20 text-white border-white/10">
              <Info className="w-5 h-5" /> More Info
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
