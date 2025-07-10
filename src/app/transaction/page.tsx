
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTransaction } from '@/hooks/use-transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { GojekIcon, OvoIcon, ShopeePayIcon, BniIcon } from '@/components/icons';
import { simulateTransaction } from '@/lib/api';
import { ArrowUpCircle, ArrowRightCircle, Package, Loader2, LogOut, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type PaymentMethod = 'Gojek' | 'OVO' | 'ShopeePay';
type TransactionType = 'Top-up' | 'Transfer' | 'Beli Paket';

const formSchema = z.object({
  phoneNumber: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15, 'Nomor telepon maksimal 15 digit').regex(/^\d+$/, 'Hanya angka yang diperbolehkan'),
  nominal: z.number(),
  customNominal: z.string().optional(),
}).refine(data => {
    if (data.nominal === -1) {
        if (!data.customNominal || data.customNominal.trim() === '') {
            return false;
        }
        const customValue = Number(data.customNominal);
        return !isNaN(customValue) && customValue >= 10000 && customValue % 10000 === 0;
    }
    return true;
}, {
    message: 'Nominal custom harus kelipatan 10.000 dan minimal Rp10.000.',
    path: ['customNominal'],
});


export default function TransactionPage() {
  const { user, balance, isLoggedIn, isInitializing, setTransaction, logout } = useTransaction();
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Gojek');
  const [transactionType, setTransactionType] = useState<TransactionType>('Top-up');
  const [isLoading, setIsLoading] = useState(false);
  const [showCustomNominal, setShowCustomNominal] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      phoneNumber: '',
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

  const paymentMethods: { name: PaymentMethod; icon: React.ElementType }[] = [
    { name: 'Gojek', icon: GojekIcon },
    { name: 'OVO', icon: OvoIcon },
    { name: 'ShopeePay', icon: ShopeePayIcon },
  ];

  const transactionTypes: { name: TransactionType; icon: React.ElementType }[] = [
    { name: 'Top-up', icon: ArrowUpCircle },
    { name: 'Transfer', icon: ArrowRightCircle },
    { name: 'Beli Paket', icon: Package },
  ];

  const nominals = [10000, 25000, 50000, 100000];

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    const transactionNominal = data.nominal === -1 ? Number(data.customNominal) : data.nominal;

    if (balance < transactionNominal) {
      toast({
        variant: 'destructive',
        title: 'Transaksi Gagal',
        description: 'Saldo Anda tidak mencukupi untuk melakukan transaksi ini.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await simulateTransaction({
        phoneNumber: data.phoneNumber,
        nominal: transactionNominal,
        paymentMethod,
        transactionType,
      });
      setTransaction(result);
      router.push('/bnipayment');
    } catch (error) {
      const err = error as Error;
      toast({
        variant: 'destructive',
        title: 'Terjadi Kesalahan',
        description: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isInitializing || !isLoggedIn) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
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
                        Silakan lakukan transaksi Anda.
                    </p>
                </div>
                <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout" className="flex-shrink-0">
                    <LogOut className="h-5 w-5" />
                </Button>
            </div>
             <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted/50 p-3">
                <Wallet className="h-6 w-6 text-primary" />
                <div>
                    <p className="text-sm text-muted-foreground">Saldo Anda</p>
                    <p className="text-lg font-bold">Rp{balance.toLocaleString('id-ID')}</p>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Pilih Mitra Pembayaran</Label>
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

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-lg font-semibold">
                Nomor Telepon
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="081234567890"
                {...form.register('phoneNumber')}
                className="text-base"
              />
              {form.formState.errors.phoneNumber && <p className="text-sm font-medium text-destructive">{form.formState.errors.phoneNumber.message}</p>}
            </div>

            <div className="space-y-4">
              <Label className="text-lg font-semibold">Jenis Transaksi</Label>
              <div className="grid grid-cols-3 gap-4">
                {transactionTypes.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    onClick={() => setTransactionType(name)}
                    className={`flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 p-4 transition-all ${transactionType === name ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <Icon className={`h-6 w-6 ${transactionType === name ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            
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
                 <div className="space-y-2">
                    <Label htmlFor="customNominal" className="text-lg font-semibold">
                        Masukkan Nominal Custom
                    </Label>
                    <Input
                        id="customNominal"
                        type="number"
                        placeholder="Contoh: 20000"
                        step="10000"
                        {...form.register('customNominal')}
                        className="text-base"
                    />
                    {form.formState.errors.customNominal && <p className="text-sm font-medium text-destructive">{form.formState.errors.customNominal.message}</p>}
                </div>
            )}


            <Button type="submit" className="w-full text-lg" size="lg" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
              Bayar Sekarang
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
