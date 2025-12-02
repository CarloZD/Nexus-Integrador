package com.nexus.marketplace.dto.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameImageDTO {
    private Long id;
    private Long gameId;
    private String imageUrl;
    private String imageType;
    private Integer displayOrder;
}




