package com.nexus.marketplace.dto.library;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryGameDTO {
    private Long id;
    private Long gameId;
    private String gameTitle;
    private String gameImage;
    private String gameCategory;
    private String gamePlatform;
    private BigDecimal purchasePrice;
    private Integer playTimeMinutes;
    private String playTimeFormatted; // "5h 30m"
    private LocalDateTime lastPlayed;
    private Boolean isInstalled;
    private LocalDateTime acquiredAt;
    private Long orderId;
}


