package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.payment.*;
import com.nexus.marketplace.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Pagos", description = "Procesamiento de pagos con tarjeta y Yape")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // ==================== PAGO CON TARJETA ====================

    @PostMapping("/card")
    @Operation(summary = "Pagar con tarjeta", description = "Procesa un pago con tarjeta de crédito o débito")
    public ResponseEntity<PaymentResponseDTO> payWithCard(
            @Valid @RequestBody PaymentRequestDTO request,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO response = paymentService.processCardPayment(email, request);
        return ResponseEntity.ok(response);
    }

    // ==================== PAGO CON YAPE ====================

    @PostMapping("/yape/generate-qr")
    @Operation(summary = "Generar QR de Yape", description = "Genera un código QR para pagar con Yape")
    public ResponseEntity<YapeQRResponseDTO> generateYapeQR(
            @RequestParam Long orderId,
            Authentication authentication) {

        String email = authentication.getName();
        YapeQRResponseDTO response = paymentService.generateYapeQR(email, orderId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/yape/confirm")
    @Operation(summary = "Confirmar pago Yape", description = "Confirma que el pago con Yape fue realizado")
    public ResponseEntity<PaymentResponseDTO> confirmYapePayment(
            @RequestParam String paymentCode,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO response = paymentService.confirmYapePayment(email, paymentCode);
        return ResponseEntity.ok(response);
    }

    // ==================== CONSULTAS ====================

    @GetMapping("/status/{paymentCode}")
    @Operation(summary = "Estado del pago", description = "Consulta el estado de un pago por su código")
    public ResponseEntity<PaymentResponseDTO> getPaymentStatus(
            @PathVariable String paymentCode,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO response = paymentService.getPaymentStatus(email, paymentCode);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Pago de una orden", description = "Obtiene el pago asociado a una orden")
    public ResponseEntity<PaymentResponseDTO> getPaymentByOrder(
            @PathVariable Long orderId,
            Authentication authentication) {

        String email = authentication.getName();
        PaymentResponseDTO response = paymentService.getPaymentByOrder(email, orderId);
        return ResponseEntity.ok(response);
    }

    // ==================== INFO ====================

    @GetMapping("/methods")
    @Operation(summary = "Métodos de pago", description = "Lista los métodos de pago disponibles")
    public ResponseEntity<Map<String, Object>> getPaymentMethods() {
        Map<String, Object> methods = new HashMap<>();
        
        Map<String, String> card = new HashMap<>();
        card.put("id", "CREDIT_CARD");
        card.put("name", "Tarjeta de Crédito/Débito");
        card.put("description", "Paga con Visa, Mastercard o American Express");
        card.put("icon", "credit-card");
        
        Map<String, String> yape = new HashMap<>();
        yape.put("id", "YAPE");
        yape.put("name", "Yape");
        yape.put("description", "Escanea el QR y paga desde tu app de Yape");
        yape.put("icon", "qr-code");
        
        methods.put("methods", new Object[]{card, yape});
        methods.put("defaultMethod", "CREDIT_CARD");
        
        return ResponseEntity.ok(methods);
    }
}


