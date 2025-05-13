import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { pbApi } from '../api/pocketbase';
import type { User } from '../api/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  register: (email: string, password: string, name: string) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithOAuth: (provider: 'google' | 'apple') => Promise<void>;
  completeOAuthLogin: (code: string) => Promise<User>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<User>;
  updateAvatar: (file: File) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if already logged in
    const loadUser = async () => {
      setIsLoading(true);
      
      try {
        // Get current user from pocketbase if authenticated
        if (pbApi.isAuthenticated) {
          setUser(pbApi.currentUser);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Subscribe to auth state changes
    pbApi.client.authStore.onChange(() => {
      setUser(pbApi.currentUser);
    });
  }, []);

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    try {
      const user = await pbApi.register(email, password, name);
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const user = await pbApi.login(email, password);
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (provider: 'google' | 'apple') => {
    setIsLoading(true);
    try {
      await pbApi.loginWithOAuth(provider);
      // No need to set user here as this redirects the browser
    } catch (error) {
      console.error(`Error during ${provider} OAuth login:`, error);
      setIsLoading(false);
      throw error;
    }
  };

  const completeOAuthLogin = async (code: string) => {
    setIsLoading(true);
    try {
      const user = await pbApi.completeOAuthLogin(code);
      setUser(user);
      return user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    pbApi.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      const updatedUser = await pbApi.updateProfile(data);
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAvatar = async (file: File) => {
    setIsLoading(true);
    try {
      const updatedUser = await pbApi.updateAvatar(file);
      setUser(updatedUser);
      return updatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: pbApi.isAuthenticated,
        register,
        login,
        loginWithOAuth,
        completeOAuthLogin,
        logout,
        updateProfile,
        updateAvatar,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
