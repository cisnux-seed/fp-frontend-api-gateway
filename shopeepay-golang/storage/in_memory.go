package storage

import (
	"shopee-service/model"
	"sync"

	"github.com/google/uuid"
)

// Penyimpanan data di memori untuk simulasi.
// Di aplikasi nyata, ini akan diganti dengan koneksi ke database.
var (
	Accounts     = make(map[int64]*model.Account) // user_id -> Account
	Transactions = make(map[string]model.Transaction)
	Mutex        = &sync.Mutex{}
)

// SeedData menginisialisasi beberapa data dummy untuk pengujian.
func SeedData() {
	Mutex.Lock()
	defer Mutex.Unlock()
	// Kunci dari map ini adalah user_id dari database BNI.
	// Ini mensimulasikan bahwa user-user ini telah menautkan akun ShopeePay mereka.
	Accounts[1] = &model.Account{ID: uuid.New().String(), UserID: 1, Balance: 1500000}
	Accounts[2] = &model.Account{ID: uuid.New().String(), UserID: 2, Balance: 75000}
	Accounts[3] = &model.Account{ID: uuid.New().String(), UserID: 3, Balance: 5000} // Saldo kecil untuk tes gagal
}
