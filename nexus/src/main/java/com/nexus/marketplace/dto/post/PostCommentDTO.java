package com.nexus.marketplace.dto.post;


import com.nexus.marketplace.dto.user.UserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostCommentDTO {
    private Long id;
    private UserDTO user;
    private String content;
    private LocalDateTime createdAt;
}