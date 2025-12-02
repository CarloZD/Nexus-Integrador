package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.review.*;
import com.nexus.marketplace.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@Tag(name = "Reviews", description = "Gestión de reseñas de juegos")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    // ==================== PÚBLICOS (GET) ====================

    @GetMapping("/game/{gameId}")
    @Operation(summary = "Reviews de un juego", description = "Obtiene las reviews de un juego específico")
    public ResponseEntity<Page<ReviewDTO>> getGameReviews(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Page<ReviewDTO> reviews = reviewService.getGameReviews(gameId, page, size, email);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/game/{gameId}/helpful")
    @Operation(summary = "Reviews más útiles", description = "Obtiene las reviews más útiles de un juego")
    public ResponseEntity<Page<ReviewDTO>> getMostHelpfulReviews(
            @PathVariable Long gameId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Page<ReviewDTO> reviews = reviewService.getMostHelpfulReviews(gameId, page, size, email);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/game/{gameId}/stats")
    @Operation(summary = "Estadísticas de reviews", description = "Obtiene estadísticas de reviews de un juego")
    public ResponseEntity<GameReviewStatsDTO> getGameReviewStats(@PathVariable Long gameId) {
        GameReviewStatsDTO stats = reviewService.getGameReviewStats(gameId);
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/latest")
    @Operation(summary = "Últimas reseñas de la comunidad", description = "Obtiene las últimas reseñas generadas en toda la plataforma")
    public ResponseEntity<Page<ReviewDTO>> getLatestReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Page<ReviewDTO> reviews = reviewService.getLatestReviews(page, size, email);
        return ResponseEntity.ok(reviews);
    }

    // ==================== AUTENTICADOS ====================

    @GetMapping("/game/{gameId}/my-review")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Mi review para un juego", description = "Obtiene la review del usuario actual para un juego")
    public ResponseEntity<ReviewDTO> getMyReviewForGame(
            @PathVariable Long gameId,
            Authentication authentication) {

        String email = authentication.getName();
        ReviewDTO review = reviewService.getUserReviewForGame(gameId, email);
        
        if (review == null) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(review);
    }

    @GetMapping("/my-reviews")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Mis reviews", description = "Obtiene todas las reviews del usuario actual")
    public ResponseEntity<Page<ReviewDTO>> getMyReviews(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication.getName();
        Page<ReviewDTO> reviews = reviewService.getUserReviews(email, page, size);
        return ResponseEntity.ok(reviews);
    }

    @PostMapping
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Crear review", description = "Crea una nueva review para un juego")
    public ResponseEntity<ReviewDTO> createReview(
            @Valid @RequestBody CreateReviewRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        ReviewDTO review = reviewService.createReview(email, request);
        return ResponseEntity.ok(review);
    }

    @PutMapping("/{id}")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Actualizar review", description = "Actualiza una review existente")
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReviewRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        ReviewDTO review = reviewService.updateReview(id, email, request);
        return ResponseEntity.ok(review);
    }

    @DeleteMapping("/{id}")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Eliminar review", description = "Elimina una review")
    public ResponseEntity<Map<String, String>> deleteReview(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        reviewService.deleteReview(id, email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Reseña eliminada exitosamente");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/helpful")
    @SecurityRequirement(name = "bearer-jwt")
    @Operation(summary = "Marcar como útil", description = "Marca una review como útil")
    public ResponseEntity<ReviewDTO> markAsHelpful(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        ReviewDTO review = reviewService.markAsHelpful(id, email);
        return ResponseEntity.ok(review);
    }
}




