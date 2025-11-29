package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.Game;
import com.nexus.marketplace.domain.User;
import com.nexus.marketplace.domain.UserFavorite;
import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.dto.user.UserProfileDTO;
import com.nexus.marketplace.repository.GameRepository;
import com.nexus.marketplace.repository.UserFavoriteRepository;
import com.nexus.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFavoriteRepository favoriteRepository;

    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserProfileDTO getUserProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        long favoritesCount = favoriteRepository.countByUserId(user.getId());

        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .favoritesCount((int) favoritesCount)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public UserProfileDTO updateProfile(String email, String username, String fullName) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (username != null && !username.equals(user.getUsername())) {
            if (userRepository.existsByUsername(username)) {
                throw new RuntimeException("El username ya está en uso");
            }
            user.setUsername(username);
        }

        if (fullName != null) {
            user.setFullName(fullName);
        }

        user = userRepository.save(user);

        long favoritesCount = favoriteRepository.countByUserId(user.getId());

        return UserProfileDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .favoritesCount((int) favoritesCount)
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Contraseña actual incorrecta");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public void addFavorite(String email, Long gameId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new RuntimeException("Juego no encontrado"));

        if (favoriteRepository.existsByUserIdAndGameId(user.getId(), gameId)) {
            throw new RuntimeException("El juego ya está en favoritos");
        }

        UserFavorite favorite = new UserFavorite();
        favorite.setUser(user);
        favorite.setGame(game);

        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String email, Long gameId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        favoriteRepository.deleteByUserIdAndGameId(user.getId(), gameId);
    }

    public List<GameDTO> getFavorites(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        List<UserFavorite> favorites = favoriteRepository.findByUserId(user.getId());

        return favorites.stream()
                .map(fav -> convertGameToDTO(fav.getGame()))
                .collect(Collectors.toList());
    }

    public boolean isFavorite(String email, Long gameId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        return favoriteRepository.existsByUserIdAndGameId(user.getId(), gameId);
    }

    private GameDTO convertGameToDTO(Game game) {
        return GameDTO.builder()
                .id(game.getId())
                .steamAppId(game.getSteamAppId())
                .title(game.getTitle())
                .description(game.getDescription())
                .shortDescription(game.getShortDescription())
                .price(game.getPrice())
                .headerImage(game.getHeaderImage())
                .backgroundImage(game.getBackgroundImage())
                .developer(game.getDeveloper())
                .publisher(game.getPublisher())
                .releaseDate(game.getReleaseDate())
                .genres(game.getGenres())
                .categories(game.getCategories())
                .isFree(game.getIsFree())
                .stock(game.getStock())
                .active(game.getActive())
                .build();
    }
}