import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
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
    <div className="fixed bottom-4 right-4 z-50">
      <div className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg">
        <Users className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium">{onlineUsers} Online</span>
      </div>
    </div>
  );
};
