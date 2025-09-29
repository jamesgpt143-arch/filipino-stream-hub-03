import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Send, User, Clock } from 'lucide-react';

interface Comment {
  id: string;
  name: string;
  message: string;
  facebook_link?: string;
  creator_username: string;
  created_at: string;
  updated_at: string;
}

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    name: '',
    message: '',
    facebook_link: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { username } = useAuth();

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

      setComments(data || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.name.trim() || !newComment.message.trim()) {
      toast({
        title: "Error",
        description: "Name and message are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          name: newComment.name.trim(),
          message: newComment.message.trim(),
          facebook_link: newComment.facebook_link.trim() || null,
          creator_username: username || 'anonymous'
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

      setNewComment({ name: '', message: '', facebook_link: '' });
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <MessageCircle className="w-8 h-8 text-primary" />
            Comments
          </h1>
          <p className="text-muted-foreground">Share your thoughts and connect with other viewers</p>
        </div>

        {/* Comment Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Leave a Comment</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={newComment.name}
                    onChange={(e) => setNewComment(prev => ({ ...prev, name: e.target.value }))}
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
            Recent Comments ({comments.length})
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
              {comments.map((comment) => (
                <Card key={comment.id} className="hover:shadow-lg transition-shadow">
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
                        
                        <p className="text-foreground whitespace-pre-wrap break-words">
                          {comment.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Comments;