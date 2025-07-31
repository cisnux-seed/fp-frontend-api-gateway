import { POST } from './route';
import { NextResponse } from 'next/server';

jest.mock('next/headers'); // Akan otomatis pakai dari __mocks__/next/headers.ts
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => new Response(JSON.stringify(data), init)),
    redirect: jest.requireActual('next/server').NextResponse.redirect,
  }
}));

describe('POST /api/auth/login', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should return a JSON response on success', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jwt: 'mock-jwt-token',
        user: { username: 'testuser' },
      }),
      headers: {
        get: jest.fn().mockReturnValue('mocked-set-cookie-header'), // ✅ Tambahkan ini
      },
    });

    const req = new Request('http://localhost:3000', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        identifier: 'testuser',
        password: 'password123',
      }),
    });

    const res = await POST(req as any);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      user: { username: 'testuser' },
      message: 'Login successful',
    });
  });

  // Test lainnya bisa ditambahkan di sini...
});
