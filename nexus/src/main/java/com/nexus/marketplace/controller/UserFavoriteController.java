package com.nexus.marketplace.controller;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.domain.User;
import com.nexus.marketplace.domain.UserFavorite;
import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.repository.GameRepository;
import com.nexus.marketplace.repository.UserFavoriteRepository;
import com.nexus.marketplace.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/favorites")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Favoritos", description = "Gestión de juegos favoritos del usuario")
public class UserFavoriteController {

    @Autowired
    private UserFavoriteRepository favoriteRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    @GetMapping
    @Operation(summary = "Obtener favoritos del usuario")
    public ResponseEntity<List<GameDTO>> getFavorites(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<GameDTO> favorites = favoriteRepository.findByUserId(user.getId())
                .stream()
                .map(fav -> convertGameToDTO(fav.getGame()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(favorites);
    }

    @PostMapping("/{gameId}")
    @Operation(summary = "Agregar juego a favoritos")
    public ResponseEntity<Map<String, Object>> addFavorite(
            @PathVariable Long gameId,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        // Verificar si ya existe
        if (favoriteRepository.existsByUserIdAndGameId(user.getId(), gameId)) {
            throw new RuntimeException("El juego ya está en favoritos");
        }

        UserFavorite favorite = new UserFavorite();
        favorite.setUser(user);
        favorite.setGame(game);
        favoriteRepository.save(favorite);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Juego agregado a favoritos");
        response.put("isFavorite", true);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{gameId}")
    @Operation(summary = "Eliminar juego de favoritos")
    public ResponseEntity<Map<String, Object>> removeFavorite(
            @PathVariable Long gameId,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        UserFavorite favorite = favoriteRepository.findByUserIdAndGameId(user.getId(), gameId)
                .orElseThrow(() -> new RuntimeException("Favorito no encontrado"));

        favoriteRepository.delete(favorite);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Juego eliminado de favoritos");
        response.put("isFavorite", false);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{gameId}/check")
    @Operation(summary = "Verificar si un juego está en favoritos")
    public ResponseEntity<Map<String, Boolean>> checkFavorite(
            @PathVariable Long gameId,
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean isFavorite = favoriteRepository.existsByUserIdAndGameId(user.getId(), gameId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("isFavorite", isFavorite);
        return ResponseEntity.ok(response);
    }

    private GameDTO convertGameToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .steamAppId(game.getSteamAppId())
                .title(game.getTitle())
                .description(game.getDescription())
                .shortDescription(game.getShortDescription())
                .price(game.getPrice())
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