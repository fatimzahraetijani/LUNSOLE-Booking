-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `lunsole_booking` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `lunsole_booking`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Accommodations Table
CREATE TABLE IF NOT EXISTS `accommodations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `type` ENUM('hotel', 'apartment', 'villa', 'guesthouse') NOT NULL,
  `country` VARCHAR(100) NOT NULL,
  `city` VARCHAR(100) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NOT NULL,
  `longitude` DECIMAL(11, 8) NOT NULL,
  `stars` INT DEFAULT 0,
  `image_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_city_country` (`city`, `country`),
  INDEX `idx_coordinates` (`latitude`, `longitude`)
) ENGINE=InnoDB;

-- 3. Rooms Table
CREATE TABLE IF NOT EXISTS `rooms` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `accommodation_id` INT NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `type` ENUM('single', 'double', 'suite', 'family') NOT NULL,
  `price_per_night` DECIMAL(10, 2) NOT NULL,
  `capacity` INT NOT NULL DEFAULT 1,
  `description` TEXT,
  `amenities` JSON, -- Store array of strings e.g. ["wifi", "ac", "tv"]
  `image_url` VARCHAR(500),
  FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Bookings Table
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `room_id` INT NOT NULL,
  `check_in` DATE NOT NULL,
  `check_out` DATE NOT NULL,
  `total_price` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
  `guests_count` INT NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
  INDEX `idx_check_in_out` (`check_in`, `check_out`)
) ENGINE=InnoDB;

-- 5. Favorites Table
CREATE TABLE IF NOT EXISTS `favorites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `accommodation_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_user_acc` (`user_id`, `accommodation_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Reviews Table
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `accommodation_id` INT NOT NULL,
  `rating` INT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
  `comment` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;
