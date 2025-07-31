import { DELETE } from './route';
import { NextResponse } from 'next/server';

jest.mock('next/headers'); // agar cookies() bisa dimock dari __mocks__
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: jest.fn((data, init) => new Response(JSON.stringify(data), init)),
    redirect: jest.requireActual('next/server').NextResponse.redirect,
  }
}));

describe('DELETE /api/auth/logout', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should clear the cookie and return 200', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
      headers: {
        set: jest.fn(), // ✅ penting! ini yang tadi error
      },
    });

    const req = new Request('http://localhost:3000', { method: 'DELETE' });

    const res = await DELETE(req as any);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      message: 'Logout completed locally',
    });
  });
});
