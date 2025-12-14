import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Megaphone, X } from 'lucide-react';

export const AnnouncementBar = () => {
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const fetchLatestAnnouncement = async () => {
    try {
      // Hanapin ang pinakabagong comment na nagsisimula sa "#announce:"
      const { data, error } = await supabase
        .from('comments')
        .select('message, created_at')
        .ilike('message', '#announce:%') // Case insensitive search
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data && data.message) {
        // Alisin ang "#announce:" prefix para malinis tingnan
        const cleanMessage = data.message.replace(/^#announce:\s*/i, '');
        setAnnouncement(cleanMessage);
      }
    } catch (error) {
      console.error("Error fetching announcement", error);
    }
  };

  useEffect(() => {
    fetchLatestAnnouncement();

    // Realtime update: Pag nag post ka ng bagong announce, lalabas agad
    const channel = supabase
      .channel('public:announcements')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'comments',
        filter: 'message=ilike.#announce:*' // Filter lang ng announcements
      }, (payload) => {
        const newMsg = payload.new as { message: string };
        setAnnouncement(newMsg.message.replace(/^#announce:\s*/i, ''));
        setIsVisible(true);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  if (!announcement || !isVisible) return null;

  return (
    <div className="bg-primary/90 text-primary-foreground py-2 px-4 relative overflow-hidden shadow-md z-40 border-b border-primary-foreground/10">
      <div className="container mx-auto flex items-center justify-between gap-4">
        
        {/* Icon */}
        <div className="flex-shrink-0 bg-background/20 p-1 rounded">
            <Megaphone className="w-4 h-4 animate-pulse" />
        </div>

        {/* Marquee Text */}
        <div className="flex-1 overflow-hidden relative h-6">
           <div className="absolute whitespace-nowrap animate-marquee">
              <span className="font-medium text-sm mx-4">{announcement}</span>
              {/* Duplicate for smooth loop */}
              <span className="font-medium text-sm mx-4">•</span>
              <span className="font-medium text-sm mx-4">{announcement}</span>
              <span className="font-medium text-sm mx-4">•</span>
              <span className="font-medium text-sm mx-4">{announcement}</span>
           </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)} 
          className="flex-shrink-0 hover:bg-black/20 rounded-full p-1 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tailwind Animation Config (Add this to index.css if not working) */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};
