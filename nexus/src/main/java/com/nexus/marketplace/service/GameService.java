package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.domain.GameImage;
import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.dto.game.GameImageDTO;
import com.nexus.marketplace.dto.game.GameCreateRequest;
import com.nexus.marketplace.dto.game.GameUpdateRequest;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.repository.GameImageRepository;
import com.nexus.marketplace.repository.GameRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class GameService {

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private GameImageRepository gameImageRepository;

    @Autowired
    private RawgService rawgService;

    @Transactional
    public void importGamesFromSteam() {
        // Usar RAWG en lugar de Steam (más confiable)
        List<Map<String, Object>> steamGames = rawgService.getPopularGames();

        // O si prefieres Steam, usa:
        // List<Map<String, Object>> steamGames = steamService.getPopularGames();

        for (Map<String, Object> gameData : steamGames) {
            String steamAppId = (String) gameData.get("steamAppId");

            // Verificar si ya existe
            if (!gameRepository.existsBySteamAppId(steamAppId)) {
                Game game = new Game();
                game.setSteamAppId(steamAppId);
                game.setTitle((String) gameData.get("title"));
                game.setShortDescription((String) gameData.get("shortDescription"));
                game.setDescription((String) gameData.get("description"));
                game.setHeaderImage((String) gameData.get("headerImage"));
                game.setBackgroundImage((String) gameData.get("backgroundImage"));
                game.setPrice((BigDecimal) gameData.get("price"));
                game.setIsFree((Boolean) gameData.getOrDefault("isFree", false));
                game.setDeveloper((String) gameData.get("developer"));
                game.setPublisher((String) gameData.get("publisher"));
                game.setReleaseDate((String) gameData.get("releaseDate"));
                game.setGenres((String) gameData.get("genres"));
                game.setCategories((String) gameData.get("categories"));
                game.setActive(true);
                game.setStock(100); // Stock por defecto

                gameRepository.save(game);
                System.out.println("Imported game: " + game.getTitle());
            }
        }
    }

    public List<GameDTO> getAllGames() {
        return gameRepository.findByActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GameDTO> getLatestGames() {
        return gameRepository.findLatestGames().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<GameDTO> searchGames(String search) {
        return gameRepository.searchGames(search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public GameDTO getGameById(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));
        return convertToDTO(game);
    }

    /**
     * Obtener imágenes/screenshots de un juego
     */
    public List<GameImageDTO> getGameImages(Long gameId) {
        return gameImageRepository.findByGameIdOrderByDisplayOrder(gameId).stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener solo screenshots de un juego
     */
    public List<GameImageDTO> getGameScreenshots(Long gameId) {
        return gameImageRepository.findByGameIdAndImageType(gameId, GameImage.ImageType.SCREENSHOT).stream()
                .map(this::convertImageToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener juegos destacados
     */
    public List<GameDTO> getFeaturedGames() {
        return gameRepository.findByFeaturedTrueAndActiveTrue().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener juegos por categoría
     */
    public List<GameDTO> getGamesByCategory(String category) {
        Game.GameCategory gameCategory = Game.GameCategory.valueOf(category.toUpperCase());
        return gameRepository.findByCategoryAndActiveTrue(gameCategory).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener juegos por plataforma
     */
    public List<GameDTO> getGamesByPlatform(String platform) {
        Game.GamePlatform gamePlatform = Game.GamePlatform.valueOf(platform.toUpperCase());
        return gameRepository.findByPlatformAndActiveTrue(gamePlatform).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // ==================== MÉTODOS CRUD PARA ADMIN ====================

    /**
     * Obtener todos los juegos (incluyendo inactivos) - Solo para admin
     */
    public List<GameDTO> getAllGamesIncludingInactive() {
        return gameRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Crear un nuevo juego
     */
    @Transactional
    public GameDTO createGame(GameCreateRequest request) {
        // Verificar que el steamAppId no exista
        if (gameRepository.existsBySteamAppId(request.getSteamAppId())) {
            throw new RuntimeException("Ya existe un juego con el Steam App ID: " + request.getSteamAppId());
        }

        Game game = new Game();
        game.setSteamAppId(request.getSteamAppId());
        game.setTitle(request.getTitle());
        game.setShortDescription(request.getShortDescription());
        game.setDescription(request.getDescription());
        game.setPrice(request.getPrice());
        game.setIsFree(request.getIsFree() != null ? request.getIsFree() : false);
        game.setStock(request.getStock() != null ? request.getStock() : 0);
        game.setActive(request.getActive() != null ? request.getActive() : true);
        game.setFeatured(request.getFeatured() != null ? request.getFeatured() : false);
        game.setRating(request.getRating() != null ? request.getRating() : BigDecimal.ZERO);

        // Categoría
        if (request.getCategory() != null) {
            try {
                game.setCategory(Game.GameCategory.valueOf(request.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                game.setCategory(Game.GameCategory.ACTION);
            }
        }

        // Plataforma
        if (request.getPlatform() != null) {
            try {
                game.setPlatform(Game.GamePlatform.valueOf(request.getPlatform().toUpperCase()));
            } catch (IllegalArgumentException e) {
                game.setPlatform(Game.GamePlatform.PC);
            }
        }

        // Campos opcionales
        game.setImageUrl(request.getImageUrl());
        game.setCoverImageUrl(request.getCoverImageUrl());
        game.setScreenshots(request.getScreenshots());
        game.setHeaderImage(request.getHeaderImage());
        game.setBackgroundImage(request.getBackgroundImage());
        game.setDeveloper(request.getDeveloper());
        game.setPublisher(request.getPublisher());
        game.setReleaseDate(request.getReleaseDate());
        game.setGenres(request.getGenres());
        game.setCategories(request.getCategories());

        game = gameRepository.save(game);
        return convertToDTO(game);
    }

    /**
     * Actualizar un juego existente
     */
    @Transactional
    public GameDTO updateGame(Long id, GameUpdateRequest request) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Juego no encontrado con ID: " + id));

        // Actualizar campos si están presentes
        if (request.getTitle() != null) {
            game.setTitle(request.getTitle());
        }
        if (request.getShortDescription() != null) {
            game.setShortDescription(request.getShortDescription());
        }
        if (request.getDescription() != null) {
            game.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            game.setPrice(request.getPrice());
        }
        if (request.getIsFree() != null) {
            game.setIsFree(request.getIsFree());
        }
        if (request.getStock() != null) {
            game.setStock(request.getStock());
        }
        if (request.getActive() != null) {
            game.setActive(request.getActive());
        }
        if (request.getFeatured() != null) {
            game.setFeatured(request.getFeatured());
        }
        if (request.getRating() != null) {
            game.setRating(request.getRating());
        }

        // Categoría
        if (request.getCategory() != null) {
            try {
                game.setCategory(Game.GameCategory.valueOf(request.getCategory().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Mantener la categoría actual si es inválida
            }
        }

        // Plataforma
        if (request.getPlatform() != null) {
            try {
                game.setPlatform(Game.GamePlatform.valueOf(request.getPlatform().toUpperCase()));
            } catch (IllegalArgumentException e) {
                // Mantener la plataforma actual si es inválida
            }
        }

        // Campos opcionales
        if (request.getImageUrl() != null) {
            game.setImageUrl(request.getImageUrl());
        }
        if (request.getCoverImageUrl() != null) {
            game.setCoverImageUrl(request.getCoverImageUrl());
        }
        if (request.getScreenshots() != null) {
            game.setScreenshots(request.getScreenshots());
        }
        if (request.getHeaderImage() != null) {
            game.setHeaderImage(request.getHeaderImage());
        }
        if (request.getBackgroundImage() != null) {
            game.setBackgroundImage(request.getBackgroundImage());
        }
        if (request.getDeveloper() != null) {
            game.setDeveloper(request.getDeveloper());
        }
        if (request.getPublisher() != null) {
            game.setPublisher(request.getPublisher());
        }
        if (request.getReleaseDate() != null) {
            game.setReleaseDate(request.getReleaseDate());
        }
        if (request.getGenres() != null) {
            game.setGenres(request.getGenres());
        }
        if (request.getCategories() != null) {
            game.setCategories(request.getCategories());
        }

        game = gameRepository.save(game);
        return convertToDTO(game);
    }

    /**
     * Eliminar un juego (soft delete)
     */
    @Transactional
    public void deleteGame(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Juego no encontrado con ID: " + id));
        
        game.setActive(false);
        gameRepository.save(game);
    }

    private GameImageDTO convertImageToDTO(GameImage image) {
        return GameImageDTO.builder()
                .id(image.getId())
                .gameId(image.getGame().getId())
                .imageUrl(image.getImageUrl())
                .imageType(image.getImageType().name())
                .displayOrder(image.getDisplayOrder())
                .build();
    }

    private GameDTO convertToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .steamAppId(game.getSteamAppId())
                .title(game.getTitle())
                .description(game.getDescription())
                .shortDescription(game.getShortDescription())
                .price(game.getPrice())
                // Campos agregados
                .category(game.getCategory() != null ? game.getCategory().name() : null)
                .platform(game.getPlatform() != null ? game.getPlatform().name() : null)
                .rating(game.getRating())
                .imageUrl(game.getImageUrl())
                .coverImageUrl(game.getCoverImageUrl())
                .featured(game.getFeatured())
                .screenshots(game.getScreenshots())
                // Campos existentes
                .headerImage(game.getHeaderImage())
                .backgroundImage(game.getBackgroundImage())
                .developer(game.getDeveloper())
                .publisher(game.getPublisher())
                .releaseDate(game.getReleaseDate())
                .genres(game.getGenres())
                .categories(game.getCategories())
                .isFree(game.getIsFree())
                .stock(game.getStock())
                .active(game.getActive())
                .build();
    }
}