-- =====================================================
-- SCRIPT SQL: Actualizar posts existentes y crear índice
-- La columna 'active' ya existe, solo necesitamos actualizar y crear índice
-- =====================================================

USE nexus_db;

-- Actualizar todos los posts existentes para que estén activos por defecto
-- (Solo si no tienen valor o están en NULL)
UPDATE `posts` SET `active` = 1 WHERE `active` IS NULL OR `active` = 0;

-- Crear índice si no existe (puede dar error si ya existe, pero es seguro ignorarlo)
CREATE INDEX `idx_posts_active` ON `posts` (`active`);

