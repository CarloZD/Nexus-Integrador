package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.game.GameDTO;
import com.nexus.marketplace.dto.game.GameCreateRequest;
import com.nexus.marketplace.dto.game.GameUpdateRequest;
import com.nexus.marketplace.dto.post.PostDTO;
import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.dto.user.UserProfileResponse;
import com.nexus.marketplace.dto.user.UserStatsDTO;
import com.nexus.marketplace.service.AuditService;
import com.nexus.marketplace.service.CommunityService;
import com.nexus.marketplace.service.GameService;
import com.nexus.marketplace.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
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

    @Autowired
    private GameService gameService;

    @Autowired
    private CommunityService communityService;

    @Autowired
    private AuditService auditService;

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

    // ==================== GESTIÓN DE JUEGOS ====================

    @GetMapping("/games")
    @Operation(
            summary = "Listar todos los juegos",
            description = "Obtiene todos los juegos del sistema (incluyendo inactivos)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de juegos obtenida exitosamente")
    })
    public ResponseEntity<List<GameDTO>> getAllGames() {
        List<GameDTO> games = gameService.getAllGamesIncludingInactive();
        return ResponseEntity.ok(games);
    }

    @PostMapping("/games")
    @Operation(
            summary = "Crear nuevo juego",
            description = "Crea un nuevo juego en el catálogo"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Juego creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Datos inválidos o Steam App ID duplicado")
    })
    public ResponseEntity<GameDTO> createGame(
            @Valid @RequestBody GameCreateRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        GameDTO game = gameService.createGame(request);
        
        // Registrar en auditoría
        Long adminId = getUserIdFromAuth(authentication);
        String ipAddress = getClientIpAddress(httpRequest);
        auditService.log(adminId, "GAME_CREATE", 
                String.format("Admin creó juego: %s (ID: %d)", game.getTitle(), game.getId()), 
                ipAddress);
        
        return ResponseEntity.ok(game);
    }

    @PutMapping("/games/{id}")
    @Operation(
            summary = "Actualizar juego",
            description = "Actualiza los datos de un juego existente"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Juego actualizado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Juego no encontrado")
    })
    public ResponseEntity<GameDTO> updateGame(
            @Parameter(description = "ID del juego")
            @PathVariable Long id,
            @Valid @RequestBody GameUpdateRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        GameDTO game = gameService.updateGame(id, request);
        
        // Registrar en auditoría
        Long adminId = getUserIdFromAuth(authentication);
        String ipAddress = getClientIpAddress(httpRequest);
        auditService.log(adminId, "GAME_UPDATE", 
                String.format("Admin actualizó juego: %s (ID: %d)", game.getTitle(), game.getId()), 
                ipAddress);
        
        return ResponseEntity.ok(game);
    }

    @DeleteMapping("/games/{id}")
    @Operation(
            summary = "Eliminar juego",
            description = "Elimina un juego del catálogo (soft delete)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Juego eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Juego no encontrado")
    })
    public ResponseEntity<Map<String, String>> deleteGame(
            @Parameter(description = "ID del juego")
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        GameDTO game = gameService.getGameById(id);
        gameService.deleteGame(id);
        
        // Registrar en auditoría
        Long adminId = getUserIdFromAuth(authentication);
        String ipAddress = getClientIpAddress(httpRequest);
        auditService.log(adminId, "GAME_DELETE", 
                String.format("Admin eliminó juego: %s (ID: %d)", game.getTitle(), game.getId()), 
                ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Juego eliminado exitosamente");
        response.put("gameId", id.toString());
        
        return ResponseEntity.ok(response);
    }

    // ==================== GESTIÓN DE POSTS Y COMENTARIOS ====================

    @GetMapping("/posts")
    @Operation(
            summary = "Listar todos los posts",
            description = "Obtiene todos los posts del sistema (incluyendo inactivos)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de posts obtenida exitosamente")
    })
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            @Parameter(description = "Número de página")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página")
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        
        String email = authentication.getName();
        Page<PostDTO> posts = communityService.getAllPostsIncludingInactive(page, size, email);
        return ResponseEntity.ok(posts);
    }

    @DeleteMapping("/posts/{id}")
    @Operation(
            summary = "Eliminar post (Admin)",
            description = "Elimina un post del sistema (solo admin)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Post eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Post no encontrado")
    })
    public ResponseEntity<Map<String, String>> deletePost(
            @Parameter(description = "ID del post")
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        communityService.deletePostAsAdmin(id);
        
        // Registrar en auditoría
        Long adminId = getUserIdFromAuth(authentication);
        String ipAddress = getClientIpAddress(httpRequest);
        auditService.log(adminId, "POST_DELETE", 
                String.format("Admin eliminó post ID: %d", id), 
                ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Post eliminado exitosamente");
        response.put("postId", id.toString());
        
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    @Operation(
            summary = "Eliminar comentario (Admin)",
            description = "Elimina un comentario de un post (solo admin)"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Comentario eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Comentario no encontrado")
    })
    public ResponseEntity<Map<String, String>> deleteComment(
            @Parameter(description = "ID del post")
            @PathVariable Long postId,
            @Parameter(description = "ID del comentario")
            @PathVariable Long commentId,
            Authentication authentication,
            HttpServletRequest httpRequest) {
        
        communityService.deleteCommentAsAdmin(postId, commentId);
        
        // Registrar en auditoría
        Long adminId = getUserIdFromAuth(authentication);
        String ipAddress = getClientIpAddress(httpRequest);
        auditService.log(adminId, "COMMENT_DELETE", 
                String.format("Admin eliminó comentario ID: %d del post ID: %d", commentId, postId), 
                ipAddress);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "Comentario eliminado exitosamente");
        response.put("commentId", commentId.toString());
        
        return ResponseEntity.ok(response);
    }

    // ==================== AUDITORÍA ====================

    @GetMapping("/audit-logs")
    @Operation(
            summary = "Obtener logs de auditoría",
            description = "Obtiene los últimos logs de auditoría del sistema"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Logs obtenidos exitosamente")
    })
    public ResponseEntity<List<Map<String, Object>>> getAuditLogs(
            @Parameter(description = "Número de logs a obtener")
            @RequestParam(defaultValue = "100") int limit) {
        
        List<Map<String, Object>> logs = auditService.getRecentLogs(limit);
        return ResponseEntity.ok(logs);
    }

    // ==================== HELPERS ====================

    private Long getUserIdFromAuth(Authentication authentication) {
        if (authentication == null) return null;
        String email = authentication.getName();
        try {
            return userService.getUserByEmail(email).getId();
        } catch (Exception e) {
            return null;
        }
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }
        return request.getRemoteAddr();
    }
}