package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.dto.user.UserProfileResponse;
import com.nexus.marketplace.dto.user.UserStatsDTO;
import com.nexus.marketplace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Administración", description = "Endpoints para gestión administrativa del sistema")
public class AdminController {

    @Autowired
    private UserService userService;

    @GetMapping("/users")
    @Operation(
            summary = "Listar todos los usuarios",
            description = "Obtiene una lista paginada de todos los usuarios del sistema con filtros de ordenamiento"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de usuarios obtenida exitosamente"),
            @ApiResponse(responseCode = "403", description = "No autorizado - requiere rol ADMIN")
    })
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @Parameter(description = "Número de página (empieza en 0)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Cantidad de elementos por página")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Campo por el cual ordenar")
            @RequestParam(defaultValue = "id") String sortBy,

            @Parameter(description = "Dirección del ordenamiento (asc/desc)")
            @RequestParam(defaultValue = "asc") String direction) {

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<UserDTO> users = userService.getAllUsers(pageable);

        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}")
    @Operation(
            summary = "Obtener usuario por ID",
            description = "Obtiene los detalles completos de un usuario específico"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado"),
            @ApiResponse(responseCode = "403", description = "No autorizado")
    })
    public ResponseEntity<UserDTO> getUserById(
            @Parameter(description = "ID del usuario")
            @PathVariable Long id) {

        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/toggle-status")
    @Operation(
            summary = "Activar/desactivar usuario",
            description = "Cambia el estado activo/inactivo de un usuario. No se puede desactivar al último admin activo."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estado actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "No se puede desactivar al último admin"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserDTO> toggleUserStatus(
            @Parameter(description = "ID del usuario")
            @PathVariable Long id) {

        UserDTO user = userService.toggleUserStatus(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/{id}/role")
    @Operation(
            summary = "Cambiar rol de usuario",
            description = "Cambia el rol de un usuario entre USER y ADMIN. No se puede cambiar el rol del último admin."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Rol actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Rol inválido o no se puede cambiar último admin"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserDTO> changeUserRole(
            @Parameter(description = "ID del usuario")
            @PathVariable Long id,

            @Parameter(description = "Nuevo rol (USER o ADMIN)")
            @RequestBody Map<String, String> request) {

        String newRole = request.get("role");
        if (newRole == null || newRole.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        UserDTO user = userService.changeUserRole(id, newRole);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    @Operation(
            summary = "Eliminar usuario",
            description = "Elimina permanentemente un usuario del sistema. No se puede eliminar al último admin."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Usuario eliminado exitosamente"),
            @ApiResponse(responseCode = "400", description = "No se puede eliminar al último admin"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<Map<String, String>> deleteUser(
            @Parameter(description = "ID del usuario")
            @PathVariable Long id) {

        userService.deleteUser(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Usuario eliminado exitosamente");
        response.put("userId", id.toString());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/users/search")
    @Operation(
            summary = "Buscar usuarios",
            description = "Busca usuarios por email, username o nombre completo"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Búsqueda realizada exitosamente")
    })
    public ResponseEntity<List<UserDTO>> searchUsers(
            @Parameter(description = "Término de búsqueda")
            @RequestParam String q) {

        List<UserDTO> users = userService.searchUsers(q);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/{id}/profile")
    @Operation(
            summary = "Obtener información extendida del usuario",
            description = "Devuelve el resumen utilizado por el panel de perfil (estadísticas, pedidos recientes, logros, etc.)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Perfil obtenido correctamente"),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado")
    })
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @Parameter(description = "ID del usuario a consultar")
            @PathVariable Long id) {

        UserProfileResponse profile = userService.getUserProfile(id);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/stats")
    @Operation(
            summary = "Obtener estadísticas del sistema",
            description = "Obtiene estadísticas generales sobre usuarios (total, activos, admins, etc.)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estadísticas obtenidas exitosamente")
    })
    public ResponseEntity<UserStatsDTO> getStats() {
        UserStatsDTO stats = userService.getStats();
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/health")
    @Operation(
            summary = "Health check del panel admin",
            description = "Verifica que el panel de administración esté funcionando correctamente"
    )
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "Admin Panel");
        health.put("timestamp", java.time.LocalDateTime.now());

        return ResponseEntity.ok(health);
    }
}