'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { BniIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
    identifier: z.string().min(1, { message: 'Username or Email is required' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export default function LoginPage() {
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            router.replace('/transaction');
        }
    }, [isAuthenticated, authLoading, router]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            identifier: '',
            password: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        try {
            await login(values.identifier, values.password);
        } catch (error) {
            // Error is handled in the auth context
        } finally {
            setIsLoading(false);
        }
    }

    if (authLoading || isAuthenticated) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/logo-bni.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50 z-0" />

            <Card className="w-full max-w-sm shadow-lg z-10">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 h-auto w-40">
                        <BniIcon className="h-full w-full object-contain" />
                    </div>
                    <CardTitle className="text-2xl">BNI Internet Banking</CardTitle>
                    <CardDescription>
                        Welcome! Please login to start your session.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="identifier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username / Email</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="username or example@email.com"
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
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Login
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}