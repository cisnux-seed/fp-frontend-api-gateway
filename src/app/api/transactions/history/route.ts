// SIMULASI: /api/transactions/history (Endpoint sederhana untuk riwayat)
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

    // Read history from our in-memory database, and return it in reverse chronological order.
    const historyData = [...db.transactions].reverse();
    
    return NextResponse.json({
        meta: { code: "200", message: "transactions retrieved successfully" },
        data: historyData
    });
}
