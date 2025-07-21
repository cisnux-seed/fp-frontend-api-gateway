
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/use-transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { GojekIcon, OvoIcon, ShopeePayIcon } from '@/components/icons';
import { ArrowLeft, CheckCircle2, XCircle, ArrowUpCircle, Loader2, History as HistoryIcon, FileText } from 'lucide-react';
import type { TransactionResponse, PaymentMethodApi, PaymentMethodUI } from '@/lib/types';

const paymentMethodMap: Record<PaymentMethodApi, { name: PaymentMethodUI, icon: React.ElementType }> = {
  GOPAY: { name: 'Gojek', icon: GojekIcon },
  SHOPEE_PAY: { name: 'ShopeePay', icon: ShopeePayIcon },
  BANK_TRANSFER: { name: 'Gojek', icon: GojekIcon }, // Fallback
};

export default function HistoryPage() {
  const { history, isLoggedIn, isInitializing, fetchUserData } = useTransaction();
  const router = useRouter();

  useEffect(() => {
    if (!isInitializing && !isLoggedIn) {
      router.replace('/login');
    }
  }, [isLoggedIn, isInitializing, router]);

  // Memuat data saat komponen dimuat, jika sudah login
  useEffect(() => {
    if(isLoggedIn) {
        fetchUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  if (isInitializing || !isLoggedIn) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <HistoryIcon className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Riwayat Transaksi</CardTitle>
                <CardDescription>Daftar semua transaksi yang telah Anda lakukan.</CardDescription>
              </div>
            </div>
            <Button variant="outline" onClick={() => router.push('/transaction')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map((t: TransactionResponse) => {
                 const PaymentInfo = t.paymentMethod ? paymentMethodMap[t.paymentMethod] : null;
                 const isSuccess = t.transactionStatus === 'SUCCESS';
                
                 return (
                  <div key={t.id} className="flex items-center space-x-4 rounded-lg border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <ArrowUpCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        {PaymentInfo?.icon && <PaymentInfo.icon className="h-5 w-5" />}
                        <p className="font-semibold">{PaymentInfo?.name || t.paymentMethod} - {t.transactionType}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{t.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(t.createdAt), "d MMM yyyy, HH:mm", { locale: id })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end text-right">
                       <p className={`font-bold text-base ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                        -Rp{t.amount.toLocaleString('id-ID')}
                       </p>
                       <div className="flex items-center gap-1.5">
                         {isSuccess ? (
                           <CheckCircle2 className="h-4 w-4 text-green-500" />
                         ) : (
                           <XCircle className="h-4 w-4 text-red-500" />
                         )}
                         <span className={`text-sm font-medium ${isSuccess ? 'text-green-600' : 'text-red-600'}`}>
                           {t.transactionStatus}
                         </span>
                       </div>
                    </div>
                  </div>
                 )
                })}
            </div>
          ) : (
            <div className="py-16 text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Belum Ada Transaksi</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                    Riwayat transaksi Anda akan muncul di sini setelah Anda mulai bertransaksi.
                </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
