import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json(
        {
            status: 'OK',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        },
        {
            status: 200,
            headers: {
                'Cache-Control': 'no-store'
            }
        }
    );
}

export async function HEAD() {
    return new NextResponse(null, { status: 200 });
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Allow': 'GET, HEAD, OPTIONS'
        }
    });
}