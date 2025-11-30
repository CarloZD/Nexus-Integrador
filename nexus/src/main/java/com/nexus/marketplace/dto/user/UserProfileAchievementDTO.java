package com.nexus.marketplace.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileAchievementDTO {
    private Long id;
    private String title;
    private String detail;
    private Integer progress;
}

