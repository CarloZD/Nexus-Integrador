package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.cart.*;
import com.nexus.marketplace.exception.UnauthorizedException;
import com.nexus.marketplace.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Carrito", description = "Gestión del carrito de compras")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    @Operation(summary = "Obtener carrito del usuario", description = "Retorna el carrito actual del usuario autenticado")
    public ResponseEntity<CartDTO> getCart(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isEmpty()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        String email = authentication.getName();
        CartDTO cart = cartService.getOrCreateCart(email);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    @Operation(summary = "Agregar juego al carrito", description = "Agrega un juego al carrito o incrementa su cantidad si ya existe")
    public ResponseEntity<CartDTO> addToCart(
            @RequestBody AddToCartRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isEmpty()) {
            throw new UnauthorizedException("Usuario no autenticado");
        }
        String email = authentication.getName();
        CartDTO cart = cartService.addToCart(email, request.getGameId(), request.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Actualizar cantidad de item", description = "Actualiza la cantidad de un item en el carrito")
    public ResponseEntity<CartDTO> updateCartItem(
            @PathVariable Long itemId,
            @RequestBody UpdateCartItemRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        CartDTO cart = cartService.updateCartItem(email, itemId, request.getQuantity());
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Eliminar item del carrito", description = "Elimina un item específico del carrito")
    public ResponseEntity<CartDTO> removeFromCart(
            @PathVariable Long itemId,
            Authentication authentication) {
        String email = authentication.getName();
        CartDTO cart = cartService.removeFromCart(email, itemId);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Vaciar carrito", description = "Elimina todos los items del carrito")
    public ResponseEntity<Map<String, String>> clearCart(Authentication authentication) {
        String email = authentication.getName();
        cartService.clearCart(email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Carrito vaciado exitosamente");
        return ResponseEntity.ok(response);
    }
}