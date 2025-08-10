// jest.config.js - UPDATED FOR NEXT.JS 15 AND MODERN SYNTAX
const nextJest = require('next/jest')

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({ dir: './' })

// Custom Jest configuration
const customJestConfig = {
    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // Test environment
    testEnvironment: 'jsdom',

    // Module name mapping for path aliases and file types
    moduleNameMapper: {
        // Handle module aliases
        '^@/(.*)$': '<rootDir>/src/$1',

        // Handle CSS imports (with CSS modules)
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',

        // Handle CSS imports (without CSS modules)
        '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',

        // Handle image imports
        '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': '<rootDir>/__mocks__/fileMock.js',

        // Handle font imports
        '^.+\\.(woff|woff2|eot|ttf|otf)$/i': '<rootDir>/__mocks__/fileMock.js',
    },

    // Coverage collection
    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/api/**/*',
        '!src/middleware.ts',
        '!src/**/*.stories.{js,jsx,ts,tsx}',
        '!src/**/*.config.{js,jsx,ts,tsx}',
        '!src/**/index.{js,jsx,ts,tsx}',
        // Exclude specific files that don't need testing
        '!src/app/layout.tsx',
        '!src/app/globals.css',
    ],

    // Test file patterns
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}',
        '<rootDir>/__tests__/**/*.{js,jsx,ts,tsx}',
    ],

    // Files to ignore during transformation
    transformIgnorePatterns: [
        '/node_modules/',
        '^.+\\.module\\.(css|sass|scss)$',
    ],

    // Test environment options
    testEnvironmentOptions: {
        url: 'http://localhost:3000',
    },

    // Coverage thresholds
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // Coverage reporters
    coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

    // Max number of concurrent workers
    maxWorkers: '50%',

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: false,

    // The directory where Jest should output its coverage files
    coverageDirectory: 'coverage',

    // Ignore patterns for coverage
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/.next/',
        '/coverage/',
        '/public/',
    ],

    // Module file extensions
    moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],

    // Verbose output
    verbose: false,

    // Watch plugins for better DX
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],

    // Handle ES modules in node_modules
    extensionsToTreatAsEsm: ['.ts', '.tsx'],

    // Transform configuration for better ES module support
    transform: {
        // Use built-in TypeScript transformer for .ts and .tsx files
        '^.+\\.(ts|tsx)$': ['ts-jest', {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx',
            },
        }],
    },

    // Global setup
    globals: {
        'ts-jest': {
            useESM: true,
            tsconfig: {
                jsx: 'react-jsx',
            },
        },
    },

    // Handle modern node_modules that use ES modules
    transformIgnorePatterns: [
        'node_modules/(?!(.*\\.mjs$|@testing-library|lucide-react))',
    ],
}

// Create Jest config with Next.js defaults
module.exports = createJestConfig(customJestConfig)