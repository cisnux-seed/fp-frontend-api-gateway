import type { Config } from 'jest';
import nextJest from 'next/jest';

const createJestConfig = nextJest({
  // Sediakan path ke aplikasi Next.js Anda untuk memuat file next.config.js dan .env di lingkungan tes Anda
  dir: './',
});

// Tambahkan konfigurasi kustom yang akan diteruskan ke Jest
const customJestConfig: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    // Menangani alias modul (ini akan dikonfigurasi secara otomatis untuk Anda segera)
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  // Jest tidak akan mentransformasi file dari node_modules secara default.
  // Beberapa library seperti lucide-react menggunakan sintaks modern yang perlu ditransformasi.
  transformIgnorePatterns: [
    '/node_modules/(?!lucide-react)/',
  ],
};

// createJestConfig diekspor dengan cara ini untuk memastikan bahwa next/jest dapat memuat
// konfigurasi Next.js yang bersifat async.
export default createJestConfig(customJestConfig);
