package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    Page<Post> findByActiveTrueOrderByCreatedAtDesc(Pageable pageable);

    Page<Post> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.active = true AND " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.content) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "ORDER BY p.createdAt DESC")
    Page<Post> searchPosts(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Post p WHERE p.active = true ORDER BY p.likeCount DESC, p.createdAt DESC")
    Page<Post> findPopularPosts(Pageable pageable);

    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.user WHERE p.id = :id AND p.active = true")
    Optional<Post> findByIdWithUser(@Param("id") Long id);

    List<Post> findTop5ByActiveTrueOrderByCreatedAtDesc();

    Page<Post> findAllByOrderByCreatedAtDesc(Pageable pageable);
}