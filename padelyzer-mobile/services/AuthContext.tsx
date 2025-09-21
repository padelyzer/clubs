import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterData, AuthTokens } from '../types';
import ApiService from './api';

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [token, userData] = await AsyncStorage.multiGet(['auth_token', 'user_data']);
      
      if (token[1] && userData[1]) {
        const parsedUser = JSON.parse(userData[1]);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.post<{ user: User; tokens: AuthTokens }>('/api/auth/login', credentials);
      
      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        
        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['auth_token', tokens.accessToken],
          ['refresh_token', tokens.refreshToken],
          ['user_data', JSON.stringify(userData)],
        ]);
        
        setUser(userData);
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Login failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.post<{ user: User; tokens: AuthTokens }>('/api/auth/register', data);
      
      if (response.success && response.data) {
        const { user: userData, tokens } = response.data;
        
        // Store tokens and user data
        await AsyncStorage.multiSet([
          ['auth_token', tokens.accessToken],
          ['refresh_token', tokens.refreshToken],
          ['user_data', JSON.stringify(userData)],
        ]);
        
        setUser(userData);
        
        return { success: true };
      } else {
        return { success: false, error: response.error || 'Registration failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      // Call logout endpoint to invalidate tokens
      await ApiService.post('/api/auth/logout');
      
      // Clear local storage
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local data
      await AsyncStorage.multiRemove(['auth_token', 'refresh_token', 'user_data']);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await ApiService.get<User>('/api/auth/me');
      
      if (response.success && response.data) {
        await AsyncStorage.setItem('user_data', JSON.stringify(response.data));
        setUser(response.data);
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshUserData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}