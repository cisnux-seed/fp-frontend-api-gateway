import { renderHook, act } from '@testing-library/react';
import { useToast } from '@/hooks/use-toast';

describe('useToast', () => {
    it('initially has no toasts', () => {
        const { result } = renderHook(() => useToast());
        expect(result.current.toasts).toHaveLength(0);
    });

    it('adds a toast', () => {
        const { result } = renderHook(() => useToast());

        act(() => {
            result.current.toast({
                title: 'Test Toast',
                description: 'This is a test toast',
            });
        });

        expect(result.current.toasts).toHaveLength(1);
        expect(result.current.toasts[0].title).toBe('Test Toast');
    });

    it('dismisses a toast', () => {
        const { result } = renderHook(() => useToast());

        let toastId: string;
        act(() => {
            const { id } = result.current.toast({
                title: 'Test Toast',
            });
            toastId = id;
        });

        expect(result.current.toasts).toHaveLength(1);

        act(() => {
            result.current.dismiss(toastId);
        });

        expect(result.current.toasts[0].open).toBe(false);
    });
});