import {NextRequest, NextResponse} from "next/server";
import {API_BASE_URL} from "@/libs/constants";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const ewallet = searchParams.get('ewallet');

        if (!ewallet) {
            return NextResponse.json(
                { message: 'E-wallet type is required' },
                { status: 400 }
            );
        }

        const response = await fetch(`${API_BASE_URL}/api/payment/wallet?ewallet=${ewallet}`, {
            method: 'GET',
            headers: {
                'Cookie': req.headers.get('cookie') || '',
            },
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                { message: data.meta?.message || 'Failed to fetch wallet balance' },
                { status: response.status }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Wallet balance fetch error:', error);
        return NextResponse.json(
            { message: 'Server error occurred' },
            { status: 500 }
        );
    }
}