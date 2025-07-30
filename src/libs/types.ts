export type User = {
    username: string;
    email?: string;
};

export type PaymentMethod = 'GOPAY' | 'SHOPEE_PAY';

export type AccountInfo = {
    id: string;
    userId: number;
    balance: number;
    currency: string;
    accountStatus: string;
    createdAt: string;
    updatedAt: string;
};

export type Balance = {
    balance: number;
    currency: string;
};

export type EWalletBalance = {
    provider: string;
    balance: number;
    currency: string;
    accountNumber: string;
    lastUpdated: string;
};

export type TransactionStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type TransactionType = 'TOPUP' | 'PAYMENT' | 'REFUND' | 'TRANSFER';

export type Transaction = {
    id: string;
    transactionId: string;
    transactionType: TransactionType;
    transactionStatus: TransactionStatus;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    currency: string;
    paymentMethod?: PaymentMethod;
    description?: string;
    createdAt: string;
};

export type TopUpRequest = {
    amount: number;
    paymentMethod: PaymentMethod;
    phoneNumber: string;
    description?: string;
};

export type ApiResponse<T> = {
    meta: {
        code: string;
        message?: string;
    };
    data?: T;
};