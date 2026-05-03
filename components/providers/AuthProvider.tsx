'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import useSWR from 'swr';

interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  credits: number;
  onboarded: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  refreshToken: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  refreshToken: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  // Load token from localStorage on mount
  useEffect(() => {
    mountedRef.current = true;
    const saved = localStorage.getItem('token');
    if (saved) {
      setToken(saved);
    } else {
      setLoading(false);
    }
    return () => { mountedRef.current = false; };
  }, []);

  // Fetch user data when token changes
  const { data, error, mutate } = useSWR(
    token ? ['/api/auth/me', token] : null,
    async ([url, t]) => {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error('Auth failed');
      return res.json();
    },
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
      setLoading(false);
    } else if (error) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      setLoading(false);
    }
  }, [data, error]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '登录失败');
    // Set user and token atomically
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '注册失败');
    // Set user and token atomically
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('swr-cache');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  }, []);

  const refreshToken = useCallback(() => {
    mutate();
  }, [mutate]);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  );
}
