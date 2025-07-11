-- =================================================================
-- FUNGSI DATABASE: perform_transfer
-- =================================================================
-- Fungsi ini menangani logika transfer antar pengguna secara aman
-- di dalam database. Ini memastikan semua operasi (pengurangan,
-- penambahan, pencatatan) berhasil atau gagal sebagai satu kesatuan.

-- Hapus fungsi lama jika ada untuk pembaruan yang bersih.
-- Cara ini lebih sederhana dan tidak akan menyebabkan error palsu di editor.
-- Hapus fungsi lama jika ada untuk pembaruan yang bersih.
DROP PROCEDURE perform_transfer;

-- Buat prosedur baru yang aman.
CREATE OR REPLACE PROCEDURE perform_transfer(
    p_sender_email IN VARCHAR2,
    p_receiver_phone IN VARCHAR2,
    p_amount IN NUMBER,
    p_payment_method IN VARCHAR2,
    p_transaction_type IN VARCHAR2
)
AS
    sender_id VARCHAR2(100);
    receiver_id VARCHAR2(100);
    sender_balance NUMBER;
BEGIN
    -- 1. Dapatkan ID dan saldo pengirim
    SELECT id, balance INTO sender_id, sender_balance
    FROM users WHERE email = p_sender_email;

    -- 2. Dapatkan ID penerima
    SELECT id INTO receiver_id
    FROM users WHERE phoneNumber = p_receiver_phone;

    -- 3. Validasi: Pastikan pengirim dan penerima ada
    IF sender_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20001, 'Pengirim dengan email ' || p_sender_email || ' tidak ditemukan');
    END IF;
    IF receiver_id IS NULL THEN
        RAISE_APPLICATION_ERROR(-20002, 'Penerima dengan nomor telepon ' || p_receiver_phone || ' tidak ditemukan');
    END IF;

    -- 4. Validasi: Pastikan saldo pengirim mencukupi
    IF sender_balance < p_amount THEN
        RAISE_APPLICATION_ERROR(-20003, 'Saldo pengirim tidak mencukupi');
    END IF;

    -- 5. Lakukan operasi transfer
    UPDATE users SET balance = balance - p_amount WHERE id = sender_id;
    UPDATE users SET balance = balance + p_amount WHERE id = receiver_id;

    -- 6. Catat transaksi di riwayat
    INSERT INTO transactions (user_email, payment_method, phoneNumber, transaction_type, nominal, status)
    VALUES (p_sender_email, p_payment_method, p_receiver_phone, p_transaction_type, p_amount, 'Success');
END;
/
