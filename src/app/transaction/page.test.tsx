import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TransactionPage from './page';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// Mock router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

describe('TransactionPage', () => {
  const push = jest.fn();
  const logout = jest.fn();
  const topUp = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push });
  });

  const renderComponent = (overrides = {}) => {
    (useAuth as jest.Mock).mockReturnValue({
      user: { username: 'TestUser' },
      balance: { balance: 100000 },
      isAuthenticated: true,
      isLoading: false,
      logout,
      topUp,
      ...overrides,
    });

    render(<TransactionPage />);
  };    

  it('renders user info and balance correctly', () => {
    renderComponent();

    expect(screen.getByText('Welcome, TestUser')).toBeInTheDocument();
    expect(screen.getByText(/Rp100.000/)).toBeInTheDocument();
    expect(screen.getByText('Top Up Now')).toBeInTheDocument();
  });

  it('validates phone number field and shows error on invalid input', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: 'abc' }, // invalid phone number
    });

    fireEvent.click(screen.getByText('Top Up Now'));

    await waitFor(() => {
      expect(screen.getByText('Only numbers are allowed')).toBeInTheDocument();
    });
  });

  it('submits form and calls topUp', async () => {
    renderComponent();

    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '898081234567' },
    });

    fireEvent.click(screen.getByLabelText('Rp10.000'));

    fireEvent.click(screen.getByText('Top Up Now'));

    await waitFor(() => {
      expect(topUp).toHaveBeenCalledWith({
        amount: 10000,
        paymentMethod: 'GOPAY',
        phoneNumber: '898081234567',
        description: 'Top-up to GOPAY',
      });

      expect(push).toHaveBeenCalledWith('/transaction/success');
    });
  });

  it('redirects to /login if not authenticated', () => {
    renderComponent({ isAuthenticated: false });

    expect(push).toHaveBeenCalledWith('/login');
  });
});
