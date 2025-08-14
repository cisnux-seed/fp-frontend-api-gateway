import { POST } from "./route";

  it('should return an error if login fails from backend', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({
        meta: { message: 'Invalid credentials' }
      }),
      headers: {
        get: jest.fn(),
      },
    });

    const req = new Request('http://localhost:3000', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        identifier: 'testuser',
        password: 'wrongpassword',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({
      message: 'Invalid credentials',
    });
  });

  it('should handle missing set-cookie header gracefully', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        jwt: 'mock-jwt-token',
        user: { username: 'testuser' },
        meta: { message: 'Login success' },
      }),
      headers: {
        get: jest.fn().mockReturnValue(null), // No Set-Cookie
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
    const body = await res.json();
    expect(body.user.username).toBe('testuser');
  });

  it('should handle server/network errors', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network down'));

    const req = new Request('http://localhost:3000', {
      method: 'POST',
      headers: new Headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        identifier: 'testuser',
        password: 'password123',
      }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      message: 'Server error occurred',
    });
  });
