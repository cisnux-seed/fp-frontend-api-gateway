
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { User, Transaction, TransactionInput, PaymentMethod, TransactionType } from '@/lib/types';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const TOKEN_KEY = 'bni_user_token';

// Helper untuk mendekode token tanpa verifikasi, hanya untuk mendapatkan data payload
function decodeToken(token: string): (JwtPayload & { id: number; username: string; email: string }) | null {
  try {
    return jwt.decode(token) as (JwtPayload & { id: number; username: string; email: string });
  } catch (error) {
    console.error("Gagal mendekode token:", error);
    return null;
  }
}

export interface TransactionContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  user: { username: string; email: string } | null;
  balance: number;
  history: Transaction[];
  transaction: Transaction | null;
  login: (identifier: string, pass: string) => Promise<void>;
  logout: () => void;
  processTransaction: (transactionDetails: {
      phone_number: string;
      nominal: number;
      payment_method: PaymentMethod;
      transaction_type: TransactionType;
  }) => Promise<void>;
  fetchUserData: () => Promise<void>;
  resetTransaction: () => void;
  account: AccountDataType | null;
}

interface AccountDataType {
  id: string;
  user_id: number;
  balance: number;
  currency: string;
  account_status: string;
  created_at: string;
  updated_at: string;
}


export const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [balance, setBalance] = useState<number>(0);
  const [history, setHistory] = useState<Transaction[]>([]);
  const [transaction, setTransactionState] = useState<Transaction | null>(null);
  const [account, setAccount] = useState<AccountDataType | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const isLoggedIn = !!token;

  const getAuthHeaders = useCallback(() => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    
    // Menggunakan state token yang selalu up-to-date
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
  }, [token]);
  
  const logout = useCallback(() => {
    try {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('bni_user_data');
    } catch (error) {
      console.error("Tidak bisa menghapus token dari localStorage:", error);
    }
    setToken(null);
    setUser(null);
    setTransactionState(null);
    setBalance(0);
    setHistory([]);
    router.replace('/login');
  }, [router]);

  // Fungsi untuk mereset state transaksi agar halaman processing bisa digunakan lagi
  const resetTransaction = useCallback(() => {
    setTransactionState(null);
  }, []);

  const fetchUserData = useCallback(async () => {
    const currentToken = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
    if (!currentToken) return;

    try {
      const response = await fetch(`https://kong-proxy-one-gate-payment.apps.ocp-one-gate-payment.skynux.fun/api/payment/account`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            toast({ variant: 'destructive', title: 'Sesi Kedaluwarsa', description: 'Silakan login kembali.' });
            logout(); // Paksa logout jika token tidak valid
        }
        // Gunakan pesan dari server jika ada, jika tidak gunakan pesan default
        throw new Error(data.message || 'Gagal memuat data pengguna.');
      }

      setBalance(data.data?.balance || 0);  // ✅ Correct
      setHistory(data.history);
      setAccount(data.data);

    } catch (error) {
      console.error("Fetch user data error:", error);
      if (error instanceof Error) {
        toast({ variant: 'destructive', title: 'Kesalahan Data', description: error.message });
      }
    }
  }, [toast, logout, getAuthHeaders]);

  useEffect(() => {
    const initializeApp = async () => {
      setIsInitializing(true);
      // Setiap kali app load, reset state transaksi
      resetTransaction();
      try {
        const storedToken = localStorage.getItem(TOKEN_KEY);
        if (storedToken) {
          const decodedUser = decodeToken(storedToken);
          const isTokenExpired = decodedUser?.exp ? decodedUser.exp * 1000 < Date.now() : false;

          if (isTokenExpired) {
            logout();
          } else {
            setToken(storedToken);
            if (decodedUser) {
              // Mengambil email dari 'user' object yang dikirim saat login, bukan dari token
              const storedUser = localStorage.getItem('bni_user_data');
              const email = storedUser ? JSON.parse(storedUser).email : '';
              setUser({
                username: decodedUser?.username || 'unknown',
                email: decodedUser?.email || 'unknown'
              });
            }
          }
        }
      } catch (error) {
        console.error("Tidak bisa mengakses localStorage untuk token:", error);
        logout();
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch data ketika token sudah siap
  useEffect(() => {
    if (token && !isInitializing) {
        fetchUserData();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isInitializing]);


  const login = async (identifier: string, pass: string) => {
    try {
      const response = await fetch('https://kong-proxy-one-gate-payment.apps.ocp-one-gate-payment.skynux.fun/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: identifier, password: pass }),
      });

      const data = await response.json();
      // console.log("Login response:", data);
      console.log("Login response:", JSON.stringify(data, null, 2));

      if (!response.ok || !data.data?.access_token) {
        throw new Error(data.message || 'User ID atau password salah.');
      }

      localStorage.setItem(TOKEN_KEY, data.data.access_token);
      setToken(data.data.access_token);

      const decodedUser = decodeToken(data.data.access_token);
      const userEmail = decodedUser?.email ?? 'unknown';
      const userName = decodedUser?.username ?? 'unknown';

      setUser({ username: userName, email: userEmail });

      toast({
        title: 'Login Berhasil',
        description: `Selamat datang kembali, ${userName}!`,
      });

      // Reset state transaksi saat login, untuk jaga-jaga
      resetTransaction();
      router.replace('/transaction');

    } catch(error) {
       toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error instanceof Error ? error.message : 'Terjadi kesalahan saat mencoba login.',
      });
    }
  };

  const processTransaction = async (transactionDetails: Omit<TransactionInput, 'status'>): Promise<void> => {
    resetTransaction();

    if (!token) {
      toast({ variant: 'destructive', title: 'Sesi Tidak Ditemukan', description: 'Silakan login kembali.' });
      logout();
      return Promise.reject(new Error("User tidak sedang login"));
    }

    try {
      const response = await fetch(
          'https://kong-proxy-one-gate-payment.apps.ocp-one-gate-payment.skynux.fun/api/payment/wallet/topup',
          {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(transactionDetails),
          }
      );

      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.message || 'Gagal memproses top up.');
      }

      await fetchUserData(); // Refresh balance
      setTransactionState(resultData.data); // Simpan transaksi
      return Promise.resolve();
    } catch (error) {
      await fetchUserData(); // Tetap refresh balance meskipun gagal
      if (error instanceof Error) {
        toast({
          variant: 'destructive',
          title: 'Top Up Gagal',
          description: error.message,
        });
      }
      return Promise.reject(error);
    }
  };

  return (
    <TransactionContext.Provider
      value={{ user, balance, account ,history, isLoggedIn, isInitializing, transaction, login, logout, processTransaction, fetchUserData, resetTransaction }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
