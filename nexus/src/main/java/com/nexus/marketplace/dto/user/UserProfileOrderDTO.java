package com.nexus.marketplace.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileOrderDTO {
    private String id;
    private String game;
    private Double total;
    private String date;
    private String status;
}

