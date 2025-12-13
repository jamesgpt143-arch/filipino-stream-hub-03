import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Smile, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Interface base sa iyong database schema
interface Comment {
  id: string;
  name: string;
  message: string;
  creator_username: string;
  created_at: string;
  facebook_link?: string | null;
}

const REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export const CommentsWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [userName, setUserName] = useState(() => localStorage.getItem("chat_username") || "");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Save username to local storage para di paulit-ulit itype
  useEffect(() => {
    if (userName) localStorage.setItem("chat_username", userName);
  }, [userName]);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true }); // Oldest first sa chat style

    if (error) console.error("Error fetching comments:", error);
    else setComments(data || []);
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      // Optional: Realtime subscription
      const channel = supabase
        .channel('public:comments')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
          setComments((prev) => [...prev, payload.new as Comment]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments, isOpen]);

  const handleSend = async () => {
    if (!newMessage.trim() || !userName.trim()) {
      toast({ description: "Please enter a name and message", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);

    const { error } = await supabase.from('comments').insert({
      name: userName,
      message: newMessage,
      creator_username: userName, // Required field base sa schema mo
      facebook_link: null
    });

    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to send", variant: "destructive" });
    } else {
      setNewMessage("");
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="w-[340px] h-[480px] bg-background border border-border rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden font-sans">
          
          {/* Header */}
          <div className="p-3 border-b border-border bg-primary text-primary-foreground flex justify-between items-center shadow-sm">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <MessageCircle size={18} /> Community Chat
            </h3>
            <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/20 text-primary-foreground" onClick={() => setIsOpen(false)}>
              <X size={16} />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-3 bg-muted/30">
            <div className="space-y-3">
              {comments.map((comment) => {
                const isMe = comment.name === userName;
                return (
                  <div key={comment.id} className={`flex gap-2 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar className="w-6 h-6 mb-1 border">
                      <AvatarFallback className="text-[10px] bg-secondary">{comment.name[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-muted-foreground px-1 mb-0.5">
                        {comment.name}
                      </span>
                      
                      <div className={`group relative px-3 py-2 text-sm shadow-sm
                        ${isMe 
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none' 
                          : 'bg-card border border-border rounded-2xl rounded-bl-none text-foreground'
                        }`}
                      >
                        {comment.message}
                        
                        {/* Reaction Button (Hover only) */}
                        <div className={`absolute ${isMe ? '-left-6' : '-right-6'} bottom-0 opacity-0 group-hover:opacity-100 transition-opacity`}>
                           <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-accent">
                                <Smile size={12} className="text-muted-foreground" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-1 flex gap-0.5" side="top">
                              {REACTIONS.map((emoji) => (
                                <button key={emoji} className="hover:bg-accent p-1 rounded text-lg transition-transform hover:scale-125"
                                  onClick={() => toast({ description: `Sent ${emoji} (Demo only)` })}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Footer / Input */}
          <div className="p-3 bg-background border-t border-border space-y-2">
            {!localStorage.getItem("chat_username") && (
               <Input 
                 placeholder="Enter your name..." 
                 value={userName}
                 onChange={(e) => setUserName(e.target.value)}
                 className="h-8 text-xs bg-muted/50"
               />
            )}
            <div className="flex gap-2">
              <Input 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..." 
                className="rounded-full h-9 text-sm focus-visible:ring-1"
              />
              <Button size="icon" onClick={handleSend} disabled={isLoading} className="h-9 w-9 rounded-full shrink-0">
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING BUTTON */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90 
          ${isOpen ? 'rotate-90 scale-0 opacity-0 hidden' : 'scale-100 opacity-100'}`}
      >
        <MessageCircle size={28} />
        {/* Optional: Unread indicator badge logic here */}
      </Button>
    </div>
  );
};
