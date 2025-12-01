package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.Game;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends JpaRepository<Game, Long> {

    Optional<Game> findBySteamAppId(String steamAppId);

    List<Game> findByActiveTrue();

    @Query("SELECT g FROM Game g WHERE g.active = true AND " +
            "(LOWER(g.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(g.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Game> searchGames(@Param("search") String search);

    @Query("SELECT g FROM Game g WHERE g.active = true ORDER BY g.createdAt DESC")
    List<Game> findLatestGames();

    boolean existsBySteamAppId(String steamAppId);

    // Juegos destacados
    List<Game> findByFeaturedTrueAndActiveTrue();

    // Por categoría
    List<Game> findByCategoryAndActiveTrue(Game.GameCategory category);

    // Por plataforma
    List<Game> findByPlatformAndActiveTrue(Game.GamePlatform platform);

    // Por categoría y plataforma
    List<Game> findByCategoryAndPlatformAndActiveTrue(Game.GameCategory category, Game.GamePlatform platform);

    // Juegos gratuitos
    List<Game> findByIsFreeAndActiveTrue(Boolean isFree);

    // Contar por categoría
    long countByCategoryAndActiveTrue(Game.GameCategory category);
}