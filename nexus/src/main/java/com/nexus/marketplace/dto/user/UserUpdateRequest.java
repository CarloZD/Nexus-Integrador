package com.nexus.marketplace.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


// UserUpdateRequest - Para actualizar datos del usuario
@Data
@NoArgsConstructor
@AllArgsConstructor
class UserUpdateRequest {
    private String username;
    private String fullName;
    private String avatarUrl;
}

