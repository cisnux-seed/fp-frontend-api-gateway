import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from './page';
import '@testing-library/jest-dom';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// 🔧 Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// 🔧 Mock useAuth
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('Login Page', () => {
  const mockPush = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ replace: mockPush });
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('renders login form correctly', () => {
    render(<LoginPage />);
    expect(screen.getByLabelText(/Username \/ Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/Username or Email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/Password must be at least 6 characters/i)).toBeInTheDocument();
    });
  });

  it('submits form with correct values', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      isAuthenticated: false,
      isLoading: false,
    });

    render(<LoginPage />);
    fireEvent.change(screen.getByLabelText(/Username \/ Email/i), {
      target: { value: 'testuser' },
    });
    fireEvent.change(screen.getByLabelText(/Password/i), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'password123');
    });
  });
});
