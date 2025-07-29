'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTransaction } from '@/hooks/use-transaction';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { BniIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    username: z.string().min(1, { message: 'Username harus diisi.' }),
    password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

export default function LoginPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useTransaction();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);

        try {
            await login(values.username, values.password);

        } catch (error) {
            console.error('Login error:', error);
            alert('Login gagal. Cek kembali username dan password Anda.');
        }

        setIsLoading(false);
    }

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/logo-bni.jpg')" }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50 z-0" />

            <Card className="w-full max-w-sm shadow-lg z-10">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-auto w-40">
                        <BniIcon className="h-full w-full object-contain" />
                    </div>
                    <CardTitle className="text-2xl">BNI Internet Banking</CardTitle>
                    <CardDescription>
                        Selamat datang! Silakan login untuk memulai sesi Anda.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-6"
                        >
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="username"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="******"
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Login
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm">
                    <p className="text-muted-foreground">
                        Belum punya akun?{' '}
                        <Link
                            href="/register"
                            className="font-semibold text-primary hover:underline"
                        >
                            Daftar sekarang!
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
