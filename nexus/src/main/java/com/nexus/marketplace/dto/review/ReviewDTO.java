package com.nexus.marketplace.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Long id;
    private Long userId;
    private String username;
    private String userAvatar;
    private Long gameId;
    private String gameTitle;
    private Integer rating;
    private String comment;
    private Integer helpful;
    private Boolean isOwnReview; // Si la review es del usuario actual
    private Boolean markedHelpful; // Si el usuario actual marcó como útil
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


