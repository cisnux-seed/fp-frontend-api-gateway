
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
import { GojekIcon, OvoIcon, ShopeePayIcon, BniIcon } from '@/components/icons';
import { Loader2, LogOut, Wallet, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { PaymentMethodUI } from '@/lib/types';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';


const formSchema = z.object({
  phone_number: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').regex(/^\d+$/, 'Nomor telepon harus berupa angka.'),
  nominal: z.number(),
  customNominal: z.string().optional(),
}).refine(data => {
    if (data.nominal === -1) {
        if (!data.customNominal || data.customNominal.trim() === '') {
            return false;
        }
        const customValue = Number(data.customNominal);
        return !isNaN(customValue) && customValue >= 10000;
    }
    return true;
}, {
    message: 'Nomor custom harus diisi dan minimal Rp10.000.',
    path: ['customNominal'],
});

const exampleNumbers: Record<PaymentMethodUI, string> = {
  Gojek: '898081234560',
  ShopeePay: '897081234561',
  OVO: '81234567890 (semua nomor kecuali berakhiran 9)',
};

export default function TransactionPage() {
  const { user, account, isLoggedIn, isInitializing, processTransaction, logout } = useTransaction();
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodUI>('Gojek');
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

  const paymentMethods: { name: PaymentMethodUI; icon: React.ElementType }[] = [
    { name: 'Gojek', icon: GojekIcon },
    { name: 'OVO', icon: OvoIcon },
    { name: 'ShopeePay', icon: ShopeePayIcon },
  ];

  const nominals = [10000, 25000, 50000, 100000];

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const transactionNominal = data.nominal === -1 ? Number(data.customNominal) : data.nominal;

    if (account && account.balance < transactionNominal) {
      toast({
        variant: 'destructive',
        title: 'Transaksi Gagal',
        description: 'Saldo Anda tidak mencukupi untuk melakukan transaksi ini.',
      });
      return;
    }

    setIsLoading(true);

    router.push('/processing');

    processTransaction({
        phone_number: data.phone_number,
        amount: transactionNominal,
        paymentMethod: paymentMethod,
    }).catch(() => {
      // Jika terjadi error (misal: jaringan), context akan menampilkan toast.
      // Arahkan pengguna kembali dari halaman processing jika proses gagal total.
      router.replace('/transaction');
    }).finally(() => {
      setIsLoading(false);
    });
  };
  
  if (isInitializing || !isLoggedIn || !account) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-background p-4 sm:p-6 md:p-8 space-y-6">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader>
            <div className="flex w-full items-center justify-between">
                <div className="h-20 w-32 flex-shrink-0">
                    <BniIcon className="h-full w-full object-contain" />
                </div>
                <div className="flex flex-grow flex-col items-center px-4">
                    <h2 className="text-xl font-semibold capitalize text-foreground md:text-2xl">
                        Selamat Datang, {user?.username || 'Pengguna'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Status Akun: {account.accountStatus}
                    </p>
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
                        <p className="text-lg font-bold">Rp{account.balance.toLocaleString('id-ID')}</p>
                    </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => router.push('/history')}>
                    <History className="mr-2 h-4 w-4" />
                    Lihat Riwayat
                </Button>
            </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="space-y-4">
                <Label className="text-lg font-semibold">
                  Pilih Mitra Pembayaran Top-up
                </Label>
                <div className="grid grid-cols-3 gap-4">
                  {paymentMethods.map(({ name, icon: Icon }) => (
                    <div
                      key={name}
                      onClick={() => setPaymentMethod(name)}
                      className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${paymentMethod === name ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <Icon className="h-8 w-8" />
                      <span className="text-sm font-medium">{name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <FormField
                control={form.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="phone_number" className="text-lg font-semibold">Nomor Telepon</Label>
                    <FormControl>
                        <Input
                            id="phone_number"
                            type="tel"
                            placeholder={`Contoh: ${exampleNumbers[paymentMethod]}`}
                            {...field}
                            className="text-base"
                        />
                    </FormControl>
                    <FormDescription>
                       Untuk transaksi {paymentMethod} yang sukses, coba: {exampleNumbers[paymentMethod]}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
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
                        <Label
                          key={n}
                          htmlFor={`nominal-${n}`}
                          className={cn('flex cursor-pointer items-center justify-center rounded-md border-2 p-4 font-semibold transition-all', nominalValue === n ? 'border-primary bg-primary/5 text-primary' : 'border-border')}
                        >
                          <RadioGroupItem value={String(n)} id={`nominal-${n}`} className="sr-only" />
                          Rp{n.toLocaleString('id-ID')}
                        </Label>
                      ))}
                      <Label
                          htmlFor="nominal-custom"
                          className={cn('flex cursor-pointer items-center justify-center rounded-md border-2 p-4 font-semibold transition-all', nominalValue === -1 ? 'border-primary bg-primary/5 text-primary' : 'border-border')}
                        >
                          <RadioGroupItem value="-1" id="nominal-custom" className="sr-only" />
                          Lainnya
                        </Label>
                    </div>
                  </RadioGroup>
                )}
              />
              
              {showCustomNominal && (
                  <FormField
                    control={form.control}
                    name="customNominal"
                    render={({ field }) => (
                        <FormItem>
                            <Label htmlFor="customNominal" className="text-lg font-semibold">Masukkan Nominal Custom</Label>
                            <FormControl>
                                <Input
                                    id="customNominal"
                                    type="number"
                                    placeholder="Contoh: 20000"
                                    step="1000"
                                    {...field}
                                    className="text-base"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
              )}

              <Button type="submit" className="w-full text-lg" size="lg" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                Top Up Sekarang
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
