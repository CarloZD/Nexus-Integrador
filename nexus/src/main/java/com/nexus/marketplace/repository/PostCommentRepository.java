package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.PostComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostCommentRepository extends JpaRepository<PostComment, Long> {

    @Query("SELECT c FROM PostComment c LEFT JOIN FETCH c.user WHERE c.post.id = :postId AND c.active = true ORDER BY c.createdAt DESC")
    List<PostComment> findByPostIdAndActiveTrueOrderByCreatedAtDesc(Long postId);

    Page<PostComment> findByPostIdAndActiveTrueOrderByCreatedAtDesc(Long postId, Pageable pageable);

    long countByPostIdAndActiveTrue(Long postId);
}