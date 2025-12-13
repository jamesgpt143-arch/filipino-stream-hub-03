import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Smile, Lock, ShieldCheck, LogOut, Trash2, Edit2 } from "lucide-react";
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

// ADMIN CREDENTIALS
const ADMIN_USER = "flameiptv";
const ADMIN_PASS = "darman18";

export const CommentsWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newMessage, setNewMessage] = useState("");
  
  // Login States
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("chat_is_admin") === "true");
  const [showLogin, setShowLogin] = useState(false);
  const [inputPass, setInputPass] = useState("");
  
  // Normal User State
  // Init state from storage, but don't auto-save on change anymore
  const [userName, setUserName] = useState(() => localStorage.getItem("chat_username") || "");
  const [isNameSet, setIsNameSet] = useState(() => !!localStorage.getItem("chat_username"));
  
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle Admin Persistence
  useEffect(() => {
    localStorage.setItem("chat_is_admin", isAdmin ? "true" : "false");
    if (isAdmin) setUserName(ADMIN_USER);
  }, [isAdmin]);

  // Function to fetch comments
  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching comments:", error);
    } else if (data) {
      setComments(prev => {
        if (prev.length === data.length && prev[prev.length - 1]?.id === data[data.length - 1]?.id) {
          return prev; 
        }
        return data;
      });
    }
  };

  // MAIN EFFECT: Realtime + Polling
  useEffect(() => {
    if (isOpen) {
      fetchComments(); 

      const channel = supabase
        .channel('chat_room_updates')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, (payload) => {
          const newComment = payload.new as Comment;
          setComments((prev) => {
            if (prev.some(c => c.id === newComment.id)) return prev; 
            return [...prev, newComment];
          });
        })
        .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'comments' }, (payload) => {
          setComments((prev) => prev.filter(c => c.id !== payload.old.id));
        })
        .subscribe();

      const intervalId = setInterval(() => {
        fetchComments();
      }, 3000);

      return () => { 
        supabase.removeChannel(channel);
        clearInterval(intervalId);
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments.length, isOpen]);

  const handleSend = async () => {
    const finalName = isAdmin ? ADMIN_USER : userName;

    if (!newMessage.trim() || !finalName.trim()) {
      toast({ description: "Please enter a name and message", variant: "destructive" });
      return;
    }

    // SAVE NAME ON SEND ONLY (Fixes the typing bug)
    if (!isAdmin) {
      localStorage.setItem("chat_username", finalName);
      setIsNameSet(true);
    }
    
    setIsLoading(true);

    const { data, error } = await supabase.from('comments').insert({
      name: finalName,
      message: newMessage,
      creator_username: finalName,
      facebook_link: null
    }).select().single();

    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to send", variant: "destructive" });
    } else if (data) {
      setNewMessage("");
      setComments((prev) => [...prev, data]);
    }
    setIsLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    if (!isAdmin) return;
    
    const previousComments = [...comments];
    setComments(prev => prev.filter(c => c.id !== commentId));

    const { error } = await supabase.from('comments').delete().eq('id', commentId);

    if (error) {
      console.error("Delete error:", error);
      setComments(previousComments);
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    } else {
      toast({ description: "Comment deleted" });
    }
  };

  const handleAdminLogin = () => {
    if (inputPass === ADMIN_PASS) {
      setIsAdmin(true);
      setUserName(ADMIN_USER);
      setShowLogin(false);
      setInputPass("");
      toast({ title: "Welcome back!", description: "Logged in as Admin" });
    } else {
      toast({ title: "Access Denied", description: "Invalid password", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setUserName("");
    setIsNameSet(false); // Reset name state on logout
    toast({ description: "Logged out" });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="w-[340px] h-[480px] bg-background border border-border rounded-xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden font-sans">
          
          {/* Header */}
          <div className="p-3 border-b border-border bg-primary text-primary-foreground flex justify-between items-center shadow-sm relative">
            <h3 className="font-bold flex items-center gap-2 text-sm">
              <MessageCircle size={18} /> Community Chat
            </h3>
            
            <div className="flex items-center gap-1">
              <Popover open={showLogin} onOpenChange={setShowLogin}>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/20 text-primary-foreground">
                     {isAdmin ? <ShieldCheck size={16} className="text-yellow-300" /> : <Lock size={14} className="opacity-50" />}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-60 p-3" align="end">
                  {isAdmin ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Logged in as <span className="text-primary font-bold">{ADMIN_USER}</span></p>
                      <Button variant="destructive" size="sm" className="w-full" onClick={handleLogout}>
                        <LogOut size={14} className="mr-2" /> Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-medium text-xs text-muted-foreground">Admin Access</h4>
                      <Input 
                        type="password" 
                        placeholder="Enter Password" 
                        value={inputPass} 
                        onChange={(e) => setInputPass(e.target.value)} 
                        className="h-8 text-xs" 
                        onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
                      />
                      <Button size="sm" className="w-full h-8 text-xs" onClick={handleAdminLogin}>Login</Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>

              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-primary/20 text-primary-foreground" onClick={() => setIsOpen(false)}>
                <X size={16} />
              </Button>
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-3 bg-muted/30">
            <div className="space-y-3">
              {comments.map((comment) => {
                const isMe = comment.name === (isAdmin ? ADMIN_USER : userName);
                const isCommentAdmin = comment.name === ADMIN_USER;

                return (
                  <div key={comment.id} className={`flex gap-2 items-end ${isMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar className={`w-6 h-6 mb-1 border ${isCommentAdmin ? 'ring-2 ring-yellow-400' : ''}`}>
                      <AvatarFallback className={`text-[10px] ${isCommentAdmin ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                        {comment.name[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-muted-foreground px-1 mb-0.5 flex items-center gap-1">
                        {comment.name}
                        {isCommentAdmin && (
                          <ShieldCheck size={12} className="text-blue-500 fill-blue-100" />
                        )}
                        
                        {isAdmin && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(comment.id);
                            }}
                            className="ml-1 p-0.5 text-muted-foreground hover:text-red-500 transition-colors"
                            title="Delete comment"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </span>
                      
                      <div className={`group relative px-3 py-2 text-sm shadow-sm
                        ${isMe 
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-none' 
                          : 'bg-card border border-border rounded-2xl rounded-bl-none text-foreground'
                        }`}
                      >
                        {comment.message}
                        
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
                                  onClick={() => toast({ description: `Reacted with ${emoji}` })}
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
            
            {/* NAME INPUT SECTION */}
            {!isAdmin && !isNameSet && (
               <div className="relative">
                 <Input 
                   placeholder="Enter your name..." 
                   value={userName}
                   onChange={(e) => setUserName(e.target.value)}
                   className="h-8 text-xs bg-muted/50 pr-8"
                 />
               </div>
            )}

            {/* Change Name Option (Shown when name is set) */}
            {!isAdmin && isNameSet && (
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-muted-foreground">Posting as <span className="font-bold text-foreground">{userName}</span></span>
                <button 
                  onClick={() => setIsNameSet(false)} 
                  className="text-[10px] text-blue-500 hover:text-blue-600 flex items-center gap-1"
                >
                  <Edit2 size={8} /> Change
                </button>
              </div>
            )}
            
            {isAdmin && (
              <div className="text-[10px] text-blue-500 flex items-center gap-1 px-1">
                <ShieldCheck size={10} /> Commenting as <span className="font-bold">{ADMIN_USER}</span>
              </div>
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
      </Button>
    </div>
  );
};
