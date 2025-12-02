package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.*;
import com.nexus.marketplace.dto.payment.*;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.exception.UnauthorizedException;
import com.nexus.marketplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LibraryService libraryService;

    private static final int YAPE_QR_EXPIRATION_MINUTES = 15;

    /**
     * Iniciar pago con tarjeta
     */
    @Transactional
    public PaymentResponseDTO processCardPayment(String email, PaymentRequestDTO request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Order order = orderRepository.findByIdWithItems(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        // Verificar que la orden pertenece al usuario
        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para pagar esta orden");
        }

        // Verificar que la orden está pendiente
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Esta orden ya no está pendiente de pago");
        }

        // Verificar que no haya un pago existente
        if (paymentRepository.existsByOrderId(order.getId())) {
            Payment existingPayment = paymentRepository.findByOrderId(order.getId()).get();
            if (existingPayment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                throw new RuntimeException("Esta orden ya fue pagada");
            }
            // Si hay un pago pendiente o fallido, lo actualizamos
            paymentRepository.delete(existingPayment);
        }

        // Validar datos de tarjeta (simulación)
        validateCardData(request);

        // Determinar marca de tarjeta
        String cardBrand = detectCardBrand(request.getCardNumber());

        // Crear registro de pago
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentCode(generatePaymentCode());
        payment.setPaymentMethod(request.getPaymentMethod().equals("CREDIT_CARD") 
                ? Payment.PaymentMethod.CREDIT_CARD 
                : Payment.PaymentMethod.DEBIT_CARD);
        payment.setAmount(order.getTotalAmount());
        payment.setCardLastFour(request.getCardNumber().substring(request.getCardNumber().length() - 4));
        payment.setCardBrand(cardBrand);
        payment.setStatus(Payment.PaymentStatus.PROCESSING);

        payment = paymentRepository.save(payment);

        // Simular procesamiento de pago (en producción sería una llamada a pasarela de pago)
        boolean paymentSuccess = simulateCardPayment(request);

        if (paymentSuccess) {
            payment.setStatus(Payment.PaymentStatus.COMPLETED);
            payment.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
            payment.setPaidAt(LocalDateTime.now());
            payment = paymentRepository.save(payment);

            // Actualizar orden
            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);

            // Agregar juegos a la biblioteca
            addGamesToLibrary(user, order);

            return buildPaymentResponse(payment, "¡Pago exitoso! Los juegos han sido agregados a tu biblioteca.");
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
            payment = paymentRepository.save(payment);

            return buildPaymentResponse(payment, "El pago fue rechazado. Por favor, verifica los datos de tu tarjeta.");
        }
    }

    /**
     * Generar QR para pago con Yape
     */
    @Transactional
    public YapeQRResponseDTO generateYapeQR(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        // Verificar que la orden pertenece al usuario
        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para pagar esta orden");
        }

        // Verificar que la orden está pendiente
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Esta orden ya no está pendiente de pago");
        }

        // Verificar/eliminar pago existente
        if (paymentRepository.existsByOrderId(order.getId())) {
            Payment existingPayment = paymentRepository.findByOrderId(order.getId()).get();
            if (existingPayment.getStatus() == Payment.PaymentStatus.COMPLETED) {
                throw new RuntimeException("Esta orden ya fue pagada");
            }
            paymentRepository.delete(existingPayment);
        }

        // Crear pago pendiente para Yape
        String paymentCode = generatePaymentCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(YAPE_QR_EXPIRATION_MINUTES);

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setPaymentCode(paymentCode);
        payment.setPaymentMethod(Payment.PaymentMethod.YAPE);
        payment.setAmount(order.getTotalAmount());
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setExpiresAt(expiresAt);

        // Generar datos del QR (en producción serían datos reales de Yape)
        String qrData = generateYapeQRData(paymentCode, order.getTotalAmount());
        payment.setQrCodeData(qrData);

        payment = paymentRepository.save(payment);

        // Generar QR en Base64 (simulado)
        String qrBase64 = generateQRCodeBase64(qrData);

        return YapeQRResponseDTO.builder()
                .paymentCode(paymentCode)
                .amount(order.getTotalAmount())
                .qrCodeBase64(qrBase64)
                .qrCodeData(qrData)
                .yapeDeepLink("yape://pay?code=" + paymentCode + "&amount=" + order.getTotalAmount())
                .expiresAt(expiresAt)
                .expiresInSeconds(YAPE_QR_EXPIRATION_MINUTES * 60)
                .instructions("1. Abre tu app de Yape\n2. Escanea el código QR\n3. Confirma el pago de S/. " + order.getTotalAmount())
                .build();
    }

    /**
     * Confirmar pago de Yape (simulado - en producción sería un webhook)
     */
    @Transactional
    public PaymentResponseDTO confirmYapePayment(String email, String paymentCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Código de pago no encontrado"));

        Order order = payment.getOrder();

        // Verificar que el pago pertenece al usuario
        if (!order.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para confirmar este pago");
        }

        // Verificar estado
        if (payment.getStatus() == Payment.PaymentStatus.COMPLETED) {
            throw new RuntimeException("Este pago ya fue confirmado");
        }

        // Verificar expiración
        if (payment.getExpiresAt() != null && payment.getExpiresAt().isBefore(LocalDateTime.now())) {
            payment.setStatus(Payment.PaymentStatus.EXPIRED);
            paymentRepository.save(payment);
            throw new RuntimeException("El código QR ha expirado. Por favor, genera uno nuevo.");
        }

        // Simular confirmación exitosa de Yape
        payment.setStatus(Payment.PaymentStatus.COMPLETED);
        payment.setTransactionId("YAPE-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());
        payment.setPaidAt(LocalDateTime.now());
        payment = paymentRepository.save(payment);

        // Actualizar orden
        order.setStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);

        // Agregar juegos a la biblioteca
        addGamesToLibrary(user, order);

        return buildPaymentResponse(payment, "¡Pago con Yape confirmado! Los juegos han sido agregados a tu biblioteca.");
    }

    /**
     * Verificar estado de pago
     */
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentStatus(String email, String paymentCode) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Payment payment = paymentRepository.findByPaymentCode(paymentCode)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado"));

        if (!payment.getOrder().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para ver este pago");
        }

        return buildPaymentResponse(payment, null);
    }

    /**
     * Obtener pago por orden
     */
    @Transactional(readOnly = true)
    public PaymentResponseDTO getPaymentByOrder(String email, Long orderId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No hay pago para esta orden"));

        if (!payment.getOrder().getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para ver este pago");
        }

        return buildPaymentResponse(payment, null);
    }

    // ==================== HELPERS ====================

    private void addGamesToLibrary(User user, Order order) {
        for (OrderItem item : order.getItems()) {
            libraryService.addGameToLibrary(user, item.getGame(), order, item.getPriceAtPurchase());
        }
    }

    private void validateCardData(PaymentRequestDTO request) {
        if (request.getCardNumber() == null || request.getCardNumber().length() < 13) {
            throw new RuntimeException("Número de tarjeta inválido");
        }
        if (request.getCardHolder() == null || request.getCardHolder().isEmpty()) {
            throw new RuntimeException("Nombre del titular es requerido");
        }
        if (request.getCvv() == null || request.getCvv().length() < 3) {
            throw new RuntimeException("CVV inválido");
        }
    }

    private String detectCardBrand(String cardNumber) {
        String cleanNumber = cardNumber.replaceAll("\\s", "");
        if (cleanNumber.startsWith("4")) {
            return "VISA";
        } else if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2")) {
            return "MASTERCARD";
        } else if (cleanNumber.startsWith("3")) {
            return "AMEX";
        } else {
            return "OTHER";
        }
    }

    private boolean simulateCardPayment(PaymentRequestDTO request) {
        // Simulación: 95% de éxito
        // En producción, aquí iría la integración con pasarela de pago real
        return Math.random() > 0.05;
    }

    private String generatePaymentCode() {
        return "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateYapeQRData(String paymentCode, BigDecimal amount) {
        // En producción, estos serían los datos reales de Yape
        return String.format("YAPE|%s|%.2f|NEXUS_MARKETPLACE", paymentCode, amount);
    }

    private String generateQRCodeBase64(String data) {
        // En producción, usar librería como ZXing para generar QR real
        // Aquí devolvemos un placeholder que el frontend puede usar para generar el QR
        String placeholder = "QR_DATA:" + data;
        return Base64.getEncoder().encodeToString(placeholder.getBytes());
    }

    private PaymentResponseDTO buildPaymentResponse(Payment payment, String message) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .orderNumber(payment.getOrder().getOrderNumber())
                .paymentCode(payment.getPaymentCode())
                .paymentMethod(payment.getPaymentMethod().name())
                .status(payment.getStatus().name())
                .amount(payment.getAmount())
                .cardLastFour(payment.getCardLastFour())
                .cardBrand(payment.getCardBrand())
                .yapePhone(payment.getYapePhone())
                .qrCodeData(payment.getQrCodeData())
                .expiresAt(payment.getExpiresAt())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .message(message)
                .build();
    }
}




