import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

const ContentSection = ({ title, children }: ContentSectionProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const { current } = scrollContainerRef;
      const scrollAmount = direction === "left" ? -current.offsetWidth + 200 : current.offsetWidth - 200;
      current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="py-8 space-y-4 animate-fade-in">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight pl-1 border-l-4 border-primary">
          {title}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("left")}
            className="hidden md:flex rounded-full bg-white/5 hover:bg-white/20 text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => scroll("right")}
            className="hidden md:flex rounded-full bg-white/5 hover:bg-white/20 text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-4 px-4 md:px-8 pb-4 scrollbar-hide snap-x"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContentSection;
