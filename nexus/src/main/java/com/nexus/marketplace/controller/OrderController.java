package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.order.*;
import com.nexus.marketplace.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Órdenes", description = "Gestión de órdenes y compras")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ==================== USUARIO ====================

    @PostMapping("/checkout")
    @Operation(summary = "Crear orden", description = "Crea una orden a partir del carrito actual")
    public ResponseEntity<OrderDTO> checkout(
            @Valid @RequestBody CreateOrderRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        OrderDTO order = orderService.createOrderFromCart(email, request);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/my-orders")
    @Operation(summary = "Mis órdenes", description = "Obtiene las órdenes del usuario actual (paginado)")
    public ResponseEntity<Page<OrderSummaryDTO>> getMyOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication.getName();
        Page<OrderSummaryDTO> orders = orderService.getUserOrders(email, page, size);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/my-orders/all")
    @Operation(summary = "Todas mis órdenes", description = "Obtiene todas las órdenes del usuario sin paginación")
    public ResponseEntity<List<OrderSummaryDTO>> getAllMyOrders(Authentication authentication) {
        String email = authentication.getName();
        List<OrderSummaryDTO> orders = orderService.getAllUserOrders(email);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de orden", description = "Obtiene el detalle completo de una orden")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        OrderDTO order = orderService.getOrderById(id, email);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Buscar por número", description = "Busca una orden por su número de orden")
    public ResponseEntity<OrderDTO> getOrderByNumber(
            @PathVariable String orderNumber,
            Authentication authentication) {

        String email = authentication.getName();
        OrderDTO order = orderService.getOrderByNumber(orderNumber, email);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancelar orden", description = "Cancela una orden pendiente")
    public ResponseEntity<OrderDTO> cancelOrder(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        OrderDTO order = orderService.cancelOrder(id, email);
        return ResponseEntity.ok(order);
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Completar orden", description = "Marca una orden como completada (simula pago exitoso)")
    public ResponseEntity<OrderDTO> completeOrder(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        OrderDTO order = orderService.completeOrder(id, email);
        return ResponseEntity.ok(order);
    }

    // ==================== ADMIN ====================

    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Todas las órdenes (Admin)", description = "Obtiene todas las órdenes del sistema")
    public ResponseEntity<Page<OrderDTO>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<OrderDTO> orders = orderService.getAllOrders(page, size);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/admin/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Órdenes por estado (Admin)", description = "Filtra órdenes por estado: PENDING, COMPLETED, CANCELLED")
    public ResponseEntity<Page<OrderDTO>> getOrdersByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<OrderDTO> orders = orderService.getOrdersByStatus(status, page, size);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/admin/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Actualizar estado (Admin)", description = "Cambia el estado de una orden")
    public ResponseEntity<OrderDTO> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        String status = request.get("status");
        OrderDTO order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(order);
    }
}




