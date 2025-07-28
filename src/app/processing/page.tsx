
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/use-transaction';
import { Loader2 } from 'lucide-react';
import { BniIcon } from '@/components/icons';

export default function ProcessingPage() {
  const { transaction, isInitializing: isTransactionInitializing } = useTransaction();
  const router = useRouter();

  useEffect(() => {
    // Jika transaksi sudah ada hasilnya (baik sukses maupun gagal),
    // langsung arahkan ke halaman hasil.
    if (!isTransactionInitializing && transaction) {
      router.replace('/bnipayment');
    }
  }, [transaction, isTransactionInitializing, router]);

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-6 bg-background p-4">
      <div className="mx-auto h-auto w-48">
        <BniIcon className="h-full w-full object-contain" />
      </div>
      <div className="flex items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground">
            Transaksi Sedang Diproses
            </h2>
            <p className="text-muted-foreground">
            Mohon tunggu, kami sedang menghubungi mitra kami...
            </p>
        </div>
      </div>
    </div>
  );
}
