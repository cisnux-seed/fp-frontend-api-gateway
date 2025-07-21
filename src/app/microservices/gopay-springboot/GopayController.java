// CATATAN: File ini harus ditempatkan di dalam struktur proyek Spring Boot Anda,
// misalnya di: src/main/java/com/example/gopayservice/controller/GopayController.java

package com.example.gopayservice.controller;

import com.example.gopayservice.dto.TopupRequest;
import com.example.gopayservice.dto.TopupResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;
import java.util.UUID;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/v1/gopay")
public class GopayController {

    private static final Logger LOGGER = Logger.getLogger(GopayController.class.getName());

    // Daftar nomor telepon yang dianggap "terdaftar" di GoPay
    private static final Set<String> allowedPhoneNumbers = Set.of(
            "081293846571", "085773092184", "087812349091", "082229901765",
            "081317758842", "085266104738", "085978452203", "081996731156",
            "087754209934", "083159914870"
    );

    @PostMapping("/topup")
    public ResponseEntity<TopupResponse> processTopup(@RequestBody TopupRequest request) {
        LOGGER.info("Menerima permintaan top-up untuk nomor: " + request.getPhoneNumber() + " sebesar: " + request.getAmount());

        // Validasi dasar
        if (request.getPhoneNumber() == null || request.getPhoneNumber().isEmpty() || request.getAmount() <= 0) {
            TopupResponse response = new TopupResponse(
                "FAILED",
                null,
                request.getBniTransactionId(),
                "Parameter tidak valid."
            );
            return ResponseEntity.ok(response);
        }

        // Simulasi logika bisnis: Cek apakah nomor telepon terdaftar
        boolean isSuccess = allowedPhoneNumbers.contains(request.getPhoneNumber());

        if (isSuccess) {
            LOGGER.info("Transaksi " + request.getBniTransactionId() + " BERHASIL.");
            TopupResponse response = new TopupResponse(
                "SUCCESS",
                "GP-SIM-" + UUID.randomUUID().toString(),
                request.getBniTransactionId(),
                "Top-up berhasil diproses oleh GoPay."
            );
            return ResponseEntity.ok(response);
        } else {
            LOGGER.warning("Transaksi " + request.getBniTransactionId() + " GAGAL karena nomor tidak terdaftar.");
            TopupResponse response = new TopupResponse(
                "FAILED",
                null,
                request.getBniTransactionId(),
                "Nomor telepon tidak terdaftar di GoPay."
            );
            return ResponseEntity.ok(response);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("GoPay Spring Boot Service is running!");
    }
}
