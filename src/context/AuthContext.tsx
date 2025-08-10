'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import {Balance, TopUpRequest, Transaction, User} from "@/libs/types";

interface AuthContextType {
    user: User | null;
    balance: Balance | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (identifier: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    fetchBalance: () => Promise<void>;
    topUp: (request: TopUpRequest) => Promise<Transaction>;
    refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [balance, setBalance] = useState<Balance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const router = useRouter();
    const { toast } = useToast();

    // Helper function to make authenticated requests with auto-refresh
// 1️⃣ refreshAuth first
    const refreshAuth = useCallback(async (): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/refresh', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({}),
                credentials: 'include',
            });
            return response.ok;
        } catch (error) {
            console.error('Token refresh failed:', error);
            return false;
        }
    }, []);

// 2️⃣ logout second
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'DELETE',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setBalance(null);
            setIsAuthenticated(false);
            router.push('/login');
        }
    }, [router]);

// 3️⃣ authenticatedFetch after both are declared
    const authenticatedFetch = useCallback(
        async (url: string, options: RequestInit = {}): Promise<Response> => {
            let response: Response;

            try {
                response = await fetch(url, {
                    ...options,
                    credentials: 'include',
                });
            } catch (error) {
                console.error(`Network error while fetching ${url}:`, error);
                throw error instanceof Error ? error : new Error(String(error));
            }

            if (response.status === 401) {
                const refreshSuccess = await refreshAuth();
                if (refreshSuccess) {
                    try {
                        return await fetch(url, {
                            ...options,
                            credentials: 'include',
                        });
                    } catch (error) {
                        console.error(`Network error while retrying ${url}:`, error);
                        throw error instanceof Error ? error : new Error(String(error));
                    }
                } else {
                    await logout();
                    throw new Error('Session expired');
                }
            }

            return response;
        },
        [refreshAuth, logout]
    );

    const login = useCallback(async (identifier: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
                credentials: 'include',
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setUser({ username: identifier });
            setIsAuthenticated(true);

            // Fetch user balance after login
            await fetchBalance();

            toast({
                title: 'Login Successful',
                description: `Welcome back, ${identifier}!`,
            });

            router.push('/transaction');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Login failed';
            toast({
                variant: 'destructive',
                title: 'Login Failed',
                description: message,
            });
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [router, toast]);

    const fetchBalance = useCallback(async () => {
        try {
            const response = await authenticatedFetch('/api/payment/balance');

            if (!response.ok) {
                throw new Error('Failed to fetch balance');
            }

            const data = await response.json();
            setBalance(data.data);
        } catch (error) {
            console.error('Balance fetch error:', error);
            if (error instanceof Error && error.message !== 'Session expired') {
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to fetch balance',
                });
            }
        }
    }, [authenticatedFetch, toast]);

    const topUp = useCallback(async (request: TopUpRequest): Promise<Transaction> => {
        try {
            console.log(request);
            const response = await authenticatedFetch('/api/payment/topup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Top-up failed');
            }

            // Refresh balance after successful top-up
            await fetchBalance();

            toast({
                title: 'Top-up Successful',
                description: `Successfully topped up ${request.amount.toLocaleString()} IDR`,
            });

            return data.data;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Top-up failed';
            toast({
                variant: 'destructive',
                title: 'Top-up Failed',
                description: message,
            });
            throw error;
        }
    }, [authenticatedFetch, fetchBalance, toast]);

    // Check authentication status on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/payment/balance', {
                    credentials: 'include',
                });

                if (response.ok) {
                    setIsAuthenticated(true);
                    const data = await response.json();
                    setBalance(data.data);
                    // Set a default user since we don't have user info endpoint
                    setUser({ username: 'User' });
                } else if (response.status === 401) {
                    // Try to refresh token
                    const refreshSuccess = await refreshAuth();
                    if (refreshSuccess) {
                        await checkAuth(); // Retry after refresh
                    } else {
                        setIsAuthenticated(false);
                    }
                }
            } catch (error) {
                console.error('Auth check error:', error);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [refreshAuth]);

    const value: AuthContextType = {
        user,
        balance,
        isLoading,
        isAuthenticated,
        login,
        logout,
        fetchBalance,
        topUp,
        refreshAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};