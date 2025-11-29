package com.nexus.marketplace.dto.user;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequest {

    @Size(min = 3, max = 20, message = "El username debe tener entre 3 y 20 caracteres")
    private String username;

    @Size(min = 2, max = 200, message = "El nombre completo debe tener entre 2 y 200 caracteres")
    private String fullName;
}