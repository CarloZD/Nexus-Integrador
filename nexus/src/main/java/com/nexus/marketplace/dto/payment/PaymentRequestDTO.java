package com.nexus.marketplace.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PaymentRequestDTO {

    @NotNull(message = "El ID de la orden es requerido")
    private Long orderId;

    @NotBlank(message = "El método de pago es requerido")
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, YAPE

    // Para tarjeta
    private String cardNumber;      // Se procesará y solo se guardará últimos 4 dígitos
    private String cardHolder;
    private String expiryMonth;
    private String expiryYear;
    private String cvv;

    // Para Yape
    private String yapePhone;       // Número de teléfono Yape
}

