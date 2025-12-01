package com.nexus.marketplace.service;

import com.nexus.marketplace.domain.*;
import com.nexus.marketplace.dto.post.*;
import com.nexus.marketplace.dto.user.UserDTO;
import com.nexus.marketplace.exception.ResourceNotFoundException;
import com.nexus.marketplace.exception.UnauthorizedException;
import com.nexus.marketplace.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CommunityService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostMediaRepository postMediaRepository;

    @Autowired
    private PostCommentRepository postCommentRepository;

    @Autowired
    private PostLikeRepository postLikeRepository;

    @Autowired
    private UserRepository userRepository;

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    // ==================== POSTS ====================

    @Transactional(readOnly = true)
    public Page<PostDTO> getAllPosts(int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByActiveTrueOrderByCreatedAtDesc(pageable);

        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        return posts.map(post -> convertToDTO(post, currentUser));
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getPopularPosts(int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findPopularPosts(pageable);

        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        return posts.map(post -> convertToDTO(post, currentUser));
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> searchPosts(String query, int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.searchPosts(query, pageable);

        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        return posts.map(post -> convertToDTO(post, currentUser));
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getUserPosts(Long userId, int page, int size, String email) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Post> posts = postRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId, pageable);

        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        return posts.map(post -> convertToDTO(post, currentUser));
    }

    @Transactional
    public PostDTO getPostById(Long id, String email) {
        Post post = postRepository.findByIdWithUser(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post no encontrado"));

        // Incrementar contador de vistas
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);

        User currentUser = email != null ? userRepository.findByEmail(email).orElse(null) : null;

        return convertToDTO(post, currentUser);
    }

    @Transactional
    public PostDTO createPost(String email, CreatePostRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        Post post = new Post();
        post.setUser(user);
        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setActive(true);
        post.setViewCount(0);
        post.setLikeCount(0);
        post.setCommentCount(0);

        post = postRepository.save(post);

        return convertToDTO(post, user);
    }

    @Transactional
    public PostDTO updatePost(Long id, String email, UpdatePostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post no encontrado"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Verificar que el usuario sea el dueño del post
        if (!post.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para editar este post");
        }

        if (request.getTitle() != null && !request.getTitle().isEmpty()) {
            post.setTitle(request.getTitle());
        }

        if (request.getContent() != null && !request.getContent().isEmpty()) {
            post.setContent(request.getContent());
        }

        post = postRepository.save(post);

        return convertToDTO(post, user);
    }

    @Transactional
    public void deletePost(Long id, String email) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Post no encontrado"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Verificar que el usuario sea el dueño del post o admin
        if (!post.getUser().getId().equals(user.getId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new UnauthorizedException("No tienes permiso para eliminar este post");
        }

        post.setActive(false);
        postRepository.save(post);
    }

    // ==================== MEDIA ====================

    @Transactional
    public PostDTO uploadMedia(Long postId, String email, MultipartFile file, String mediaType) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post no encontrado"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Verificar que el usuario sea el dueño del post
        if (!post.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para subir archivos a este post");
        }

        // Validar tipo de archivo
        String contentType = file.getContentType();
        PostMedia.MediaType type;

        if (mediaType.equals("IMAGE")) {
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("El archivo debe ser una imagen");
            }
            type = PostMedia.MediaType.IMAGE;
        } else if (mediaType.equals("VIDEO")) {
            if (contentType == null || !contentType.startsWith("video/")) {
                throw new RuntimeException("El archivo debe ser un video");
            }
            type = PostMedia.MediaType.VIDEO;
        } else {
            throw new RuntimeException("Tipo de media inválido");
        }

        // Guardar archivo
        String fileName = saveFile(file);
        String fileUrl = "/uploads/" + fileName;

        // Crear registro de media
        PostMedia media = new PostMedia();
        media.setPost(post);
        media.setMediaUrl(fileUrl);
        media.setMediaType(type);
        media.setDisplayOrder(post.getMedia().size());

        postMediaRepository.save(media);

        // Si es la primera imagen, establecerla como imagen principal del post
        if (type == PostMedia.MediaType.IMAGE && post.getImageUrl() == null) {
            post.setImageUrl(fileUrl);
            postRepository.save(post);
        }

        return convertToDTO(post, user);
    }

    @Transactional
    public void deleteMedia(Long postId, Long mediaId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post no encontrado"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        if (!post.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("No tienes permiso para eliminar media de este post");
        }

        PostMedia media = postMediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media no encontrada"));

        if (!media.getPost().getId().equals(postId)) {
            throw new RuntimeException("El media no pertenece a este post");
        }

        // Eliminar archivo físico
        deleteFile(media.getMediaUrl());

        // Si era la imagen principal, limpiarla
        if (post.getImageUrl() != null && post.getImageUrl().equals(media.getMediaUrl())) {
            post.setImageUrl(null);
            postRepository.save(post);
        }

        postMediaRepository.delete(media);
    }

    // ==================== COMMENTS ====================

    @Transactional(readOnly = true)
    public List<PostCommentDTO> getPostComments(Long postId) {
        List<PostComment> comments = postCommentRepository
                .findByPostIdAndActiveTrueOrderByCreatedAtDesc(postId);

        return comments.stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PostCommentDTO createComment(Long postId, String email, CreateCommentRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post no encontrado"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        PostComment comment = new PostComment();
        comment.setPost(post);
        comment.setUser(user);
        comment.setContent(request.getContent());
        comment.setActive(true);

        comment = postCommentRepository.save(comment);

        // Actualizar contador de comentarios
        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return convertCommentToDTO(comment);
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, String email) {
        PostComment comment = postCommentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comentario no encontrado"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        // Verificar que el usuario sea el dueño del comentario o admin
        if (!comment.getUser().getId().equals(user.getId()) && user.getRole() != User.UserRole.ADMIN) {
            throw new UnauthorizedException("No tienes permiso para eliminar este comentario");
        }

        comment.setActive(false);
        postCommentRepository.save(comment);

        // Actualizar contador
        Post post = comment.getPost();
        post.setCommentCount(Math.max(0, post.getCommentCount() - 1));
        postRepository.save(post);
    }

    // ==================== LIKES ====================

    @Transactional
    public PostDTO toggleLike(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post no encontrado"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        PostLike existingLike = postLikeRepository.findByPostIdAndUserId(postId, user.getId())
                .orElse(null);

        if (existingLike != null) {
            // Unlike
            postLikeRepository.delete(existingLike);
            post.setLikeCount(Math.max(0, post.getLikeCount() - 1));
        } else {
            // Like
            PostLike like = new PostLike();
            like.setPost(post);
            like.setUser(user);
            postLikeRepository.save(like);
            post.setLikeCount(post.getLikeCount() + 1);
        }

        post = postRepository.save(post);

        return convertToDTO(post, user);
    }

    // ==================== HELPERS ====================

    private String saveFile(MultipartFile file) {
        try {
            // Crear directorio si no existe
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generar nombre único
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename != null && originalFilename.contains(".")
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : "";
            String fileName = UUID.randomUUID().toString() + extension;

            // Guardar archivo
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return fileName;

        } catch (IOException e) {
            throw
                    new RuntimeException("Error al guardar el archivo: " + e.getMessage());
        }
    }
    private void deleteFile(String fileUrl) {
        try {
            if (fileUrl != null && fileUrl.startsWith("/uploads/")) {
                String fileName = fileUrl.substring("/uploads/".length());
                Path filePath = Paths.get(uploadDir).resolve(fileName);
                Files.deleteIfExists(filePath);
            }
        } catch (IOException e) {
            System.err.println("Error al eliminar archivo: " + e.getMessage());
        }
    }

    private PostDTO convertToDTO(Post post, User currentUser) {
        // Cargar comentarios
        List<PostCommentDTO> comments = postCommentRepository
                .findByPostIdAndActiveTrueOrderByCreatedAtDesc(post.getId())
                .stream()
                .map(this::convertCommentToDTO)
                .collect(Collectors.toList());

        // Cargar media
        List<PostMediaDTO> media = postMediaRepository
                .findByPostIdOrderByDisplayOrder(post.getId())
                .stream()
                .map(this::convertMediaToDTO)
                .collect(Collectors.toList());

        // Verificar si el usuario actual dio like
        boolean isLiked = currentUser != null &&
                postLikeRepository.existsByPostIdAndUserId(post.getId(), currentUser.getId());

        return PostDTO.builder()
                .id(post.getId())
                .user(convertUserToDTO(post.getUser()))
                .title(post.getTitle())
                .content(post.getContent())
                .imageUrl(post.getImageUrl())
                .viewCount(post.getViewCount())
                .likeCount(post.getLikeCount())
                .commentCount(post.getCommentCount())
                .isLikedByCurrentUser(isLiked)
                .media(media)
                .comments(comments)
                .createdAt(post.getCreatedAt())
                .updatedAt(post.getUpdatedAt())
                .build();
    }

    private PostMediaDTO convertMediaToDTO(PostMedia media) {
        return PostMediaDTO.builder()
                .id(media.getId())
                .mediaUrl(media.getMediaUrl())
                .mediaType(media.getMediaType().name())
                .displayOrder(media.getDisplayOrder())
                .build();
    }

    private PostCommentDTO convertCommentToDTO(PostComment comment) {
        return PostCommentDTO.builder()
                .id(comment.getId())
                .user(convertUserToDTO(comment.getUser()))
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }

    private UserDTO convertUserToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
}