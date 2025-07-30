'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ArrowLeft, LogOut } from 'lucide-react';

export default function TransactionSuccessPage() {
    const { isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, isLoading, router]);

    if (isLoading || !isAuthenticated) {
        return (
            <div
                className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
                style={{ backgroundImage: "url('/images/logo-bni.jpg')" }}
            >
                <div className="absolute inset-0 bg-black/50 z-0" />
                <div className="z-10 text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div
            className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/logo-bni.jpg')" }}
        >
            <div className="absolute inset-0 bg-black/50 z-0" />
            <Card className="w-full max-w-md shadow-lg z-10">
                <CardHeader className="items-center text-center">
                    <CheckCircle2 className="h-16 w-16 text-green-500" />
                    <CardTitle className="text-3xl text-green-600">
                        Transaction Successful
                    </CardTitle>
                    <CardDescription>
                        Your top-up has been processed successfully.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-lg border p-4 space-y-3 text-center">
                        <p className="text-lg font-semibold text-green-600">
                            Top-up Completed!
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Your e-wallet has been topped up successfully. The transaction may take a few moments to reflect in your e-wallet balance.
                        </p>
                    </div>
                </CardContent>
                <CardFooter className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button variant="outline" onClick={() => router.push('/transaction')}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        New Transaction
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