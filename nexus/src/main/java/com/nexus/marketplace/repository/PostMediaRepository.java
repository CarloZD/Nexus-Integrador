package com.nexus.marketplace.repository;

import com.nexus.marketplace.domain.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {

    List<PostMedia> findByPostIdOrderByDisplayOrder(Long postId);

    void deleteByPostId(Long postId);
}