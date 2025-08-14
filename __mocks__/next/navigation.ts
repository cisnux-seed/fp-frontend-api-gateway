// __mocks__/next/navigation.ts
export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
});

export const usePathname = jest.fn(() => '/');

export const useSearchParams = jest.fn(() => new URLSearchParams());

export const redirect = jest.fn();

export const notFound = jest.fn();
