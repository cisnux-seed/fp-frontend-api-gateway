import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// Mock modules before importing components
const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockToast = jest.fn();

jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
}));

jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: mockToast,
    }),
}));

// Import after mocking
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Type for mock response options
interface MockResponseOptions {
    ok?: boolean;
    status?: number;
    statusText?: string;
    headers?: Record<string, string>;
}

// Create a default mock response for any unmocked fetch calls
const createDefaultMockResponse = (data: any = {}, options: MockResponseOptions = {}): Promise<Response> => {
    const mockResponse = {
        ok: options.ok !== undefined ? options.ok : false,
        status: options.status || 401,
        statusText: options.statusText || 'Unauthorized',
        headers: {
            get: jest.fn(() => null),
        },
        json: jest.fn(() => Promise.resolve(data)),
        text: jest.fn(() => Promise.resolve(JSON.stringify(data))),
        blob: jest.fn(() => Promise.resolve(new Blob())),
        arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
        clone: jest.fn(() => createDefaultMockResponse(data, options)),
    } as unknown as Response;

    return Promise.resolve(mockResponse);
};

// Create a successful mock response
const createSuccessMockResponse = (data: any = {}, options: MockResponseOptions = {}): Promise<Response> => {
    const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: {
            get: jest.fn((name: string) => {
                if (name === 'set-cookie') return options.headers?.['set-cookie'] || null;
                return null;
            }),
        },
        json: jest.fn(() => Promise.resolve(data)),
        text: jest.fn(() => Promise.resolve(JSON.stringify(data))),
        blob: jest.fn(() => Promise.resolve(new Blob())),
        arrayBuffer: jest.fn(() => Promise.resolve(new ArrayBuffer(0))),
        clone: jest.fn(() => createSuccessMockResponse(data, options)),
    } as unknown as Response;

    return Promise.resolve(mockResponse);
};

// Mock fetch with a default implementation
const mockFetch = jest.fn<Promise<Response>, [string | Request, RequestInit?]>();
// @ts-ignore
global.fetch = mockFetch;

beforeEach(() => {
    jest.clearAllMocks();

    // Set default mock implementation for any unmocked fetch calls
    mockFetch.mockImplementation(() => createDefaultMockResponse());
});

const TestComponent: React.FC = () => {
    const { user, isLoading, isAuthenticated, login, logout } = useAuth();

    const handleLogin = async (): Promise<void> => {
        try {
            await login('testuser', 'password');
        } catch (error) {
            // Handle error silently for test
            console.log('Login error in test:', (error as Error).message);
        }
    };

    return (
        <div>
            <div data-testid="loading">{isLoading.toString()}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
            <div data-testid="user">{user?.username || 'null'}</div>
            <button onClick={handleLogin} data-testid="login-btn">Login</button>
            <button onClick={logout} data-testid="logout-btn">Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    it('provides initial state when auth check fails', async () => {
        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for initial auth check to complete
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
    });

    it('handles successful login flow', async () => {
        const user = userEvent.setup();

        // Mock specific fetch calls in sequence
        mockFetch
            // 1. Login API call (success)
            .mockImplementationOnce(() =>
                createSuccessMockResponse(
                    {
                        meta: { message: 'Login successful' },
                        user: { username: 'testuser' }
                    },
                    {
                        headers: { 'set-cookie': 'auth-token=token123; HttpOnly' }
                    }
                )
            )
            // 2. Balance fetch after login (success)
            .mockImplementationOnce(() =>
                createSuccessMockResponse({ data: { balance: 100000, currency: 'IDR' } })
            );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for initial loading to complete
        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        // Trigger login
        const loginButton = screen.getByTestId('login-btn');
        await act(async () => {
            await user.click(loginButton);
        });

        // Wait for navigation to happen
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/transaction');
        }, { timeout: 5000 });

        // Verify success toast was called
        expect(mockToast).toHaveBeenCalledWith({
            title: 'Login Successful',
            description: 'Welcome back, testuser!',
        });
    });

    it('handles login failure with proper error message', async () => {
        const user = userEvent.setup();

        // Mock login failure
        mockFetch.mockImplementationOnce(() =>
            createDefaultMockResponse(
                { meta: { message: 'Login failed' } },
                { status: 401, ok: false }
            )
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        const loginButton = screen.getByTestId('login-btn');
        await act(async () => {
            await user.click(loginButton);
        });

        // Wait for error toast
        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Login failed',
            });
        }, { timeout: 3000 });

        // Should not navigate on failed login
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles network errors during login', async () => {
        const user = userEvent.setup();

        // Mock network error
        mockFetch.mockImplementationOnce(() =>
            Promise.reject(new Error('Network error'))
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        const loginButton = screen.getByTestId('login-btn');
        await act(async () => {
            await user.click(loginButton);
        });

        await waitFor(() => {
            expect(mockToast).toHaveBeenCalledWith({
                variant: 'destructive',
                title: 'Login Failed',
                description: 'Login failed',
            });
        }, { timeout: 3000 });

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles successful authentication on mount', async () => {
        // Mock successful balance fetch on mount
        mockFetch.mockImplementationOnce(() =>
            createSuccessMockResponse({ data: { balance: 50000, currency: 'IDR' } })
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
            expect(screen.getByTestId('user')).toHaveTextContent('User');
        });
    });

    it('handles logout', async () => {
        const user = userEvent.setup();

        // First mock successful auth check
        mockFetch.mockImplementationOnce(() =>
            createSuccessMockResponse({ data: { balance: 100000, currency: 'IDR' } })
        );

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        // Wait for auth check
        await waitFor(() => {
            expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
        });

        // Mock logout request
        mockFetch.mockImplementationOnce(() =>
            createSuccessMockResponse({ message: 'Logged out' })
        );

        const logoutButton = screen.getByTestId('logout-btn');
        await act(async () => {
            await user.click(logoutButton);
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login');
        });
    });
});