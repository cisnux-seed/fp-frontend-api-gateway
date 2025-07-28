
// ====================================================================
// KERANGKA DATABASE - TIPE DATA
// ====================================================================

export type User = {
  id: number;
  email: string;
  username: string;
  balance: number;
  // Properti password dan nomor telepon tidak pernah dikirim ke client
};

// Tipe untuk input registrasi pengguna baru dari form
export type RegisterUserInput = Omit<User, 'id' | 'balance'> & { password: string };


export type PaymentMethod = 'Gojek' | 'ShopeePay';
export type TransactionType = 'Top-up'; // Hanya Top-up yang didukung
export type TransactionStatus = 'Success' | 'Failed';

// Tipe ini merepresentasikan satu entri transaksi di database
export type Transaction = {
  id: number;
  user_id: number;
  date: string; // ISO string date
  payment_method: PaymentMethod;
  phone_number: string;
  transaction_type: TransactionType;
  nominal: number;
  status: TransactionStatus;
  message?: string | null; // Pesan dari mitra (opsional)
};

// Tipe untuk input transaksi baru yang dikirim ke API
export type TransactionInput = Omit<Transaction, 'id' | 'date' | 'user_id'>;
