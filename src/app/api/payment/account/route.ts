// SIMULASI: /api/payment/account
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-mock';
import { db } from '@/lib/dummy-db';

export async function GET(req: NextRequest) {
    const auth = verifyToken(req);
    if (!auth.isValid) {
        return NextResponse.json({
            meta: { code: "401", message: auth.message },
            data: null
        }, { status: 401 });
    }

    // Now, we read from our in-memory database instead of a hardcoded object.
    const accountData = db.account;
    
    return NextResponse.json({
        meta: { code: "200", message: "account details retrieved successfully" },
        data: accountData
    });
}
