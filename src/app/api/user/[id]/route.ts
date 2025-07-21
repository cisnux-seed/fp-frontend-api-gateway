
import { NextResponse, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = parseInt(params.id, 10);

  if (isNaN(userId)) {
    return NextResponse.json({ message: 'ID pengguna tidak valid.' }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    const balanceQuery = 'SELECT balance FROM users WHERE id = $1';
    const balanceResult = await client.query(balanceQuery, [userId]);
    
    if (balanceResult.rows.length === 0) {
        return NextResponse.json({ message: 'Pengguna tidak ditemukan.' }, { status: 404 });
    }
    const balance = parseFloat(balanceResult.rows[0].balance);

    const historyQuery = 'SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC';
    const historyResult = await client.query(historyQuery, [userId]);
    const history = historyResult.rows;

    return NextResponse.json({ balance, history }, { status: 200 });
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  } finally {
    client.release();
  }
}
