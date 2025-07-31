import { GET } from './route';

jest.mock('@/libs/constants', () => ({
  API_BASE_URL: 'http://mock-api.com',
}));

jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: jest.fn((data, init) => new Response(JSON.stringify(data), init)),
    },
  };
});

describe('GET /api/payment/balance', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return balance data when successful', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ balance: 1000 }),
    });

    const req = new Request('http://localhost:3000', {
      headers: { cookie: 'token=abc' },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.balance).toBe(1000);
  });

  it('should return error message when fetch fails with non-OK status', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        meta: { message: 'Invalid request' },
      }),
    });

    const req = new Request('http://localhost:3000');
    const res = await GET(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Invalid request');
  });

  it('should handle unexpected server errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    const req = new Request('http://localhost:3000');
    const res = await GET(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Server error occurred');
  });
});
