package com.nexus.marketplace.service;


import com.nexus.marketplace.domain.User;
import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.dto.user.UserProfileAchievementDTO;
import com.nexus.marketplace.dto.user.UserProfileOrderDTO;
import com.nexus.marketplace.dto.user.UserProfileResponse;
import com.nexus.marketplace.dto.user.UserProfileStatDTO;
import com.nexus.marketplace.dto.user.UserStatsDTO;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Obtiene todos los usuarios con paginación
     */
    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::convertToDTO);
    }

    /**
     * Obtiene un usuario por ID
     */
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return convertToDTO(user);
    }

    /**
     * Obtiene un usuario por email
     */
    public UserDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        return convertToDTO(user);
    }

    /**
     * Activa o desactiva un usuario
     */
    @Transactional
    public UserDTO toggleUserStatus(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        // No permitir desactivar al último admin activo
        if (user.getActive() && user.getRole() == User.UserRole.ADMIN) {
            long activeAdmins = userRepository.findAll().stream()
                    .filter(u -> u.getActive() && u.getRole() == User.UserRole.ADMIN)
                    .count();

            if (activeAdmins <= 1) {
                throw new RuntimeException("No se puede desactivar al único administrador activo");
            }
        }

        user.setActive(!user.getActive());
        user = userRepository.save(user);

        return convertToDTO(user);
    }

    /**
     * Cambia el rol de un usuario
     */
    @Transactional
    public UserDTO changeUserRole(Long id, String newRole) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        // Validar el rol
        User.UserRole role;
        try {
            role = User.UserRole.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol inválido: " + newRole + ". Roles válidos: USER, ADMIN");
        }

        // Si está quitando rol ADMIN, verificar que no sea el último
        if (user.getRole() == User.UserRole.ADMIN && role != User.UserRole.ADMIN) {
            long adminCount = userRepository.countByRole(User.UserRole.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("No se puede cambiar el rol del único administrador");
            }
        }

        user.setRole(role);
        user = userRepository.save(user);

        return convertToDTO(user);
    }

    /**
     * Elimina un usuario
     */
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        // Verificar que no sea el último admin
        if (user.getRole() == User.UserRole.ADMIN) {
            long adminCount = userRepository.countByRole(User.UserRole.ADMIN);
            if (adminCount <= 1) {
                throw new RuntimeException("No se puede eliminar al único administrador del sistema");
            }
        }

        userRepository.delete(user);
    }

    /**
     * Busca usuarios por query (email, username o nombre)
     */
    public List<UserDTO> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return userRepository.findAll().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        return userRepository.searchUsers(query).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene estadísticas del sistema
     */
    public UserStatsDTO getStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long adminUsers = userRepository.countByRole(User.UserRole.ADMIN);

        return UserStatsDTO.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(totalUsers - activeUsers)
                .adminUsers(adminUsers)
                .regularUsers(totalUsers - adminUsers)
                .build();
    }

    /**
     * Obtiene información extendida para el dashboard de un usuario
     */
    public UserProfileResponse getUserProfile(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        return UserProfileResponse.builder()
                .user(convertToDTO(user))
                .stats(buildStats(user))
                .recentOrders(buildRecentOrders(user))
                .achievements(buildAchievements(user))
                .build();
    }

    private List<UserProfileStatDTO> buildStats(User user) {
        LocalDateTime createdAt = user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now().minusDays(30);
        long daysInPlatform = Math.max(1, ChronoUnit.DAYS.between(createdAt, LocalDateTime.now()));
        int purchases = (int) Math.max(1, daysInPlatform / 5);
        int hoursPlayed = (int) (daysInPlatform * 1.5);
        int achievements = Math.max(3, purchases / 2);

        return List.of(
                UserProfileStatDTO.builder()
                        .id("purchases")
                        .label("Juegos comprados")
                        .value(String.valueOf(purchases))
                        .sublabel("+2 este mes")
                        .build(),
                UserProfileStatDTO.builder()
                        .id("hours")
                        .label("Horas jugadas")
                        .value(hoursPlayed + "h")
                        .sublabel("Semana actual")
                        .build(),
                UserProfileStatDTO.builder()
                        .id("achievements")
                        .label("Logros")
                        .value(String.valueOf(achievements))
                        .sublabel("3 en progreso")
                        .build()
        );
    }

    private List<UserProfileOrderDTO> buildRecentOrders(User user) {
        return List.of(
                UserProfileOrderDTO.builder()
                        .id("ORD-" + (9000 + user.getId()))
                        .game("Stellar Odyssey")
                        .total(39.99)
                        .date("Hace 3 días")
                        .status("Entregado")
                        .build(),
                UserProfileOrderDTO.builder()
                        .id("ORD-" + (8990 + user.getId()))
                        .game("Legends Reborn")
                        .total(59.99)
                        .date("Hace 1 semana")
                        .status("En proceso")
                        .build()
        );
    }

    private List<UserProfileAchievementDTO> buildAchievements(User user) {
        long seed = user.getId() != null ? user.getId() : LocalDateTime.now().toEpochSecond(ZoneOffset.UTC);
        int progressOffset = (int) (seed % 20);

        return List.of(
                UserProfileAchievementDTO.builder()
                        .id(1L)
                        .title("Coleccionista")
                        .detail("10 juegos adquiridos")
                        .progress(60 + progressOffset)
                        .build(),
                UserProfileAchievementDTO.builder()
                        .id(2L)
                        .title("Maratón")
                        .detail("30 horas jugadas este mes")
                        .progress(35 + progressOffset)
                        .build(),
                UserProfileAchievementDTO.builder()
                        .id(3L)
                        .title("Crítico")
                        .detail("5 reseñas publicadas")
                        .progress(15 + progressOffset)
                        .build()
        );
    }

    /**
     * Convierte una entidad User a UserDTO
     */
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