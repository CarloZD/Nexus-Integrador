package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.library.LibraryGameDTO;
import com.nexus.marketplace.dto.library.LibraryStatsDTO;
import com.nexus.marketplace.service.LibraryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/library")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Biblioteca", description = "Gestión de juegos adquiridos por el usuario")
public class LibraryController {

    @Autowired
    private LibraryService libraryService;

    @GetMapping
    @Operation(summary = "Mi biblioteca", description = "Obtiene todos los juegos de la biblioteca del usuario")
    public ResponseEntity<List<LibraryGameDTO>> getMyLibrary(Authentication authentication) {
        String email = authentication.getName();
        List<LibraryGameDTO> library = libraryService.getUserLibrary(email);
        return ResponseEntity.ok(library);
    }

    @GetMapping("/paged")
    @Operation(summary = "Mi biblioteca (paginada)", description = "Obtiene los juegos de la biblioteca paginados")
    public ResponseEntity<Page<LibraryGameDTO>> getMyLibraryPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication) {
        String email = authentication.getName();
        Page<LibraryGameDTO> library = libraryService.getUserLibraryPaged(email, page, size);
        return ResponseEntity.ok(library);
    }

    @GetMapping("/stats")
    @Operation(summary = "Estadísticas de biblioteca", description = "Obtiene estadísticas de la biblioteca del usuario")
    public ResponseEntity<LibraryStatsDTO> getLibraryStats(Authentication authentication) {
        String email = authentication.getName();
        LibraryStatsDTO stats = libraryService.getLibraryStats(email);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/installed")
    @Operation(summary = "Juegos instalados", description = "Obtiene los juegos marcados como instalados")
    public ResponseEntity<List<LibraryGameDTO>> getInstalledGames(Authentication authentication) {
        String email = authentication.getName();
        List<LibraryGameDTO> games = libraryService.getInstalledGames(email);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/recent")
    @Operation(summary = "Jugados recientemente", description = "Obtiene los juegos jugados recientemente")
    public ResponseEntity<List<LibraryGameDTO>> getRecentlyPlayed(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {
        String email = authentication.getName();
        List<LibraryGameDTO> games = libraryService.getRecentlyPlayed(email, limit);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/search")
    @Operation(summary = "Buscar en biblioteca", description = "Busca juegos dentro de la biblioteca del usuario")
    public ResponseEntity<List<LibraryGameDTO>> searchInLibrary(
            @RequestParam String q,
            Authentication authentication) {
        String email = authentication.getName();
        List<LibraryGameDTO> games = libraryService.searchInLibrary(email, q);
        return ResponseEntity.ok(games);
    }

    @GetMapping("/owns/{gameId}")
    @Operation(summary = "¿Tengo este juego?", description = "Verifica si el usuario tiene un juego en su biblioteca")
    public ResponseEntity<Map<String, Boolean>> checkOwnership(
            @PathVariable Long gameId,
            Authentication authentication) {
        String email = authentication.getName();
        boolean owns = libraryService.userOwnsGame(email, gameId);
        
        Map<String, Boolean> response = new HashMap<>();
        response.put("owns", owns);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{gameId}/install")
    @Operation(summary = "Instalar juego", description = "Marca un juego como instalado")
    public ResponseEntity<LibraryGameDTO> installGame(
            @PathVariable Long gameId,
            Authentication authentication) {
        String email = authentication.getName();
        LibraryGameDTO game = libraryService.installGame(email, gameId);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/{gameId}/uninstall")
    @Operation(summary = "Desinstalar juego", description = "Marca un juego como desinstalado")
    public ResponseEntity<LibraryGameDTO> uninstallGame(
            @PathVariable Long gameId,
            Authentication authentication) {
        String email = authentication.getName();
        LibraryGameDTO game = libraryService.uninstallGame(email, gameId);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/{gameId}/play")
    @Operation(summary = "Registrar tiempo de juego", description = "Registra tiempo jugado (simulación)")
    public ResponseEntity<LibraryGameDTO> playGame(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "30") Integer minutes,
            Authentication authentication) {
        String email = authentication.getName();
        LibraryGameDTO game = libraryService.playGame(email, gameId, minutes);
        return ResponseEntity.ok(game);
    }
}

