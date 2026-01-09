import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { Channel } from "@/data/channels";

interface ChannelCardProps {
  channel: Channel;
  onClick?: () => void;
  onToggleHide?: (channelName: string) => void;
  onDelete?: (channelName: string) => void;
  isHidden?: boolean;
  isCustom?: boolean;
  canDelete?: boolean;
}

const ChannelCard = ({ channel, onClick }: ChannelCardProps) => {
  return (
    <div onClick={onClick} className="block h-full cursor-pointer">
      <div className="group relative h-[160px] md:h-[180px] w-full bg-secondary/20 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden transition-all duration-300 hover:bg-secondary/40 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
        
        {/* Background Image/Logo with Blur */}
        <div className="absolute inset-0 p-8 flex items-center justify-center opacity-50 group-hover:opacity-30 transition-opacity duration-300">
           <img 
             src={channel.logo} 
             alt={channel.name}
             className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
           />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">Live TV</p>
              <h3 className="font-bold text-white text-lg leading-none group-hover:text-primary transition-colors">
                {channel.name}
              </h3>
            </div>
            
            {/* Small Play Button */}
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
          </div>
        </div>

        {/* Live Badge */}
        <div className="absolute top-3 right-3 px-2 py-0.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded-sm animate-pulse shadow-red-600/50 shadow-sm">
          Live
        </div>
      </div>
    </div>
  );
};

export default ChannelCard;
