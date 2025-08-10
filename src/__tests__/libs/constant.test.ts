import {API_BASE_URL} from "@/libs/constants";

process.env.API_BASE_URL = 'https://example.com';

describe('API_BASE_URL', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules(); // Clears the module cache
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv; // Restore original env
    });

    it('should use environment variable when API_BASE_URL is set', () => {
        expect(API_BASE_URL).toBe('http://localhost:3001');
    });

    it('should use default URL when API_BASE_URL is not set', () => {
        process.env.API_BASE_URL = undefined;
        expect(API_BASE_URL).toBe(
            'https://kong-proxy-one-gate-payment.apps.ocp-one-gate-payment.skynux.fun'
        );
    });
});