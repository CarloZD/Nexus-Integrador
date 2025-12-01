package com.nexus.marketplace.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDTO {
    private Long id;
    private Long orderId;
    private String orderNumber;
    private String paymentCode;
    private String paymentMethod;
    private String status;
    private BigDecimal amount;
    
    // Para tarjeta
    private String cardLastFour;
    private String cardBrand;
    
    // Para Yape
    private String yapePhone;
    private String qrCodeData;      // Base64 del QR o datos para generarlo
    private String qrCodeUrl;       // URL para mostrar QR
    
    private LocalDateTime expiresAt;
    private LocalDateTime paidAt;
    private LocalDateTime createdAt;
    
    private String message;         // Mensaje informativo
}

