package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    // Verificar si un usuario ha comprado un juego específico
    boolean existsByOrderUserIdAndGameId(Long userId, Long gameId);
}




