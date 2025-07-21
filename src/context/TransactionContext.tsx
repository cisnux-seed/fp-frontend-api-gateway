
'use client';

import { createContext, useState, useEffect, type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import type { UserAuth, UserRegister, AuthResponse, AccountResponse, TransactionResponse, TopupRequest, PageableResponse, PaymentMethodUI, WebResponse } from '@/lib/types';
import apiService from '@/lib/apiService';
import { jwtDecode, type JwtPayload } from 'jwt-decode';

// Helper untuk mendekode token
function decodeToken(token: string): (JwtPayload & { user: { username: string } }) | null {
  try {
    // Anggap payload memiliki struktur { user: { username: '...' } }
    return jwtDecode(token) as (JwtPayload & { user: { username: string } });
  } catch (error) {
    console.error("Gagal mendekode token:", error);
    return null;
  }
}

export interface TransactionContextType {
  isLoggedIn: boolean;
  isInitializing: boolean;
  user: { username: string } | null;
  account: AccountResponse | null;
  history: TransactionResponse[];
  transactionResult: WebResponse<TransactionResponse> | null;
  login: (credentials: UserAuth) => Promise<void>;
  register: (details: UserRegister) => Promise<WebResponse<string>>;
  logout: () => void;
  processTransaction: (transactionDetails: Omit<TopupRequest, 'description' | 'paymentMethod'> & { paymentMethod: PaymentMethodUI }) => Promise<void>;
  fetchUserData: () => Promise<void>;
}

export const TransactionContext = createContext<TransactionContextType | null>(null);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [history, setHistory] = useState<TransactionResponse[]>([]);
  const [transactionResult, setTransactionResult] = useState<WebResponse<TransactionResponse> | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setAccount(null);
    setHistory([]);
    setTransactionResult(null);
    setIsLoggedIn(false);
    if (apiService) {
      apiService.defaults.headers.Authorization = '';
    }
    router.replace('/login');
    toast({ title: "Logout Berhasil", description: "Anda telah keluar dari sesi." });
  }, [router, toast]);
  
  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const accountResponse: WebResponse<AccountResponse> = await apiService.get('/api/payment/account');
      const historyResponse: WebResponse<TransactionResponse[]> = await apiService.get('/api/transactions/history');

      if (accountResponse.data) {
        setAccount(accountResponse.data);
      }
      if (historyResponse.data) {
        setHistory(historyResponse.data);
      }
    } catch (error: any) {
      console.error("Gagal memuat data pengguna:", error);
      toast({ variant: 'destructive', title: 'Sesi Bermasalah', description: error.meta?.message || 'Silakan login kembali.' });
      if (error.meta?.code === "401") {
        logout();
      }
    }
  }, [toast, logout]);

  useEffect(() => {
    const initializeApp = async () => {
      setIsInitializing(true);
      setTransactionResult(null); // Selalu reset hasil transaksi saat inisialisasi
      const token = localStorage.getItem('accessToken');
      
      if (token) {
        const decoded = decodeToken(token);
        const isTokenExpired = decoded?.exp ? decoded.exp * 1000 < Date.now() : true;
        
        if (isTokenExpired) {
          logout();
        } else if (decoded) {
            setUser({ username: decoded.user.username });
            setIsLoggedIn(true);
            apiService.defaults.headers.Authorization = `Bearer ${token}`;
            await fetchUserData();
        } else {
          // Token ada tapi tidak bisa di-decode
          logout();
        }
      } else {
        setIsLoggedIn(false);
      }
      setIsInitializing(false);
    };
    initializeApp();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const login = async (credentials: UserAuth) => {
    try {
      const response: WebResponse<AuthResponse> = await apiService.post('/api/auth/login', credentials);
      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      apiService.defaults.headers.Authorization = `Bearer ${accessToken}`;

      const decoded = decodeToken(accessToken);
      if(decoded?.user?.username) {
        setUser({ username: decoded.user.username });
        setIsLoggedIn(true);
        toast({ title: 'Login Berhasil', description: `Selamat datang kembali, ${decoded.user.username}!` });
      }

      await fetchUserData();
      setTransactionResult(null);
      router.replace('/transaction');

    } catch(error: any) {
       toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error.meta?.message || 'Terjadi kesalahan saat mencoba login.',
      });
      throw error;
    }
  };

  const register = async (details: UserRegister): Promise<WebResponse<string>> => {
      return await apiService.post('/api/auth/register', details);
  };

  const processTransaction = async (transactionDetails: Omit<TopupRequest, 'description' | 'paymentMethod'> & { paymentMethod: PaymentMethodUI }): Promise<void> => {
      setTransactionResult(null);
      const uiToApiMethodMap: Record<PaymentMethodUI, TopupRequest['paymentMethod']> = {
        'Gojek': 'GOPAY',
        'OVO': 'SHOPEE_PAY', // OVO disamakan dengan ShopeePay untuk sementara
        'ShopeePay': 'SHOPEE_PAY',
      };
      
      const payload: TopupRequest = {
        amount: transactionDetails.amount,
        phone_number: transactionDetails.phone_number,
        paymentMethod: uiToApiMethodMap[transactionDetails.paymentMethod],
        description: `Top-up for ${transactionDetails.phone_number}`,
      };

      try {
        const response: WebResponse<TransactionResponse> = await apiService.post('/api/payment/topup', payload);
        await fetchUserData(); // Refresh saldo dan riwayat
        setTransactionResult(response);
      } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Transaksi Gagal',
            description: error.meta?.message || 'Gagal memproses transaksi.',
        });
        setTransactionResult(error as WebResponse<TransactionResponse>); // Simpan hasil error
        throw error;
      }
  };

  return (
    <TransactionContext.Provider
      value={{ isLoggedIn, isInitializing, user, account, history, transactionResult, login, register, logout, processTransaction, fetchUserData }}
    >
      {children}
    </TransactionContext.Provider>
  );
}
