// src/__tests__/components/ui/form.test.tsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import '@testing-library/jest-dom';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Test form schema
const testSchema = z.object({
    username: z.string().min(2, 'Username must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
});

type TestFormData = z.infer<typeof testSchema>;

// Test component with proper error rendering
const TestFormComponent = () => {
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<TestFormData>({
        mode: 'onSubmit',
        resolver: zodResolver(testSchema), // Use Zod resolver for validation
        defaultValues: {
            username: '',
            email: ''
        }
    });

    const onSubmit = async (data: TestFormData) => {
        console.log('Form submitted:', data);
    };

    return (
        <form data-testid="test-form" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-2">
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    {...register('username')}
                    placeholder="Enter username"
                    aria-invalid={errors.username ? 'true' : 'false'}
                />
                {errors.username && (
                    <span data-testid="username-error" role="alert">
                        {errors.username.message}
                    </span>
                )}
            </div>

            <div className="space-y-2">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    {...register('email')}
                    type="email"
                    placeholder="Enter email"
                    aria-invalid={errors.email ? 'true' : 'false'}
                />
                {errors.email && (
                    <span data-testid="email-error" role="alert">
                        {errors.email.message}
                    </span>
                )}
            </div>

            <button type="submit">Submit</button>
        </form>
    );
};

describe('Form Components', () => {
    // Suppress console.log for cleaner test output
    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('renders form fields correctly', async () => {
        render(<TestFormComponent />);

        // Wait for form to be ready
        await waitFor(() => {
            expect(screen.getByLabelText('Username')).toBeInTheDocument();
        });

        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('submits form successfully with valid data', async () => {
        const user = userEvent.setup();
        const consoleSpy = jest.spyOn(console, 'log');

        render(<TestFormComponent />);

        const usernameInput = await screen.findByPlaceholderText('Enter username');
        const emailInput = screen.getByPlaceholderText('Enter email');
        const submitButton = screen.getByRole('button', { name: 'Submit' });

        // Enter valid data
        await user.type(usernameInput, 'validuser');
        await user.type(emailInput, 'valid@email.com');

        // Submit form
        await user.click(submitButton);

        // Wait for successful submission
        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Form submitted:', {
                username: 'validuser',
                email: 'valid@email.com',
            });
        });

        // Should not show error messages
        expect(screen.queryByTestId('username-error')).not.toBeInTheDocument();
        expect(screen.queryByTestId('email-error')).not.toBeInTheDocument();

        // Aria-invalid should be false for valid inputs
        expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
        expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('clears validation errors when input becomes valid', async () => {
        const user = userEvent.setup();
        render(<TestFormComponent />);

        const usernameInput = await screen.findByPlaceholderText('Enter username');
        const submitButton = screen.getByRole('button', { name: 'Submit' });

        // First trigger validation error
        await user.type(usernameInput, 'a');
        await user.click(submitButton);

        // Wait for error to appear
        const usernameError = await screen.findByTestId('username-error');
        expect(usernameError).toBeInTheDocument();

        // Fix the input
        await user.clear(usernameInput);
        await user.type(usernameInput, 'validuser');
        await user.click(submitButton);

        // Wait for error to disappear
        await waitFor(() => {
            expect(screen.queryByTestId('username-error')).not.toBeInTheDocument();
        });
    });

    it('integrates with react-hook-form correctly', async () => {
        const user = userEvent.setup();

        // Test that the form actually uses react-hook-form
        const TestIntegration = () => {
            const form = useForm<TestFormData>({
                resolver: zodResolver(testSchema),
                defaultValues: { username: '', email: '' },
            });

            return (
                <div>
                    <Form {...form}>
                        <form data-testid="integration-form">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="Username" {...field} />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                    <div data-testid="form-state">
                        {JSON.stringify({
                            isValid: form.formState.isValid,
                            isDirty: form.formState.isDirty,
                        })}
                    </div>
                </div>
            );
        };

        render(<TestIntegration />);

        // Wait for form to be ready
        const usernameInput = await screen.findByPlaceholderText('Username');

        // Initially should be invalid (empty required fields) and not dirty
        await waitFor(() => {
            expect(screen.getByTestId('form-state')).toHaveTextContent(
                JSON.stringify({ isValid: false, isDirty: false })
            );
        });

        // Type something to make it dirty
        await user.type(usernameInput, 'test');

        // Should now be dirty and potentially valid depending on the input
        await waitFor(() => {
            const formState = screen.getByTestId('form-state');
            expect(formState.textContent).toContain('"isDirty":true');
        });
    });

    it('applies proper accessibility attributes', async () => {
        render(<TestFormComponent />);

        // Wait for form to be ready
        const usernameInput = await screen.findByPlaceholderText('Enter username');
        const emailInput = screen.getByPlaceholderText('Enter email');

        // Should have proper labels
        expect(usernameInput).toHaveAccessibleName('Username');
        expect(emailInput).toHaveAccessibleName('Email');

        // Should have proper types
        expect(emailInput).toHaveAttribute('type', 'email');

        // Should have proper initial aria-invalid
        expect(usernameInput).toHaveAttribute('aria-invalid', 'false');
        expect(emailInput).toHaveAttribute('aria-invalid', 'false');
    });
});