-- =====================================================
-- SCRIPT SQL: Agregar columna 'active' a la tabla posts
-- Ejecutar en nexus_db
-- =====================================================

-- Verificar si la columna existe antes de agregarla
SET @dbname = DATABASE();
SET @tablename = 'posts';
SET @columnname = 'active';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (COLUMN_NAME = @columnname)
  ) > 0,
  'SELECT 1', -- Columna ya existe, no hacer nada
  CONCAT('ALTER TABLE ', @tablename, ' ADD COLUMN ', @columnname, ' TINYINT(1) NOT NULL DEFAULT 1')
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Actualizar todos los posts existentes para que estén activos por defecto
UPDATE `posts` SET `active` = 1 WHERE `active` IS NULL OR `active` = 0;

-- Crear índice para mejorar las consultas de posts activos (si no existe)
SET @indexname = 'idx_posts_active';
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.STATISTICS
    WHERE
      (TABLE_SCHEMA = @dbname)
      AND (TABLE_NAME = @tablename)
      AND (INDEX_NAME = @indexname)
  ) > 0,
  'SELECT 1', -- Índice ya existe, no hacer nada
  CONCAT('CREATE INDEX ', @indexname, ' ON ', @tablename, ' (', @columnname, ')')
));
PREPARE createIndexIfNotExists FROM @preparedStatement;
EXECUTE createIndexIfNotExists;
DEALLOCATE PREPARE createIndexIfNotExists;

