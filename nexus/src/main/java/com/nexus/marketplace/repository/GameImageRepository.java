package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.GameImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameImageRepository extends JpaRepository<GameImage, Long> {

    // Obtener imágenes de un juego ordenadas
    List<GameImage> findByGameIdOrderByDisplayOrder(Long gameId);

    // Obtener imágenes por tipo
    List<GameImage> findByGameIdAndImageTypeOrderByDisplayOrder(Long gameId, GameImage.ImageType imageType);

    // Obtener solo screenshots
    List<GameImage> findByGameIdAndImageType(Long gameId, GameImage.ImageType imageType);

    // Contar imágenes de un juego
    long countByGameId(Long gameId);

    // Eliminar todas las imágenes de un juego
    void deleteByGameId(Long gameId);
}


