package com.nexus.marketplace.dto.order;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequest {
    
    @NotBlank(message = "El método de pago es requerido")
    private String paymentMethod;
}

