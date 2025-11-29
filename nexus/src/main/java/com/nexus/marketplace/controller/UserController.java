package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.dto.user.UserProfileDTO;
import com.nexus.marketplace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileDTO> getProfile(Authentication authentication) {
        try {
            String email = authentication.getName();
            UserProfileDTO profile = userService.getUserProfile(email);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            Authentication authentication,
            @RequestBody Map<String, String> updates) {
        try {
            String email = authentication.getName();
            String username = updates.get("username");
            String fullName = updates.get("fullName");

            UserProfileDTO profile = userService.updateProfile(email, username, fullName);
            return ResponseEntity.ok(profile);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            Authentication authentication,
            @RequestBody Map<String, String> passwords) {
        try {
            String email = authentication.getName();
            String currentPassword = passwords.get("currentPassword");
            String newPassword = passwords.get("newPassword");

            userService.changePassword(email, currentPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/favorites/{gameId}")
    public ResponseEntity<?> addFavorite(
            Authentication authentication,
            @PathVariable Long gameId) {
        try {
            String email = authentication.getName();
            userService.addFavorite(email, gameId);
            return ResponseEntity.ok(Map.of("message", "Juego agregado a favoritos"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/favorites/{gameId}")
    public ResponseEntity<?> removeFavorite(
            Authentication authentication,
            @PathVariable Long gameId) {
        try {
            String email = authentication.getName();
            userService.removeFavorite(email, gameId);
            return ResponseEntity.ok(Map.of("message", "Juego eliminado de favoritos"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<GameDTO>> getFavorites(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<GameDTO> favorites = userService.getFavorites(email);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/favorites/{gameId}/check")
    public ResponseEntity<?> checkFavorite(
            Authentication authentication,
            @PathVariable Long gameId) {
        try {
            String email = authentication.getName();
            boolean isFavorite = userService.isFavorite(email, gameId);
            return ResponseEntity.ok(Map.of("isFavorite", isFavorite));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}