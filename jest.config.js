// jest.config.js - CORRECTED VERSION
const nextJest = require('next/jest')

const createJestConfig = nextJest({
    dir: './',
})

const customJestConfig = {
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    testEnvironment: 'jest-environment-jsdom',

    // ✅ FIXED: Changed from "moduleNameMapping" to "moduleNameMapper"
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },

    collectCoverageFrom: [
        'src/**/*.{js,jsx,ts,tsx}',
        '!src/**/*.d.ts',
        '!src/app/api/**/*',
        '!src/middleware.ts',
    ],
    testMatch: [
        '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
        '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
    ],
    transformIgnorePatterns: [
        '/node_modules/',
        '^.+\\.module\\.(css|sass|scss)$',
    ],
}

module.exports = createJestConfig(customJestConfig)