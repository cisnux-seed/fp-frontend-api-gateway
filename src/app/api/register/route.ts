
import { NextResponse, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

const DEFAULT_BALANCE = 5000000;

export async function POST(req: NextRequest) {
  try {
    const { email, username, phone_number, password } = await req.json();

    if (!email || !username || !phone_number || !password) {
      return NextResponse.json({ message: 'Semua kolom harus diisi.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Cek apakah email, username, atau nomor telepon sudah ada
      const checkQuery = `
        SELECT 
          (SELECT 1 FROM users WHERE email = $1) as email_exists,
          (SELECT 1 FROM users WHERE username = $2) as username_exists,
          (SELECT 1 FROM users WHERE phone_number = $3) as phone_exists;
      `;
      const checkResult = await client.query(checkQuery, [email, username, phone_number]);
      const { email_exists, username_exists, phone_exists } = checkResult.rows[0];

      if (email_exists) {
        return NextResponse.json({ message: 'Email sudah terdaftar.' }, { status: 409 });
      }
      if (username_exists) {
        return NextResponse.json({ message: 'Username sudah terdaftar.' }, { status: 409 });
      }
      if (phone_exists) {
        return NextResponse.json({ message: 'Nomor telepon sudah terdaftar.' }, { status: 409 });
      }

      // Hash password
      const password_hash = await bcrypt.hash(password, 10);
      
      // Simpan pengguna baru dan kembalikan hanya data yang aman
      const insertQuery = `
        INSERT INTO users (email, username, phone_number, password_hash, balance)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, email, username, phone_number, balance;
      `;
      const insertResult = await client.query(insertQuery, [email, username, phone_number, password_hash, DEFAULT_BALANCE]);
      const newUser = insertResult.rows[0];

      return NextResponse.json(newUser, { status: 201 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
