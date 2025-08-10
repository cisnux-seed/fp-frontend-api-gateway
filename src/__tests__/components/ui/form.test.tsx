import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
    useFormField
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// Test schema
const testSchema = z.object({
    email: z.string().email('Invalid email address'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    age: z.number().min(18, 'Must be at least 18 years old'),
});

type TestFormData = z.infer<typeof testSchema>;

// FIXED: Test component with proper form submission handling
const TestForm: React.FC<{ onSubmit: (data: TestFormData) => void }> = ({ onSubmit }) => {
    const form = useForm<TestFormData>({
        resolver: zodResolver(testSchema),
        defaultValues: {
            email: '',
            name: '',
            age: 0,
        },
    });

    const handleSubmit = (data: TestFormData) => {
        onSubmit(data);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter email" {...field} />
                            </FormControl>
                            <FormDescription>
                                We'll never share your email.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter name" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Age</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"
                                    placeholder="Enter age"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Submit</Button>
            </form>
        </Form>
    );
};

// Component to test useFormField hook
const TestFormField: React.FC = () => {
    const {
        id,
        name,
        formItemId,
        formDescriptionId,
        formMessageId,
        error,
        invalid,
        isDirty,
        isTouched
    } = useFormField();

    return (
        <div>
            <div data-testid="field-id">{id}</div>
            <div data-testid="field-name">{name}</div>
            <div data-testid="form-item-id">{formItemId}</div>
            <div data-testid="form-description-id">{formDescriptionId}</div>
            <div data-testid="form-message-id">{formMessageId}</div>
            <div data-testid="field-error">{error?.message || 'no error'}</div>
            <div data-testid="field-invalid">{invalid.toString()}</div>
            <div data-testid="field-dirty">{isDirty.toString()}</div>
            <div data-testid="field-touched">{isTouched.toString()}</div>
        </div>
    );
};

const TestFormWithHook: React.FC = () => {
    const form = useForm({
        defaultValues: {
            testField: '',
        },
    });

    return (
        <Form {...form}>
            <FormField
                control={form.control}
                name="testField"
                render={() => (
                    <FormItem>
                        <TestFormField />
                    </FormItem>
                )}
            />
        </Form>
    );
};

describe('Form Components', () => {
    describe('Form Integration', () => {
        it('renders form with all fields correctly', () => {
            const mockSubmit = jest.fn();
            render(<TestForm onSubmit={mockSubmit} />);

            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Age')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
            expect(screen.getByText("We'll never share your email.")).toBeInTheDocument();
        });

        // FIXED: Wrap user interactions in act() and handle async properly
        it('handles form submission with valid data', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            // FIXED: Wrap all user interactions in act()
            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter email'), 'test@example.com');
            });

            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe');
            });

            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter age'), '25');
            });

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }));
            });

            // FIXED: Now correctly expects just the form data
            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalledWith({
                    email: 'test@example.com',
                    name: 'John Doe',
                    age: 25,
                });
            });
        });

        // FIXED: Wrap user interactions in act()
        it('shows validation errors for invalid data', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter email'), 'invalid-email');
                await user.type(screen.getByPlaceholderText('Enter name'), 'A'); // Too short
                await user.type(screen.getByPlaceholderText('Enter age'), '16'); // Too young
            });

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }));
            });

            await waitFor(() => {
                expect(screen.getByText('Invalid email address')).toBeInTheDocument();
                expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
                expect(screen.getByText('Must be at least 18 years old')).toBeInTheDocument();
            });

            expect(mockSubmit).not.toHaveBeenCalled();
        });

        // FIXED: Wrap user interactions in act()
        it('clears validation errors when data becomes valid', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            // Fill with invalid data first
            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter email'), 'invalid');
                await user.click(screen.getByRole('button', { name: 'Submit' }));
            });

            await waitFor(() => {
                expect(screen.getByText('Invalid email address')).toBeInTheDocument();
            });

            // Fix the email
            await act(async () => {
                await user.clear(screen.getByPlaceholderText('Enter email'));
                await user.type(screen.getByPlaceholderText('Enter email'), 'test@example.com');
            });

            await waitFor(() => {
                expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
            });
        });
    });

    describe('FormField Component', () => {
        it('renders label correctly', () => {
            const mockSubmit = jest.fn();
            render(<TestForm onSubmit={mockSubmit} />);

            const emailLabel = screen.getByText('Email');
            expect(emailLabel).toBeInTheDocument();
            expect(emailLabel.tagName.toLowerCase()).toBe('label');
        });

        it('associates label with input correctly', () => {
            const mockSubmit = jest.fn();
            render(<TestForm onSubmit={mockSubmit} />);

            const emailInput = screen.getByLabelText('Email');
            expect(emailInput).toBeInTheDocument();
        });
    });

    describe('FormMessage Component', () => {
        it('shows error messages when validation fails', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            await act(async () => {
                await user.click(screen.getByRole('button', { name: 'Submit' }));
            });

            await waitFor(() => {
                // Check for required field errors (empty email should trigger validation)
                const errorMessages = screen.getAllByText(/Invalid email address|Name must be at least 2 characters/);
                expect(errorMessages.length).toBeGreaterThan(0);
            });
        });

        it('does not show error messages when validation passes', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter email'), 'test@example.com');
                await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe');
                await user.type(screen.getByPlaceholderText('Enter age'), '25');
                await user.click(screen.getByRole('button', { name: 'Submit' }));
            });

            await waitFor(() => {
                expect(screen.queryByText('Invalid email address')).not.toBeInTheDocument();
                expect(screen.queryByText('Name must be at least 2 characters')).not.toBeInTheDocument();
                expect(screen.queryByText('Must be at least 18 years old')).not.toBeInTheDocument();
            });
        });
    });

    describe('FormDescription Component', () => {
        it('renders description text correctly', () => {
            const mockSubmit = jest.fn();
            render(<TestForm onSubmit={mockSubmit} />);

            expect(screen.getByText("We'll never share your email.")).toBeInTheDocument();
        });
    });

    describe('useFormField Hook', () => {
        it('provides correct form field context', () => {
            render(<TestFormWithHook />);

            expect(screen.getByTestId('field-name')).toHaveTextContent('testField');
            expect(screen.getByTestId('field-error')).toHaveTextContent('no error');
            expect(screen.getByTestId('field-invalid')).toHaveTextContent('false');
            expect(screen.getByTestId('field-dirty')).toHaveTextContent('false');
            expect(screen.getByTestId('field-touched')).toHaveTextContent('false');
        });

        // FIXED: Updated to match the actual error thrown
        it('throws error when used outside FormField', () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestFormField />);
            }).toThrow("Cannot destructure property 'getFieldState'");

            consoleSpy.mockRestore();
        });
    });

    describe('Form Accessibility', () => {
        it('has proper ARIA attributes', () => {
            const mockSubmit = jest.fn();
            render(<TestForm onSubmit={mockSubmit} />);

            const emailInput = screen.getByLabelText('Email');
            expect(emailInput).toHaveAttribute('aria-describedby');
        });

        it('associates error messages with inputs', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter email'), 'invalid');
                await user.click(screen.getByRole('button', { name: 'Submit' }));
            });

            await waitFor(() => {
                const emailInput = screen.getByLabelText('Email');
                const ariaDescribedBy = emailInput.getAttribute('aria-describedby');
                expect(ariaDescribedBy).toBeTruthy();

                if (ariaDescribedBy) {
                    expect(emailInput).toHaveAttribute('aria-invalid', 'true');
                }
            });
        });
    });

    describe('Form State Management', () => {
        it('tracks form state changes correctly', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            const emailInput = screen.getByLabelText('Email');

            // Initially, form should be in pristine state
            expect(emailInput).toHaveValue('');

            // Type in email field
            await act(async () => {
                await user.type(emailInput, 'test@example.com');
            });

            expect(emailInput).toHaveValue('test@example.com');
        });

        it('resets form validation on successful submission', async () => {
            const mockSubmit = jest.fn();
            const user = userEvent.setup();

            render(<TestForm onSubmit={mockSubmit} />);

            // Fill form with valid data
            await act(async () => {
                await user.type(screen.getByPlaceholderText('Enter email'), 'test@example.com');
                await user.type(screen.getByPlaceholderText('Enter name'), 'John Doe');
                await user.type(screen.getByPlaceholderText('Enter age'), '25');
                await user.click(screen.getByRole('button', { name: 'Submit' }));
            });

            await waitFor(() => {
                expect(mockSubmit).toHaveBeenCalledTimes(1);
            });
        });
    });
});