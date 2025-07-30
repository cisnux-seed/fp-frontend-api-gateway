import { NextResponse, type NextRequest } from 'next/server';
import {API_BASE_URL} from "@/libs/constants";


export async function GET(req: NextRequest) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/payment/account`, {
            method: 'GET',
            headers: {
                'Cookie': req.headers.get('cookie') || '',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.meta?.message || 'Failed to fetch account' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Account fetch error:', error);
        return NextResponse.json(
            { message: 'Server error occurred' },
            { status: 500 }
        );
    }
}