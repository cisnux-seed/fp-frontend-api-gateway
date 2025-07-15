
import { NextResponse, type NextRequest } from 'next/server';
import { pool } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'User ID dan password harus diisi.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      // Cek apakah identifier adalah email atau username
      const isEmail = identifier.includes('@');
      
      const query = isEmail
        ? 'SELECT * FROM users WHERE email = $1'
        : 'SELECT * FROM users WHERE username = $1';
      
      const result = await client.query(query, [identifier]);
      const user = result.rows[0];

      if (!user) {
        return NextResponse.json({ message: 'User ID atau password salah.' }, { status: 401 });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return NextResponse.json({ message: 'User ID atau password salah.' }, { status: 401 });
      }

      // Jangan kirim password hash ke client
      const { password_hash, ...userToReturn } = user;

      return NextResponse.json(userToReturn, { status: 200 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
