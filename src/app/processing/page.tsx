
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTransaction } from '@/hooks/use-transaction';
import { Loader2, Wallet } from 'lucide-react';

export default function ProcessingPage() {
    const { transactionResult, isInitializing, isLoggedIn } = useTransaction();
    const router = useRouter();

    useEffect(() => {
        if (!isInitializing && !isLoggedIn) {
            router.replace('/login');
            return;
        }
        
        // Jika proses transaksi selesai (data 'transactionResult' sudah ada di context),
        // arahkan ke halaman hasil.
        if (transactionResult) {
            router.replace('/bnipayment');
        }
    }, [transactionResult, isInitializing, isLoggedIn, router]);
    
    // Selama transaksi diproses, transactionResult akan null.
    // Tampilkan UI loading ini.
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-8 bg-background p-4 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center">
                <Loader2 className="absolute h-24 w-24 animate-spin text-primary/50" />
                <Wallet className="h-12 w-12 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
                Memproses Transaksi Anda...
            </h1>
            <p className="max-w-md text-center text-sm text-muted-foreground">
                Ini mungkin memerlukan beberapa saat. Mohon jangan tutup atau refresh halaman ini.
            </p>
        </div>
    );
}
