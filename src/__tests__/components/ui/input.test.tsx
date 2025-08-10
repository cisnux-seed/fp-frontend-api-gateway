import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/input';

describe('Input Component', () => {
    it('renders with placeholder', () => {
        render(<Input placeholder="Enter text" />);

        const input = screen.getByPlaceholderText('Enter text');
        expect(input).toBeInTheDocument();
        expect(input).toHaveClass('flex');
        expect(input).toHaveClass('h-10');
        expect(input).toHaveClass('w-full');
        expect(input).toHaveClass('rounded-md');
    });

    it('handles user input', async () => {
        const user = userEvent.setup();
        render(<Input data-testid="test-input" />);

        const input = screen.getByTestId('test-input');
        await user.type(input, 'Hello World');

        expect(input).toHaveValue('Hello World');
    });

    it('supports different input types', () => {
        const { rerender } = render(<Input type="email" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

        rerender(<Input type="password" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

        rerender(<Input type="number" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });

    it('can be disabled', () => {
        render(<Input disabled data-testid="input" />);

        const input = screen.getByTestId('input');
        expect(input).toBeDisabled();
    });

    it('handles onChange events', async () => {
        const handleChange = jest.fn();
        const user = userEvent.setup();

        render(<Input onChange={handleChange} data-testid="input" />);

        const input = screen.getByTestId('input');
        await user.type(input, 'test');

        expect(handleChange).toHaveBeenCalled();
    });

    it('applies custom className', () => {
        render(<Input className="custom-class" data-testid="input" />);

        expect(screen.getByTestId('input')).toHaveClass('custom-class');
        expect(screen.getByTestId('input')).toHaveClass('h-10');
        expect(screen.getByTestId('input')).toHaveClass('w-full');
        expect(screen.getByTestId('input')).toHaveClass('rounded-md');
    });

    it('forwards ref correctly', () => {
        const ref = React.createRef<HTMLInputElement>();
        render(<Input ref={ref} data-testid="input" />);

        expect(ref.current).toBe(screen.getByTestId('input'));
    });
});
