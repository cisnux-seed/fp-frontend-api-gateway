import {NextResponse, type NextRequest} from 'next/server';
import {API_BASE_URL} from "@/libs/constants";


export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': req.headers.get('cookie') || '',
            },
            body: JSON.stringify({
                refreshToken: body.refreshToken,
            }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {message: data.meta?.message || 'Token refresh failed'},
                {status: response.status}
            );
        }

        const nextResponse = NextResponse.json({
            message: data.meta?.message || 'Token refreshed successfully',
        });

        // Forward new cookies
        const setCookieHeaders = response.headers.get('set-cookie');
        if (setCookieHeaders) {
            nextResponse.headers.set('Set-Cookie', setCookieHeaders);
        }

        return nextResponse;
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json(
            {message: 'Server error occurred'},
            {status: 500}
        );
    }
}