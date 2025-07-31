import { cn } from '@/libs/utils';

describe('Utils', () => {
    describe('cn function', () => {
        it('merges class names correctly', () => {
            const result = cn('text-red-500', 'bg-blue-500');
            expect(result).toBe('text-red-500 bg-blue-500');
        });

        it('handles conditional classes', () => {
            const result = cn('base-class', 'active-class', false);
            expect(result).toBe('base-class active-class');
        });

        it('handles tailwind merge conflicts', () => {
            const result = cn('p-4', 'p-2');
            expect(result).toBe('p-2');
        });
    });
});