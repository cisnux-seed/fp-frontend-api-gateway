// CATATAN: File ini harus ditempatkan di dalam struktur proyek Spring Boot Anda,
// misalnya di: src/main/java/com/example/gopayservice/dto/TopupRequest.java

package com.example.gopayservice.dto;

// Menggunakan record untuk DTO yang immutable dan ringkas (memerlukan Java 14+)
public class TopupRequest {
    private String partnerId;
    private String phoneNumber;
    private int amount;
    private String bniTransactionId; // Diperbarui dari transactionId

    // Constructor, Getters, and Setters
    // Dibutuhkan oleh Jackson (library JSON di Spring) jika tidak menggunakan record

    public TopupRequest() {
    }

    public TopupRequest(String partnerId, String phoneNumber, int amount, String bniTransactionId) {
        this.partnerId = partnerId;
        this.phoneNumber = phoneNumber;
        this.amount = amount;
        this.bniTransactionId = bniTransactionId;
    }

    public String getPartnerId() {
        return partnerId;
    }

    public void setPartnerId(String partnerId) {
        this.partnerId = partnerId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public int getAmount() {
        return amount;
    }

    public void setAmount(int amount) {
        this.amount = amount;
    }

    public String getBniTransactionId() {
        return bniTransactionId;
    }

    public void setBniTransactionId(String bniTransactionId) {
        this.bniTransactionId = bniTransactionId;
    }
}
