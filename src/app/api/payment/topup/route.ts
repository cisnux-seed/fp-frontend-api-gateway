// SIMULASI: /api/payment/topup
import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth-mock';
import type { TopupRequest, TransactionResponse } from '@/lib/types';
import { db } from '@/lib/dummy-db';

// Daftar nomor yang diizinkan untuk berhasil, sekarang dipisah per layanan
const gopayAllowedNumbers = new Set([
  "898081234560", "898081234561", "898081234562", "898081234563",
  "898081234564", "898081234565", "898081234566", "898081234567",
  "898081234568", "898081234569"
]);

const shopeePayAllowedNumbers = new Set([
  "897081234560", "897081234561", "897081234562", "897081234563",
  "897081234564", "897081234565", "897081234566", "897081234567",
  "897081234568", "897081234569"
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

        let isSuccess = false;
        let failureMessage = "Nomor telepon tidak terdaftar di layanan mitra.";

        switch (body.paymentMethod) {
            case 'GOPAY':
                isSuccess = gopayAllowedNumbers.has(body.phone_number);
                break;
            case 'SHOPEE_PAY':
                isSuccess = shopeePayAllowedNumbers.has(body.phone_number);
                break;
            default:
                isSuccess = false;
                failureMessage = "Metode pembayaran tidak didukung.";
        }

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
                meta: { code: "422", message: failureMessage },
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
