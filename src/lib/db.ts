
import { Pool } from 'pg';

let pool: Pool | undefined;

// Fungsi ini menggunakan lazy initialization.
// Koneksi pool hanya akan dibuat saat fungsi ini pertama kali dipanggil,
// bukan saat modul di-load. Ini mencegah error saat 'npm run build'.
export function getPool(): Pool {
  if (!pool) {
    if (!process.env.POSTGRES_URL) {
      throw new Error('Variabel lingkungan POSTGRES_URL tidak ditemukan.');
    }
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
    });
  }
  return pool;
}
