'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

type User = {
  email: string;
  username: string;
};

export type Transaction = {
  paymentMethod: 'Gojek' | 'OVO' | 'ShopeePay';
  phoneNumber: string;
  transactionType: 'Top-up' | 'Beli Paket' | 'Transfer';
  nominal: number;
  status: 'Success' | 'Failed';
};

export interface TransactionContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  user: User | null;
  balance: number;
  transaction: Transaction | null;
  login: (email: string, pass: string, username: string) => void;
  logout: () => void;
  setTransaction: (transaction: Transaction) => void;
}

export const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(5000000); // Saldo awal
  const [transaction, setTransactionState] = useState<Transaction | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedLoginStatus = localStorage.getItem('isLoggedIn');
      const storedUser = localStorage.getItem('user');
      if (storedLoginStatus === 'true' && storedUser) {
        setIsLoggedIn(true);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Could not access localStorage", error);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  const login = (email: string, pass: string, username: string) => {
    if (email && pass) {
      const userData = { email, username };
      toast({
        title: 'Login Berhasil',
        description: `Selamat datang kembali, ${username}!`,
      });
      setIsLoggedIn(true);
      setUser(userData);
      try {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error("Could not access localStorage", error);
      }
      router.replace('/transaction');
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: 'User ID atau password salah.',
      });
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setTransactionState(null);
    try {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Could not access localStorage", error);
    }
    router.replace('/login');
  };

  const setTransaction = (newTransaction: Transaction) => {
    if (newTransaction.status === 'Success') {
      setBalance(prevBalance => prevBalance - newTransaction.nominal);
    }
    setTransactionState(newTransaction);
  };

  return (
    <TransactionContext.Provider
      value={{ user, balance, isLoggedIn, isInitializing, transaction, login, logout, setTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
