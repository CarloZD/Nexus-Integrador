package com.nexus.marketplace.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.domain.User;
import com.nexus.marketplace.dto.auth.RegisterRequest;
import com.nexus.marketplace.dto.cart.AddToCartRequest;
import com.nexus.marketplace.dto.cart.UpdateCartItemRequest;
import com.nexus.marketplace.repository.GameRepository;
import com.nexus.marketplace.repository.UserRepository;
import com.nexus.marketplace.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class CartControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private User testUser;
    private Game testGame;
    private String authToken;

    @BeforeEach
    void setUp() throws Exception {
        // Limpiar datos
        userRepository.deleteAll();
        gameRepository.deleteAll();

        // Crear usuario de prueba
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("Test123!");
        registerRequest.setFullName("Test User");

        // Registrar usuario y obtener token
        String registerResponse = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        authToken = objectMapper.readTree(registerResponse).get("token").asText();

        // Obtener usuario guardado
        testUser = userRepository.findByEmail("test@example.com").orElseThrow();

        // Crear juego de prueba
        testGame = new Game();
        testGame.setSteamAppId("123456");
        testGame.setTitle("Test Game");
        testGame.setDescription("Test Description");
        testGame.setShortDescription("Short Description");
        testGame.setPrice(new BigDecimal("29.99"));
        testGame.setCategory(Game.GameCategory.ACTION);
        testGame.setPlatform(Game.GamePlatform.PC);
        testGame.setActive(true);
        testGame.setStock(100);
        testGame.setIsFree(false);
        testGame = gameRepository.save(testGame);
    }

    @Test
    void testGetCart_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/cart"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetCart_Authenticated() throws Exception {
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.total").value(0));
    }

    @Test
    void testAddToCart_Success() throws Exception {
        AddToCartRequest request = new AddToCartRequest();
        request.setGameId(testGame.getId());
        request.setQuantity(2);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items[0].game.id").value(testGame.getId()))
                .andExpect(jsonPath("$.items[0].quantity").value(2))
                .andExpect(jsonPath("$.total").exists());
    }

    @Test
    void testAddToCart_Unauthenticated() throws Exception {
        AddToCartRequest request = new AddToCartRequest();
        request.setGameId(testGame.getId());
        request.setQuantity(1);

        mockMvc.perform(post("/api/cart/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    void testAddToCart_GameNotFound() throws Exception {
        AddToCartRequest request = new AddToCartRequest();
        request.setGameId(999L);
        request.setQuantity(1);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound());
    }

    @Test
    void testAddToCart_InsufficientStock() throws Exception {
        // Reducir stock del juego
        testGame.setStock(5);
        gameRepository.save(testGame);

        AddToCartRequest request = new AddToCartRequest();
        request.setGameId(testGame.getId());
        request.setQuantity(10); // Más que el stock disponible

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testUpdateCartItem_Success() throws Exception {
        // Primero agregar un item al carrito
        AddToCartRequest addRequest = new AddToCartRequest();
        addRequest.setGameId(testGame.getId());
        addRequest.setQuantity(2);

        String cartResponse = mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long itemId = objectMapper.readTree(cartResponse)
                .get("items").get(0).get("id").asLong();

        // Actualizar la cantidad
        UpdateCartItemRequest updateRequest = new UpdateCartItemRequest();
        updateRequest.setQuantity(5);

        mockMvc.perform(put("/api/cart/items/{itemId}", itemId)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(5));
    }

    @Test
    void testUpdateCartItem_RemoveItem() throws Exception {
        // Agregar item
        AddToCartRequest addRequest = new AddToCartRequest();
        addRequest.setGameId(testGame.getId());
        addRequest.setQuantity(1);

        String cartResponse = mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long itemId = objectMapper.readTree(cartResponse)
                .get("items").get(0).get("id").asLong();

        // Establecer cantidad a 0 para eliminar
        UpdateCartItemRequest updateRequest = new UpdateCartItemRequest();
        updateRequest.setQuantity(0);

        mockMvc.perform(put("/api/cart/items/{itemId}", itemId)
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void testRemoveFromCart_Success() throws Exception {
        // Agregar item
        AddToCartRequest addRequest = new AddToCartRequest();
        addRequest.setGameId(testGame.getId());
        addRequest.setQuantity(1);

        String cartResponse = mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Long itemId = objectMapper.readTree(cartResponse)
                .get("items").get(0).get("id").asLong();

        // Eliminar item
        mockMvc.perform(delete("/api/cart/items/{itemId}", itemId)
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void testClearCart_Success() throws Exception {
        // Agregar items
        AddToCartRequest addRequest = new AddToCartRequest();
        addRequest.setGameId(testGame.getId());
        addRequest.setQuantity(2);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(addRequest)))
                .andExpect(status().isOk());

        // Limpiar carrito
        mockMvc.perform(delete("/api/cart/clear")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Carrito vaciado exitosamente"));

        // Verificar que el carrito está vacío
        mockMvc.perform(get("/api/cart")
                        .header("Authorization", "Bearer " + authToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items").isArray())
                .andExpect(jsonPath("$.items").isEmpty());
    }

    @Test
    void testAddToCart_UpdateExistingItem() throws Exception {
        // Agregar item por primera vez
        AddToCartRequest request1 = new AddToCartRequest();
        request1.setGameId(testGame.getId());
        request1.setQuantity(2);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(2));

        // Agregar más del mismo juego
        AddToCartRequest request2 = new AddToCartRequest();
        request2.setGameId(testGame.getId());
        request2.setQuantity(3);

        mockMvc.perform(post("/api/cart/items")
                        .header("Authorization", "Bearer " + authToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.items[0].quantity").value(5)); // 2 + 3 = 5
    }
}

