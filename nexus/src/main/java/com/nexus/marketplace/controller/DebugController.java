package com.nexus.marketplace.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class DebugController {

    @Value("${file.upload-dir:uploads/}")
    private String uploadDir;

    @GetMapping("/uploads-info")
    public ResponseEntity<Map<String, Object>> getUploadsInfo() {
        Map<String, Object> info = new HashMap<>();

        try {
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
            File uploadDirectory = uploadPath.toFile();

            info.put("uploadDir", uploadDir);
            info.put("absolutePath", uploadPath.toString());
            info.put("exists", uploadDirectory.exists());
            info.put("isDirectory", uploadDirectory.isDirectory());
            info.put("canRead", uploadDirectory.canRead());
            info.put("canWrite", uploadDirectory.canWrite());

            if (uploadDirectory.exists()) {
                File[] files = uploadDirectory.listFiles();
                if (files != null) {
                    List<Map<String, Object>> fileList = Arrays.stream(files)
                            .map(f -> {
                                Map<String, Object> fileInfo = new HashMap<>();
                                fileInfo.put("name", f.getName());
                                fileInfo.put("size", f.length());
                                fileInfo.put("url", "/uploads/" + f.getName());
                                return fileInfo;
                            })
                            .collect(Collectors.toList());

                    info.put("fileCount", files.length);
                    info.put("files", fileList);
                } else {
                    info.put("fileCount", 0);
                    info.put("files", new ArrayList<>());
                }
            }

            return ResponseEntity.ok(info);

        } catch (Exception e) {
            info.put("error", e.getMessage());
            return ResponseEntity.ok(info);
        }
    }
}