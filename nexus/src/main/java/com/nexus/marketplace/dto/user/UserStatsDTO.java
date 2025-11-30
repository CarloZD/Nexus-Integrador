package com.nexus.marketplace.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDTO {
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long adminUsers;
    private Long regularUsers;
}