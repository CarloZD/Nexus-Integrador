package com.nexus.marketplace.dto.post;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PostMediaDTO {
    private Long id;
    private String mediaUrl;
    private String mediaType;
    private Integer displayOrder;
}