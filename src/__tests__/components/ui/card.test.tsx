import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter
} from '@/components/ui/card';

describe('Card Components', () => {
    describe('Card', () => {
        it('renders correctly', () => {
            render(<Card data-testid="card">Card Content</Card>);
            const card = screen.getByTestId('card');
            expect(card).toBeInTheDocument();
            expect(card).toHaveClass('rounded-lg');
            expect(card).toHaveClass('border');
        });

        it('applies custom className', () => {
            render(<Card className="custom-class" data-testid="card">Content</Card>);
            expect(screen.getByTestId('card')).toHaveClass('custom-class');
        });
    });

    describe('CardHeader', () => {
        it('renders correctly', () => {
            render(<CardHeader data-testid="header">Header Content</CardHeader>);
            const header = screen.getByTestId('header');
            expect(header).toBeInTheDocument();
            expect(header).toHaveClass('flex');
            expect(header).toHaveClass('flex-col');
        });
    });

    describe('CardTitle', () => {
        it('renders correctly', () => {
            render(<CardTitle>Test Title</CardTitle>);
            const title = screen.getByText('Test Title');
            expect(title).toBeInTheDocument();
            expect(title).toHaveClass('text-2xl');
            expect(title).toHaveClass('font-semibold');
        });
    });

    describe('CardDescription', () => {
        it('renders correctly', () => {
            render(<CardDescription>Test Description</CardDescription>);
            const description = screen.getByText('Test Description');
            expect(description).toBeInTheDocument();
            expect(description).toHaveClass('text-sm');
            expect(description).toHaveClass('text-muted-foreground');
        });
    });

    describe('CardContent', () => {
        it('renders correctly', () => {
            render(<CardContent data-testid="content">Content</CardContent>);
            const content = screen.getByTestId('content');
            expect(content).toBeInTheDocument();
            expect(content).toHaveClass('p-6');
            expect(content).toHaveClass('pt-0');
        });
    });

    describe('CardFooter', () => {
        it('renders correctly', () => {
            render(<CardFooter data-testid="footer">Footer</CardFooter>);
            const footer = screen.getByTestId('footer');
            expect(footer).toBeInTheDocument();
            expect(footer).toHaveClass('flex');
            expect(footer).toHaveClass('items-center');
        });
    });

    describe('Full Card Integration', () => {
        it('renders complete card structure', () => {
            render(
                <Card data-testid="full-card">
                    <CardHeader>
                        <CardTitle>Card Title</CardTitle>
                        <CardDescription>Card Description</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Card content goes here</p>
                    </CardContent>
                    <CardFooter>
                        <button>Action</button>
                    </CardFooter>
                </Card>
            );

            expect(screen.getByTestId('full-card')).toBeInTheDocument();
            expect(screen.getByText('Card Title')).toBeInTheDocument();
            expect(screen.getByText('Card Description')).toBeInTheDocument();
            expect(screen.getByText('Card content goes here')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
        });
    });
});