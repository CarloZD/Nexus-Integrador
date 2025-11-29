package com.nexus.marketplace.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// ChangePasswordRequest - Para cambiar contraseña
@Data
@NoArgsConstructor
@AllArgsConstructor
class ChangePasswordRequest {
    private String currentPassword;
    private String newPassword;
}