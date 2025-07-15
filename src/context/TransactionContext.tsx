
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User, Transaction, TransactionInput, PaymentMethod, TransactionType } from '@/lib/types';

const SESSION_KEY = 'bni_user_session';

export interface TransactionContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  user: User | null;
  balance: number;
  history: Transaction[];
  transaction: Transaction | null;
  login: (identifier: string, pass: string) => void;
  logout: () => void;
  processTransaction: (transactionDetails: {
      phone_number: string;
      nominal: number;
      payment_method: PaymentMethod;
      transaction_type: TransactionType;
  }) => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [transaction, setTransactionState] = useState<Transaction | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const isLoggedIn = !!user;

  const logout = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch (error) {
      console.error("Tidak bisa menghapus sesi dari localStorage:", error);
    }
    setUser(null);
    setTransactionState(null);
    setBalance(0);
    setHistory([]);
    router.replace('/login');
  }, [router]);

  const initializeUserData = useCallback(async (userId: number) => {
    try {
      const response = await fetch(`/api/user/${userId}`);
      if (!response.ok) {
        throw new Error('Gagal memuat data pengguna.');
      }
      const data = await response.json();
      setBalance(data.balance);
      setHistory(data.history);
    } catch (error) {
      console.error("Initialization error:", error);
      toast({ variant: 'destructive', title: 'Error', description: 'Gagal memuat data pengguna dari server.' });
      logout();
    }
  }, [toast, logout]);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const storedUser = localStorage.getItem(SESSION_KEY);
        if (storedUser) {
          const sessionUser = JSON.parse(storedUser);
          setUser(sessionUser);
          await initializeUserData(sessionUser.id);
        }
      } catch (error) {
        console.error("Tidak bisa mengakses localStorage untuk sesi:", error);
        logout();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [initializeUserData, logout]);

  const saveSession = useCallback((userData: User) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Tidak bisa menyimpan sesi ke localStorage:", error);
    }
  }, []);

  const login = async (identifier: string, pass: string) => {
    setIsInitializing(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          variant: 'destructive',
          title: 'Login Gagal',
          description: data.message || 'User ID atau password salah.',
        });
        return;
      }
      
      toast({
        title: 'Login Berhasil',
        description: `Selamat datang kembali, ${data.username}!`,
      });
      
      saveSession(data);
      await initializeUserData(data.id);
      router.replace('/transaction');

    } catch(error) {
       toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: 'Terjadi kesalahan saat mencoba login.',
      });
    } finally {
        setIsInitializing(false);
    }
  };

  const processTransaction = async (transactionDetails: Omit<TransactionInput, 'status'>): Promise<void> => {
      if (!user) throw new Error("User tidak sedang login");

      try {
        const response = await fetch('/api/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, transactionDetails }),
        });

        const newTransaction = await response.json();

        if (!response.ok) {
            throw new Error(newTransaction.message || 'Gagal memproses transaksi.');
        }

        // Perbarui state setelah transaksi berhasil
        await initializeUserData(user.id);
        setTransactionState(newTransaction);
        
      } catch (error) {
        console.error("Gagal memproses transaksi:", error);
        if (error instanceof Error) {
            toast({
                variant: 'destructive',
                title: 'Transaksi Gagal',
                description: error.message,
            });
        }
        throw error;
      }
  };

  return (
    <TransactionContext.Provider
      value={{ user, balance, history, isLoggedIn, isInitializing, transaction, login, logout, processTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
