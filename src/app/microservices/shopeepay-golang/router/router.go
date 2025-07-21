package router

import (
	"net/http"
	"shopee-service/handler"
	"shopee-service/middleware"
)

func NewRouter() *http.ServeMux {
	mux := http.NewServeMux()

	// Endpoint pembayaran yang dilindungi oleh middleware otentikasi JWT
	paymentHandler := http.HandlerFunc(handler.ShopeePayHandler)
	mux.Handle("/shopeepay/pay", middleware.JWTMiddleware(paymentHandler))

	// Endpoint health check untuk root path
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Pastikan hanya root path ("/") yang ditangani di sini, bukan path lain.
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		// Pastikan hanya metode GET yang diizinkan untuk health check
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ShopeePay GoLang Service is running! You can now make transactions from the BNI app."))
	})

	return mux
}
