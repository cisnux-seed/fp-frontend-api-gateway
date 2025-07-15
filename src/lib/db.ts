
import { Pool } from 'pg';

// Konfigurasi koneksi akan diambil dari variabel lingkungan
// Pastikan Anda membuat file .env.local di root proyek Anda
// dengan isi sebagai berikut:
//
// POSTGRES_URL="postgres://user:password@host:port/database"
//
// Contoh:
// POSTGRES_URL="postgres://postgres:mysecretpassword@localhost:5432/bni_prototype"

if (!process.env.POSTGRES_URL) {
  throw new Error('Variabel lingkungan POSTGRES_URL tidak ditemukan.');
}

export const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});
