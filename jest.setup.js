// jest.setup.js
import '@testing-library/jest-dom'

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        refresh: jest.fn(),
        prefetch: jest.fn(),
    }),
    useSearchParams: () => ({
        get: jest.fn(),
    }),
    usePathname: () => '/',
}))

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        const { priority, ...otherProps } = props;
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...otherProps} />
    },
}))

// ✅ FIXED: Mock use-toast hook properly
jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn(),
        dismiss: jest.fn(),
        toasts: [],
    }),
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock other browser APIs
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}))

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
}))

// Cleanup after each test
afterEach(() => {
    jest.clearAllMocks()
})
