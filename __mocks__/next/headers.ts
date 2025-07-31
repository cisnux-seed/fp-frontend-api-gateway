export const cookies = jest.fn(() => ({
  get: jest.fn((key) => {
    if (key === 'refresh_token') return { value: 'mock-refresh-token' };
    return undefined;
  }),
  set: jest.fn(),
  delete: jest.fn(),
}));
