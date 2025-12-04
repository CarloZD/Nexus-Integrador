package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.domain.GameImage;
import com.nexus.marketplace.dto.game.GameCreateRequest;
import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.dto.game.GameImageDTO;
import com.nexus.marketplace.dto.game.GameUpdateRequest;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.repository.GameImageRepository;
import com.nexus.marketplace.repository.GameRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceTest {

    @Mock
    private GameRepository gameRepository;

    @Mock
    private GameImageRepository gameImageRepository;

    @Mock
    private RawgService rawgService;

    @InjectMocks
    private GameService gameService;

    private Game testGame;
    private GameCreateRequest createRequest;
    private GameUpdateRequest updateRequest;

    @BeforeEach
    void setUp() {
        // Crear juego de prueba
        testGame = new Game();
        testGame.setId(1L);
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

        // Crear GameCreateRequest
        createRequest = new GameCreateRequest();
        createRequest.setSteamAppId("789012");
        createRequest.setTitle("New Game");
        createRequest.setDescription("New Description");
        createRequest.setShortDescription("New Short Description");
        createRequest.setPrice(new BigDecimal("39.99"));
        createRequest.setCategory("ACTION");
        createRequest.setPlatform("PC");
        createRequest.setStock(50);
        createRequest.setActive(true);

        // Crear GameUpdateRequest
        updateRequest = new GameUpdateRequest();
        updateRequest.setTitle("Updated Game");
        updateRequest.setPrice(new BigDecimal("49.99"));
    }

    @Test
    void testGetAllGames_Success() {
        // Arrange
        Game game2 = new Game();
        game2.setId(2L);
        game2.setTitle("Game 2");
        game2.setActive(true);
        
        when(gameRepository.findByActiveTrue()).thenReturn(Arrays.asList(testGame, game2));

        // Act
        List<GameDTO> games = gameService.getAllGames();

        // Assert
        assertNotNull(games);
        assertEquals(2, games.size());
        assertEquals("Test Game", games.get(0).getTitle());
        verify(gameRepository, times(1)).findByActiveTrue();
    }

    @Test
    void testGetGameById_Success() {
        // Arrange
        when(gameRepository.findById(1L)).thenReturn(Optional.of(testGame));

        // Act
        GameDTO gameDTO = gameService.getGameById(1L);

        // Assert
        assertNotNull(gameDTO);
        assertEquals(testGame.getId(), gameDTO.getId());
        assertEquals(testGame.getTitle(), gameDTO.getTitle());
        assertEquals(testGame.getPrice(), gameDTO.getPrice());
        verify(gameRepository, times(1)).findById(1L);
    }

    @Test
    void testGetGameById_NotFound() {
        // Arrange
        when(gameRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gameService.getGameById(999L);
        });

        assertEquals("Juego no encontrado", exception.getMessage());
        verify(gameRepository, times(1)).findById(999L);
    }

    @Test
    void testSearchGames_Success() {
        // Arrange
        when(gameRepository.searchGames("test")).thenReturn(Arrays.asList(testGame));

        // Act
        List<GameDTO> games = gameService.searchGames("test");

        // Assert
        assertNotNull(games);
        assertEquals(1, games.size());
        assertEquals("Test Game", games.get(0).getTitle());
        verify(gameRepository, times(1)).searchGames("test");
    }

    @Test
    void testGetLatestGames_Success() {
        // Arrange
        when(gameRepository.findLatestGames()).thenReturn(Arrays.asList(testGame));

        // Act
        List<GameDTO> games = gameService.getLatestGames();

        // Assert
        assertNotNull(games);
        assertEquals(1, games.size());
        verify(gameRepository, times(1)).findLatestGames();
    }

    @Test
    void testGetFeaturedGames_Success() {
        // Arrange
        testGame.setFeatured(true);
        when(gameRepository.findByFeaturedTrueAndActiveTrue()).thenReturn(Arrays.asList(testGame));

        // Act
        List<GameDTO> games = gameService.getFeaturedGames();

        // Assert
        assertNotNull(games);
        assertEquals(1, games.size());
        assertTrue(games.get(0).getFeatured());
        verify(gameRepository, times(1)).findByFeaturedTrueAndActiveTrue();
    }

    @Test
    void testGetGamesByCategory_Success() {
        // Arrange
        when(gameRepository.findByCategoryAndActiveTrue(Game.GameCategory.ACTION))
                .thenReturn(Arrays.asList(testGame));

        // Act
        List<GameDTO> games = gameService.getGamesByCategory("ACTION");

        // Assert
        assertNotNull(games);
        assertEquals(1, games.size());
        verify(gameRepository, times(1)).findByCategoryAndActiveTrue(Game.GameCategory.ACTION);
    }

    @Test
    void testGetGamesByPlatform_Success() {
        // Arrange
        when(gameRepository.findByPlatformAndActiveTrue(Game.GamePlatform.PC))
                .thenReturn(Arrays.asList(testGame));

        // Act
        List<GameDTO> games = gameService.getGamesByPlatform("PC");

        // Assert
        assertNotNull(games);
        assertEquals(1, games.size());
        verify(gameRepository, times(1)).findByPlatformAndActiveTrue(Game.GamePlatform.PC);
    }

    @Test
    void testGetGameImages_Success() {
        // Arrange
        GameImage image1 = new GameImage();
        image1.setId(1L);
        image1.setGame(testGame);
        image1.setImageUrl("http://example.com/image1.jpg");
        image1.setImageType(GameImage.ImageType.SCREENSHOT);
        image1.setDisplayOrder(1);

        GameImage image2 = new GameImage();
        image2.setId(2L);
        image2.setGame(testGame);
        image2.setImageUrl("http://example.com/image2.jpg");
        image2.setImageType(GameImage.ImageType.SCREENSHOT);
        image2.setDisplayOrder(2);

        when(gameImageRepository.findByGameIdOrderByDisplayOrder(1L))
                .thenReturn(Arrays.asList(image1, image2));

        // Act
        List<GameImageDTO> images = gameService.getGameImages(1L);

        // Assert
        assertNotNull(images);
        assertEquals(2, images.size());
        assertEquals("http://example.com/image1.jpg", images.get(0).getImageUrl());
        verify(gameImageRepository, times(1)).findByGameIdOrderByDisplayOrder(1L);
    }

    @Test
    void testGetGameScreenshots_Success() {
        // Arrange
        GameImage screenshot = new GameImage();
        screenshot.setId(1L);
        screenshot.setGame(testGame);
        screenshot.setImageUrl("http://example.com/screenshot.jpg");
        screenshot.setImageType(GameImage.ImageType.SCREENSHOT);

        when(gameImageRepository.findByGameIdAndImageType(1L, GameImage.ImageType.SCREENSHOT))
                .thenReturn(Arrays.asList(screenshot));

        // Act
        List<GameImageDTO> screenshots = gameService.getGameScreenshots(1L);

        // Assert
        assertNotNull(screenshots);
        assertEquals(1, screenshots.size());
        verify(gameImageRepository, times(1))
                .findByGameIdAndImageType(1L, GameImage.ImageType.SCREENSHOT);
    }

    @Test
    void testCreateGame_Success() {
        // Arrange
        when(gameRepository.existsBySteamAppId(createRequest.getSteamAppId())).thenReturn(false);
        when(gameRepository.save(any(Game.class))).thenReturn(testGame);

        // Act
        GameDTO gameDTO = gameService.createGame(createRequest);

        // Assert
        assertNotNull(gameDTO);
        verify(gameRepository, times(1)).existsBySteamAppId(createRequest.getSteamAppId());
        verify(gameRepository, times(1)).save(any(Game.class));
    }

    @Test
    void testCreateGame_SteamAppIdExists() {
        // Arrange
        when(gameRepository.existsBySteamAppId(createRequest.getSteamAppId())).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            gameService.createGame(createRequest);
        });

        assertTrue(exception.getMessage().contains("Ya existe un juego con el Steam App ID"));
        verify(gameRepository, never()).save(any(Game.class));
    }

    @Test
    void testUpdateGame_Success() {
        // Arrange
        when(gameRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(gameRepository.save(any(Game.class))).thenReturn(testGame);

        // Act
        GameDTO gameDTO = gameService.updateGame(1L, updateRequest);

        // Assert
        assertNotNull(gameDTO);
        verify(gameRepository, times(1)).findById(1L);
        verify(gameRepository, times(1)).save(any(Game.class));
    }

    @Test
    void testUpdateGame_NotFound() {
        // Arrange
        when(gameRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            gameService.updateGame(999L, updateRequest);
        });

        assertTrue(exception.getMessage().contains("Juego no encontrado"));
        verify(gameRepository, never()).save(any(Game.class));
    }

    @Test
    void testDeleteGame_Success() {
        // Arrange
        when(gameRepository.findById(1L)).thenReturn(Optional.of(testGame));
        when(gameRepository.save(any(Game.class))).thenReturn(testGame);

        // Act
        gameService.deleteGame(1L);

        // Assert
        verify(gameRepository, times(1)).findById(1L);
        verify(gameRepository, times(1)).save(any(Game.class));
        assertFalse(testGame.getActive());
    }

    @Test
    void testDeleteGame_NotFound() {
        // Arrange
        when(gameRepository.findById(999L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () -> {
            gameService.deleteGame(999L);
        });

        assertTrue(exception.getMessage().contains("Juego no encontrado"));
        verify(gameRepository, never()).save(any(Game.class));
    }

    @Test
    void testGetAllGamesIncludingInactive_Success() {
        // Arrange
        Game inactiveGame = new Game();
        inactiveGame.setId(2L);
        inactiveGame.setTitle("Inactive Game");
        inactiveGame.setActive(false);

        when(gameRepository.findAll()).thenReturn(Arrays.asList(testGame, inactiveGame));

        // Act
        List<GameDTO> games = gameService.getAllGamesIncludingInactive();

        // Assert
        assertNotNull(games);
        assertEquals(2, games.size());
        verify(gameRepository, times(1)).findAll();
    }
}

