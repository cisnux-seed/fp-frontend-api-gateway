// ====================================================================
// TIPE DATA BERDASARKAN OPENAPI SPEC
// ====================================================================

// --- WRAPPER & META ---
export interface MetaResponse {
  code: string;
  message: string;
}

export interface WebResponse<T> {
  meta: MetaResponse;
  data: T;
}

export interface PaginationResponse {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface PageableResponse<T> {
    content: T[];
    pagination: PaginationResponse;
}

// --- AUTHENTICATION ---
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserAuth {
  username: string; // Bisa username atau email
  password: string;
}


// --- PAYMENT & ACCOUNT ---
export type AccountStatus = "ACTIVE" | "SUSPENDED" | "CLOSED";

export interface AccountResponse {
  id: number;
  userId: number;
  balance: number;
  currency: "IDR" | "USD" | "EUR";
  accountStatus: AccountStatus;
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

export type PaymentMethodApi = "GOPAY" | "SHOPEE_PAY" | "BANK_TRANSFER";
export type PaymentMethodUI = 'Gojek' | 'ShopeePay';

export interface TopupRequest {
  amount: number;
  paymentMethod: PaymentMethodApi;
  description: string;
  phone_number: string; // Ditambahkan untuk kompatibilitas simulasi
}


// --- TRANSACTIONS ---
export type TransactionTypeApi = "TOPUP" | "PAYMENT" | "REFUND" | "TRANSFER";
export type TransactionStatusApi = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

export interface TransactionResponse {
  id: number;
  transactionId: string;
  transactionType: TransactionTypeApi;
  transactionStatus: TransactionStatusApi;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: "IDR";
  paymentMethod: PaymentMethodApi;
  description: string;
  createdAt: string; // ISO Date String
  updatedAt?: string; // ISO Date String, optional
  phone_number?: string; // Ditambahkan untuk UI, karena tidak ada di response asli
}
