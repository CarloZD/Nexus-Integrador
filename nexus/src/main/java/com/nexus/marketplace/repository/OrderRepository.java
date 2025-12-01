package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Buscar órdenes por usuario
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Buscar por número de orden
    Optional<Order> findByOrderNumber(String orderNumber);

    // Buscar orden por ID con usuario
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.user WHERE o.id = :id")
    Optional<Order> findByIdWithUser(@Param("id") Long id);

    // Buscar orden por ID con items
    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    // Buscar órdenes por estado
    Page<Order> findByStatusOrderByCreatedAtDesc(Order.OrderStatus status, Pageable pageable);

    // Contar órdenes por usuario
    long countByUserId(Long userId);

    // Contar órdenes por estado
    long countByStatus(Order.OrderStatus status);

    // Verificar si existe orden con número
    boolean existsByOrderNumber(String orderNumber);

    // Órdenes recientes (para admin)
    List<Order> findTop10ByOrderByCreatedAtDesc();
}
