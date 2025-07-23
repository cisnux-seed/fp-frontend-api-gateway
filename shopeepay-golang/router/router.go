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

	// Endpoint health check untuk memastikan service berjalan
	mux.HandleFunc("/shopeepay/health", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ShopeePay Go Service is running!"))
	})

	return mux
}
