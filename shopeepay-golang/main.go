package main

import (
	"fmt"
	"log"
	"net/http"
	"shopee-service/router" // Menggunakan router baru
	"shopee-service/storage"
)

// seed menginisialisasi data awal untuk simulasi
func seed() {
	storage.SeedData()
}

func main() {
	// Memasukkan data awal saat aplikasi dimulai
	seed()

	// Menginisialisasi router baru
	r := router.NewRouter()

	// Menjalankan server HTTP
	port := "8080"
	fmt.Printf("ShopeePay Service (GoLang) running at http://localhost:%s\n", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
