'use client';

import { TransactionProvider } from '@/context/TransactionContext';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <TransactionProvider>
      {children}
      <Toaster />
    </TransactionProvider>
  );
}
