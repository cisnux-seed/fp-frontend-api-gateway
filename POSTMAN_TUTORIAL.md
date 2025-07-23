# Tutorial Lengkap Pengujian API dengan Postman

Dokumen ini akan memandu Anda cara menguji **seluruh alur kerja** aplikasi BNI-Simulasi menggunakan Postman, mulai dari membuat akun hingga melakukan transaksi yang melibatkan microservice.

## Prasyarat

1.  Aplikasi [Postman](https://www.postman.com/downloads/) sudah terinstal.
2.  Semua 3 server (Next.js, GoLang, Spring Boot) sedang berjalan sesuai panduan di `README.md`.

---

## Memahami Alur Token JWT

Sebelum menguji, penting untuk memahami ada **dua jenis token** dalam simulasi ini:

1.  **Token Pengguna (User Token):**
    *   **Siapa yang membuat?** Dibuat oleh **BNI App** saat pengguna berhasil login.
    *   **Untuk apa?** Untuk mengotentikasi **pengguna** saat mereka ingin melakukan aksi di BNI App (misalnya, membuat transaksi).
    *   **Digunakan dimana?** Dikirim dari Postman (atau frontend) ke BNI App di header `Authorization`.

2.  **Token Mitra (Partner Token):**
    *   **Siapa yang membuat?** Dibuat oleh **BNI App** saat akan meneruskan permintaan ke GoPay atau ShopeePay.
    *   **Untuk apa?** Untuk mengotentikasi **BNI App itu sendiri** sebagai mitra terpercaya di mata layanan GoPay dan ShopeePay.
    *   **Digunakan dimana?** Dikirim dari BNI App ke layanan GoPay/ShopeePay. **Ini terjadi di belakang layar.**

Jadi, **layanan GoPay dan ShopeePay tidak pernah membuat token**, mereka hanya **memvalidasi** "Partner Token" yang mereka terima.

---

## Bagian 1: Alur Pengguna (Registrasi & Login di Aplikasi BNI)

### Langkah 1: Registrasi Pengguna Baru

1.  Buka Postman dan buat permintaan **POST** ke `http://localhost:9002/api/register`.
2.  Di tab **Body**, pilih **raw** dan **JSON**.
3.  Masukkan data pengguna baru. Contoh:
    ```json
    {
        "email": "kautsar@example.com",
        "username": "kautsar",
        "password": "password123"
    }
    ```
4.  Klik **Send**. Anda akan menerima respons `201 Created`.

### Langkah 2: Login dan Dapatkan Token JWT

1.  Buat permintaan **POST** ke `http://localhost:9002/api/login`.
2.  Di tab **Body**, pilih **raw** dan **JSON**.
3.  Masukkan kredensial (bisa pakai `username` atau `email`):
    ```json
    {
        "identifier": "kautsar",
        "password": "password123"
    }
    ```
4.  Klik **Send**. Anda akan menerima respons `200 OK`. Di dalam body respons, **salin nilai `token`**. Ini adalah **User Token**.

---

## Bagian 2: Alur Transaksi via Aplikasi BNI (Endpoint Aman)

### Langkah 3: Membuat Transaksi Baru

1.  Buat permintaan baru dengan metode **POST**.
2.  Masukkan URL: `http://localhost:9002/api/transactions`
3.  Pilih tab **Authorization** -> **Bearer Token** dan **tempelkan User Token** yang Anda salin dari langkah 2.

#### Contoh A: Transaksi GoPay (Sukses)
-   Pilih tab **Body** -> **raw** -> **JSON**.
-   Nomor telepon ini (`898081234567`) akan diterima oleh microservice GoPay.
    ```json
    {
        "payment_method": "Gojek",
        "phone_number": "898081234567",
        "transaction_type": "Top-up",
        "nominal": 50000
    }
    ```
-   Klik **Send**. Anda akan mendapat respons `201 Created`. Di belakang layar, BNI App membuat **Partner Token** dan mengirimkannya ke GoPay Service, yang kemudian memvalidasinya.

#### Contoh B: Transaksi GoPay (Gagal karena Nomor Salah)
-   Ubah `phone_number` di body menjadi nomor yang **tidak terdaftar** di microservice GoPay (misal: `12345`).
-   Klik **Send**. Anda akan mendapat respons `400 Bad Request` dengan pesan dari GoPay, menunjukkan otentikasi berhasil tetapi validasi bisnis gagal.

#### Contoh C: Transaksi ShopeePay (Sukses)
-   Ubah `payment_method` dan `phone_number` (`8970812345`).
    ```json
    {
        "payment_method": "ShopeePay",
        "phone_number": "8970812345",
        "transaction_type": "Top-up",
        "nominal": 100000
    }
    ```
-   Klik **Send**. Anda akan mendapat respons `201 Created`.

---

## Bagian 3: Pengujian Langsung ke Microservice (Simulasi menjadi BNI App)

Bagian ini menunjukkan cara menguji layanan GoPay dan ShopeePay secara langsung, seolah-olah Anda adalah aplikasi BNI. Anda perlu membuat **Partner Token** secara manual.

### Tes Langsung Microservice GoPay (Dengan Otentikasi)
-   **URL**: `POST http://localhost:8081/gopay/pay`
-   **Authorization**: Pilih `Bearer Token`.
    -   **Cara Membuat Token**: Buka situs [jwt.io](https://jwt.io/).
        1.  Ubah algoritma menjadi **HS256**.
        2.  Di **PAYLOAD**, masukkan: `{ "partner": "BNI_MOBILE" }`
        3.  Di **VERIFY SIGNATURE**, masukkan secret key GoPay: `ini-adalah-kunci-rahasia-gopay-yang-sangat-aman-dan-panjang`
        4.  Salin token yang dihasilkan di sebelah kiri.
-   **Body (JSON)**:
    ```json
    {
        "user_id": 1,
        "amount": 10000,
        "description": "Test from Postman",
        "phone_number": "898081234567"
    }
    ```

### Tes Langsung Microservice ShopeePay (Dengan Otentikasi)
-   **URL**: `POST http://localhost:8080/shopeepay/pay`
-   **Authorization**: Pilih `Bearer Token`.
    -   **Cara Membuat Token**: Sama seperti di atas, tetapi gunakan secret key ShopeePay: `shopeepay-secret-key`.
-   **Body (JSON)**:
    
    **Contoh Sukses:**
    ```json
    {
        "user_id": 1,
        "amount": 50000,
        "description": "Test from Postman",
        "phone_number": "8970812345"
    }
    ```

Selamat! Anda telah berhasil menguji seluruh alur kerja API dari awal hingga akhir.
