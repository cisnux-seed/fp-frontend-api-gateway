
'use server';

import type { Transaction, TransactionInput } from './types';
import { getSupabaseClient } from '../supabaseClient';


/**
 * Mengambil saldo pengguna saat ini dari database.
 * @param email - Email pengguna.
 * @returns Saldo pengguna sebagai number.
 */
export async function getBalance(email: string): Promise<number> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('users')
        .select('balance')
        .eq('email', email)
        .single();

    if (error || !data) {
        console.error('Gagal mengambil saldo:', error);
        return 0; // Kembalikan 0 jika user tidak ditemukan atau ada error
    }
    return data.balance;
}


/**
 * Mengambil riwayat transaksi pengguna dari database.
 * @param email - Email pengguna.
 * @returns Array riwayat transaksi, diurutkan dari yang terbaru.
 */
export async function getHistory(email: string): Promise<Transaction[]> {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_email', email)
        .order('date', { ascending: false });

    if (error) {
        console.error('Gagal mengambil riwayat:', error);
        return [];
    }
    return data as Transaction[];
}


/**
 * Menyimpan transaksi baru ke Supabase.
 * - Untuk 'Transfer', memanggil fungsi RPC perform_transfer untuk penanganan atomik.
 * - Untuk lainnya, menangani logika pengurangan saldo dan pencatatan secara langsung.
 * @param email - Email pengguna.
 * @param transaction - Objek transaksi yang akan disimpan.
 * @returns Objek yang berisi saldo baru, riwayat baru, dan transaksi yang baru dibuat.
 */
export async function saveTransaction(email: string, transaction: TransactionInput): Promise<{ newBalance: number; newHistory: Transaction[]; createdTransaction: Transaction; }> {
    const supabase = getSupabaseClient();
    
    // Logika untuk TRANSFER menggunakan RPC
    if (transaction.transaction_type === 'Transfer') {
        const { error: rpcError } = await supabase.rpc('perform_transfer', {
            p_sender_email: email,
            p_receiver_phonenumber: transaction.phone_number,
            p_nominal: transaction.nominal,
            p_payment_method: transaction.payment_method,
            p_transaction_type: transaction.transaction_type,
            p_status: transaction.status,
        });

        if (rpcError) {
            console.error('Transfer gagal:', rpcError);
            throw new Error(`Transfer gagal: ${rpcError.message}`);
        }
    } else { // Logika untuk Top-up dan Beli Paket (Non-Transfer)
        if (transaction.status === 'Success') {
             const { data: user, error: userError } = await supabase
                .from('users')
                .select('balance')
                .eq('email', email)
                .single();

            if (userError || !user) throw new Error('Pengguna tidak ditemukan.');
            if (user.balance < transaction.nominal) throw new Error('Saldo tidak mencukupi.');

            const newBalance = user.balance - transaction.nominal;
            const { error: updateError } = await supabase.from('users').update({ balance: newBalance }).eq('email', email);
            if (updateError) {
                throw new Error('Gagal memperbarui saldo.');
            }
        }
        
        // Catat transaksi
        const { error: insertError } = await supabase.from('transactions').insert({
            user_email: email,
            payment_method: transaction.payment_method,
            phone_number: transaction.phone_number,
            transaction_type: transaction.transaction_type,
            nominal: transaction.nominal,
            status: transaction.status,
        });

        if (insertError) {
            console.error("Gagal menyimpan transaksi non-transfer:", insertError);
            throw new Error("Gagal mencatat riwayat transaksi.");
        }
    }
    
    // Ambil data terbaru setelah transaksi berhasil
    const finalBalance = await getBalance(email);
    const finalHistory = await getHistory(email);

    if (finalHistory.length === 0) {
        throw new Error("Gagal mengambil transaksi terakhir setelah penyimpanan.");
    }
    const createdTransaction = finalHistory[0];

    return { newBalance: finalBalance, newHistory: finalHistory, createdTransaction };
}
