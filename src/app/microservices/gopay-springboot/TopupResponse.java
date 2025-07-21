// CATATAN: File ini harus ditempatkan di dalam struktur proyek Spring Boot Anda,
// misalnya di: src/main/java/com/example/gopayservice/dto/TopupResponse.java

// package com.example.gopayservice.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

// Menggunakan record untuk DTO yang immutable dan ringkas (memerlukan Java 14+)
@JsonInclude(JsonInclude.Include.NON_NULL) // Agar field null tidak dimasukkan ke JSON
public class TopupResponse {
    private String status;
    private String gopayRefId;
    private String bniTransactionId;
    private String message;

    // Constructor, Getters, and Setters
    // Dibutuhkan oleh Jackson (library JSON di Spring) jika tidak menggunakan record

    public TopupResponse() {
    }

    public TopupResponse(String status, String gopayRefId, String bniTransactionId, String message) {
        this.status = status;
        this.gopayRefId = gopayRefId;
        this.bniTransactionId = bniTransactionId;
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getGopayRefId() {
        return gopayRefId;
    }

    public void setGopayRefId(String gopayRefId) {
        this.gopayRefId = gopayRefId;
    }

    public String getBniTransactionId() {
        return bniTransactionId;
    }

    public void setBniTransactionId(String bniTransactionId) {
        this.bniTransactionId = bniTransactionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
