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
public class YapeQRResponseDTO {
    private String paymentCode;
    private BigDecimal amount;
    private String qrCodeBase64;        // QR en Base64 para mostrar directamente
    private String qrCodeData;          // Datos del QR (para generar en frontend)
    private String yapeDeepLink;        // Link para abrir Yape directamente
    private LocalDateTime expiresAt;
    private Integer expiresInSeconds;
    private String instructions;        // Instrucciones para el usuario
}




