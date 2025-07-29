
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { BniIcon } from '@/components/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTransaction } from '@/hooks/use-transaction';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  username: z.string().min(3, { message: 'Username minimal 3 karakter.' }),
  email: z.string().email({ message: 'Alamat email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

export default function RegisterPage() {
  const { isLoggedIn, isInitializing } = useTransaction();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isInitializing && isLoggedIn) {
      router.replace('/transaction');
    }
  }, [isLoggedIn, isInitializing, router]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Gagal mendaftarkan pengguna.');
      }

      toast({
        title: 'Registrasi Berhasil',
        description: `Selamat datang, ${data.username}! Silakan login.`,
      });
      router.push('/login');

    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Registrasi Gagal',
          description: error.message,
        });
      }
    } finally {
        setIsLoading(false);
    }
  }

  if (isInitializing || isLoggedIn) {
    return (
      <div 
        className="flex min-h-screen w-full items-center justify-center p-4 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bni-logo.png')" }}
      >
        <div className="absolute inset-0 bg-black/50 z-0" />
        <div className='z-10 text-white flex items-center gap-2'>
            <Loader2 className="animate-spin" />
            <p>Mengarahkan...</p>
        </div>
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
            <CardTitle className="text-2xl">Buat Akun Baru</CardTitle>
            <CardDescription>Daftarkan diri Anda untuk memulai simulasi.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                        <Input placeholder="username_anda" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                        <Input placeholder="contoh@email.com" {...field} disabled={isLoading} />
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
                        <Input type="password" placeholder="******" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Daftar
                </Button>
                </form>
            </Form>
            </CardContent>
            <CardFooter className="flex justify-center text-sm">
                <p className="text-muted-foreground">
                    Sudah punya akun?{' '}
                    <Link href="/login" className="font-semibold text-primary hover:underline">
                        Login di sini!
                    </Link>
                </p>
            </CardFooter>
        </Card>
    </div>
  );
}
