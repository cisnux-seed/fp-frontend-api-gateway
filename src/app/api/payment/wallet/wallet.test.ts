import { GET } from './route';

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => new Response(JSON.stringify(data), init)),
  },
}));

describe('GET /api/payment/wallet', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return wallet balance if successful', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ balance: 50000 }),
    });

    const req = new Request('http://localhost/api/payment/wallet?ewallet=gopay', {
      method: 'GET',
      headers: {
        cookie: 'token=mock-token',
      },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.balance).toBe(50000);
  });

  it('should return 400 if ewallet param is missing', async () => {
    const req = new Request('http://localhost/api/payment/wallet', {
      method: 'GET',
    });

    const res = await GET(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('E-wallet type is required');
  });

  it('should return error response if fetch failed', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ meta: { message: 'Not found' } }),
    });

    const req = new Request('http://localhost/api/payment/wallet?ewallet=gopay', {
      method: 'GET',
      headers: {
        cookie: 'token=mock-token',
      },
    });

    const res = await GET(req as any);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.message).toBe('Not found');
  });

  it('should handle server error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

    const req = new Request('http://localhost/api/payment/wallet?ewallet=gopay', {
      method: 'GET',
    });

    const res = await GET(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Server error occurred');
  });
});
