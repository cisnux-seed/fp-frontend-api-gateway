// jest.setup.js - ULTRA CLEAN VERSION (NO CONSOLE NOISE)
import '@testing-library/jest-dom';

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
}));

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        const { priority, loading, ...otherProps } = props;
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...otherProps}  alt=""/>;
    },
}));

// Mock use-toast hook properly
jest.mock('@/hooks/use-toast', () => ({
    useToast: () => ({
        toast: jest.fn(),
        dismiss: jest.fn(),
        toasts: [],
    }),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock browser APIs
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
});

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
}));

Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true
});

Object.defineProperty(window, 'location', {
    value: {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        pathname: '/',
        search: '',
        hash: '',
        assign: jest.fn(),
        reload: jest.fn(),
        replace: jest.fn(),
    },
    writable: true,
});

// Mock storage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', { value: sessionStorageMock });

Object.defineProperty(global, 'crypto', {
    value: {
        randomUUID: jest.fn(() => 'test-uuid-123'),
        getRandomValues: jest.fn((arr) => {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.floor(Math.random() * 256);
            }
            return arr;
        }),
    },
});

// COMPLETE CONSOLE SUPPRESSION FOR TESTS
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
    // Suppress ALL console.error during tests (except actual test failures)
    console.error = jest.fn((...args) => {
        // Only show console.error if it's a Jest/testing-library error
        if (
            typeof args[0] === 'string' && (
                args[0].includes('Error: Uncaught') ||
                args[0].includes('The above error occurred') ||
                args[0].includes('Consider adding an error boundary')
            )
        ) {
            originalError.call(console, ...args);
        }
        // All other console.error calls are suppressed
    });

    // Suppress ALL console.warn during tests
    console.warn = jest.fn();

    // Suppress specific console.log calls during tests
    console.log = jest.fn((...args) => {
        // Only show console.log if it's not from our AuthContext
        if (
            !(typeof args[0] === 'object' &&
                args[0] &&
                ('amount' in args[0] || 'paymentMethod' in args[0]))
        ) {
            originalLog.call(console, ...args);
        }
    });
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
    console.log = originalLog;
});

// Global cleanup after each test
afterEach(() => {
    jest.clearAllMocks();

    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
});

// Suppress unhandled rejection warnings (these are expected in error tests)
process.on('unhandledRejection', () => {
    // Silently ignore - these are expected in error scenario tests
});

// Test timeout
jest.setTimeout(10000);

// Mock environment variables
process.env.API_BASE_URL = 'http://localhost:3001';