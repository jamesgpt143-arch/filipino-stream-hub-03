import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  username: string | null;
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  signUp: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Get profile to set username
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', session.user.id)
            .maybeSingle();
          
          setUsername(profile?.display_name || session.user.email?.split('@')[0] || null);
        } else {
          setUsername(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', session.user.id)
          .maybeSingle()
          .then(({ data: profile }) => {
            setUsername(profile?.display_name || session.user.email?.split('@')[0] || null);
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use username as email for Supabase (username@flameiptv.local)
      const email = `${username.trim()}@flameiptv.local`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      return !!data.user;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signUp = async (username: string, password: string): Promise<boolean> => {
    try {
      // Use username as email for Supabase (username@flameiptv.local)
      const email = `${username.trim()}@flameiptv.local`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            display_name: username.trim()
          }
        }
      });

      if (error) throw error;
      
      return !!data.user;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    setUser(null);
    setSession(null);
  };

  const isAdmin = username === 'flame143';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      username,
      user,
      session,
      isAdmin,
      login,
      signUp,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};
