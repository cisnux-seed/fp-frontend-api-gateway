import {API_BASE_URL} from "@/libs/constants";
import {NextRequest, NextResponse} from "next/server";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const response = await fetch(`${API_BASE_URL}/api/payment/wallet/topup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': req.headers.get('cookie') || '',
            },
            body: JSON.stringify({
                amount: body.amount,
                payment_method: body.paymentMethod,
                phone_number: body.phoneNumber,
                description: body.description,
            }),
            credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(
                {message: data.meta?.message || 'Top-up failed'},
                {status: response.status}
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Top-up error:', error);
        return NextResponse.json(
            {message: 'Server error occurred'},
            {status: 500}
        );
    }
}