package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.dto.user.UserStatsDTO;
import com.nexus.marketplace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administración", description = "Endpoints para administradores")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    @Operation(summary = "Listar usuarios", description = "Obtiene lista paginada de todos los usuarios")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserDTO> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Obtener usuario por ID", description = "Obtiene los detalles de un usuario específico")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/toggle-status")
    @Operation(summary = "Activar/desactivar usuario", description = "Cambia el estado activo de un usuario")
    public ResponseEntity<UserDTO> toggleUserStatus(@PathVariable Long id) {
        UserDTO user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Cambiar rol de usuario", description = "Cambia el rol de un usuario (USER/ADMIN)")
    public ResponseEntity<UserDTO> changeUserRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String newRole = request.get("role");
        UserDTO user = userService.changeUserRole(id, newRole);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Eliminar usuario", description = "Elimina un usuario del sistema")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.ok("Usuario eliminado exitosamente");
    }

    @GetMapping("/users/search")
    @Operation(summary = "Buscar usuarios", description = "Busca usuarios por email, username o nombre")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String q) {
        List<UserDTO> users = userService.searchUsers(q);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/stats")
    @Operation(summary = "Estadísticas", description = "Obtiene estadísticas generales del sistema")
    public ResponseEntity<UserStatsDTO> getStats() {
        UserStatsDTO stats = userService.getStats();
        return ResponseEntity.ok(stats);
    }
}