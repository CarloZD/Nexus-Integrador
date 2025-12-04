package com.nexus.marketplace.integration;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.repository.GameRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
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
class GameControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private GameRepository gameRepository;

    private Game testGame;

    @BeforeEach
    void setUp() {
        gameRepository.deleteAll();

        // Crear juego de prueba
        testGame = new Game();
        testGame.setSteamAppId("123456");
        testGame.setTitle("Test Game");
        testGame.setDescription("Test Description");
        testGame.setShortDescription("Short Description");
        testGame.setPrice(new BigDecimal("29.99"));
        testGame.setCategory(Game.GameCategory.ACTION);
        testGame.setPlatform(Game.GamePlatform.PC);
        testGame.setRating(new BigDecimal("4.5"));
        testGame.setActive(true);
        testGame.setStock(100);
        testGame.setIsFree(false);
        testGame.setFeatured(false);
        testGame = gameRepository.save(testGame);

        // Crear otro juego destacado
        Game featuredGame = new Game();
        featuredGame.setSteamAppId("789012");
        featuredGame.setTitle("Featured Game");
        featuredGame.setDescription("Featured Description");
        featuredGame.setShortDescription("Featured Short");
        featuredGame.setPrice(new BigDecimal("39.99"));
        featuredGame.setCategory(Game.GameCategory.RPG);
        featuredGame.setPlatform(Game.GamePlatform.PC);
        featuredGame.setActive(true);
        featuredGame.setFeatured(true);
        featuredGame.setStock(50);
        gameRepository.save(featuredGame);
    }

    @Test
    void testGetAllGames_Success() throws Exception {
        mockMvc.perform(get("/api/games"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].id").exists())
                .andExpect(jsonPath("$[0].title").value("Test Game"));
    }

    @Test
    void testGetGameById_Success() throws Exception {
        mockMvc.perform(get("/api/games/{id}", testGame.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testGame.getId()))
                .andExpect(jsonPath("$.title").value("Test Game"))
                .andExpect(jsonPath("$.price").value(29.99));
    }

    @Test
    void testGetGameById_NotFound() throws Exception {
        mockMvc.perform(get("/api/games/{id}", 999L))
                .andExpect(status().isNotFound());
    }

    @Test
    void testGetLatestGames_Success() throws Exception {
        mockMvc.perform(get("/api/games/latest"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetFeaturedGames_Success() throws Exception {
        mockMvc.perform(get("/api/games/featured"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].featured").value(true));
    }

    @Test
    void testSearchGames_Success() throws Exception {
        mockMvc.perform(get("/api/games/search")
                        .param("q", "Test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Test Game"));
    }

    @Test
    void testSearchGames_NoResults() throws Exception {
        mockMvc.perform(get("/api/games/search")
                        .param("q", "NonexistentGame"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$").isEmpty());
    }

    @Test
    void testGetGamesByCategory_Success() throws Exception {
        mockMvc.perform(get("/api/games/category/ACTION"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].category").value("ACTION"));
    }

    @Test
    void testGetGamesByCategory_InvalidCategory() throws Exception {
        mockMvc.perform(get("/api/games/category/INVALID"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetGamesByPlatform_Success() throws Exception {
        mockMvc.perform(get("/api/games/platform/PC"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].platform").value("PC"));
    }

    @Test
    void testGetGamesByPlatform_InvalidPlatform() throws Exception {
        mockMvc.perform(get("/api/games/platform/INVALID"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void testGetGameImages_Success() throws Exception {
        mockMvc.perform(get("/api/games/{id}/images", testGame.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void testGetGameScreenshots_Success() throws Exception {
        mockMvc.perform(get("/api/games/{id}/screenshots", testGame.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}

