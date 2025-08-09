// jest.setup.js - FIXED VERSION
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
    default: (props) => {
        const { priority, ...otherProps } = props;
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...otherProps} />;
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

// Mock other browser APIs that might be missing in test environment
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
}));

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true
});

// Mock location
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

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
Object.defineProperty(window, 'sessionStorage', {
    value: sessionStorageMock,
});

// Mock crypto.randomUUID for tests that might need it
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

// Mock console methods to reduce noise in tests but keep errors visible
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
    console.error = (...args) => {
        // Filter out specific React warnings that we don't need to see in tests
        if (
            typeof args[0] === 'string' && (
                args[0].includes('Warning: ReactDOM.render is no longer supported') ||
                args[0].includes('Warning: `ReactDOMTestUtils.act`') ||
                args[0].includes('Warning: An invalid form control')
            )
        ) {
            return;
        }
        originalError.call(console, ...args);
    };

    console.warn = (...args) => {
        // Filter out specific warnings we don't need in tests
        if (
            typeof args[0] === 'string' && (
                args[0].includes('componentWillReceiveProps') ||
                args[0].includes('componentWillUpdate')
            )
        ) {
            return;
        }
        originalWarn.call(console, ...args);
    };
});

afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});

// Global cleanup after each test
afterEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Clear fetch mock specifically
    if (global.fetch && typeof global.fetch.mockClear === 'function') {
        global.fetch.mockClear();
    }

    // Clear localStorage and sessionStorage
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    sessionStorageMock.getItem.mockClear();
    sessionStorageMock.setItem.mockClear();
    sessionStorageMock.removeItem.mockClear();
    sessionStorageMock.clear.mockClear();
});

// Global error handler to catch unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
    console.log('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Set test timeout to handle async operations
jest.setTimeout(10000);

// Mock environment variables that might be needed
process.env.NODE_ENV = 'test';
process.env.API_BASE_URL = 'http://localhost:3001';