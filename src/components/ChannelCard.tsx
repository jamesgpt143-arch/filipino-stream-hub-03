import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Channel } from '@/data/channels';
import { Play, EyeOff, Eye, Trash2 } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
  onClick: () => void;
  onToggleHide?: (channelName: string) => void;
  onDelete?: (channelName: string) => void;
  isHidden?: boolean;
  isCustom?: boolean;
}

export const ChannelCard = ({ channel, onClick, onToggleHide, onDelete, isHidden, isCustom }: ChannelCardProps) => {
  return (
    <Card 
      className="bg-gradient-card hover:shadow-glow border-border/30 cursor-pointer group transition-spring overflow-hidden backdrop-blur-sm hover:border-primary/30"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-center gap-4 p-4">
          {/* Channel Logo */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-lg overflow-hidden flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <img
              src={channel.logo}
              alt={channel.name}
              className="w-full h-full object-contain p-2 transition-all duration-500 group-hover:scale-110 group-hover:brightness-110 filter"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Play Icon Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
              <div className="bg-gradient-primary shadow-elegant rounded-full p-2 animate-scale-in transform group-hover:scale-110 transition-transform duration-300">
                <Play className="w-4 h-4 text-white fill-current drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Channel Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground text-base leading-tight truncate group-hover:text-accent transition-colors duration-300">
              {channel.name}
            </h3>
            {channel.category && (
              <p className="text-sm text-muted-foreground mt-1">
                {channel.category}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Category Badge */}
            {channel.category && (
              <Badge 
                variant="secondary" 
                className="text-xs bg-gradient-primary backdrop-blur-sm border-0 text-white font-medium px-2 py-1 shadow-card"
              >
                {channel.category}
              </Badge>
            )}
            
            {/* Hide/Show Button */}
            {onToggleHide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleHide(channel.name);
                }}
                className="h-8 w-8 p-0 hover:bg-muted"
              >
                {isHidden ? (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <Eye className="w-4 h-4 text-muted-foreground" />
                )}
              </Button>
            )}
            
            {/* Delete Button (only for custom channels) */}
            {isCustom && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(channel.name);
                }}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};