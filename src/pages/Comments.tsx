
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { MessageCircle, Send, User, Trash2, LogIn, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Comment {
  id: string;
  name: string;
  message: string;
  created_at: string;
  user_id: string;
  reply_to?: string | null;
  replies?: Comment[];
}

interface UserRole {
  role: 'admin' | 'moderator' | 'user';
}

const Comments = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyToName, setReplyToName] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', { event, session });
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('User logged in:', session.user.email);
          // Fetch user role
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Existing session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('Found existing user:', session.user.email);
        fetchUserRole(session.user.id);
      }
    });

    // Load comments
    loadComments();

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    console.log('Fetching user role for:', userId);
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();

    console.log('User role query result:', { data, error });

    if (!error && data) {
      console.log('User role found:', data.role);
      setUserRole(data as UserRole);
    } else {
      console.log('No user role found or error:', error);
      setUserRole(null);
    }
  };

  const loadComments = async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('id, name, message, created_at, user_id, reply_to')
      .order('created_at', { ascending: false });

    if (!error && data) {
      // Organize comments into threads
      const commentMap = new Map();
      const rootComments: Comment[] = [];

      // First pass: create all comments
      data.forEach(comment => {
        commentMap.set(comment.id, { ...comment, replies: [] });
      });

      // Second pass: organize into threads
      data.forEach(comment => {
        if (comment.reply_to) {
          const parent = commentMap.get(comment.reply_to);
          if (parent) {
            parent.replies.push(commentMap.get(comment.id));
          }
        } else {
          rootComments.push(commentMap.get(comment.id));
        }
      });

      setComments(rootComments);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Logged in successfully!",
        });
      } else {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl
          }
        });
        if (error) throw error;
        toast({
          title: "Success",
          description: "Account created successfully!",
        });
      }
      setEmail('');
      setPassword('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Success",
      description: "Logged out successfully!",
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to comment",
        variant: "destructive",
      });
      return;
    }

    if (!message.trim()) {
      toast({
        title: "Error",
        description: "Please enter a message",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const insertData: any = {
        name: user.email || 'Anonymous',
        message: message.trim(),
        user_id: user.id,
      };

      if (replyTo) {
        insertData.reply_to = replyTo;
      }

      const { error } = await supabase
        .from('comments')
        .insert(insertData);

      if (error) throw error;
      
      setMessage('');
      setReplyTo(null);
      setReplyToName(null);
      loadComments(); // Reload comments
      toast({
        title: "Success",
        description: replyTo ? "Reply posted successfully!" : "Comment posted successfully!",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post comment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    console.log('Attempting to delete comment:', commentId);
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      loadComments(); // Reload comments
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Debug function to check if user can delete
  const canDeleteComment = (comment: Comment) => {
    const isOwnComment = user && comment.user_id === user.id;
    const isAdminOrModerator = userRole && (userRole.role === 'admin' || userRole.role === 'moderator');
    
    console.log('Delete permission check:', {
      commentId: comment.id,
      userId: user?.id,
      commentUserId: comment.user_id,
      userRole: userRole?.role,
      isOwnComment,
      isAdminOrModerator,
      canDelete: isOwnComment || isAdminOrModerator
    });
    
    return isOwnComment || isAdminOrModerator;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <MessageCircle className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Comments</h1>
            </div>
            <p className="text-muted-foreground">Share your thoughts about flameiptv</p>
            
            {/* Auth Status with Debug Info */}
            {user ? (
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="text-muted-foreground">
                  Logged in as: <span className="text-foreground font-medium">{user.email}</span>
                  {userRole && userRole.role === 'admin' && (
                    <span className="ml-2 px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-xs">ADMIN</span>
                  )}
                  {userRole && userRole.role === 'moderator' && (
                    <span className="ml-2 px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs">MODERATOR</span>
                  )}
                  {/* Debug info */}
                  <span className="ml-2 text-xs text-gray-500">
                    (Role: {userRole?.role || 'loading...'})
                  </span>
                </span>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-1" />
                  Logout
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Please log in to comment</p>
            )}
          </div>

          {/* Auth Form or Comment Form */}
          {!user ? (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {isLogin ? 'Login to Comment' : 'Create Account'}
                </h2>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  <div>
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <LogIn className="w-4 h-4 mr-2" />
                    {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => setIsLogin(!isLogin)}
                    className="w-full"
                  >
                    {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">
                  {replyTo ? `Reply to ${replyToName}` : 'Leave a Comment'}
                </h2>
                {replyTo && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setReplyTo(null);
                      setReplyToName(null);
                    }}
                  >
                    Cancel Reply
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <div>
                    <Textarea
                      placeholder={replyTo ? "Write your reply..." : "Write your comment..."}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      className="w-full"
                    />
                  </div>
                  <Button type="submit" disabled={loading} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    {loading ? 'Posting...' : (replyTo ? 'Post Reply' : 'Post Comment')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Comments ({comments.length})
            </h2>
            
            {comments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                </CardContent>
              </Card>
            ) : (
              comments.map((comment) => (
                <div key={comment.id}>
                  <Card className="overflow-hidden">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground">{comment.name}</h4>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {/* Reply button */}
                              {user && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setReplyTo(comment.id);
                                    setReplyToName(comment.name);
                                  }}
                                  className="text-primary hover:text-primary/80"
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Reply
                                </Button>
                              )}
                              
                              {/* Delete button - more prominent styling */}
                              {canDeleteComment(comment) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteComment(comment.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-200 hover:border-red-300"
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-foreground whitespace-pre-wrap">{comment.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-2 space-y-2">
                      {comment.replies.map((reply) => (
                        <Card key={reply.id} className="bg-muted/30">
                          <CardContent className="pt-4">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="w-4 h-4 text-primary" />
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <h5 className="font-medium text-foreground text-sm">{reply.name}</h5>
                                    <span className="text-xs text-muted-foreground">
                                      {formatDate(reply.created_at)}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center gap-1">
                                    {/* Delete button for replies - more prominent */}
                                    {canDeleteComment(reply) && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDeleteComment(reply.id)}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-200 hover:border-red-300 h-6 px-2"
                                      >
                                        <Trash2 className="w-3 h-3 mr-1" />
                                        Delete
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                <p className="text-foreground text-sm whitespace-pre-wrap">{reply.message}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comments;
