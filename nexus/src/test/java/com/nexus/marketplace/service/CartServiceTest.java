package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.Cart;
import com.nexus.marketplace.domain.CartItem;
import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.domain.User;
import com.nexus.marketplace.dto.cart.CartDTO;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.repository.CartItemRepository;
import com.nexus.marketplace.repository.CartRepository;
import com.nexus.marketplace.repository.GameRepository;
import com.nexus.marketplace.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameRepository gameRepository;

    @InjectMocks
    private CartService cartService;

    private User testUser;
    private Game testGame;
    private Cart testCart;
    private CartItem testCartItem;

    @BeforeEach
    void setUp() {
        // Crear usuario de prueba
        testUser = new User();
        testUser.setId(1L);
        testUser.setEmail("test@example.com");
        testUser.setUsername("testuser");

        // Crear juego de prueba
        testGame = new Game();
        testGame.setId(1L);
        testGame.setTitle("Test Game");
        testGame.setPrice(new BigDecimal("29.99"));
        testGame.setActive(true);
        testGame.setStock(100);
        testGame.setIsFree(false);

        // Crear carrito de prueba
        testCart = new Cart();
        testCart.setId(1L);
        testCart.setUser(testUser);
        testCart.setTotal(BigDecimal.ZERO);
        testCart.setItems(new ArrayList<>());

        // Crear item de carrito de prueba
        testCartItem = new CartItem();
        testCartItem.setId(1L);
        testCartItem.setCart(testCart);
        testCartItem.setGame(testGame);
        testCartItem.setQuantity(2);
        testCartItem.setPrice(testGame.getPrice());
        testCartItem.calculateSubtotal();
    }

    @Test
    void testGetOrCreateCart_ExistingCart() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));

        // Act
        CartDTO cartDTO = cartService.getOrCreateCart("test@example.com");

        // Assert
        assertNotNull(cartDTO);
        assertEquals(testCart.getId(), cartDTO.getId());
        verify(cartRepository, times(1)).findByUserIdWithItems(testUser.getId());
        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    void testGetOrCreateCart_NewCart() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.empty());
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        CartDTO cartDTO = cartService.getOrCreateCart("test@example.com");

        // Assert
        assertNotNull(cartDTO);
        verify(cartRepository, times(1)).findByUserIdWithItems(testUser.getId());
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testGetOrCreateCart_UserNotFound() {
        // Arrange
        when(userRepository.findByEmail("notfound@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            cartService.getOrCreateCart("notfound@example.com");
        });

        verify(cartRepository, never()).save(any(Cart.class));
    }

    @Test
    void testAddToCart_Success_NewItem() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(gameRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findByCartIdAndGameId(testCart.getId(), 1L)).thenReturn(Optional.empty());
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(testCartItem);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        CartDTO cartDTO = cartService.addToCart("test@example.com", 1L, 2);

        // Assert
        assertNotNull(cartDTO);
        verify(gameRepository, times(1)).findById(1L);
        verify(cartItemRepository, times(1)).save(any(CartItem.class));
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testAddToCart_Success_ExistingItem() {
        // Arrange
        testCart.getItems().add(testCartItem);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(gameRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findByCartIdAndGameId(testCart.getId(), 1L))
                .thenReturn(Optional.of(testCartItem));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(testCartItem);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        CartDTO cartDTO = cartService.addToCart("test@example.com", 1L, 1);

        // Assert
        assertNotNull(cartDTO);
        verify(cartItemRepository, times(1)).save(testCartItem);
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testAddToCart_InvalidQuantity() {
        // Arrange
        // No se necesita stubbing porque la validación ocurre antes de cualquier acceso a repositorios

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cartService.addToCart("test@example.com", 1L, 0);
        });

        assertEquals("La cantidad debe ser mayor a 0", exception.getMessage());
        verify(cartItemRepository, never()).save(any(CartItem.class));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void testAddToCart_GameNotFound() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(gameRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            cartService.addToCart("test@example.com", 999L, 1);
        });

        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    void testAddToCart_GameInactive() {
        // Arrange
        testGame.setActive(false);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(gameRepository.findById(1L)).thenReturn(Optional.of(testGame));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cartService.addToCart("test@example.com", 1L, 1);
        });

        assertEquals("Este juego no está disponible actualmente", exception.getMessage());
        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    void testAddToCart_InsufficientStock() {
        // Arrange
        testGame.setStock(5);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(gameRepository.findById(1L)).thenReturn(Optional.of(testGame));
        // No se necesita stubbing de cartRepository porque la validación de stock ocurre antes

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cartService.addToCart("test@example.com", 1L, 10);
        });

        assertTrue(exception.getMessage().contains("Stock insuficiente"));
        verify(cartItemRepository, never()).save(any(CartItem.class));
        verify(cartRepository, never()).findByUserIdWithItems(anyLong());
    }

    @Test
    void testUpdateCartItem_Success() {
        // Arrange
        testCart.getItems().add(testCartItem);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(testCartItem));
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(testCartItem);
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        CartDTO cartDTO = cartService.updateCartItem("test@example.com", 1L, 3);

        // Assert
        assertNotNull(cartDTO);
        verify(cartItemRepository, times(1)).save(testCartItem);
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testUpdateCartItem_RemoveItem_QuantityZero() {
        // Arrange
        testCart.getItems().add(testCartItem);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(testCartItem));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        CartDTO cartDTO = cartService.updateCartItem("test@example.com", 1L, 0);

        // Assert
        assertNotNull(cartDTO);
        verify(cartItemRepository, times(1)).delete(testCartItem);
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testUpdateCartItem_InvalidQuantity() {
        // Arrange
        // No se necesita stubbing porque la validación ocurre antes de cualquier acceso a repositorios

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cartService.updateCartItem("test@example.com", 1L, -1);
        });

        assertEquals("La cantidad no puede ser negativa", exception.getMessage());
        verify(cartItemRepository, never()).save(any(CartItem.class));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    void testUpdateCartItem_ItemNotInCart() {
        // Arrange
        Cart otherCart = new Cart();
        otherCart.setId(2L);
        testCartItem.setCart(otherCart);

        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(testCartItem));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            cartService.updateCartItem("test@example.com", 1L, 2);
        });

        assertEquals("El item no pertenece a tu carrito", exception.getMessage());
        verify(cartItemRepository, never()).save(any(CartItem.class));
    }

    @Test
    void testRemoveFromCart_Success() {
        // Arrange
        testCart.getItems().add(testCartItem);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(1L)).thenReturn(Optional.of(testCartItem));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        CartDTO cartDTO = cartService.removeFromCart("test@example.com", 1L);

        // Assert
        assertNotNull(cartDTO);
        verify(cartItemRepository, times(1)).delete(testCartItem);
        verify(cartRepository, times(1)).save(any(Cart.class));
    }

    @Test
    void testRemoveFromCart_ItemNotFound() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartItemRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            cartService.removeFromCart("test@example.com", 999L);
        });

        verify(cartItemRepository, never()).delete(any(CartItem.class));
    }

    @Test
    void testClearCart_Success() {
        // Arrange
        testCart.getItems().add(testCartItem);
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.of(testCart));
        when(cartRepository.save(any(Cart.class))).thenReturn(testCart);

        // Act
        cartService.clearCart("test@example.com");

        // Assert
        verify(cartRepository, times(1)).save(any(Cart.class));
        assertTrue(testCart.getItems().isEmpty());
    }

    @Test
    void testClearCart_CartNotFound() {
        // Arrange
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(cartRepository.findByUserIdWithItems(testUser.getId())).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(ResourceNotFoundException.class, () -> {
            cartService.clearCart("test@example.com");
        });

        verify(cartRepository, never()).save(any(Cart.class));
    }
}

