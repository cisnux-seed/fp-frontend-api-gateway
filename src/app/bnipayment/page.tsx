
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/use-transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowLeft, LogOut, ArrowUpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GojekIcon, ShopeePayIcon } from '@/components/icons';
import type { PaymentMethod } from '@/lib/types';

const paymentIcons: { [key in PaymentMethod]: React.ElementType } = {
  Gojek: GojekIcon,
  ShopeePay: ShopeePayIcon,
};

export default function BniPaymentPage() {
  const { transaction, logout, isLoggedIn, isInitializing } = useTransaction();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      router.replace('/login');
    }
    // Jika tidak sedang loading dan TIDAK ADA data transaksi,
    // kembalikan pengguna ke halaman transaksi untuk membuat yang baru.
    if (!isInitializing && !transaction) {
        router.replace('/transaction');
    }
  }, [transaction, isLoggedIn, isInitializing, router]);

  if (isInitializing || !transaction) {
    return (
      <div 
        className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bni-logo.png')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
        <div className="z-10 text-white flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Memuat hasil transaksi...</p>
        </div>
      </div>
    );
  }

  const isSuccess = transaction.status === 'Success';
  const PaymentIcon = paymentIcons[transaction.payment_method];

  return (
    <div 
        className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/logo-bni.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/50 z-0" />
      <Card className="w-full max-w-md shadow-lg z-10">
        <CardHeader className="items-center text-center">
          {isSuccess ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          <CardTitle className={cn('text-3xl', isSuccess ? 'text-green-600' : 'text-red-600')}>
            Transaksi {isSuccess ? 'Berhasil' : 'Gagal'}
          </CardTitle>
          <CardDescription>
            {transaction.message ? transaction.message : 'Berikut adalah rincian transaksi Anda.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-3">
              <InfoRow label="Nomor Telepon" value={transaction.phone_number} />
              <InfoRow label="Mitra Pembayaran">
                <div className="flex items-center gap-2">
                    {PaymentIcon && <PaymentIcon className="h-5 w-5" />}
                    <span>{transaction.payment_method}</span>
                </div>
              </InfoRow>
              <InfoRow label="Jenis Transaksi">
                <div className="flex items-center gap-2">
                    <ArrowUpCircle className="h-5 w-5 text-muted-foreground" />
                    <span>{transaction.transaction_type}</span>
                </div>
              </InfoRow>
              <InfoRow label="Nominal" value={`Rp${transaction.nominal.toLocaleString('id-ID')}`} />
          </div>
        </CardContent>
        <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="outline" onClick={() => router.push('/transaction')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Transaksi Baru
          </Button>
          <Button onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

const InfoRow = ({ label, value, children }: { label: string; value?: string; children?: React.ReactNode }) => (
  <div className="flex justify-between items-center text-sm">
    <p className="text-muted-foreground">{label}</p>
    {value && <p className="font-semibold">{value}</p>}
    {children}
  </div>
);
