package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByOrderId(Long orderId);
    
    Optional<Payment> findByPaymentCode(String paymentCode);

    List<Payment> findByStatus(Payment.PaymentStatus status);

    // Pagos pendientes que han expirado
    List<Payment> findByStatusAndExpiresAtBefore(Payment.PaymentStatus status, LocalDateTime dateTime);

    // Pagos por método
    List<Payment> findByPaymentMethod(Payment.PaymentMethod method);

    boolean existsByOrderId(Long orderId);
}

