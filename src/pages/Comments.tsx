import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserStats } from '@/components/UserStats';
import { MessageCircle, Send, User, Clock, Reply, Trash2, Heart } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  message: string;
  facebook_link?: string;
  creator_username: string;
  created_at: string;
  updated_at: string;
  reply_to?: string;
  replies?: Comment[];
  likes: number; // Added likes field
}

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [userName, setUserName] = useState('');
  const [newComment, setNewComment] = useState({
    message: '',
    facebook_link: ''
  });
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set()); // Track liked comments locally
  
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
    // Load liked comments from local storage para maalala ng browser kung nag-like na
    const storedLikes = localStorage.getItem('flame_liked_comments');
    if (storedLikes) {
        setLikedComments(new Set(JSON.parse(storedLikes)));
    }
  }, []);

  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading comments:', error);
        return;
      }

      // Organize comments with replies
      const commentsMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create map
      data?.forEach(comment => {
        // Ensure likes is a number (default to 0 if null)
        const commentWithLikes = { 
            ...comment, 
            likes: comment.likes || 0,
            replies: [] 
        } as unknown as Comment;
        commentsMap.set(comment.id, commentWithLikes);
      });

      // Second pass: organize replies
      data?.forEach(comment => {
        if (comment.reply_to) {
          const parentComment = commentsMap.get(comment.reply_to);
          if (parentComment) {
            parentComment.replies!.push(commentsMap.get(comment.id)!);
          }
        } else {
          topLevelComments.push(commentsMap.get(comment.id)!);
        }
      });

      setComments(topLevelComments);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  // --- LIKE FUNCTIONALITY ---
  const handleLike = async (commentId: string, currentLikes: number) => {
    const isLiked = likedComments.has(commentId);
    const newLikesCount = isLiked ? currentLikes - 1 : currentLikes + 1;

    // 1. Optimistic Update (Update UI immediately)
    const newLikedSet = new Set(likedComments);
    if (isLiked) {
        newLikedSet.delete(commentId);
    } else {
        newLikedSet.add(commentId);
    }
    setLikedComments(newLikedSet);
    localStorage.setItem('flame_liked_comments', JSON.stringify(Array.from(newLikedSet)));

    // Update local state tree immediately for snappy feel
    const updateLikesInTree = (list: Comment[]): Comment[] => {
        return list.map(c => {
            if (c.id === commentId) return { ...c, likes: newLikesCount };
            if (c.replies) return { ...c, replies: updateLikesInTree(c.replies) };
            return c;
        });
    };
    setComments(prev => updateLikesInTree(prev));

    // 2. Database Update
    try {
        const { error } = await supabase
            .from('comments')
            .update({ likes: newLikesCount })
            .eq('id', commentId);

        if (error) throw error;
    } catch (err) {
        console.error("Error updating like:", err);
        loadComments(); // Revert on error
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast({ title: "Error", description: "Please enter your name", variant: "destructive" });
      return;
    }
    if (!newComment.message.trim()) {
      toast({ title: "Error", description: "Message is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          name: userName.trim(),
          message: newComment.message.trim(),
          facebook_link: newComment.facebook_link.trim() || null,
          creator_username: userName.trim(),
          likes: 0
        });

      if (error) throw error;

      toast({ title: "Success", description: "Comment posted successfully!" });
      setNewComment({ message: '', facebook_link: '' });
      loadComments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit comment", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyMessage.trim()) {
      toast({ title: "Error", description: "Reply message is required", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          name: userName.trim() || 'Anonymous',
          message: replyMessage.trim(),
          creator_username: userName.trim() || 'anonymous',
          reply_to: parentId,
          likes: 0
        });

      if (error) throw error;

      toast({ title: "Success", description: "Reply posted successfully!" });
      setReplyMessage('');
      setReplyTo(null);
      loadComments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit reply", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    const pass = prompt("Enter Admin Password to Delete:");
    if (pass !== "darman18") {
        toast({ title: "Error", description: "Wrong password", variant: "destructive" });
        return;
    }

    try {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (error) throw error;
      toast({ title: "Success", description: "Comment deleted" });
      loadComments();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Card key={comment.id} className={`hover:shadow-lg transition-shadow ${isReply ? 'ml-8 mt-3 border-l-4 border-l-primary/20' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-foreground">{comment.name}</h3>
                {comment.facebook_link && (
                  <a href={comment.facebook_link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600 text-xs px-2 py-0.5 bg-blue-500/10 rounded-full">
                    FB Profile
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {formatDate(comment.created_at)}
              </div>
            </div>
            
            <p className="text-foreground/90 whitespace-pre-wrap break-words mb-4 text-sm leading-relaxed">
              {comment.message}
            </p>

            <div className="flex items-center gap-4 pt-2 border-t border-border/50">
              {/* BUTTON NG REACT/LIKE */}
              <button
                onClick={() => handleLike(comment.id, comment.likes)}
                className={`flex items-center gap-1.5 text-sm transition-colors group ${
                    likedComments.has(comment.id) ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${likedComments.has(comment.id) ? 'fill-current' : 'group-hover:scale-110 transition-transform'}`} />
                <span>{comment.likes || 0}</span>
              </button>

              {!isReply && (
                <button
                  onClick={() => setReplyTo(comment.id)}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  Reply
                </button>
              )}

              <button 
                onClick={() => handleDelete(comment.id)}
                className="ml-auto text-muted-foreground hover:text-red-500 transition-colors"
                title="Delete Comment"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border animate-in fade-in zoom-in-95">
                <Label htmlFor="reply" className="text-xs">Replying to {comment.name}</Label>
                <Textarea
                  id="reply"
                  placeholder="Write your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={2}
                  className="mt-2 mb-2 bg-background"
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="ghost" size="sm" onClick={() => { setReplyTo(null); setReplyMessage(''); }}>Cancel</Button>
                  <Button size="sm" onClick={() => handleReply(comment.id)} disabled={isSubmitting}>
                    {isSubmitting ? "..." : "Post Reply"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center sm:justify-start gap-3">
            <MessageCircle className="w-8 h-8 text-primary" />
            Community Chat
          </h1>
          <p className="text-muted-foreground">Join the discussion with other viewers.</p>
        </div>

        {/* Comment Form */}
        <Card className="mb-8 shadow-md border-primary/10">
          <CardHeader>
            <CardTitle className="text-lg">Write a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" placeholder="Juan Dela Cruz" value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="facebook">Facebook Link (Optional)</Label>
                    <Input id="facebook" placeholder="fb.com/profile" value={newComment.facebook_link} onChange={(e) => setNewComment(prev => ({ ...prev, facebook_link: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="What's on your mind?" value={newComment.message} onChange={(e) => setNewComment(prev => ({ ...prev, message: e.target.value }))} rows={3} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                <Send className="w-4 h-4 mr-2" /> Post Comment
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-foreground px-1">
            Recent Activity ({comments.reduce((count, c) => count + 1 + (c.replies?.length || 0), 0)})
          </h2>
          
          {comments.length === 0 ? (
            <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground">No comments yet.</p>
            </div>
          ) : (
            <div className="space-y-4 pb-20">
              {comments.map(comment => renderComment(comment))}
            </div>
          )}
        </div>
      </div>
      <UserStats pagePath="/comments" />
    </div>
  );
};

export default Comments;
