package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.user.ChangePasswordRequest;
import com.nexus.marketplace.dto.user.UpdateProfileRequest;
import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Perfil", description = "Gestión del perfil de usuario")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    @GetMapping
    public ResponseEntity<UserDTO> getProfile(Authentication authentication) {
        String email = authentication.getName();
        UserDTO profile = profileService.getProfile(email);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<UserDTO> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        UserDTO updated = profileService.updateProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/password")
    public ResponseEntity<String> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String email = authentication.getName();
        profileService.changePassword(email, request);
        return ResponseEntity.ok("Contraseña actualizada exitosamente");
    }

    @DeleteMapping
    public ResponseEntity<String> deleteAccount(Authentication authentication) {
        String email = authentication.getName();
        profileService.deleteAccount(email);
        return ResponseEntity.ok("Cuenta eliminada exitosamente");
    }

    @PostMapping("/avatar")
    @Operation(summary = "Subir foto de perfil", description = "Permite al usuario subir o actualizar su foto de perfil")
    public ResponseEntity<UserDTO> uploadAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String email = authentication.getName();
        UserDTO updated = profileService.uploadAvatar(email, file);
        return ResponseEntity.ok(updated);
    }
}