package com.nexus.marketplace.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Crear el directorio si no existe
        File uploadDirectory = new File(uploadDir);
        if (!uploadDirectory.exists()) {
            boolean created = uploadDirectory.mkdirs();
            System.out.println("Upload directory created: " + created);
            System.out.println("Upload directory path: " + uploadDirectory.getAbsolutePath());
        }

        // Normalizar la ruta y agregar file: protocol
        String absolutePath = uploadDirectory.getAbsolutePath().replace("\\", "/");
        if (!absolutePath.endsWith("/")) {
            absolutePath += "/";
        }
        String uploadPath = "file:///" + absolutePath;

        System.out.println("===========================================");
        System.out.println("Upload directory exists: " + uploadDirectory.exists());
        System.out.println("Upload directory writable: " + uploadDirectory.canWrite());
        System.out.println("Serving static files from: " + uploadPath);
        System.out.println("Accessible at: http://localhost:8080/uploads/");
        System.out.println("===========================================");

        // Configurar el handler para servir los archivos
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath);
    }
}