package com.nexus.marketplace.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    /**
     * Guarda un archivo en el directorio de uploads y retorna el nombre del archivo
     * @param file Archivo a guardar
     * @return Nombre del archivo guardado
     */
    public String saveFile(MultipartFile file) {
        try {
            // Crear el directorio si no existe
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                System.out.println("✅ Created upload directory: " + uploadPath.toAbsolutePath());
            }

            // Validar el archivo
            if (file.isEmpty()) {
                throw new RuntimeException("El archivo está vacío");
            }

            // Validar que sea una imagen
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                throw new RuntimeException("El archivo debe ser una imagen");
            }

            // Validar tamaño (máximo 5MB)
            if (file.getSize() > 5 * 1024 * 1024) {
                throw new RuntimeException("El archivo no debe superar 5MB");
            }

            // Obtener extensión del archivo
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // Generar nombre único
            String fileName = UUID.randomUUID().toString() + extension;
            Path filePath = uploadPath.resolve(fileName);

            // Guardar el archivo
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Verificar que el archivo se guardó correctamente
            if (!Files.exists(filePath)) {
                throw new RuntimeException("Error al guardar el archivo");
            }

            System.out.println("✅ File saved: " + fileName);
            System.out.println("✅ File path: " + filePath.toAbsolutePath());

            return fileName;
        } catch (IOException e) {
            throw new RuntimeException("Error al guardar el archivo: " + e.getMessage(), e);
        }
    }

    /**
     * Elimina un archivo del directorio de uploads
     * @param fileName Nombre del archivo a eliminar
     */
    public void deleteFile(String fileName) {
        try {
            if (fileName == null || fileName.isEmpty()) {
                return;
            }

            // Extraer solo el nombre del archivo si viene con ruta
            String cleanFileName = fileName;
            if (fileName.contains("/")) {
                cleanFileName = fileName.substring(fileName.lastIndexOf("/") + 1);
            }

            Path filePath = Paths.get(uploadDir).resolve(cleanFileName);
            
            if (Files.exists(filePath)) {
                Files.delete(filePath);
                System.out.println("✅ File deleted: " + cleanFileName);
            }
        } catch (IOException e) {
            System.err.println("Error al eliminar el archivo: " + e.getMessage());
        }
    }
}
