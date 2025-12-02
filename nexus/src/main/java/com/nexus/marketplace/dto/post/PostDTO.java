package com.nexus.marketplace.dto.post;


import com.nexus.marketplace.dto.user.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Long id;
    private UserDTO user;
    private String title;
    private String content;
    private String imageUrl;
    private Integer viewCount;
    private Integer likeCount;
    private Integer commentCount;
    private Boolean isLikedByCurrentUser;
    private List<PostMediaDTO> media;
    private List<PostCommentDTO> comments;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}