'use client';

import { SWRConfig } from 'swr';
import { ReactNode, useCallback } from 'react';

const fetcher = async (url: string) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `请求失败 (${res.status})`);
  }
  return res.json();
};

// localStorage persistence for SWR cache
function cacheProvider() {
  if (typeof window === 'undefined') return new Map();

  const map = new Map<string, any>();

  // Restore from localStorage on init
  try {
    const saved = localStorage.getItem('swr-cache');
    if (saved) {
      const entries = JSON.parse(saved);
      for (const [key, value] of entries) {
        map.set(key, value);
      }
    }
  } catch {}

  // Save to localStorage before unload
  if (typeof window !== 'undefined') {
    const save = () => {
      try {
        const entries = Array.from(map.entries()).filter(
          ([key]) => !key.includes('/api/auth/') // Don't cache auth endpoints
        );
        localStorage.setItem('swr-cache', JSON.stringify(entries));
      } catch {}
    };
    window.addEventListener('beforeunload', save);
  }

  return map;
}

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        fetcher,
        provider: cacheProvider,
        dedupingInterval: 2000,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
        onError: (err, key) => {
          // Don't redirect on auth endpoints or when already on login page
          if (err.message?.includes('401') && !key.includes('/api/auth/') && !window.location.pathname.includes('/login')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
