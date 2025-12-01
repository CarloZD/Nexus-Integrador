package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.dto.game.GameImageDTO;
import com.nexus.marketplace.service.GameService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Tag(name = "Juegos", description = "Catálogo de videojuegos")
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping
    @Operation(summary = "Todos los juegos", description = "Obtiene todos los juegos activos")
    public ResponseEntity<List<GameDTO>> getAllGames() {
        List<GameDTO> games = gameService.getAllGames();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/latest")
    @Operation(summary = "Últimos juegos", description = "Obtiene los juegos más recientes")
    public ResponseEntity<List<GameDTO>> getLatestGames() {
        List<GameDTO> games = gameService.getLatestGames();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/featured")
    @Operation(summary = "Juegos destacados", description = "Obtiene los juegos marcados como destacados")
    public ResponseEntity<List<GameDTO>> getFeaturedGames() {
        List<GameDTO> games = gameService.getFeaturedGames();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar juegos", description = "Busca juegos por título o descripción")
    public ResponseEntity<List<GameDTO>> searchGames(
            @Parameter(description = "Término de búsqueda") @RequestParam String q) {
        List<GameDTO> games = gameService.searchGames(q);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Por categoría", description = "Filtra juegos por categoría: ACTION, ADVENTURE, RPG, STRATEGY, etc.")
    public ResponseEntity<List<GameDTO>> getGamesByCategory(
            @Parameter(description = "Categoría del juego") @PathVariable String category) {
        try {
            List<GameDTO> games = gameService.getGamesByCategory(category);
            return ResponseEntity.ok(games);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/platform/{platform}")
    @Operation(summary = "Por plataforma", description = "Filtra juegos por plataforma: PC, PS5, XBOX, NINTENDO_SWITCH, MULTI")
    public ResponseEntity<List<GameDTO>> getGamesByPlatform(
            @Parameter(description = "Plataforma del juego") @PathVariable String platform) {
        try {
            List<GameDTO> games = gameService.getGamesByPlatform(platform);
            return ResponseEntity.ok(games);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Detalle de juego", description = "Obtiene información detallada de un juego")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        try {
            GameDTO game = gameService.getGameById(id);
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/images")
    @Operation(summary = "Imágenes del juego", description = "Obtiene todas las imágenes de un juego")
    public ResponseEntity<List<GameImageDTO>> getGameImages(@PathVariable Long id) {
        List<GameImageDTO> images = gameService.getGameImages(id);
        return ResponseEntity.ok(images);
    }

    @GetMapping("/{id}/screenshots")
    @Operation(summary = "Screenshots del juego", description = "Obtiene solo los screenshots de un juego")
    public ResponseEntity<List<GameImageDTO>> getGameScreenshots(@PathVariable Long id) {
        List<GameImageDTO> screenshots = gameService.getGameScreenshots(id);
        return ResponseEntity.ok(screenshots);
    }

    @PostMapping("/import-steam")
    @Operation(summary = "Importar juegos", description = "Importa juegos populares desde RAWG API")
    public ResponseEntity<String> importFromSteam() {
        try {
            gameService.importGamesFromSteam();
            return ResponseEntity.ok("Juegos importados exitosamente desde Steam");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("Error al importar juegos: " + e.getMessage());
        }
    }
}
