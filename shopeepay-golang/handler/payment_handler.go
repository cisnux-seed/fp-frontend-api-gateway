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
	"897081234567": true, "897080987654": true, "897082345678": true, "897089876543": true,
	"897081112223": true, "897082223334": true, "897083334445": true, "897084445556": true,
	"897085556667": true, "897086667778": true,
}

func ShopeePayPaymentHandler(w http.ResponseWriter, r *http.Request) {
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
