-- =====================================================
-- SCRIPT SQL: Biblioteca de usuario y Sistema de Pagos
-- Ejecutar en nexus_db
-- =====================================================

-- Tabla de Biblioteca del Usuario (juegos adquiridos)
CREATE TABLE IF NOT EXISTS `user_library` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `game_id` bigint(20) NOT NULL,
  `order_id` bigint(20) DEFAULT NULL,
  `purchase_price` decimal(10,2) DEFAULT NULL,
  `play_time_minutes` int(11) DEFAULT 0,
  `last_played` datetime DEFAULT NULL,
  `is_installed` tinyint(1) DEFAULT 0,
  `acquired_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_game_library` (`user_id`, `game_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_game_id` (`game_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_acquired_at` (`acquired_at`),
  CONSTRAINT `library_user_fk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `library_game_fk` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE,
  CONSTRAINT `library_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de Pagos
CREATE TABLE IF NOT EXISTS `payments` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `order_id` bigint(20) NOT NULL,
  `payment_code` varchar(100) UNIQUE,
  `payment_method` enum('CREDIT_CARD','DEBIT_CARD','YAPE') NOT NULL,
  `status` enum('PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED','EXPIRED') NOT NULL DEFAULT 'PENDING',
  `amount` decimal(10,2) NOT NULL,
  `card_last_four` varchar(4) DEFAULT NULL,
  `card_brand` varchar(20) DEFAULT NULL,
  `yape_phone` varchar(15) DEFAULT NULL,
  `qr_code_data` text DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `expires_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_payment_code` (`payment_code`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_method` (`payment_method`),
  CONSTRAINT `payment_order_fk` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices adicionales para performance
CREATE INDEX IF NOT EXISTS `idx_library_installed` ON `user_library` (`user_id`, `is_installed`);
CREATE INDEX IF NOT EXISTS `idx_library_last_played` ON `user_library` (`user_id`, `last_played`);


