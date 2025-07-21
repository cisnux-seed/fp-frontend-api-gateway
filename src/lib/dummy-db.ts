// In-memory store for our dummy database
import type { AccountResponse, TransactionResponse } from './types';

interface DummyDatabase {
  account: AccountResponse;
  transactions: TransactionResponse[];
}

// Initialize our dummy "database" with some default values.
// This object will persist in memory across API requests during the server's runtime.
export const db: DummyDatabase = {
  account: {
    id: 12345,
    userId: 1, // Corresponds to johndoe
    balance: 5000000,
    currency: "IDR",
    accountStatus: "ACTIVE",
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: new Date().toISOString()
  },
  transactions: [
    {
        id: 98765,
        transactionId: "TXN-20240720-001",
        transactionType: "TOPUP",
        transactionStatus: "SUCCESS",
        amount: 50000.00,
        balanceBefore: 5050000.00,
        balanceAfter: 5000000.00,
        currency: "IDR",
        paymentMethod: "GOPAY",
        description: "Initial top up from system",
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
        updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        phone_number: "+6281200000001"
    },
  ]
};
