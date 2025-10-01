import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

interface UserStatsProps {
  pagePath: string;
}

interface OnlineUser {
  username: string;
  online_at: string;
}

export const UserStats = ({ pagePath }: UserStatsProps) => {
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [usersList, setUsersList] = useState<OnlineUser[]>([]);
  const { username } = useAuth();

  useEffect(() => {
    trackPageVisit();
    setupPresence();
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
    const channelName = `page-${pagePath.replace('/', '_')}`;
    const channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: username || 'anonymous_' + Math.random().toString(36).substr(2, 9)
        }
      }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.keys(state).length;
        setOnlineUsers(users);
        
        // Extract user details
        const onlineUsersList: OnlineUser[] = [];
        Object.entries(state).forEach(([key, presences]) => {
          if (presences && presences.length > 0) {
            const presence = presences[0] as any;
            onlineUsersList.push({
              username: presence.username || key,
              online_at: presence.online_at
            });
          }
        });
        setUsersList(onlineUsersList);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            online_at: new Date().toISOString(),
            username: username || 'Anonymous'
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="flex items-center gap-2 px-3 py-2 bg-background/90 backdrop-blur-sm border border-border rounded-lg shadow-lg hover:bg-background"
          >
            <Users className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{onlineUsers} Online</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-2">
            <h4 className="font-medium text-sm mb-3">Online Users</h4>
            {usersList.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {usersList.map((user, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-secondary/30 hover:bg-secondary/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-sm">{user.username}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No users online</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};