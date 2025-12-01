package com.nexus.marketplace.dto.library;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LibraryStatsDTO {
    private Long totalGames;
    private Long installedGames;
    private String totalPlayTime; // Formato legible
    private Long totalPlayTimeMinutes;
    private BigDecimal totalSpent;
}


