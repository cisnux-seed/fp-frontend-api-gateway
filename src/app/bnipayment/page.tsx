
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/use-transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, ArrowLeft, LogOut, ArrowUpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GojekIcon, OvoIcon, ShopeePayIcon } from '@/components/icons';
import type { PaymentMethodUI, TransactionResponse, PaymentMethodApi } from '@/lib/types';

const paymentMethodMap: Record<PaymentMethodApi, { name: PaymentMethodUI, icon: React.ElementType }> = {
  GOPAY: { name: 'Gojek', icon: GojekIcon },
  SHOPEE_PAY: { name: 'ShopeePay', icon: ShopeePayIcon },
  BANK_TRANSFER: { name: 'Gojek', icon: GojekIcon }, // Fallback
};

export default function BniPaymentPage() {
  const { transactionResult, logout, isLoggedIn, isInitializing } = useTransaction();
  const router = useRouter();

  const transaction = transactionResult?.data;
  const isSuccess = transaction?.transactionStatus === 'SUCCESS';
  const message = transactionResult?.meta.message;

  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      router.replace('/login');
    }
    // Jika halaman di-refresh dan tidak ada data transaksi, kembalikan ke halaman utama
    if (!isInitializing && !transactionResult) {
        router.replace('/transaction');
    }
  }, [transactionResult, isLoggedIn, isInitializing, router]);

  // Tampilkan loading jika data belum siap
  if (isInitializing || !transactionResult) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <p>Memuat hasil transaksi...</p>
      </div>
    );
  }

  const PaymentInfo = transaction ? paymentMethodMap[transaction.paymentMethod] : null;

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="items-center text-center">
          {isSuccess ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          <CardTitle className={cn('text-3xl', isSuccess ? 'text-green-600' : 'text-red-600')}>
            Transaksi {isSuccess ? 'Berhasil' : 'Gagal'}
          </CardTitle>
          <CardDescription>{message || (isSuccess ? 'Berikut adalah rincian transaksi Anda.' : 'Transaksi tidak dapat diproses.')}</CardDescription>
        </CardHeader>
        {transaction && (
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
                <InfoRow label="Nomor Telepon" value={transaction.phone_number || '-'} />
                <InfoRow label="Mitra Pembayaran">
                  <div className="flex items-center gap-2">
                      {PaymentInfo?.icon && <PaymentInfo.icon className="h-5 w-5" />}
                      <span>{PaymentInfo?.name || transaction.paymentMethod}</span>
                  </div>
                </InfoRow>
                <InfoRow label="Jenis Transaksi">
                  <div className="flex items-center gap-2">
                      <ArrowUpCircle className="h-5 w-5 text-muted-foreground" />
                      <span>{transaction.transactionType}</span>
                  </div>
                </InfoRow>
                <InfoRow label="Nominal" value={`Rp${transaction.amount.toLocaleString('id-ID')}`} />
            </div>
          </CardContent>
        )}
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
