
import type { TransactionStatus, TransactionInput } from './types';

/**
 * Mensimulasikan panggilan API ke sistem pihak ketiga (misalnya, Midtrans, Xendit).
 * Fungsi ini menentukan apakah sebuah transaksi berhasil atau gagal.
 * @param details - Detail input transaksi dari form.
 * @returns Status transaksi ('Success' atau 'Failed').
 */
export const simulatePartnerApiCall = (details: Omit<TransactionInput, 'status'>): Promise<TransactionStatus> => {
  return new Promise((resolve) => {
    console.log('Memulai simulasi transaksi ke mitra:', details.payment_method);
    
    // Simulasi delay jaringan ke API mitra
    setTimeout(() => {
      console.log('Mitra merespon...');
      
      // Logika bisnis: Transaksi gagal jika nomor telepon berakhiran '0'
      const isSuccess = !details.phone_number.endsWith('0');
      
      if (isSuccess) {
        console.log('Simulasi API Mitra: Sukses');
        resolve('Success');
      } else {
        console.log('Simulasi API Mitra: Gagal');
        resolve('Failed');
      }
    }, 1500); // Simulasi delay API Mitra
  });
};
  