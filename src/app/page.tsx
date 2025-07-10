'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/use-transaction';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { isLoggedIn, isInitializing } = useTransaction();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing) {
      if (isLoggedIn) {
        router.replace('/transaction');
      } else {
        router.replace('/login');
      }
    }
  }, [isLoggedIn, isInitializing, router]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Menyiapkan aplikasi...</p>
      </div>
    </div>
  );
}
