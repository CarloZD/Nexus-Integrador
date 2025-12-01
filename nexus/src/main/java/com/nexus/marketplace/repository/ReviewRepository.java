package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Reviews de un juego
    Page<Review> findByGameIdOrderByCreatedAtDesc(Long gameId, Pageable pageable);
    
    List<Review> findByGameIdOrderByCreatedAtDesc(Long gameId);

    // Reviews de un usuario
    Page<Review> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Verificar si usuario ya tiene review para un juego
    Optional<Review> findByUserIdAndGameId(Long userId, Long gameId);
    
    boolean existsByUserIdAndGameId(Long userId, Long gameId);

    // Calcular promedio de rating de un juego
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.game.id = :gameId")
    Double getAverageRatingByGameId(@Param("gameId") Long gameId);

    // Contar reviews de un juego
    long countByGameId(Long gameId);

    // Reviews más útiles de un juego
    @Query("SELECT r FROM Review r WHERE r.game.id = :gameId ORDER BY r.helpful DESC, r.createdAt DESC")
    Page<Review> findMostHelpfulByGameId(@Param("gameId") Long gameId, Pageable pageable);

    // Reviews con comentario (no vacías)
    @Query("SELECT r FROM Review r WHERE r.game.id = :gameId AND r.comment IS NOT NULL AND r.comment != '' ORDER BY r.createdAt DESC")
    Page<Review> findByGameIdWithComments(@Param("gameId") Long gameId, Pageable pageable);

    // Distribución de ratings (para estadísticas)
    @Query("SELECT r.rating, COUNT(r) FROM Review r WHERE r.game.id = :gameId GROUP BY r.rating ORDER BY r.rating DESC")
    List<Object[]> getRatingDistributionByGameId(@Param("gameId") Long gameId);
}

