import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
jest.mock('next/navigation');
jest.mock('@/hooks/use-toast');

const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
};

const mockToast = jest.fn();

(useRouter as jest.Mock).mockReturnValue(mockRouter);
(useToast as jest.Mock).mockReturnValue({ toast: mockToast });

// Mock fetch globally
global.fetch = jest.fn();

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
            <button onClick={logout} data-testid="logout-btn">Logout</button>
            <button onClick={fetchBalance} data-testid="fetch-balance-btn">Fetch Balance</button>
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
        (fetch as jest.Mock).mockClear();
    });

    describe('Initial State', () => {
        it('should have correct initial state', async () => {
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
    });

    describe('Login', () => {
        it('should login successfully and fetch balance', async () => {
            const user = userEvent.setup();

            // Mock successful login
            (fetch as jest.Mock)
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            message: 'Login successful',
                            user: { username: 'testuser' }
                        })
                    })
                )
                // Mock successful balance fetch
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            data: { balance: 100000, currency: 'IDR' }
                        })
                    })
                );

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

            expect(mockToast).toHaveBeenCalledWith({
                title: 'Login Successful',
                description: 'Welcome back, testuser!',
            });

            expect(mockRouter.push).toHaveBeenCalledWith('/transaction');
        });

        it('should handle login failure', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false,
                    status: 401,
                    json: () => Promise.resolve({
                        message: 'Invalid credentials'
                    })
                })
            );

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
                expect(mockToast).toHaveBeenCalledWith({
                    variant: 'destructive',
                    title: 'Login Failed',
                    description: 'Invalid credentials',
                });
            });

            expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        });
    });

    describe('Logout', () => {
        it('should logout successfully', async () => {
            const user = userEvent.setup();

            // Mock logout API call
            (fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        message: 'Logged out successfully'
                    })
                })
            );

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

            (fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve({
                        data: { balance: 150000, currency: 'IDR' }
                    })
                })
            );

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

            (fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false,
                    status: 500,
                    json: () => Promise.resolve({
                        message: 'Server error'
                    })
                })
            );

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
                expect(mockToast).toHaveBeenCalledWith({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'Failed to fetch balance',
                });
            });
        });
    });

    describe('Top Up', () => {
        it('should handle top up successfully', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock)
                // Mock topup API call
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            data: {
                                id: 'tx-123',
                                amount: 50000,
                                status: 'SUCCESS'
                            }
                        })
                    })
                )
                // Mock balance refresh
                .mockImplementationOnce(() =>
                    Promise.resolve({
                        ok: true,
                        json: () => Promise.resolve({
                            data: { balance: 150000, currency: 'IDR' }
                        })
                    })
                );

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
                expect(mockToast).toHaveBeenCalledWith({
                    title: 'Top-up Successful',
                    description: 'Successfully topped up 50,000 IDR',
                });
            });
        });

        it('should handle top up failure', async () => {
            const user = userEvent.setup();

            (fetch as jest.Mock).mockImplementationOnce(() =>
                Promise.resolve({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve({
                        message: 'Insufficient funds'
                    })
                })
            );

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
                expect(mockToast).toHaveBeenCalledWith({
                    variant: 'destructive',
                    title: 'Top-up Failed',
                    description: 'Insufficient funds',
                });
            });
        });
    });
});