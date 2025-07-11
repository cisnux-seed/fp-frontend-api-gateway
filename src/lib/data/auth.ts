
'use server';

import type { User } from './types';
import { getSupabaseClient } from '../supabaseClient';

const DEFAULT_BALANCE = 5000000;

/**
 * Memverifikasi kredensial pengguna (email dan password).
 * - Jika pengguna tidak ada, buat pengguna baru dengan password, saldo awal, dan nomor telepon unik.
 * - Jika pengguna ada, periksa apakah passwordnya cocok.
 * @param email - Email pengguna.
 * @param pass - Password pengguna.
 * @returns User object jika berhasil, null jika gagal.
 */
export async function verifyUserCredentials(email: string, pass: string): Promise<User | null> {
  const supabase = getSupabaseClient();
  
  let { data: user, error: fetchError } = await supabase
    .from('users')
    .select('email, username, password, phone_number')
    .eq('email', email)
    .single();

  if (fetchError && fetchError.code === 'PGRST116') { // PGRST116: no rows returned
    console.log('User tidak ditemukan, membuat user baru...');
    const username = email.split('@')[0];
    const uniquePhoneNumber = `08${Date.now().toString().slice(-10)}`;

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ 
        email, 
        username, 
        password: pass, 
        balance: DEFAULT_BALANCE, 
        phone_number: uniquePhoneNumber
      }])
      .select('email, username, phone_number')
      .single();

    if (insertError) {
      console.error('Gagal membuat user baru di Supabase:', insertError);
      return null;
    }
    
    return { email: newUser.email, username: newUser.username, phone_number: newUser.phone_number };
  }

  if (fetchError) {
    console.error('Gagal mengambil data user dari Supabase:', fetchError);
    return null;
  }

  if (user && user.password === pass) {
    return { email: user.email, username: user.username, phone_number: user.phone_number };
  } else {
    console.log('Password salah untuk user:', email);
    return null;
  }
}

/**
 * Mengambil data sesi dari localStorage.
 */
export async function checkAuthSession(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  try {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      return JSON.parse(storedUser);
    }
    return null;
  } catch (error) {
    console.error("Tidak bisa mengakses localStorage untuk sesi", error);
    return null;
  }
}

/**
 * Menyimpan sesi ke localStorage.
 */
export async function saveAuthSession(user: User): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const userToStore = { 
      email: user.email, 
      username: user.username, 
      phone_number: user.phone_number 
    };
    localStorage.setItem('user', JSON.stringify(userToStore));
  } catch (error)
 {
    console.error("Tidak bisa mengakses localStorage untuk menyimpan sesi", error);
  }
}

/**
 * Menghapus sesi dari localStorage.
 */
export async function clearAuthSession(): Promise<void> {
    if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem('user');
  } catch (error) {
     console.error("Tidak bisa mengakses localStorage untuk menghapus sesi", error);
  }
}
