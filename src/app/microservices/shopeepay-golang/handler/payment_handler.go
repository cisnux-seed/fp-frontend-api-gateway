package handler

import (
	"encoding/json"
	"net/http"
	"shopee-service/model"
	"shopee-service/storage"
	"time"

	"github.com/google/uuid"
)

var allowedPhoneNumbers = map[string]bool{
	"081293846571": true, "085773092184": true, "087812349091": true, "082229901765": true,
	"081317758842": true, "085266104738": true, "085978452203": true, "081996731156": true,
	"087754209934": true, "083159914870": true,
}

func ShopeePayHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var req struct {
		UserID      int64   `json:"user_id"`
		Amount      float64 `json:"amount"`
		Description string  `json:"description"`
		PhoneNumber string  `json:"phone_number"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "FAILED",
			"message": "Invalid request body",
		})
		return
	}

	storage.Mutex.Lock()
	defer storage.Mutex.Unlock()

	if _, ok := allowedPhoneNumbers[req.PhoneNumber]; !ok {
		w.WriteHeader(http.StatusOK) // Tetap 200 OK, tapi status FAILED di body
		json.NewEncoder(w).Encode(map[string]interface{}{
			"status":  "FAILED",
			"message": "Nomor Telepon tidak terdaftar di ShopeePay.",
			"id":      uuid.New().String(),
			"amount":  req.Amount,
		})
		return
	}

	account, ok := storage.Accounts[req.UserID]
	if !ok {
		account = &model.Account{ID: uuid.New().String(), UserID: req.UserID, Balance: 1000000}
		storage.Accounts[req.UserID] = account
	}

	trx := model.Transaction{
		ID:            uuid.New().String(),
		UserID:        req.UserID,
		AccountID:     account.ID,
		Type:          "PAYMENT",
		Amount:        req.Amount,
		BalanceBefore: account.Balance,
		BalanceAfter:  account.Balance,
		Status:        model.StatusSuccess,
		Method:        model.MethodShopeePay,
		Description:   req.Description,
		CreatedAt:     time.Now(),
		Message:       "Transaksi Berhasil", // Tambahkan pesan sukses
	}

	storage.Transactions[trx.ID] = trx

	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(trx)
}
