import { ChannelCard } from './ChannelCard';
import { Channel } from '@/data/channels';

interface ChannelGridProps {
  channels: Channel[];
  onChannelSelect: (channel: Channel) => void;
  onToggleHide?: (channelName: string) => void;
  onDelete?: (channelName: string) => void;
  hiddenChannels?: Set<string>;
  customChannels?: Channel[];
}

export const ChannelGrid = ({ channels, onChannelSelect, onToggleHide, onDelete, hiddenChannels, customChannels = [] }: ChannelGridProps) => {
  if (channels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="bg-muted/50 rounded-full p-6 mb-4">
          <svg
            className="w-12 h-12 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0012 15c-2.219 0-4.207.906-5.648 2.364M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No channels found
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          Try adjusting your search terms or category filter to find the channels you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {channels.map((channel, index) => (
        <div 
          key={`${channel.name}-${index}`}
          className="animate-fade-in transform hover:scale-[1.01] transition-spring group"
          style={{ animationDelay: `${index * 0.02}s` }}
        >
          <ChannelCard
            channel={channel}
            onClick={() => onChannelSelect(channel)}
            onToggleHide={onToggleHide}
            onDelete={onDelete}
            isHidden={hiddenChannels?.has(channel.name)}
            isCustom={customChannels.some(customChannel => customChannel.name === channel.name)}
          />
        </div>
      ))}
    </div>
  );
};