package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

// Definisikan struktur request body yang diharapkan dari BNI
type TopupRequest struct {
	UserID      int    `json:"user_id"`
	Amount      int    `json:"amount"`
	Description string `json:"description"`
	PhoneNumber string `json:"phone_number"`
}

// Definisikan struktur response body yang umum
type GenericResponse struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

// Helper untuk mengirim respons JSON
func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	response, _ := json.Marshal(payload)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write(response)
}

// ShopeePayHandler menangani logika bisnis untuk top-up
// Middleware JWT sudah menangani otentikasi sebelumnya.
func ShopeePayHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		respondWithJSON(w, http.StatusMethodNotAllowed, GenericResponse{Status: "FAILED", Message: "Method not allowed"})
		return
	}

	var req TopupRequest
	err := json.NewDecoder(r.Body).Decode(&req)
	if err != nil {
		respondWithJSON(w, http.StatusBadRequest, GenericResponse{Status: "FAILED", Message: "Could not decode request body."})
		return
	}

	// Logika validasi simulasi ShopeePay
	// Transaksi dianggap valid HANYA jika nomor telepon diawali dengan "89708"
	isValidShopeeNumber := strings.HasPrefix(req.PhoneNumber, "89708")

	fmt.Printf("[ShopeePay-Go] Received payment for %s. Is valid number? %v\n", req.PhoneNumber, isValidShopeeNumber)

	if isValidShopeeNumber {
		respondWithJSON(w, http.StatusOK, GenericResponse{Status: "SUCCESS"})
	} else {
		respondWithJSON(w, http.StatusBadRequest, GenericResponse{Status: "FAILED", Message: "The provided phone number is not a valid ShopeePay number."})
	}
}
