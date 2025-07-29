'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { useTransaction } from '@/hooks/use-transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GojekIcon, ShopeePayIcon, BniIcon } from '@/components/icons';
import { Loader2, LogOut, Wallet, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { PaymentMethod } from '@/lib/types';

const formSchema = z.object({
    phone_number: z.string().min(10).max(15).regex(/^\d+$/, 'Hanya angka yang diperbolehkan'),
    nominal: z.number(),
    customNominal: z.string().optional(),
}).refine(data => {
    if (data.nominal === -1) {
        const value = Number(data.customNominal);
        return !isNaN(value) && value >= 10000;
    }
    return true;
}, {
    message: 'Nominal custom harus diisi dan minimal Rp10.000.',
    path: ['customNominal'],
});

export default function TransactionPage() {
    const { user, balance, account, isLoggedIn, isInitializing, logout, resetTransaction, fetchUserData } = useTransaction();
    const router = useRouter();
    const { toast } = useToast();

    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Gojek');
    const [isLoading, setIsLoading] = useState(false);
    const [showCustomNominal, setShowCustomNominal] = useState(false);


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone_number: '',
            nominal: 10000,
            customNominal: '',
        },
        mode: 'onChange',
    });

    const nominalValue = form.watch('nominal');

    // const token = typeof window !== 'undefined' ? localStorage.getItem('bni_user_token') : null;

    const token = localStorage.getItem('bni_user_token');

    const getAuthHeaders = () => {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        if (token) {
            headers.append('Authorization', `Bearer ${token}`);
        }
        return headers;
    };

    const processTransaction = async ({
                                          phone_number,
                                          amount,
                                          payment_method,
                                          // transaction_type,
                                          description,
                                      }: {
        phone_number: string;
        amount: number;
        payment_method: string;
        // transaction_type: string;
        description: string;
    }): Promise<void> => {
        if (!token) {
            toast({ variant: 'destructive', title: 'Sesi Tidak Ditemukan', description: 'Silakan login kembali.' });
            logout();
            return Promise.reject(new Error("User tidak sedang login"));
        }

        try {
            const response = await fetch(
                'https://kong-proxy-one-gate-payment.apps.ocp-one-gate-payment.skynux.fun/api/payment/wallet/topup',
                {
                    method: 'POST',
                    headers: getAuthHeaders(),
                    body: JSON.stringify({
                        phone_number,
                        amount,
                        payment_method,
                        // transaction_type,
                        description,
                    }),
                }
            );

            const resultData = await response.json();

            if (!response.ok) {
                throw new Error(resultData.message || 'Gagal memproses top-up.');
            }

            await fetchUserData();
            toast({
                title: 'Top Up Sukses',
                description: `Top up sebesar Rp${amount.toLocaleString('id-ID')} berhasil.`,
            });

            return Promise.resolve();
        } catch (error) {
            await fetchUserData();
            if (error instanceof Error) {
                toast({ variant: 'destructive', title: 'Top Up Gagal', description: error.message });
            }
            return Promise.reject(error);
        }
    };

    useEffect(() => {
        resetTransaction?.();
    }, [resetTransaction]);

    useEffect(() => {
        if (!isInitializing && !isLoggedIn) {
            router.replace('/login');
        }
    }, [isLoggedIn, isInitializing, router]);

    useEffect(() => {
        setShowCustomNominal(nominalValue === -1);
        if (nominalValue !== -1) {
            form.clearErrors('customNominal');
        }
    }, [nominalValue, form]);

    const paymentMethods = [
        { name: 'Gojek', icon: GojekIcon, placeholder: 'Contoh: 898081234567' },
        { name: 'ShopeePay', icon: ShopeePayIcon, placeholder: 'Contoh: 8970812345' },
    ];


    const nominals = [10000, 25000, 50000, 100000];

    const getPlaceholder = () => {
        return paymentMethods.find(p => p.name === paymentMethod)?.placeholder || 'Masukkan nomor telepon';
    };

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        const transactionNominal = data.nominal === -1 ? Number(data.customNominal) : data.nominal;

        if (balance < transactionNominal) {
            toast({
                variant: 'destructive',
                title: 'Transaksi Gagal',
                description: 'Saldo Anda tidak mencukupi.',
            });
            return;
        }

        setIsLoading(true);

        const paymentPageUrl = paymentMethod === 'Gojek' ? '/gopay/payment' : '/shopeepay/payment';

        const mapPaymentMethod = (method: string): string => {
            switch (method.toLowerCase()) {
                case 'gojek':
                    return 'GO_PAY';
                case 'shopeepay':
                    return 'SHOPEE_PAY';
                default:
                    return method.toUpperCase().replace(' ', '_');
            }
        };



        await processTransaction({
            phone_number: data.phone_number,
            amount: transactionNominal,
            payment_method: mapPaymentMethod(paymentMethod),
            // transaction_type: 'TOPUP',
            description: `Top up via ${paymentMethod} from web`,
        }).then(() => {
            router.push(paymentPageUrl);
        }).catch(() => {
            // Already handled inside processTransaction
        }).finally(() => {
            setIsLoading(false);
        });
    };

    if (isInitializing || !isLoggedIn) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-black bg-opacity-50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center" style={{ backgroundImage: "url('/images/logo-bni.jpg')" }}>
            <div className="absolute inset-0 bg-black/50 z-0" />
            <Card className="w-full max-w-2xl shadow-xl z-10">
                <CardHeader>
                    <div className="flex w-full items-center justify-between">
                        <div className="h-20 w-32 flex-shrink-0">
                            <BniIcon className="h-full w-full object-contain" />
                        </div>
                        <div className="flex flex-grow flex-col items-center px-4">
                            <h1 className="text-xl font-semibold capitalize text-foreground md:text-2xl">
                                <h2>Selamat Datang, {account?.id || 'Pengguna'}</h2>
                            </h1>
                            <p className="text-sm text-muted-foreground">Email Anda: {user?.email || '-'}</p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout" className="flex-shrink-0">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-6 w-6 text-primary" />
                            <div>
                                <p className="text-sm text-muted-foreground">Saldo Anda</p>
                                <p className="text-lg font-bold">Rp. {typeof balance === 'number' ? balance.toLocaleString() : 'Loading...'}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push('/history')}>
                            <History className="mr-2 h-4 w-4" />
                            Lihat Riwayat
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {/* Payment Method Selection */}
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">Pilih Mitra Pembayaran Top-up</Label>
                            <div className="grid grid-cols-2 gap-4">
                                {paymentMethods.map(({ name, icon: Icon }) => (
                                    <div
                                        key={name}
                                        onClick={() => setPaymentMethod(name as PaymentMethod)}
                                        className={cn(
                                            'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all',
                                            paymentMethod === name ? 'border-primary bg-primary/5' : 'border-border'
                                        )}
                                    >
                                        <Icon className="h-8 w-8" />
                                        <span className="text-sm font-medium">{name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-2">
                            <Label htmlFor="phone_number" className="text-lg font-semibold">Nomor Telepon</Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder={getPlaceholder()}
                                {...form.register('phone_number')}
                                className="text-base"
                            />
                            {form.formState.errors.phone_number && (
                                <p className="text-sm font-medium text-destructive">{form.formState.errors.phone_number.message}</p>
                            )}
                        </div>

                        {/* Nominal Selection */}
                        <Controller
                            name="nominal"
                            control={form.control}
                            render={({ field }) => (
                                <RadioGroup
                                    onValueChange={(value) => {
                                        const numValue = Number(value);
                                        field.onChange(numValue);
                                        if (numValue !== -1) {
                                            form.setValue('customNominal', '');
                                        }
                                    }}
                                    value={String(field.value)}
                                    className="space-y-2"
                                >
                                    <Label className="text-lg font-semibold">Pilih Nominal</Label>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                                        {nominals.map((n) => (
                                            <Label key={n} className={cn('flex cursor-pointer items-center justify-center rounded-md border-2 p-4 font-semibold transition-all', field.value === n ? 'border-primary bg-primary/5 text-primary' : 'border-border')}>
                                                <RadioGroupItem value={String(n)} className="sr-only" />
                                                Rp{n.toLocaleString('id-ID')}
                                            </Label>
                                        ))}
                                        <Label className={cn('flex cursor-pointer items-center justify-center rounded-md border-2 p-4 font-semibold transition-all', field.value === -1 ? 'border-primary bg-primary/5 text-primary' : 'border-border')}>
                                            <RadioGroupItem value="-1" className="sr-only" />
                                            Lainnya
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />

                        {/* Custom Nominal Input */}
                        {showCustomNominal && (
                            <div className="space-y-2">
                                <Label htmlFor="customNominal" className="text-lg font-semibold">Masukkan Nominal Custom</Label>
                                <Input
                                    id="customNominal"
                                    type="number"
                                    placeholder="Contoh: 20000"
                                    step="1000"
                                    {...form.register('customNominal')}
                                    className="text-base"
                                />
                                {form.formState.errors.customNominal && (
                                    <p className="text-sm font-medium text-destructive">{form.formState.errors.customNominal.message}</p>
                                )}
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button type="submit" className="w-full text-lg" size="lg" disabled={isLoading || !form.formState.isValid}>
                            {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Top Up Sekarang
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
