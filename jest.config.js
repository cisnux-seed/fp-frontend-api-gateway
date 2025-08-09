// jest.config.js - FIXED AND IMPROVED VERSION
const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files
    dir: './',
})

const customJestConfig = {
    // Setup files to run before tests
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // Test environment
    testEnvironment: 'jest-environment-jsdom',

    // Module name mapping for path aliases
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        // Handle CSS imports (with CSS modules)
        '^.+\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
        // Handle CSS imports (without CSS modules)
        '^.+\\.(css|sass|scss)$': 'identity-obj-proxy',
        // Handle image imports
        '^.+\\.(png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/i': '<rootDir>/__mocks__/fileMock.js',
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

    // Coverage thresholds (optional - adjust as needed)
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },

    // Coverage reporters
    coverageReporters: ['text', 'lcov', 'html'],

    // Max number of concurrent workers
    maxWorkers: '50%',

    // Automatically clear mock calls and instances between every test
    clearMocks: true,

    // Indicates whether the coverage information should be collected while executing the test
    collectCoverage: false, // Set to true if you want coverage by default

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

    // Global variables available in all tests
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.json',
        },
    },

    // Verbose output (set to false to reduce noise)
    verbose: false,

    // Watch plugins
    watchPlugins: [
        'jest-watch-typeahead/filename',
        'jest-watch-typeahead/testname',
    ],
}

// Create the final Jest config
module.exports = createJestConfig(customJestConfig)