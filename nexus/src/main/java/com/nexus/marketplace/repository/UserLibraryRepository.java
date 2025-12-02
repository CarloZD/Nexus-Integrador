package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.UserLibrary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLibraryRepository extends JpaRepository<UserLibrary, Long> {

    // Obtener biblioteca del usuario
    List<UserLibrary> findByUserIdOrderByAcquiredAtDesc(Long userId);
    
    Page<UserLibrary> findByUserIdOrderByAcquiredAtDesc(Long userId, Pageable pageable);

    // Verificar si el usuario tiene un juego
    boolean existsByUserIdAndGameId(Long userId, Long gameId);
    
    Optional<UserLibrary> findByUserIdAndGameId(Long userId, Long gameId);

    // Juegos instalados
    List<UserLibrary> findByUserIdAndIsInstalledTrueOrderByLastPlayedDesc(Long userId);

    // Juegos jugados recientemente
    @Query("SELECT ul FROM UserLibrary ul WHERE ul.user.id = :userId AND ul.lastPlayed IS NOT NULL ORDER BY ul.lastPlayed DESC")
    List<UserLibrary> findRecentlyPlayedByUserId(@Param("userId") Long userId, Pageable pageable);

    // Contar juegos en biblioteca
    long countByUserId(Long userId);

    // Tiempo total jugado
    @Query("SELECT SUM(ul.playTimeMinutes) FROM UserLibrary ul WHERE ul.user.id = :userId")
    Long getTotalPlayTimeByUserId(@Param("userId") Long userId);

    // Buscar en biblioteca
    @Query("SELECT ul FROM UserLibrary ul WHERE ul.user.id = :userId AND " +
           "LOWER(ul.game.title) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<UserLibrary> searchInLibrary(@Param("userId") Long userId, @Param("search") String search);
}




