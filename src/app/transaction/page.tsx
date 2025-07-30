'use client';

import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useForm, Controller} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import * as z from 'zod';
import {useAuth} from '@/context/AuthContext';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardHeader} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group';
import {GojekIcon, ShopeePayIcon, BniIcon} from '@/components/icons';
import {Loader2, LogOut, Wallet} from 'lucide-react';
import {PaymentMethod} from "@/libs/types";
import {cn} from "@/libs/utils";

const formSchema = z.object({
    phone_number: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Phone number must be at most 15 digits')
        .regex(/^\d+$/, 'Only numbers are allowed'),
    amount: z.number(),
    customAmount: z.string().optional(),
}).refine(data => {
    if (data.amount === -1) {
        if (!data.customAmount || data.customAmount.trim() === '') {
            return false;
        }
        const customValue = Number(data.customAmount);
        return !isNaN(customValue) && customValue >= 10000;
    }
    return true;
}, {
    message: 'Custom amount must be filled and at least Rp10,000',
    path: ['customAmount'],
});

export default function TransactionPage() {
    const {user, balance, isLoading, isAuthenticated, logout, topUp} = useAuth();
    const router = useRouter();
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GOPAY');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showCustomAmount, setShowCustomAmount] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            phone_number: '',
            amount: 10000,
            customAmount: '',
        },
        mode: 'onChange',
    });

    const amountValue = form.watch('amount');

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    useEffect(() => {
        setShowCustomAmount(amountValue === -1);
        if (amountValue !== -1) {
            form.clearErrors('customAmount');
        }
    }, [amountValue, form]);

    const paymentMethods: { name: PaymentMethod; icon: React.ElementType; placeholder: string }[] = [
        {name: 'GOPAY', icon: GojekIcon, placeholder: 'Example: 898081234567 (must be registered in GoPay)'},
        {name: 'SHOPEE_PAY', icon: ShopeePayIcon, placeholder: 'Example: 8970812345 (must start with 89708)'},
    ];

    const amounts = [10000, 25000, 50000, 100000];

    const getPlaceholder = () => {
        return paymentMethods.find(p => p.name === paymentMethod)?.placeholder || 'Enter phone number';
    }

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        if (!balance) return;

        const transactionAmount = data.amount === -1 ? Number(data.customAmount) : data.amount;

        if (balance.balance < transactionAmount) {
            return;
        }

        setIsProcessing(true);

        try {
            await topUp({
                amount: transactionAmount,
                paymentMethod,
                phoneNumber: data.phone_number,
                description: `Top-up to ${paymentMethod}`,
            });

            // Navigate to success page or show success state
            router.push('/transaction/success');
        } catch (error) {
            // Error handling is done in the auth context
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading || !isAuthenticated) {
        return (
            <div
                className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
                style={{backgroundImage: "url('/images/logo-bni.jpg')"}}
            >
                <div className="absolute inset-0 bg-black/50 z-0"/>
                <Loader2 className="h-8 w-8 animate-spin text-white z-10"/>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
            style={{backgroundImage: "url('/images/logo-bni.jpg')"}}
        >
            <div className="absolute inset-0 bg-black/50 z-0"/>
            <Card className="w-full max-w-2xl shadow-xl z-10">
                <CardHeader>
                    <div className="flex w-full items-center justify-between">
                        <div className="h-20 w-32 flex-shrink-0">
                            <BniIcon className="h-full w-full object-contain"/>
                        </div>
                        <div className="flex flex-grow flex-col items-center px-4">
                            <h2 className="text-xl font-semibold capitalize text-foreground md:text-2xl">
                                Welcome, {user?.username || 'User'}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                E-Wallet Top-up Service
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout"
                                className="flex-shrink-0">
                            <LogOut className="h-5 w-5"/>
                        </Button>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border bg-muted/50 p-3">
                        <div className="flex items-center gap-3">
                            <Wallet className="h-6 w-6 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Your Balance</p>
                                <p className="text-lg font-bold">
                                    {balance ? `Rp${balance.balance.toLocaleString('id-ID')}` : 'Loading...'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <Label className="text-lg font-semibold">
                                Select E-Wallet Provider
                            </Label>
                            <div className="grid grid-cols-2 gap-4">
                                {paymentMethods.map(({name, icon: Icon}) => (
                                    <div
                                        key={name}
                                        onClick={() => setPaymentMethod(name)}
                                        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                                            paymentMethod === name ? 'border-primary bg-primary/5' : 'border-border'
                                        }`}
                                    >
                                        <Icon className="h-8 w-8"/>
                                        <span className="text-sm font-medium">{name.replace('_', ' ')}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number" className="text-lg font-semibold">
                                Phone Number
                            </Label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder={getPlaceholder()}
                                {...form.register('phone_number')}
                                className="text-base"
                            />
                            {form.formState.errors.phone_number && (
                                <p className="text-sm font-medium text-destructive">
                                    {form.formState.errors.phone_number.message}
                                </p>
                            )}
                        </div>

                        <Controller
                            name="amount"
                            control={form.control}
                            render={({field}) => (
                                <RadioGroup
                                    onValueChange={(value) => {
                                        const numValue = Number(value);
                                        field.onChange(numValue);
                                        if (numValue !== -1) {
                                            form.setValue('customAmount', '');
                                        }
                                    }}
                                    value={String(field.value)}
                                    className="space-y-2"
                                >
                                    <Label className="text-lg font-semibold">Select Amount</Label>
                                    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                                        {amounts.map((n) => (
                                            <Label
                                                key={n}
                                                htmlFor={`amount-${n}`}
                                                className={cn(
                                                    'flex cursor-pointer items-center justify-center rounded-md border-2 p-4 font-semibold transition-all',
                                                    amountValue === n ? 'border-primary bg-primary/5 text-primary' : 'border-border'
                                                )}
                                            >
                                                <RadioGroupItem value={String(n)} id={`amount-${n}`}
                                                                className="sr-only"/>
                                                Rp{n.toLocaleString('id-ID')}
                                            </Label>
                                        ))}
                                        <Label
                                            htmlFor="amount-custom"
                                            className={cn(
                                                'flex cursor-pointer items-center justify-center rounded-md border-2 p-4 font-semibold transition-all',
                                                amountValue === -1 ? 'border-primary bg-primary/5 text-primary' : 'border-border'
                                            )}
                                        >
                                            <RadioGroupItem value="-1" id="amount-custom" className="sr-only"/>
                                            Other
                                        </Label>
                                    </div>
                                </RadioGroup>
                            )}
                        />

                        {showCustomAmount && (
                            <div className="space-y-2">
                                <Label htmlFor="customAmount" className="text-lg font-semibold">
                                    Enter Custom Amount
                                </Label>
                                <Input
                                    id="customAmount"
                                    type="number"
                                    placeholder="Example: 20000"
                                    step="1000"
                                    {...form.register('customAmount')}
                                    className="text-base"
                                />
                                {form.formState.errors.customAmount && (
                                    <p className="text-sm font-medium text-destructive">
                                        {form.formState.errors.customAmount.message}
                                    </p>
                                )}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full text-lg"
                            size="lg"
                            disabled={isProcessing || !form.formState.isValid}
                        >
                            {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
                            Top Up Now
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}