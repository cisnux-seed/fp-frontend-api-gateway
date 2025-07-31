import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GojekIcon, ShopeePayIcon } from '@/components/icons';

describe('Icons', () => {
    it('renders GojekIcon', () => {
        render(<GojekIcon data-testid="gojek-icon" />);
        expect(screen.getByTestId('gojek-icon')).toBeInTheDocument();
    });

    it('renders ShopeePayIcon', () => {
        render(<ShopeePayIcon data-testid="shopee-icon" />);
        expect(screen.getByTestId('shopee-icon')).toBeInTheDocument();
    });
});