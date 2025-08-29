import { useState, useEffect, useCallback } from 'react';
import { JWTPayload } from '@/lib/auth';

export interface AuthState {
  isAuthenticated: boolean;
  user: JWTPayload | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    error: null,
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/check', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Auth check failed');
      }

      const data = await response.json();
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        loading: false,
        error: null,
      });
    } catch (err) {
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      setAuthState({
        isAuthenticated: true,
        user: data.user,
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
      throw err;
    }
  }, []);

  const adminLogin = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Admin login failed');
      }

      const data = await response.json();
      setAuthState({
        isAuthenticated: true,
        user: data.admin,
        loading: false,
        error: null,
      });
      return data;
    } catch (err) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Unknown error',
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      setAuthState({
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    } catch (err) {
      setAuthState(prev => ({ ...prev, loading: false }));
      console.error('Logout failed:', err);
    }
  }, []);

  return { ...authState, login, adminLogin, logout, checkAuth };
}