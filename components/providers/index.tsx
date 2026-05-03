'use client';

import { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';
import SWRProvider from './SWRProvider';
import { ToastProvider } from '@/components/ui/Toast';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SWRProvider>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </SWRProvider>
  );
}
