// ====================================================================
// KERANGKA DATABASE - TIPE DATA
// ====================================================================
// File ini mendefinisikan struktur data agar cocok dengan skema database.
// Menggunakan snake_case untuk properti yang merepresentasikan kolom database.

export type User = {
  email: string;
  username: string;
  phone_number: string; // Sesuai dengan kolom di tabel 'users'
  balance?: number;
  password?: string;
};

export type PaymentMethod = 'Gojek' | 'OVO' | 'ShopeePay';
export type TransactionType = 'Top-up' | 'Beli Paket' | 'Transfer';
export type TransactionStatus = 'Success' | 'Failed';

// Tipe ini harus cocok dengan kolom di tabel 'transactions' Anda
export type Transaction = {
  id: number;
  date: string; // Berasal dari created_at (timestamp with time zone)
  user_email: string;
  payment_method: PaymentMethod;
  phone_number: string; // Sesuai dengan kolom di tabel 'transactions'
  transaction_type: TransactionType;
  nominal: number;
  status: TransactionStatus;
};

// Tipe untuk input transaksi baru yang belum memiliki ID atau tanggal
export type TransactionInput = Omit<Transaction, 'id' | 'date' | 'user_email'>;
