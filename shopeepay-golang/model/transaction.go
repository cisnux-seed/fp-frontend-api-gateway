package model

import "time"

type Status string
type Method string

const (
	StatusSuccess Status = "SUCCESS"
	StatusFailed  Status = "FAILED"
	StatusPending Status = "PENDING"
)

const (
	MethodShopeePay Method = "SHOPEEPAY"
)

type Transaction struct {
	ID            string    `json:"id"`
	UserID        int64     `json:"user_id"`
	AccountID     string    `json:"account_id"`
	Type          string    `json:"type"` // e.g., PAYMENT, TOPUP
	Amount        float64   `json:"amount"`
	BalanceBefore float64   `json:"balance_before"`
	BalanceAfter  float64   `json:"balance_after"`
	Status        Status    `json:"status"`
	Method        Method    `json:"method"`
	Description   string    `json:"description"`
	CreatedAt     time.Time `json:"created_at"`
	Message       string    `json:"message,omitempty"`
}
