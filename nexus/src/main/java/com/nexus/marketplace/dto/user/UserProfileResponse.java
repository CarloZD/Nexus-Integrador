package com.nexus.marketplace.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private UserDTO user;
    private List<UserProfileStatDTO> stats;
    private List<UserProfileOrderDTO> recentOrders;
    private List<UserProfileAchievementDTO> achievements;
}

