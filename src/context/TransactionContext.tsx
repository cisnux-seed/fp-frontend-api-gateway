
'use client';

import { createContext, useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User, Transaction, TransactionType, PaymentMethod, TransactionInput } from '@/lib/data/types';
import { simulatePartnerApiCall } from '@/lib/api';
import { 
  checkAuthSession, 
  saveAuthSession, 
  clearAuthSession, 
  verifyUserCredentials 
} from '@/lib/data/auth';
import { 
  getBalance, 
  getHistory, 
  saveTransaction 
} from '@/lib/data/transactions';


export interface TransactionContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  user: User | null;
  balance: number;
  history: Transaction[];
  transaction: Transaction | null;
  login: (email: string, pass: string) => void;
  logout: () => void;
  processTransaction: (transactionDetails: Omit<TransactionInput, 'status'>) => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [transaction, setTransactionState] = useState<Transaction | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const initialize = async () => {
      try {
        const sessionUser = await checkAuthSession();
        if (sessionUser) {
          setUser(sessionUser);
          setIsLoggedIn(true);
          
          const userBalance = await getBalance(sessionUser.email);
          const userHistory = await getHistory(sessionUser.email);
          setBalance(userBalance);
          setHistory(userHistory);
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initialize();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsInitializing(true);
    try {
      const userData = await verifyUserCredentials(email, pass);
      if (userData) {
        toast({
          title: 'Login Berhasil',
          description: `Selamat datang kembali, ${userData.username}!`,
        });
        
        await saveAuthSession(userData);
  
        const userBalance = await getBalance(userData.email);
        const userHistory = await getHistory(userData.email);
  
        setUser(userData);
        setBalance(userBalance);
        setHistory(userHistory);
        setIsLoggedIn(true);
        router.replace('/transaction');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login Gagal',
          description: 'User ID atau password salah.',
        });
      }
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

  const logout = async () => {
    await clearAuthSession();
    setIsLoggedIn(false);
    setUser(null);
    setTransactionState(null);
    setBalance(0);
    setHistory([]);
    router.replace('/login');
  };

  const processTransaction = async (transactionDetails: Omit<TransactionInput, 'status'>): Promise<void> => {
      if (!user) throw new Error("User tidak sedang login");

      let status: 'Success' | 'Failed' = 'Success';
      // Hanya panggil API partner untuk jenis transaksi non-transfer
      if (transactionDetails.transaction_type !== 'Transfer') {
        status = await simulatePartnerApiCall({
            ...transactionDetails,
            status: 'Success' // Status sementara untuk memenuhi tipe
        });
      }
      
      const newTransactionData: TransactionInput = {
        ...transactionDetails,
        status: status,
      };

      try {
        const { newBalance, newHistory, createdTransaction } = await saveTransaction(user.email, newTransactionData);
        
        setBalance(newBalance);
        setHistory(newHistory);
        setTransactionState(createdTransaction);
        
      } catch (error) {
        console.error("Gagal memproses transaksi:", error);
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
