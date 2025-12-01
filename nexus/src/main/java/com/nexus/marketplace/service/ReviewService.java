package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.domain.Review;
import com.nexus.marketplace.domain.User;
import com.nexus.marketplace.dto.review.*;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.exception.UnauthorizedException;
import com.nexus.marketplace.repository.GameRepository;
import com.nexus.marketplace.repository.ReviewRepository;
import com.nexus.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GameRepository gameRepository;

    /**
     * Crear una nueva review
     */
    @Transactional
    public ReviewDTO createReview(String email, CreateReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new ResourceNotFoundException("Juego no encontrado"));

        // Verificar si el usuario ya tiene una review para este juego
        if (reviewRepository.existsByUserIdAndGameId(user.getId(), game.getId())) {
            throw new RuntimeException("Ya tienes una reseña para este juego. Puedes editarla.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setGame(game);
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setHelpful(0);

        review = reviewRepository.save(review);

        return convertToDTO(review, user);
    }

    /**
     * Actualizar una review existente
     */
    @Transactional
    public ReviewDTO updateReview(Long reviewId, String email, UpdateReviewRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada"));

        // Verificar que el usuario sea el dueño de la review
        if (!review.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para editar esta reseña");
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }

        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }

        review = reviewRepository.save(review);

        return convertToDTO(review, user);
    }

    /**
     * Eliminar una review
     */
    @Transactional
    public void deleteReview(Long reviewId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada"));

        // Verificar permisos (dueño o admin)
        if (!review.getUser().getId().equals(user.getId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new UnauthorizedException("No tienes permiso para eliminar esta reseña");
        }

        reviewRepository.delete(review);
    }

    /**
     * Obtener reviews de un juego
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getGameReviews(Long gameId, int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByGameIdOrderByCreatedAtDesc(gameId, pageable);

        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        return reviews.map(review -> convertToDTO(review, currentUser));
    }

    /**
     * Obtener reviews más útiles de un juego
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getMostHelpfulReviews(Long gameId, int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findMostHelpfulByGameId(gameId, pageable);

        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        return reviews.map(review -> convertToDTO(review, currentUser));
    }

    /**
     * Obtener la review del usuario para un juego específico
     */
    @Transactional(readOnly = true)
    public ReviewDTO getUserReviewForGame(Long gameId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Review review = reviewRepository.findByUserIdAndGameId(user.getId(), gameId)
                .orElse(null);

        if (review == null) {
            return null;
        }

        return convertToDTO(review, user);
    }

    /**
     * Obtener todas las reviews del usuario actual
     */
    @Transactional(readOnly = true)
    public Page<ReviewDTO> getUserReviews(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Review> reviews = reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);

        return reviews.map(review -> convertToDTO(review, user));
    }

    /**
     * Marcar una review como útil
     */
    @Transactional
    public ReviewDTO markAsHelpful(Long reviewId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Reseña no encontrada"));

        // No puedes marcar tu propia review como útil
        if (review.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("No puedes marcar tu propia reseña como útil");
        }

        // Incrementar contador (en una implementación real, se debería trackear quién marcó útil)
        review.setHelpful(review.getHelpful() + 1);
        review = reviewRepository.save(review);

        return convertToDTO(review, user);
    }

    /**
     * Obtener estadísticas de reviews de un juego
     */
    @Transactional(readOnly = true)
    public GameReviewStatsDTO getGameReviewStats(Long gameId) {
        // Verificar que el juego existe
        if (!gameRepository.existsById(gameId)) {
            throw new ResourceNotFoundException("Juego no encontrado");
        }

        Double averageRating = reviewRepository.getAverageRatingByGameId(gameId);
        long totalReviews = reviewRepository.countByGameId(gameId);

        // Obtener distribución de ratings
        List<Object[]> distribution = reviewRepository.getRatingDistributionByGameId(gameId);
        Map<Integer, Long> ratingDistribution = new HashMap<>();
        
        // Inicializar con 0
        for (int i = 1; i <= 5; i++) {
            ratingDistribution.put(i, 0L);
        }
        
        // Llenar con datos reales
        for (Object[] row : distribution) {
            Integer rating = (Integer) row[0];
            Long count = (Long) row[1];
            ratingDistribution.put(rating, count);
        }

        return GameReviewStatsDTO.builder()
                .gameId(gameId)
                .averageRating(averageRating != null ? Math.round(averageRating * 10.0) / 10.0 : 0.0)
                .totalReviews(totalReviews)
                .ratingDistribution(ratingDistribution)
                .build();
    }

    // ==================== HELPERS ====================

    private ReviewDTO convertToDTO(Review review, User currentUser) {
        boolean isOwnReview = currentUser != null && 
                review.getUser().getId().equals(currentUser.getId());

        return ReviewDTO.builder()
                .id(review.getId())
                .userId(review.getUser().getId())
                .username(review.getUser().getUsername())
                .userAvatar(null) // Agregar si tienes avatar en User
                .gameId(review.getGame().getId())
                .gameTitle(review.getGame().getTitle())
                .rating(review.getRating())
                .comment(review.getComment())
                .helpful(review.getHelpful())
                .isOwnReview(isOwnReview)
                .markedHelpful(false) // Implementar tracking si se requiere
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }
}


