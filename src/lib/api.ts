import type { Transaction } from '@/context/TransactionContext';

type TransactionInput = Omit<Transaction, 'status'>;

export const simulateTransaction = (details: TransactionInput): Promise<Transaction> => {
  return new Promise((resolve, reject) => {
    console.log('Memulai simulasi transaksi ke mitra:', details.paymentMethod);
    
    setTimeout(() => {
      console.log('Mitra merespon, memulai proses konversi ke API BNI...');
      
      setTimeout(() => {
        // Logika baru: Transaksi gagal jika nomor telepon berakhiran '0'
        const isSuccess = !details.phoneNumber.endsWith('0');
        
        if (isSuccess) {
          console.log('Transaksi Sukses');
          resolve({
            ...details,
            status: 'Success',
          });
        } else {
          console.log('Transaksi Gagal');
          resolve({
              ...details,
              status: 'Failed'
          });
        }
      }, 1000); // Simulasi delay API BNI
    }, 1500); // Simulasi delay API Mitra
  });
};
