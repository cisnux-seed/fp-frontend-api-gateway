import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Providers } from '@/components/providers';

// Mock the AuthProvider and Toaster
jest.mock('@/context/AuthContext', () => ({
    AuthProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="auth-provider">{children}</div>
    ),
}));

jest.mock('@/components/ui/toaster', () => ({
    Toaster: () => <div data-testid="toaster" />,
}));

describe('Providers Component', () => {
    it('renders children wrapped in providers', () => {
        render(
            <Providers>
                <div data-testid="test-child">Test Content</div>
            </Providers>
        );

        expect(screen.getByTestId('test-child')).toBeInTheDocument();
        expect(screen.getByTestId('auth-provider')).toBeInTheDocument();
        expect(screen.getByTestId('toaster')).toBeInTheDocument();
    });

    it('renders multiple children correctly', () => {
        render(
            <Providers>
                <div data-testid="child-1">Child 1</div>
                <div data-testid="child-2">Child 2</div>
            </Providers>
        );

        expect(screen.getByTestId('child-1')).toBeInTheDocument();
        expect(screen.getByTestId('child-2')).toBeInTheDocument();
    });
});
