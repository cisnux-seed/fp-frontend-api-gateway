import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/'];

    // Check if the current path is a public route
    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    // Check for auth-token cookie
    const authToken = request.cookies.get('auth-token');

    // If no auth token and trying to access protected route, redirect to login
    if (!authToken && !publicRoutes.includes(pathname)) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - images (public images)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
    ],
};