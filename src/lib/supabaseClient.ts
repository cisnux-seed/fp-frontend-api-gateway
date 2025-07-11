
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Variabel untuk menyimpan instance klien Supabase agar tidak dibuat berulang kali.
let supabaseClient: SupabaseClient | null = null;

/**
 * Fungsi untuk mendapatkan instance klien Supabase.
 * Ini memastikan klien hanya dibuat satu kali dan hanya saat dibutuhkan.
 * @returns SupabaseClient instance
 * @throws {Error} Jika URL atau kunci anon Supabase tidak ditemukan di variabel lingkungan.
 */
export function getSupabaseClient(): SupabaseClient {
  // Jika klien sudah ada, langsung kembalikan.
  if (supabaseClient) {
    return supabaseClient;
  }

  // Ambil variabel lingkungan.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Cek apakah variabel sudah ada. Jika tidak, lempar error yang jelas.
  // Ini akan menghentikan eksekusi hanya saat fungsi ini dipanggil.
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and/or Anon Key are missing in .env.local file.');
  }

  // Buat instance klien baru dan simpan di variabel.
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  
  return supabaseClient;
}
