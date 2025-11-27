package com.nexus.marketplace.dto.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameDTO {
    private Long id;
    private String steamAppId;
    private String title;
    private String description;
    private String shortDescription;
    private BigDecimal price;
    private String headerImage;
    private String backgroundImage;
    private String developer;
    private String publisher;
    private String releaseDate;
    private String genres;
    private String categories;
    private Boolean isFree;
    private Integer stock;
    private Boolean active;
}