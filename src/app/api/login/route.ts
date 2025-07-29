
import { NextResponse, type NextRequest } from 'next/server';
import { getPool } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('Variabel lingkungan JWT_SECRET harus didefinisikan.');
}
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    const { identifier, password } = await req.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'User ID dan password harus diisi.' }, { status: 400 });
    }

    const pool = getPool();
    const client = await pool.connect();
    try {
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

      // Buat JWT Token
      const token = jwt.sign(
        { 
            id: user.id, 
            username: user.username,
            email: user.email, // Tambahkan email ke token
        },
        JWT_SECRET,
        { expiresIn: '1h' } // Token berlaku selama 1 jam
      );

      // Jangan kirim password hash ke client
      const { password_hash, ...userToReturn } = user;

      // Kirim token dan data user yang aman
      return NextResponse.json({ user: userToReturn, token }, { status: 200 });
      
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
