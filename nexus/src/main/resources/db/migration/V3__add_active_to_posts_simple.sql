-- =====================================================
-- SCRIPT SQL SIMPLE: Agregar columna 'active' a la tabla posts
-- Ejecutar en nexus_db
-- Si la columna ya existe, este script dará error pero es seguro ignorarlo
-- =====================================================

-- Agregar columna 'active' a la tabla posts
ALTER TABLE `posts` 
ADD COLUMN `active` TINYINT(1) NOT NULL DEFAULT 1;

-- Actualizar todos los posts existentes para que estén activos por defecto
UPDATE `posts` SET `active` = 1;

-- Crear índice para mejorar las consultas de posts activos
CREATE INDEX `idx_posts_active` ON `posts` (`active`);

