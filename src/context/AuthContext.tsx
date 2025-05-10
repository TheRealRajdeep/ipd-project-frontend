"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, login, logout, register, setAuthHeader, UserData } from '@/lib/auth';
import { toast } from "sonner";

interface AuthContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const initAuth = () => {
      const user = getCurrentUser();
      if (user) {
        setUser(user);
        setAuthHeader(user.auth_token || null);
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await login(username, password);
      setUser(userData);
      setAuthHeader(userData.auth_token || null);
      toast.success("Login successful");
      router.push('/dashboard');
    } catch (err: any) {
      let errorMessage = 'Login failed';
      // Handle different types of errors
      if (err.response) {
        // The server responded with a status code outside the 2xx range
        if (err.response.data && err.response.data.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data && err.response.data.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid username or password';
        } else if (err.response.status === 401) {
          errorMessage = 'Unauthorized: Please check your credentials';
        }
      }
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (userData: any) => {
    setLoading(true);
    setError(null);
    try {
      // We now pass the correctly structured data directly to the register function
      await register(userData);
      toast.success("Registration successful. Please login.");
      router.push('/login');
    } catch (err: any) {
      let errorMessage = 'Registration failed';
      
      // Handle different types of registration errors
      if (err.response && err.response.data) {
        const data = err.response.data;
        // Django often returns field-specific errors
        if (typeof data === 'object') {
          const firstErrorKey = Object.keys(data)[0];
          if (firstErrorKey === 'profile' && typeof data.profile === 'object') {
            // Handle nested profile errors
            const profileErrorKey = Object.keys(data.profile)[0];
            errorMessage = `Profile ${profileErrorKey}: ${data.profile[profileErrorKey]}`;
          } else if (Array.isArray(data[firstErrorKey])) {
            errorMessage = `${firstErrorKey}: ${data[firstErrorKey][0]}`;
          } else if (typeof data[firstErrorKey] === 'string') {
            errorMessage = `${firstErrorKey}: ${data[firstErrorKey]}`;
          }
        } else if (typeof data === 'string') {
          errorMessage = data;
        }
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      setUser(null);
      setAuthHeader(null);
      toast.info("Logged out successfully");
      router.push('/login');
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      toast.error(err.message || 'Logout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
