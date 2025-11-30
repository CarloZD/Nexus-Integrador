package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.*;
import com.nexus.marketplace.dto.cart.*;
import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Transactional(readOnly = true)
    public CartDTO getOrCreateCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createNewCart(user));

        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO addToCart(String email, Long gameId, Integer quantity) {
        // Validar cantidad
        if (quantity == null || quantity <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Juego no encontrado con ID: " + gameId));

        // Validar que el juego esté activo
        if (!game.getActive()) {
            throw new RuntimeException("Este juego no está disponible actualmente");
        }

        // Validar stock
        if (game.getStock() < quantity) {
            throw new RuntimeException("Stock insuficiente. Solo quedan " + game.getStock() + " unidades");
        }

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> createNewCart(user));

        // Verificar si el juego ya está en el carrito
        CartItem existingItem = cartItemRepository
                .findByCartIdAndGameId(cart.getId(), gameId)
                .orElse(null);

        if (existingItem != null) {
            // Actualizar cantidad existente
            int newQuantity = existingItem.getQuantity() + quantity;

            // Validar stock para nueva cantidad
            if (game.getStock() < newQuantity) {
                throw new RuntimeException("Stock insuficiente. Solo puedes agregar " +
                        (game.getStock() - existingItem.getQuantity()) + " unidades más");
            }

            existingItem.setQuantity(newQuantity);
            existingItem.calculateSubtotal();
            cartItemRepository.save(existingItem);
        } else {
            // Crear nuevo item
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setGame(game);
            newItem.setQuantity(quantity);
            newItem.setPrice(game.getPrice());
            newItem.calculateSubtotal();

            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        cart.recalculateTotal();
        cart = cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO updateCartItem(String email, Long itemId, Integer quantity) {
        // Validar cantidad
        if (quantity == null || quantity < 0) {
            throw new RuntimeException("La cantidad no puede ser negativa");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado en el carrito"));

        // Verificar que el item pertenezca al carrito del usuario
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("El item no pertenece a tu carrito");
        }

        if (quantity == 0) {
            // Eliminar item si cantidad es 0
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            // Validar stock
            if (item.getGame().getStock() < quantity) {
                throw new RuntimeException("Stock insuficiente. Solo quedan " +
                        item.getGame().getStock() + " unidades disponibles");
            }

            item.setQuantity(quantity);
            item.calculateSubtotal();
            cartItemRepository.save(item);
        }

        cart.recalculateTotal();
        cart = cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Transactional
    public CartDTO removeFromCart(String email, Long itemId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado"));

        // Verificar que el item pertenezca al carrito del usuario
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("El item no pertenece a tu carrito");
        }

        cart.removeItem(item);
        cartItemRepository.delete(item);

        cart.recalculateTotal();
        cart = cartRepository.save(cart);

        return convertToDTO(cart);
    }

    @Transactional
    public void clearCart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Cart cart = cartRepository.findByUserIdWithItems(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Carrito no encontrado"));

        cart.clearItems();
        cart.recalculateTotal();
        cartRepository.save(cart);
    }

    private Cart createNewCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setTotal(BigDecimal.ZERO);
        return cartRepository.save(cart);
    }

    private CartDTO convertToDTO(Cart cart) {
        return CartDTO.builder()
                .id(cart.getId())
                .items(cart.getItems().stream()
                        .map(this::convertItemToDTO)
                        .collect(Collectors.toList()))
                .total(cart.getTotal())
                .itemCount(cart.getItems().size())
                .build();
    }

    private CartItemDTO convertItemToDTO(CartItem item) {
        return CartItemDTO.builder()
                .id(item.getId())
                .game(convertGameToDTO(item.getGame()))
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .subtotal(item.getSubtotal())
                .build();
    }

    private GameDTO convertGameToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .steamAppId(game.getSteamAppId())
                .title(game.getTitle())
                .shortDescription(game.getShortDescription())
                .headerImage(game.getHeaderImage())
                .price(game.getPrice())
                .isFree(game.getIsFree())
                .stock(game.getStock())
                .build();
    }
}