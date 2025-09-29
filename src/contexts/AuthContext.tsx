import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  username: string | null;
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

  useEffect(() => {
    // Check for existing session on mount
    const savedUsername = localStorage.getItem('flameiptv_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const trimmedUsername = username.trim();
    if (trimmedUsername && password) {
      // Get stored users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('flameiptv_users') || '{}');
      
      // Check if user exists and password matches
      if (storedUsers[trimmedUsername] && storedUsers[trimmedUsername] === password) {
        setUsername(trimmedUsername);
        localStorage.setItem('flameiptv_username', trimmedUsername);
        return true;
      }
    }
    return false;
  };

  const signUp = async (username: string, password: string): Promise<boolean> => {
    const trimmedUsername = username.trim();
    if (trimmedUsername && password) {
      // Get stored users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('flameiptv_users') || '{}');
      
      // Check if user already exists
      if (storedUsers[trimmedUsername]) {
        return false; // User already exists
      }
      
      // Create new user
      storedUsers[trimmedUsername] = password;
      localStorage.setItem('flameiptv_users', JSON.stringify(storedUsers));
      
      // Auto login after signup
      setUsername(trimmedUsername);
      localStorage.setItem('flameiptv_username', trimmedUsername);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUsername(null);
    localStorage.removeItem('flameiptv_username');
  };

  const isAdmin = username === 'flame143';
  const isAuthenticated = Boolean(username);

  return (
    <AuthContext.Provider value={{
      username,
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