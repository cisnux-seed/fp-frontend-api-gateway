// SIMULASI: /api/payment/topup
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-mock';
import type { TopupRequest, TransactionResponse } from '@/lib/types';
import { db } from '@/lib/dummy-db';

// Daftar nomor yang diizinkan untuk berhasil
const allowedPhoneNumbers = new Set([
  "+6281293846571", "+6285773092184", "+6287812349091", "+6282229901765",
  "+6281317758842", "+6285266104738", "+6285978452203", "+6281996731156",
  "+6287754209934", "+6283159914870"
]);

export async function POST(req: NextRequest) {
    const auth = verifyToken(req);
    if (!auth.isValid) {
        return NextResponse.json({
            meta: { code: "401", message: auth.message },
            data: null
        }, { status: 401 });
    }

    try {
        const body = (await req.json()) as TopupRequest;

        if (!body.amount || !body.paymentMethod || !body.phone_number) {
            return NextResponse.json({
                meta: { code: "400", message: "amount, paymentMethod, and phone_number are required" },
                data: null
            }, { status: 400 });
        }
        
        await new Promise(resolve => setTimeout(resolve, 1200));

        const isSuccess = allowedPhoneNumbers.has(body.phone_number);
        const currentBalance = db.account.balance;
        const newTransactionId = `TXN-${Date.now()}`;
        
        const transactionData: TransactionResponse = {
            id: Math.floor(Math.random() * 100000),
            transactionId: newTransactionId,
            transactionType: "TOPUP",
            transactionStatus: isSuccess ? "SUCCESS" : "FAILED",
            amount: body.amount,
            balanceBefore: currentBalance,
            balanceAfter: isSuccess ? currentBalance - body.amount : currentBalance,
            currency: "IDR",
            paymentMethod: body.paymentMethod,
            description: body.description || `Top up via ${body.paymentMethod}`,
            createdAt: new Date().toISOString(),
            phone_number: body.phone_number,
        };

        if (isSuccess) {
            if (currentBalance < body.amount) {
                // Handle insufficient funds
                 transactionData.transactionStatus = "FAILED";
                 transactionData.balanceAfter = currentBalance; // Balance doesn't change
                 db.transactions.push(transactionData); // Still log the failed attempt

                 return NextResponse.json({
                    meta: { code: "422", message: "Saldo tidak mencukupi." },
                    data: transactionData,
                }, { status: 422 });
            }

            // Update balance in our dummy DB
            db.account.balance -= body.amount;
            db.account.updatedAt = new Date().toISOString();
            
            // Add transaction to our dummy DB
            db.transactions.push(transactionData);

            return NextResponse.json({
                meta: { code: "201", message: "Top up berhasil" },
                data: transactionData
            }, { status: 201 });

        } else {
             // Add failed transaction to our dummy DB
             db.transactions.push(transactionData);

             return NextResponse.json({
                meta: { code: "422", message: "Nomor telepon tidak terdaftar di layanan mitra." },
                data: transactionData,
            }, { status: 422 });
        }

    } catch (error) {
        console.error('[API Topup Sim] Error:', error);
        return NextResponse.json({
            meta: { code: "500", message: "Internal server error" },
            data: null
        }, { status: 500 });
    }
}
