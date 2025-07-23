package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Definisikan struktur response body yang umum untuk error
type ErrorResponse struct {
	Status  string `json:"status"`
	Message string `json:"message,omitempty"`
}

var jwtKey = []byte("shopeepay-secret-key")

// Claims struct untuk JWT
type Claims struct {
	Partner string `json:"partner"`
	jwt.RegisteredClaims
}

// Helper untuk mengirim respons JSON saat terjadi error
func respondWithError(w http.ResponseWriter, code int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(ErrorResponse{Status: "FAILED", Message: message})
}

// JWTMiddleware memvalidasi token JWT sebelum melanjutkan ke handler berikutnya
func JWTMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			respondWithError(w, http.StatusUnauthorized, "Authorization header is required")
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			respondWithError(w, http.StatusUnauthorized, "Invalid authorization header format")
			return
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			return jwtKey, nil
		})

		if err != nil || !token.Valid || claims.Partner != "BNI_MOBILE" {
			fmt.Println("[ShopeePay-Go] JWT validation failed:", err)
			respondWithError(w, http.StatusUnauthorized, "Invalid or unauthorized token")
			return
		}

		fmt.Println("[ShopeePay-Go] JWT validation successful for partner:", claims.Partner)
		next.ServeHTTP(w, r)
	})
}
