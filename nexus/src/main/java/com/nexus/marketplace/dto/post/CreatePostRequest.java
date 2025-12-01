package com.nexus.marketplace.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreatePostRequest {

    @NotBlank(message = "El título es requerido")
    @Size(min = 5, max = 200, message = "El título debe tener entre 5 y 200 caracteres")
    private String title;

    @NotBlank(message = "El contenido es requerido")
    @Size(min = 10, message = "El contenido debe tener al menos 10 caracteres")
    private String content;
}