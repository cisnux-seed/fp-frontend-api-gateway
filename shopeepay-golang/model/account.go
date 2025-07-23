package model

// Account merepresentasikan akun dompet digital ShopeePay untuk seorang pengguna.
type Account struct {
	ID      string  `json:"id"`
	UserID  int64   `json:"user_id"` // Kunci asing ke sistem user BNI
	Balance float64 `json:"balance"`
}
