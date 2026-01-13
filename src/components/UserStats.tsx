import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserStatsProps {
  pagePath: string;
}

export const UserStats = ({ pagePath }: UserStatsProps) => {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);

  useEffect(() => {
    trackPageVisit();
    const cleanup = setupPresence();
    return cleanup;
  }, [pagePath]);

  const trackPageVisit = async () => {
    try {
      const visitorId = localStorage.getItem('visitor_id') || generateVisitorId();
      localStorage.setItem('visitor_id', visitorId);

      await supabase.functions.invoke('track-visit', {
        body: {
          page_path: pagePath,
          visitor_id: visitorId
        }
      });
    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  };

  const generateVisitorId = () => {
    return 'visitor_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  };

  const setupPresence = () => {
    const visitorId = localStorage.getItem('visitor_id') || generateVisitorId();
    const channelName = `page-${pagePath.replace('/', '_')}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: visitorId
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).length;
        setOnlineUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString()
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="fixed bottom-20 left-4 z-40 md:bottom-4">
      <div className="flex items-center gap-1.5 px-2 py-1 bg-background/80 backdrop-blur-sm border border-border/50 rounded-full shadow-sm text-xs">
        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="text-muted-foreground">{onlineUsers}</span>
      </div>
    </div>
  );
};
