package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.User;
import com.nexus.marketplace.dto.user.ChangePasswordRequest;
import com.nexus.marketplace.dto.user.UpdateProfileRequest;
import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.exception.UnauthorizedException;
import com.nexus.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProfileService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public UserDTO getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        return convertToDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Actualizar username si se proporciona y es diferente
        if (request.getUsername() != null && !request.getUsername().equals(user.getUsername())) {
            // Verificar que el nuevo username no esté en uso
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new RuntimeException("El username ya está en uso");
            }
            user.setUsername(request.getUsername());
        }

        // Actualizar nombre completo si se proporciona
        if (request.getFullName() != null && !request.getFullName().isEmpty()) {
            user.setFullName(request.getFullName());
        }

        user = userRepository.save(user);
        return convertToDTO(user);
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Verificar que la contraseña actual sea correcta
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new UnauthorizedException("La contraseña actual es incorrecta");
        }

        // Actualizar contraseña
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Desactivar cuenta en lugar de eliminarla (soft delete)
        user.setActive(false);
        userRepository.save(user);
    }

    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .active(user.getActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}