package com.nexus.marketplace.controller;

import com.nexus.marketplace.dto.post.*;
import com.nexus.marketplace.service.CommunityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/community")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
@SecurityRequirement(name = "bearer-jwt")
@Tag(name = "Comunidad", description = "Gestión de posts, comentarios y media de la comunidad")
public class CommunityController {

    @Autowired
    private CommunityService communityService;

    // ==================== POSTS ====================

    @GetMapping("/posts")
    @Operation(summary = "Obtener todos los posts", description = "Lista paginada de posts ordenados por fecha")
    public ResponseEntity<Page<PostDTO>> getAllPosts(
            @Parameter(description = "Número de página") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Tamaño de página") @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Page<PostDTO> posts = communityService.getAllPosts(page, size, email);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/popular")
    @Operation(summary = "Obtener posts populares", description = "Posts ordenados por likes y vistas")
    public ResponseEntity<Page<PostDTO>> getPopularPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Page<PostDTO> posts = communityService.getPopularPosts(page, size, email);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/search")
    @Operation(summary = "Buscar posts", description = "Búsqueda de posts por título o contenido")
    public ResponseEntity<Page<PostDTO>> searchPosts(
            @Parameter(description = "Término de búsqueda") @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Page<PostDTO> posts = communityService.searchPosts(q, page, size, email);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/user/{userId}")
    @Operation(summary = "Obtener posts de un usuario", description = "Posts creados por un usuario específico")
    public ResponseEntity<Page<PostDTO>> getUserPosts(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        Page<PostDTO> posts = communityService.getUserPosts(userId, page, size, email);
        return ResponseEntity.ok(posts);
    }

    @GetMapping("/posts/{id}")
    @Operation(summary = "Obtener post por ID", description = "Detalles completos de un post")
    public ResponseEntity<PostDTO> getPostById(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication != null ? authentication.getName() : null;
        PostDTO post = communityService.getPostById(id, email);
        return ResponseEntity.ok(post);
    }

    @PostMapping("/posts")
    @Operation(summary = "Crear nuevo post", description = "Crea un nuevo post en la comunidad")
    public ResponseEntity<PostDTO> createPost(
            @Valid @RequestBody CreatePostRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        PostDTO post = communityService.createPost(email, request);
        return ResponseEntity.ok(post);
    }

    @PutMapping("/posts/{id}")
    @Operation(summary = "Actualizar post", description = "Edita un post existente")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePostRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        PostDTO post = communityService.updatePost(id, email, request);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{id}")
    @Operation(summary = "Eliminar post", description = "Elimina un post (soft delete)")
    public ResponseEntity<Map<String, String>> deletePost(
            @PathVariable Long id,
            Authentication authentication) {

        String email = authentication.getName();
        communityService.deletePost(id, email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Post eliminado exitosamente");
        return ResponseEntity.ok(response);
    }

    // ==================== MEDIA ====================

    @PostMapping("/posts/{postId}/media")
    @Operation(summary = "Subir imagen/video", description = "Agrega una imagen o video a un post")
    public ResponseEntity<PostDTO> uploadMedia(
            @PathVariable Long postId,
            @Parameter(description = "Archivo de imagen o video") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Tipo de media: IMAGE o VIDEO") @RequestParam String mediaType,
            Authentication authentication) {

        String email = authentication.getName();
        PostDTO post = communityService.uploadMedia(postId, email, file, mediaType);
        return ResponseEntity.ok(post);
    }

    @DeleteMapping("/posts/{postId}/media/{mediaId}")
    @Operation(summary = "Eliminar media", description = "Elimina una imagen o video de un post")
    public ResponseEntity<Map<String, String>> deleteMedia(
            @PathVariable Long postId,
            @PathVariable Long mediaId,
            Authentication authentication) {

        String email = authentication.getName();
        communityService.deleteMedia(postId, mediaId, email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Media eliminada exitosamente");
        return ResponseEntity.ok(response);
    }

    // ==================== COMMENTS ====================

    @GetMapping("/posts/{postId}/comments")
    @Operation(summary = "Obtener comentarios", description = "Lista de comentarios de un post")
    public ResponseEntity<List<PostCommentDTO>> getPostComments(@PathVariable Long postId) {
        List<PostCommentDTO> comments = communityService.getPostComments(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping("/posts/{postId}/comments")
    @Operation(summary = "Crear comentario", description = "Agrega un comentario a un post")
    public ResponseEntity<PostCommentDTO> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CreateCommentRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        PostCommentDTO comment = communityService.createComment(postId, email, request);
        return ResponseEntity.ok(comment);
    }

    @DeleteMapping("/posts/{postId}/comments/{commentId}")
    @Operation(summary = "Eliminar comentario", description = "Elimina un comentario de un post")
    public ResponseEntity<Map<String, String>> deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Authentication authentication) {

        String email = authentication.getName();
        communityService.deleteComment(postId, commentId, email);

        Map<String, String> response = new HashMap<>();
        response.put("message", "Comentario eliminado exitosamente");
        return ResponseEntity.ok(response);
    }

    // ==================== LIKES ====================

    @PostMapping("/posts/{postId}/like")
    @Operation(summary = "Dar/Quitar like", description = "Toggle like en un post")
    public ResponseEntity<PostDTO> toggleLike(
            @PathVariable Long postId,
            Authentication authentication) {

        String email = authentication.getName();
        PostDTO post = communityService.toggleLike(postId, email);
        return ResponseEntity.ok(post);
    }
}