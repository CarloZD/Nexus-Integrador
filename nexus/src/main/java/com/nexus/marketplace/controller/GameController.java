package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class GameController {

    @Autowired
    private GameService gameService;

    @GetMapping
    public ResponseEntity<List<GameDTO>> getAllGames() {
        List<GameDTO> games = gameService.getAllGames();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/latest")
    public ResponseEntity<List<GameDTO>> getLatestGames() {
        List<GameDTO> games = gameService.getLatestGames();
        return ResponseEntity.ok(games);
    }

    @GetMapping("/search")
    public ResponseEntity<List<GameDTO>> searchGames(@RequestParam String q) {
        List<GameDTO> games = gameService.searchGames(q);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GameDTO> getGameById(@PathVariable Long id) {
        try {
            GameDTO game = gameService.getGameById(id);
            return ResponseEntity.ok(game);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/import-steam")
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