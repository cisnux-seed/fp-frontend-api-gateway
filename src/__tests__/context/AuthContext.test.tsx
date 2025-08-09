import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn(),
    }),
}));

// Mock fetch globally
global.fetch = jest.fn();

const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
};

// Test component that consumes AuthContext
const TestComponent = () => {
    const {
        user,
        balance,
        isLoading,
        isAuthenticated,
        login,
        logout,
        fetchBalance,
        topUp
    } = useAuth();

    return (
        <div>
            <div data-testid="loading">{isLoading.toString()}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="username">{user?.username || 'No user'}</div>
            <div data-testid="balance">{balance?.balance || 'No balance'}</div>
            <button
                onClick={() => login('testuser', 'password123')}
                data-testid="login-btn"
            >
                Login
            </button>
            <button onClick={logout} data-testid="logout-btn">
                Logout
            </button>
            <button onClick={fetchBalance} data-testid="fetch-balance-btn">
                Fetch Balance
            </button>
            <button
                onClick={() => topUp({
                    amount: 50000,
                    paymentMethod: 'GOPAY',
                    phoneNumber: '081234567890',
                    description: 'Test topup'
                })}
                data-testid="topup-btn"
            >
                Top Up
            </button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        (fetch as jest.Mock).mockClear();
    });

    describe('Initial State', () => {
        it('should have correct initial state when not authenticated', async () => {
            (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
            expect(screen.getByTestId('username')).toHaveTextContent('No user');
            expect(screen.getByTestId('balance')).toHaveTextContent('No balance');
        });

        it('should load authenticated state on mount', async () => {
            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    data: { balance: 100000, currency: 'IDR' }
                })
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
            expect(screen.getByTestId('username')).toHaveTextContent('User');
            expect(screen.getByTestId('balance')).toHaveTextContent('100000');
        });
    });

    describe('Login', () => {
        it('should login successfully', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock)
                // Login request
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        message: 'Login successful',
                        user: { username: 'testuser' }
                    })
                })
                // Balance fetch after login
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        data: { balance: 100000, currency: 'IDR' }
                    })
                });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await act(async () => {
                await user.click(screen.getByTestId('login-btn'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
                expect(screen.getByTestId('username')).toHaveTextContent('testuser');
                expect(screen.getByTestId('balance')).toHaveTextContent('100000');
            });

            expect(mockRouter.push).toHaveBeenCalledWith('/transaction');
        });

        it('should handle login failure', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                status: 401,
                json: () => Promise.resolve({
                    message: 'Invalid credentials'
                })
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await act(async () => {
                await user.click(screen.getByTestId('login-btn'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
            });
        });
    });

    describe('Logout', () => {
        it('should logout successfully', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    message: 'Logged out successfully'
                })
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await act(async () => {
                await user.click(screen.getByTestId('logout-btn'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
                expect(screen.getByTestId('username')).toHaveTextContent('No user');
                expect(screen.getByTestId('balance')).toHaveTextContent('No balance');
            });

            expect(mockRouter.push).toHaveBeenCalledWith('/login');
        });
    });

    describe('Balance Management', () => {
        it('should fetch balance successfully', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock)
                // Initial auth check (unauthenticated)
                .mockRejectedValueOnce(new Error('Network error'))
                // Manual balance fetch
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        data: { balance: 150000, currency: 'IDR' }
                    })
                });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await act(async () => {
                await user.click(screen.getByTestId('fetch-balance-btn'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('balance')).toHaveTextContent('150000');
            });
        });

        it('should handle balance fetch failure', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock)
                // Initial auth check
                .mockRejectedValueOnce(new Error('Network error'))
                // Manual balance fetch failure
                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({
                        message: 'Server error'
                    })
                });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await act(async () => {
                await user.click(screen.getByTestId('fetch-balance-btn'));
            });

            // Should not crash and maintain current state
            expect(screen.getByTestId('balance')).toHaveTextContent('No balance');
        });
    });

    describe('Top Up', () => {
        it('should handle top up successfully', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock)
                // Initial auth check
                .mockRejectedValueOnce(new Error('Network error'))
                // Top up request
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        data: {
                            id: 'tx-123',
                            amount: 50000,
                            status: 'SUCCESS'
                        }
                    })
                })
                // Balance refresh after top up
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        data: { balance: 150000, currency: 'IDR' }
                    })
                });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await act(async () => {
                await user.click(screen.getByTestId('topup-btn'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('balance')).toHaveTextContent('150000');
            });
        });

        it('should handle top up failure', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock)
                // Initial auth check
                .mockRejectedValueOnce(new Error('Network error'))
                // Top up failure
                .mockResolvedValueOnce({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve({
                        message: 'Insufficient funds'
                    })
                });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await expect(async () => {
                await act(async () => {
                    await user.click(screen.getByTestId('topup-btn'));
                });
            }).rejects.toThrow();
        });
    });

    describe('Token Refresh', () => {
        it('should refresh token on 401 error', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock)
                // Initial auth check
                .mockRejectedValueOnce(new Error('Network error'))
                // Balance fetch returns 401
                .mockResolvedValueOnce({
                    ok: false,
                    status: 401
                })
                // Token refresh succeeds
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        message: 'Token refreshed'
                    })
                })
                // Retry balance fetch succeeds
                .mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({
                        data: { balance: 75000, currency: 'IDR' }
                    })
                });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('loading')).toHaveTextContent('false');
            });

            await act(async () => {
                await user.click(screen.getByTestId('fetch-balance-btn'));
            });

            await waitFor(() => {
                expect(screen.getByTestId('balance')).toHaveTextContent('75000');
            });

            // Should have called fetch 4 times: auth check, balance (401), refresh, retry balance
            expect(fetch).toHaveBeenCalledTimes(4);
        });
    });
});