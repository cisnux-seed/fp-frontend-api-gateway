
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/use-transaction';
import { Loader2 } from 'lucide-react';
import { GojekIcon } from '@/components/icons';
import { Card, CardContent } from '@/components/ui/card';

export default function GopayPaymentPage() {
  const { transaction, isInitializing: isTransactionInitializing } = useTransaction();
  const router = useRouter();

  useEffect(() => {
    // Jika transaksi sudah ada hasilnya (baik sukses maupun gagal),
    // tunggu sebentar lalu arahkan ke halaman hasil akhir.
    if (!isTransactionInitializing && transaction) {
      const timer = setTimeout(() => {
        router.replace('/bnipayment');
      }, 3000); // Tunggu 3 detik

      // Membersihkan timer jika komponen unmount
      return () => clearTimeout(timer);
    }
  }, [transaction, isTransactionInitializing, router]);

  // Jika belum ada hasil, tampilkan halaman loading
  return (
    <div 
        className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/logo-gp.jpeg')" }}
    >
      <div className="absolute inset-0 bg-black/50 z-0" />
      <Card className="w-full max-w-sm shadow-lg z-10 bg-white">
        <CardContent className="flex flex-col items-center justify-center space-y-6 p-10">
          <div className="mx-auto h-auto w-32">
            <GojekIcon className="h-full w-full object-contain" />
          </div>
          <div className="flex items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-green-600" />
            <div className="text-center">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Menghubungi GoPay...
                </h2>
                <p className="text-gray-500">
                    Silakan tunggu, transaksi Anda sedang diproses.
                </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
