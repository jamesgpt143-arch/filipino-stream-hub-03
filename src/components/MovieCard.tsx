import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface MovieCardProps {
  id: number;
  title: string;
  poster_path: string;
  vote_average?: number;
  release_date?: string;
  overview?: string;
}

const MovieCard = ({ id, title, poster_path, vote_average }: MovieCardProps) => {
  // Fallback image kung walang poster
  const imageSrc = poster_path 
    ? `https://image.tmdb.org/t/p/w500${poster_path}` 
    : "/placeholder.svg";

  return (
    <Link to={`/movie/${id}`}>
      <div className="group relative w-full h-[300px] md:h-[350px] bg-card rounded-xl overflow-hidden border border-white/5 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 ring-0 hover:ring-2 ring-primary/50">
        
        {/* Poster Image */}
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:opacity-40"
          loading="lazy"
        />

        {/* Gradient Overlay (Visible only on hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
          
          {/* Play Button Icon */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-0 group-hover:scale-100 transition-transform duration-300 delay-75">
            <div className="bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/90">
              <Play className="w-8 h-8 fill-current ml-1" />
            </div>
          </div>

          {/* Movie Info on Hover */}
          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
             {vote_average && (
              <Badge variant="secondary" className="mb-2 bg-yellow-500/20 text-yellow-500 border-yellow-500/20 backdrop-blur-sm">
                <Star className="w-3 h-3 mr-1 fill-current" />
                {vote_average.toFixed(1)}
              </Badge>
            )}
            <h3 className="font-bold text-white text-lg leading-tight line-clamp-2 drop-shadow-md">
              {title}
            </h3>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default MovieCard;
