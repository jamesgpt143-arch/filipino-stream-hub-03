import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  username: string | null;
  isAdmin: boolean;
  login: (username: string) => void;
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

  const login = (username: string) => {
    const trimmedUsername = username.trim();
    if (trimmedUsername) {
      setUsername(trimmedUsername);
      localStorage.setItem('flameiptv_username', trimmedUsername);
    }
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
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};