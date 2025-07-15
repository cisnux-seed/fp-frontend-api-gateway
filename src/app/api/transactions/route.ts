
import { NextResponse, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import type { TransactionInput } from '@/lib/types';
import { simulatePartnerApiCall } from '@/lib/api';


export async function POST(req: NextRequest) {
  try {
    const { userId, transactionDetails } = await req.json() as { userId: number, transactionDetails: Omit<TransactionInput, 'status'>};

    if (!userId || !transactionDetails) {
      return NextResponse.json({ message: 'Data tidak lengkap.' }, { status: 400 });
    }
    
    const client = await pool.connect();
    try {
      // 1. Dapatkan status dari simulasi API partner
      const status = await simulatePartnerApiCall(transactionDetails);

      // 2. Mulai transaksi database
      await client.query('BEGIN');

      let currentBalance = 0;

      // 3. Jika sukses, kurangi saldo user
      if (status === 'Success') {
        const balanceResult = await client.query('SELECT balance FROM users WHERE id = $1 FOR UPDATE', [userId]);
        
        if (balanceResult.rows.length === 0) {
          throw new Error('Pengguna tidak ditemukan.');
        }

        currentBalance = parseFloat(balanceResult.rows[0].balance);
        
        if (currentBalance < transactionDetails.nominal) {
          await client.query('ROLLBACK');
          return NextResponse.json({ message: 'Saldo tidak mencukupi.' }, { status: 400 });
        }
        
        const newBalance = currentBalance - transactionDetails.nominal;
        await client.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);
      }

      // 4. Catat transaksi ke tabel history
      const insertQuery = `
        INSERT INTO transactions (user_id, payment_method, phone_number, transaction_type, nominal, status)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const transactionValues = [
        userId,
        transactionDetails.payment_method,
        transactionDetails.phone_number,
        transactionDetails.transaction_type,
        transactionDetails.nominal,
        status,
      ];
      
      const transactionResult = await client.query(insertQuery, transactionValues);

      // 5. Commit transaksi database
      await client.query('COMMIT');
      
      // 6. Kirim kembali data transaksi yang baru dibuat
      return NextResponse.json(transactionResult.rows[0], { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction processing error:', error);
      if (error instanceof Error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
      }
      return NextResponse.json({ message: 'Terjadi kesalahan pada server saat memproses transaksi.' }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('API endpoint error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
