import { POST } from './route';

// ✅ Perbaiki mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'mock-refresh-token' })),
    set: jest.fn(),
  })),
}));

// ✅ Perbaiki mock NextResponse agar return-nya Response valid
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: (data: any, init?: ResponseInit) =>
        new Response(JSON.stringify(data), init),
    },
  };
});

describe('POST /api/auth/refresh', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return a new token on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: 'new-access-token',
        refresh_token: 'new-refresh-token',
      }),
    });

    const req = new Request('http://localhost:3000', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req as any);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.access_token).toBe('new-access-token');
    expect(body.refresh_token).toBe('new-refresh-token');
  });

  it('should return 401 if refresh token is missing', async () => {
    const mockedCookies = require('next/headers').cookies;
    mockedCookies.mockImplementationOnce(() => ({
      get: jest.fn(() => undefined),
      set: jest.fn(),
    }));

    const req = new Request('http://localhost:3000', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req as any);

    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.message).toBe('Missing refresh token');
  });

  it('should return 500 if refresh request fails (fetch.ok === false)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({}), // tetap tambahkan json agar tidak error
    });

    const req = new Request('http://localhost:3000', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'application/json' },
    });

    const res = await POST(req as any);

    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Server error occurred');
  });
});
