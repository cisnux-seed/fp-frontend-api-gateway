// src/__tests__/context/AuthContext.test.tsx
import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
// Mock the toast hook from the correct location
jest.mock('@/hooks/use-toast');

// Mock the hooks
jest.mock('next/navigation');
jest.mock('@/hooks/use-toast');

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockToast = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue({
        push: mockPush,
        replace: mockReplace,
    });

    const mockUseToast = require('@/hooks/use-toast').useToast;
    mockUseToast.mockReturnValue({
        toast: mockToast,
    });

    global.fetch = jest.fn();
});

// Test component to access the context
const TestComponent = () => {
    const auth = useAuth();

    return (
        <div>
            <div data-testid="loading">{auth.isLoading.toString()}</div>
            <div data-testid="authenticated">{auth.isAuthenticated.toString()}</div>
            <div data-testid="user">{auth.user?.username || 'null'}</div>
            <div data-testid="balance">{auth.balance?.balance || 'null'}</div>
            <button onClick={() => auth.login('testuser', 'password')}>Login</button>
            <button onClick={() => auth.logout()}>Logout</button>
            <button onClick={() => auth.fetchBalance()}>Fetch Balance</button>
        </div>
    );
};

describe('AuthContext', () => {
    it('provides initial state correctly', () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(screen.getByTestId('loading')).toHaveTextContent('true');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('balance')).toHaveTextContent('null');
    });

    it('throws error when useAuth is used outside AuthProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            render(<TestComponent />);
        }).toThrow('useAuth must be used within AuthProvider');

        consoleSpy.mockRestore();
    });

    it('handles successful login', async () => {
        const mockFetch = global.fetch as jest.Mock;

        // Mock successful login response
        mockFetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    message: 'Login successful',
                    user: { username: 'testuser' }
                })
            })
            // Mock successful balance fetch
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: { balance: 100000, currency: 'IDR' }
                })
            });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');

        await act(async () => {
            loginButton.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        });

        expect(screen.getByTestId('user')).toHaveTextContent('testuser');
        expect(screen.getByTestId('balance')).toHaveTextContent('100000');
        expect(mockToast).toHaveBeenCalledWith({
            title: 'Login Successful',
            description: 'Welcome back, testuser!',
        });
        expect(mockPush).toHaveBeenCalledWith('/transaction');
    });

    it('handles login failure', async () => {
        const mockFetch = global.fetch as jest.Mock;

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
            json: async () => ({
                message: 'Invalid credentials'
            })
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');

        await act(async () => {
            loginButton.click();
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

    it('handles logout', async () => {
        const mockFetch = global.fetch as jest.Mock;

        // Mock logout response
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'Logged out successfully' })
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const logoutButton = screen.getByText('Logout');

        await act(async () => {
            logoutButton.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        });

        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('balance')).toHaveTextContent('null');
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('handles fetch balance success', async () => {
        const mockFetch = global.fetch as jest.Mock;

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: { balance: 50000, currency: 'IDR' }
            })
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const fetchBalanceButton = screen.getByText('Fetch Balance');

        await act(async () => {
            fetchBalanceButton.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('balance')).toHaveTextContent('50000');
        });
    });

    it('handles fetch balance failure', async () => {
        const mockFetch = global.fetch as jest.Mock;

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            json: async () => ({
                message: 'Server error'
            })
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const fetchBalanceButton = screen.getByText('Fetch Balance');

        await act(async () => {
            fetchBalanceButton.click();
        });

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to fetch balance',
            });
        });
    });

    it('handles token refresh on 401 error', async () => {
        const mockFetch = global.fetch as jest.Mock;

        // First call returns 401, second call (refresh) succeeds, third call (retry) succeeds
        mockFetch
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Token refreshed' })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: { balance: 75000, currency: 'IDR' }
                })
            });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const fetchBalanceButton = screen.getByText('Fetch Balance');

        await act(async () => {
            fetchBalanceButton.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('balance')).toHaveTextContent('75000');
        });

        // Should have called fetch 3 times: original request, refresh, retry
        expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('handles failed token refresh', async () => {
        const mockFetch = global.fetch as jest.Mock;

        // First call returns 401, refresh call fails
        mockFetch
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
            })
            .mockResolvedValueOnce({
                ok: false,
                status: 401,
            });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const fetchBalanceButton = screen.getByText('Fetch Balance');

        await act(async () => {
            fetchBalanceButton.click();
        });

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        });

        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('loads authentication state on mount when balance fetch succeeds', async () => {
        const mockFetch = global.fetch as jest.Mock;

        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: { balance: 25000, currency: 'IDR' }
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
        expect(screen.getByTestId('user')).toHaveTextContent('User');
        expect(screen.getByTestId('balance')).toHaveTextContent('25000');
    });

    it('handles authentication check failure on mount', async () => {
        const mockFetch = global.fetch as jest.Mock;

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 401,
        });

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });
});

// Test the topUp functionality separately
describe('AuthContext - TopUp', () => {
    const TestTopUpComponent = () => {
        const auth = useAuth();

        const handleTopUp = async () => {
            try {
                await auth.topUp({
                    amount: 10000,
                    paymentMethod: 'GOPAY',
                    phoneNumber: '08123456789',
                    description: 'Test top up'
                });
            } catch (error) {
                // Error handling is done in context
            }
        };

        return (
            <div>
                <div data-testid="balance">{auth.balance?.balance || 'null'}</div>
                <button onClick={handleTopUp}>Top Up</button>
            </div>
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            replace: mockReplace,
        });

        const { useToast } = require('@/hooks/use-toast');
        (useToast as jest.Mock).mockReturnValue({
            toast: mockToast,
        });

        global.fetch = jest.fn();
    });

    it('handles successful top up', async () => {
        const mockFetch = global.fetch as jest.Mock;

        mockFetch
            // Top up request
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: {
                        id: 'tx-123',
                        amount: 10000,
                        transactionStatus: 'SUCCESS'
                    }
                })
            })
            // Balance fetch after top up
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    data: { balance: 35000, currency: 'IDR' }
                })
            });

        render(
            <AuthProvider>
                <TestTopUpComponent />
            </AuthProvider>
        );

        const topUpButton = screen.getByText('Top Up');

        await act(async () => {
            topUpButton.click();
        });

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                title: 'Top-up Successful',
                description: 'Successfully topped up 10,000 IDR',
            });
        });

        expect(screen.getByTestId('balance')).toHaveTextContent('35000');
    });

    it('handles top up failure', async () => {
        const mockFetch = global.fetch as jest.Mock;

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({
                message: 'Insufficient funds'
            })
        });

        render(
            <AuthProvider>
                <TestTopUpComponent />
            </AuthProvider>
        );

        const topUpButton = screen.getByText('Top Up');

        await act(async () => {
            topUpButton.click();
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