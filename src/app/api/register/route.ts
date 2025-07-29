
import { NextResponse, type NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';

const DEFAULT_BALANCE = 5000000;

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();

    if (!email || !username || !password) {
      return NextResponse.json({ message: 'Semua kolom harus diisi.' }, { status: 400 });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
      // Cek apakah email atau username sudah ada
      const checkQuery = `
        SELECT 
          (SELECT 1 FROM users WHERE email = $1) as email_exists,
          (SELECT 1 FROM users WHERE username = $2) as username_exists
      `;
      const checkResult = await client.query(checkQuery, [email, username]);
      const { email_exists, username_exists } = checkResult.rows[0];

      if (email_exists) {
        return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 });
      }
      if (username_exists) {
        return NextResponse.json({ message: 'Username sudah terdaftar.' }, { status: 409 });
      }

      // Mulai transaksi
      await client.query('BEGIN');

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);
      
      // Simpan pengguna baru dan dapatkan ID-nya
      const insertUserQuery = `
        INSERT INTO users (email, username, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, email, username, created_at;
      `;
      const userResult = await client.query(insertUserQuery, [email, username, password_hash]);
      const newUser = userResult.rows[0];

      if (!newUser) {
        await client.query('ROLLBACK');
        throw new Error('Gagal membuat pengguna.');
      }

      // Buat akun yang terhubung untuk pengguna baru
      const insertAccountQuery = `
        INSERT INTO accounts (user_id, balance)
        VALUES ($1, $2)
      `;
      await client.query(insertAccountQuery, [newUser.id, DEFAULT_BALANCE]);

      // Commit transaksi
      await client.query('COMMIT');
      
      // Kembalikan hanya data user yang aman (tanpa password)
      return NextResponse.json(newUser, { status: 201 });

    } catch(e) {
      // Jika terjadi error, batalkan semua perubahan
      await client.query('ROLLBACK');
      throw e; // Lemparkan error agar ditangkap oleh blok catch luar
    }
    finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
