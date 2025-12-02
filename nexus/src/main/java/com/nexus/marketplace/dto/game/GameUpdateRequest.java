package com.nexus.marketplace.dto.game;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class GameUpdateRequest {
    
    @Size(max = 200, message = "El título no puede exceder 200 caracteres")
    private String title;

    @Size(max = 500, message = "La descripción corta no puede exceder 500 caracteres")
    private String shortDescription;

    private String description;

    @DecimalMin(value = "0.0", message = "El precio debe ser mayor o igual a 0")
    private BigDecimal price;

    private String category;
    private String platform;
    private BigDecimal rating;
    private String imageUrl;
    private String coverImageUrl;
    private Boolean featured;
    private String screenshots;
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

