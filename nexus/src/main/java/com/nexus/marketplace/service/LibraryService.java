package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.*;
import com.nexus.marketplace.dto.library.LibraryGameDTO;
import com.nexus.marketplace.dto.library.LibraryStatsDTO;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.repository.UserLibraryRepository;
import com.nexus.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LibraryService {

    @Autowired
    private UserLibraryRepository libraryRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtener biblioteca del usuario
     */
    @Transactional(readOnly = true)
    public List<LibraryGameDTO> getUserLibrary(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return libraryRepository.findByUserIdOrderByAcquiredAtDesc(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener biblioteca paginada
     */
    @Transactional(readOnly = true)
    public Page<LibraryGameDTO> getUserLibraryPaged(String email, int page, int size) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pageable pageable = PageRequest.of(page, size);
        return libraryRepository.findByUserIdOrderByAcquiredAtDesc(user.getId(), pageable)
                .map(this::convertToDTO);
    }

    /**
     * Verificar si el usuario tiene un juego
     */
    @Transactional(readOnly = true)
    public boolean userOwnsGame(String email, Long gameId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return libraryRepository.existsByUserIdAndGameId(user.getId(), gameId);
    }

    /**
     * Obtener juegos instalados
     */
    @Transactional(readOnly = true)
    public List<LibraryGameDTO> getInstalledGames(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return libraryRepository.findByUserIdAndIsInstalledTrueOrderByLastPlayedDesc(user.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener juegos jugados recientemente
     */
    @Transactional(readOnly = true)
    public List<LibraryGameDTO> getRecentlyPlayed(String email, int limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Pageable pageable = PageRequest.of(0, limit);
        return libraryRepository.findRecentlyPlayedByUserId(user.getId(), pageable).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Buscar en biblioteca
     */
    @Transactional(readOnly = true)
    public List<LibraryGameDTO> searchInLibrary(String email, String search) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return libraryRepository.searchInLibrary(user.getId(), search).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtener estadísticas de biblioteca
     */
    @Transactional(readOnly = true)
    public LibraryStatsDTO getLibraryStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        long totalGames = libraryRepository.countByUserId(user.getId());
        long installedGames = libraryRepository.findByUserIdAndIsInstalledTrueOrderByLastPlayedDesc(user.getId()).size();
        Long totalPlayTimeMinutes = libraryRepository.getTotalPlayTimeByUserId(user.getId());
        
        if (totalPlayTimeMinutes == null) {
            totalPlayTimeMinutes = 0L;
        }

        // Calcular total gastado
        List<UserLibrary> library = libraryRepository.findByUserIdOrderByAcquiredAtDesc(user.getId());
        BigDecimal totalSpent = library.stream()
                .map(ul -> ul.getPurchasePrice() != null ? ul.getPurchasePrice() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return LibraryStatsDTO.builder()
                .totalGames(totalGames)
                .installedGames(installedGames)
                .totalPlayTimeMinutes(totalPlayTimeMinutes)
                .totalPlayTime(formatPlayTime(totalPlayTimeMinutes.intValue()))
                .totalSpent(totalSpent)
                .build();
    }

    /**
     * Simular instalación de juego
     */
    @Transactional
    public LibraryGameDTO installGame(String email, Long gameId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        UserLibrary library = libraryRepository.findByUserIdAndGameId(user.getId(), gameId)
                .orElseThrow(() -> new ResourceNotFoundException("No tienes este juego en tu biblioteca"));

        library.setIsInstalled(true);
        library = libraryRepository.save(library);

        return convertToDTO(library);
    }

    /**
     * Simular desinstalación de juego
     */
    @Transactional
    public LibraryGameDTO uninstallGame(String email, Long gameId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        UserLibrary library = libraryRepository.findByUserIdAndGameId(user.getId(), gameId)
                .orElseThrow(() -> new ResourceNotFoundException("No tienes este juego en tu biblioteca"));

        library.setIsInstalled(false);
        library = libraryRepository.save(library);

        return convertToDTO(library);
    }

    /**
     * Simular jugar (actualiza tiempo y última vez jugado)
     */
    @Transactional
    public LibraryGameDTO playGame(String email, Long gameId, Integer minutesPlayed) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        UserLibrary library = libraryRepository.findByUserIdAndGameId(user.getId(), gameId)
                .orElseThrow(() -> new ResourceNotFoundException("No tienes este juego en tu biblioteca"));

        library.setPlayTimeMinutes(library.getPlayTimeMinutes() + minutesPlayed);
        library.setLastPlayed(LocalDateTime.now());
        library.setIsInstalled(true); // Si juega, está instalado
        library = libraryRepository.save(library);

        return convertToDTO(library);
    }

    /**
     * Agregar juego a biblioteca (usado por PaymentService cuando se completa el pago)
     */
    @Transactional
    public void addGameToLibrary(User user, Game game, Order order, BigDecimal purchasePrice) {
        // Verificar si ya tiene el juego
        if (libraryRepository.existsByUserIdAndGameId(user.getId(), game.getId())) {
            return; // Ya lo tiene, no agregar duplicado
        }

        UserLibrary library = new UserLibrary();
        library.setUser(user);
        library.setGame(game);
        library.setOrder(order);
        library.setPurchasePrice(purchasePrice);
        library.setPlayTimeMinutes(0);
        library.setIsInstalled(false);

        libraryRepository.save(library);
    }

    // ==================== HELPERS ====================

    private LibraryGameDTO convertToDTO(UserLibrary library) {
        Game game = library.getGame();
        
        return LibraryGameDTO.builder()
                .id(library.getId())
                .gameId(game.getId())
                .gameTitle(game.getTitle())
                .gameImage(game.getHeaderImage())
                .gameCategory(game.getCategory() != null ? game.getCategory().name() : null)
                .gamePlatform(game.getPlatform() != null ? game.getPlatform().name() : null)
                .purchasePrice(library.getPurchasePrice())
                .playTimeMinutes(library.getPlayTimeMinutes())
                .playTimeFormatted(formatPlayTime(library.getPlayTimeMinutes()))
                .lastPlayed(library.getLastPlayed())
                .isInstalled(library.getIsInstalled())
                .acquiredAt(library.getAcquiredAt())
                .orderId(library.getOrder() != null ? library.getOrder().getId() : null)
                .build();
    }

    private String formatPlayTime(Integer minutes) {
        if (minutes == null || minutes == 0) {
            return "Sin jugar";
        }
        
        int hours = minutes / 60;
        int mins = minutes % 60;
        
        if (hours > 0) {
            return hours + "h " + mins + "m";
        } else {
            return mins + " minutos";
        }
    }
}

