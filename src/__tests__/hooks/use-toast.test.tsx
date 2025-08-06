import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';

// Mock dependencies at the top
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
    }),
}));

jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn(),
    }),
}));

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Simple test component
const TestComponent = () => {
    const { login, isLoading, isAuthenticated } = useAuth();

    return (
        <div>
            <div data-testid="loading">{isLoading.toString()}</div>
            <div data-testid="authenticated">{isAuthenticated.toString()}</div>
        <button
    onClick={() => login('testuser', 'password123')}
    data-testid="login-btn"
        >
        Login
        </button>
        </div>
);
};

describe('AuthContext', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
    });

    it('should render initial state correctly', async () => {
        // Mock failed auth check (unauthenticated)
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