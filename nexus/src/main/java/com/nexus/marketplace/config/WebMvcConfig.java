package com.nexus.marketplace.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;
import java.nio.file.Paths;

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
            System.out.println("===========================================");
            System.out.println("Upload directory created: " + created);
            System.out.println("Upload directory path: " + uploadDirectory.getAbsolutePath());
            System.out.println("===========================================");
        }

        // Obtener la ruta absoluta correctamente
        String absolutePath = Paths.get(uploadDir).toAbsolutePath().toString();

        // Normalizar la ruta para que funcione en Windows y Linux
        if (!absolutePath.endsWith(File.separator)) {
            absolutePath += File.separator;
        }

        // Convertir a formato file:/// URL
        String uploadPath = "file:///" + absolutePath.replace("\\", "/");

        System.out.println("===========================================");
        System.out.println("Upload directory exists: " + uploadDirectory.exists());
        System.out.println("Upload directory writable: " + uploadDirectory.canWrite());
        System.out.println("Serving static files from: " + uploadPath);
        System.out.println("Accessible at: http://localhost:8080/uploads/");
        System.out.println("===========================================");

        // Configurar el handler para servir los archivos
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadPath)
                .setCachePeriod(3600); // Cache por 1 hora
    }
}