package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.user.ChangePasswordRequest;
import com.nexus.marketplace.dto.user.UpdateProfileRequest;
import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
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
}