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
import { MessageCircle, Send, User, Clock, Reply, Trash2 } from 'lucide-react';

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
  const { toast } = useToast();

  useEffect(() => {
    loadComments();
  }, []);


  const loadComments = async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments",
          variant: "destructive"
        });
        return;
      }

      // Organize comments with replies
      const commentsMap = new Map<string, Comment>();
      const topLevelComments: Comment[] = [];

      // First pass: create map of all comments
      data?.forEach(comment => {
        commentsMap.set(comment.id, { ...comment, replies: [] });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive"
      });
      return;
    }

    if (!newComment.message.trim()) {
      toast({
        title: "Error",
        description: "Message is required",
        variant: "destructive"
      });
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
          creator_username: userName.trim()
        });

      if (error) {
        console.error('Error submitting comment:', error);
        toast({
          title: "Error",
          description: "Failed to submit comment",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Comment posted successfully!"
      });

      setNewComment({ message: '', facebook_link: '' });
      loadComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error",
        description: "Failed to submit comment",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Reply message is required",
        variant: "destructive"
      });
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
          reply_to: parentId
        });

      if (error) {
        console.error('Error submitting reply:', error);
        toast({
          title: "Error",
          description: "Failed to submit reply",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Reply posted successfully!"
      });

      setReplyMessage('');
      setReplyTo(null);
      loadComments();
    } catch (error) {
      console.error('Error submitting reply:', error);
      toast({
        title: "Error",
        description: "Failed to submit reply",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error deleting comment:', error);
        toast({
          title: "Error",
          description: "Failed to delete comment",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success",
        description: "Comment deleted successfully"
      });

      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <Card key={comment.id} className={`hover:shadow-lg transition-shadow ${isReply ? 'ml-8 mt-3' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{comment.name}</h3>
                {comment.facebook_link && (
                  <a 
                    href={comment.facebook_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 text-sm"
                  >
                    Facebook
                  </a>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatDate(comment.created_at)}
                <Badge variant="outline" className="text-xs">
                  by {comment.creator_username}
                </Badge>
              </div>
            </div>
            
            <p className="text-foreground whitespace-pre-wrap break-words mb-3">
              {comment.message}
            </p>

            <div className="flex items-center gap-2">
              {!isReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(comment.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Reply className="w-4 h-4 mr-1" />
                  Reply
                </Button>
              )}
            </div>

            {/* Reply Form */}
            {replyTo === comment.id && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <Label htmlFor="reply">Reply to {comment.name}</Label>
                <Textarea
                  id="reply"
                  placeholder="Write your reply..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post Reply"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyTo(null);
                      setReplyMessage('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4">
            {comment.replies.map(reply => renderComment(reply, true))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                <MessageCircle className="w-8 h-8 text-primary" />
                Comments
              </h1>
              <p className="text-muted-foreground">Share your thoughts and connect with other viewers</p>
            </div>
          </div>
        </div>

        {/* Comment Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Leave a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="facebook">Facebook Profile (optional)</Label>
                <Input
                  id="facebook"
                  placeholder="https://facebook.com/yourprofile"
                  value={newComment.facebook_link}
                  onChange={(e) => setNewComment(prev => ({ ...prev, facebook_link: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Write your comment here..."
                  value={newComment.message}
                  onChange={(e) => setNewComment(prev => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  required
                />
              </div>

              <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Comments List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Recent Comments ({comments.reduce((count, comment) => count + 1 + (comment.replies?.length || 0), 0)})
          </h2>
          
          {comments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No comments yet. Be the first to share your thoughts!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
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