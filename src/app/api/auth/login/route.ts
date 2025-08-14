import {NextResponse, type NextRequest} from 'next/server';
import {API_BASE_URL} from '@/libs/constants';

jest.mock('next/server'); // akan pakai __mocks__/next/server.ts

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: body.identifier, // Map identifier to username
                password: body.password,
            }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {message: data.meta?.message || 'Login failed'},
                {status: response.status}
            );
        }

        // Create response with httpOnly cookies
        const nextResponse = NextResponse.json({
            message: data.meta?.message || 'Login successful',
            user: {
                // Extract user info if available in response
                username: body.identifier,
            }
        });

        // Forward cookies from the backend
        const setCookieHeaders = response.headers.get('set-cookie');
        if (setCookieHeaders) {
            nextResponse.headers.set('Set-Cookie', setCookieHeaders);
        }

        return nextResponse;
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            {message: 'Server error occurred'},
            {status: 500}
        );
    }
}