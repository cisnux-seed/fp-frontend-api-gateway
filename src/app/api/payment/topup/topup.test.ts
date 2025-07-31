import { POST } from './route';

jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => new Response(JSON.stringify(data), init)),
  },
}));

describe('POST /api/payment/topup', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return top-up data on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const req = new Request('http://localhost/api/payment/topup', {
      method: 'POST',
      body: JSON.stringify({
        amount: 10000,
        paymentMethod: 'gopay',
        phoneNumber: '08123456789',
        description: 'testing',
      }),
      headers: {
        'Content-Type': 'application/json',
        cookie: 'token=mock-token',
      },
    });

    const res = await POST(req as any);

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  it('should return error response if top-up failed', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ meta: { message: 'Invalid top-up' } }),
    });

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({
        amount: 0,
        paymentMethod: 'invalid',
        phoneNumber: '',
        description: '',
      }),
      headers: {
        'Content-Type': 'application/json',
        cookie: 'token=mock-token',
      },
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.message).toBe('Invalid top-up');
  });

  it('should handle server error', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

    const req = new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.message).toBe('Server error occurred');
  });
});
