import { GET } from './route';

jest.mock('@/libs/constants', () => ({
  API_BASE_URL: 'https://mock-api.com',
}));

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => new Response(JSON.stringify(data), init)),
  },
}));

describe('GET /api/payment/account', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return account data on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ accountNumber: '1234567890' }),
    });

    const req = new Request('http://localhost:3000', {
      headers: { cookie: 'refresh-token=abc' },
    });

    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.accountNumber).toBe('1234567890');
  });

  it('should return error message if response not ok', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        meta: { message: 'Forbidden' },
      }),
    });

    const req = new Request('http://localhost:3000');
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.message).toBe('Forbidden');
  });

  it('should return 500 on fetch error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Fetch failed'));

    const req = new Request('http://localhost:3000');
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe('Server error occurred');
  });
});
