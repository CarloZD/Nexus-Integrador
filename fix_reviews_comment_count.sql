-- Script para corregir el campo comment_count en la tabla reviews
-- Ejecuta este script en tu base de datos MySQL/MariaDB

USE nexus_db;

-- Agregar valor por defecto al campo comment_count
ALTER TABLE `reviews` 
MODIFY COLUMN `comment_count` int(11) NOT NULL DEFAULT 0;

-- Verificar que el cambio se aplicó correctamente
DESCRIBE reviews;

