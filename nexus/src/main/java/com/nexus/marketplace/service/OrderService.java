package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.*;
import com.nexus.marketplace.dto.order.*;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.exception.UnauthorizedException;
import com.nexus.marketplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    /**
     * Crear orden desde el carrito del usuario
     */
    @Transactional
    public OrderDTO createOrderFromCart(String email, CreateOrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado"));

        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        // Verificar stock de todos los items
        for (CartItem cartItem : cart.getItems()) {
            Game game = cartItem.getGame();
            if (game.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Stock insuficiente para: " + game.getTitle());
            }
        }

        // Crear la orden
        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(Order.OrderStatus.PENDING);
        order.setTotalAmount(BigDecimal.ZERO);

        // Crear items de la orden desde el carrito
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setGame(cartItem.getGame());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getPrice());
            order.addItem(orderItem);

            // Reducir stock
            Game game = cartItem.getGame();
            game.setStock(game.getStock() - cartItem.getQuantity());
            gameRepository.save(game);
        }

        // Calcular total
        order.calculateTotal();

        // Guardar orden
        order = orderRepository.save(order);

        // Vaciar carrito
        cart.clearItems();
        cart.setTotal(BigDecimal.ZERO);
        cartRepository.save(cart);

        return convertToDTO(order);
    }

    /**
     * Obtener órdenes del usuario actual
     */
    @Transactional(readOnly = true)
    public Page<OrderSummaryDTO> getUserOrders(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return orders.map(this::convertToSummaryDTO);
    }

    /**
     * Obtener todas las órdenes del usuario (sin paginación)
     */
    @Transactional(readOnly = true)
    public List<OrderSummaryDTO> getAllUserOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return orders.stream()
                .map(this::convertToSummaryDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener detalle de una orden
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderById(Long orderId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        // Verificar que la orden pertenece al usuario o es admin
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new UnauthorizedException("No tienes permiso para ver esta orden");
        }

        return convertToDTO(order);
    }

    /**
     * Obtener orden por número de orden
     */
    @Transactional(readOnly = true)
    public OrderDTO getOrderByNumber(String orderNumber, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        // Verificar que la orden pertenece al usuario o es admin
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new UnauthorizedException("No tienes permiso para ver esta orden");
        }

        return convertToDTO(order);
    }

    /**
     * Cancelar orden (solo si está PENDING)
     */
    @Transactional
    public OrderDTO cancelOrder(Long orderId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        // Verificar permisos
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new UnauthorizedException("No tienes permiso para cancelar esta orden");
        }

        // Solo se puede cancelar si está pendiente
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Solo se pueden cancelar órdenes pendientes");
        }

        // Restaurar stock
        for (OrderItem item : order.getItems()) {
            Game game = item.getGame();
            game.setStock(game.getStock() + item.getQuantity());
            gameRepository.save(game);
        }

        order.setStatus(Order.OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    /**
     * Completar orden (simular pago exitoso)
     */
    @Transactional
    public OrderDTO completeOrder(Long orderId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        // Verificar permisos
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new UnauthorizedException("No tienes permiso para completar esta orden");
        }

        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Solo se pueden completar órdenes pendientes");
        }

        order.setStatus(Order.OrderStatus.COMPLETED);
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    // ==================== ADMIN ====================

    /**
     * Obtener todas las órdenes (admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(this::convertToDTO);
    }

    /**
     * Obtener órdenes por estado (admin)
     */
    @Transactional(readOnly = true)
    public Page<OrderDTO> getOrdersByStatus(String status, int page, int size) {
        Order.OrderStatus orderStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        Pageable pageable = PageRequest.of(page, size);
        Page<Order> orders = orderRepository.findByStatusOrderByCreatedAtDesc(orderStatus, pageable);
        return orders.map(this::convertToDTO);
    }

    /**
     * Actualizar estado de orden (admin)
     */
    @Transactional
    public OrderDTO updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Orden no encontrada"));

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        Order.OrderStatus oldStatus = order.getStatus();

        // Si se cancela, restaurar stock
        if (newStatus == Order.OrderStatus.CANCELLED && oldStatus != Order.OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Game game = item.getGame();
                game.setStock(game.getStock() + item.getQuantity());
                gameRepository.save(game);
            }
        }

        order.setStatus(newStatus);
        order = orderRepository.save(order);

        return convertToDTO(order);
    }

    // ==================== HELPERS ====================

    private String generateOrderNumber() {
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String uuid = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        return "NX-" + timestamp + "-" + uuid;
    }

    private OrderDTO convertToDTO(Order order) {
        List<OrderItemDTO> items = order.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList());

        return OrderDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .username(order.getUser().getUsername())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .paymentMethod(order.getPaymentMethod())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    private OrderItemDTO convertItemToDTO(OrderItem item) {
        return OrderItemDTO.builder()
                .id(item.getId())
                .gameId(item.getGame().getId())
                .gameTitle(item.getGame().getTitle())
                .gameImage(item.getGame().getHeaderImage())
                .quantity(item.getQuantity())
                .priceAtPurchase(item.getPriceAtPurchase())
                .subtotal(item.getSubtotal())
                .build();
    }

    private OrderSummaryDTO convertToSummaryDTO(Order order) {
        return OrderSummaryDTO.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .itemCount(order.getItems().size())
                .createdAt(order.getCreatedAt())
                .build();
    }
}


