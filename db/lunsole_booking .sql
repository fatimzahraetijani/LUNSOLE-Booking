-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 03 sep. 2026 à 17:49
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `lunsole_booking`
--

-- --------------------------------------------------------

--
-- Structure de la table `accommodations`
--

CREATE TABLE `accommodations` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `type` enum('hotel','apartment','villa','guesthouse') NOT NULL,
  `country` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `address` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `stars` int(11) DEFAULT 0,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `accommodations`
--

INSERT INTO `accommodations` (`id`, `name`, `description`, `type`, `country`, `city`, `address`, `latitude`, `longitude`, `stars`, `image_url`, `created_at`) VALUES
(10, 'LUNSOLE Rabat Grand Hotel', 'Experience unmatched luxury in the heart of Morocco\'s capital. LUNSOLE Rabat Grand Hotel offers presidential suites, five-star wellness spas, and exquisite fine dining near the Royal Palace.', 'hotel', 'Morocco', 'Rabat', 'Avenue Mohammed V, Centre Ville, Rabat', 34.01810000, -6.83580000, 5, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(11, 'Rabat Marina Residence', 'Chic waterfront apartments offering the ultimate lock-and-go convenience. Enjoy stunning views of the marina, private yacht docks, and easy access to the historical Hassan Tower.', 'apartment', 'Morocco', 'Rabat', 'Marina de Bouregreg, Rabat', 34.02520000, -6.82850000, 4, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(12, 'Palais Riad LUNSOLE Marrakech', 'An architectural masterpiece in the historic Medina of Marrakech. Immerse yourself in ultimate tranquility with a central heated swimming pool, traditional hammam, and Moroccan gourmet dining on the rooftop.', 'hotel', 'Morocco', 'Marrakech', 'Derb Jdid, Medina, Marrakech', 31.62140000, -7.99440000, 5, 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(13, 'Gueliz Chic Loft & Spa', 'Modern architectural loft situated in the upscale Gueliz neighborhood. Surrounded by high-end fashion boutiques, chic French-Moroccan bistros, and trendy art galleries.', 'apartment', 'Morocco', 'Marrakech', 'Avenue Hassan II, Gueliz, Marrakech', 31.63480000, -8.01250000, 4, 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(14, 'LUNSOLE Casablanca Oceanfront', 'A spectacular oasis overlooking the Atlantic Ocean. Blends modern soaring architecture with warm Moroccan hospitality, featuring direct beach access, an infinity pool, and premium business facilities.', 'hotel', 'Morocco', 'Casablanca', 'Boulevard de la Corniche, Ain Diab, Casablanca', 33.59510000, -7.63220000, 5, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(15, 'Gauthier Boutique Penthouse', 'Sophisticated penthouse in Casablanca\'s trendiest residential quarters. Experience complete tranquility with premium soundproofing, designer furniture, and a vast wrap-around sky terrace.', 'apartment', 'Morocco', 'Casablanca', 'Rue Gauthier, Casablanca', 33.59010000, -7.65820000, 4, 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(16, 'LUNSOLE El Minzah Resort', 'Step into legendary luxury where high society and historical glamour meet. Features lush Andalusian gardens, views of the Strait of Gibraltar, an outdoor pool, and classic wood-paneled piano bars.', 'hotel', 'Morocco', 'Tangier', 'Rue de la Liberte, Tangier', 35.77250000, -5.79970000, 5, 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(17, 'LUNSOLE Agadir Bay Palace', 'A luxurious beach resort with spectacular views of Agadir\'s crescent bay. Features a huge lagoon-style swimming pool, private cabanas, tennis courts, and custom-designed Moroccan wellness treatments.', 'hotel', 'Morocco', 'Agadir', 'Boulevard du 20 Aout, Agadir', 30.41320000, -9.60520000, 5, 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(18, 'LUNSOLE Blue Riad Guesthouse', 'Immerse yourself in Chefchaouen\'s blue-washed architecture. This charming boutique riad guesthouse offers a panoramic terrace overlooking the Rif Mountains, wood fires, and traditional home-cooked tagines.', 'guesthouse', 'Morocco', 'Chefchaouen', 'Avenue Hassan I, Medina, Chefchaouen', 35.16880000, -5.26310000, 4, 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80', '2026-08-27 21:31:28'),
(19, 'LUNSOLE Luxury Palace Test', 'An outstanding test hotel.', 'hotel', 'Morocco', 'Fez', '123 Palace Avenue, Fez', 34.01810000, -5.00780000, 5, 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', '2026-08-30 18:49:18');

-- --------------------------------------------------------

--
-- Structure de la table `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `check_in` date NOT NULL,
  `check_out` date NOT NULL,
  `total_price` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled') DEFAULT 'pending',
  `guests_count` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `room_id`, `check_in`, `check_out`, `total_price`, `status`, `guests_count`, `created_at`) VALUES
(1, 3, 24, '2026-09-04', '2026-09-06', 340.00, 'confirmed', 1, '2026-09-03 15:41:23');

-- --------------------------------------------------------

--
-- Structure de la table `favorites`
--

CREATE TABLE `favorites` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `accommodation_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `accommodation_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `accommodation_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` enum('single','double','suite','family') NOT NULL,
  `price_per_night` decimal(10,2) NOT NULL,
  `capacity` int(11) NOT NULL DEFAULT 1,
  `description` text DEFAULT NULL,
  `amenities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`amenities`)),
  `image_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `rooms`
--

INSERT INTO `rooms` (`id`, `accommodation_id`, `name`, `type`, `price_per_night`, `capacity`, `description`, `amenities`, `image_url`) VALUES
(17, 10, 'Superior Executive Suite', 'double', 180.00, 2, 'Chic Parisian-Moroccan fusion design, plush king size bed, smart work area, and luxury marble bathroom.', '[\"WiFi\",\"Air Conditioning\",\"Mini Bar\",\"City View\",\"Breakfast Included\"]', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'),
(18, 10, 'Royal Ocean Penthouse', 'suite', 350.00, 2, 'Exquisite suite with panoramic ocean views, private hot tub, exclusive lounge access, and butler service.', '[\"Private Hot Tub\",\"Butler Service\",\"WiFi\",\"Mini Bar\",\"Ocean View\",\"Lounge Access\"]', 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'),
(19, 11, 'Marina Yacht-View Flat', 'double', 110.00, 2, 'A stylish 1-bedroom apartment featuring a private terrace overlooking yachts, fully fitted kitchen, and laundry.', '[\"Terrace\",\"Kitchen\",\"WiFi\",\"Air Conditioning\",\"Washing Machine\"]', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'),
(20, 11, 'Marina Duplex Penthouse', 'family', 220.00, 4, 'Spacious two-level duplex penthouse with floor-to-ceiling windows, huge sunset deck, and 2 en-suite bedrooms.', '[\"Sunset Deck\",\"Kitchen\",\"WiFi\",\"Air Conditioning\",\"Gym Access\",\"Parking\"]', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'),
(21, 12, 'Moroccan Patio Suite', 'suite', 240.00, 2, 'Exquisite suite overlooking the central garden pool, featuring hand-carved cedarwood walls and tadelakt bathroom.', '[\"Pool Access\",\"WiFi\",\"Air Conditioning\",\"Fireplace\",\"Hammam Access\"]', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'),
(22, 12, 'Sultan Grand Royal Suite', 'family', 480.00, 4, 'The riad\'s largest suite. Features two bedrooms, private plunge pool on the rooftop, and dedicated host.', '[\"Private Plunge Pool\",\"Butler Service\",\"WiFi\",\"Fireplace\",\"Rooftop Lounge\"]', 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'),
(23, 13, 'Gueliz Executive Loft', 'double', 95.00, 2, 'Industrial-chic loft with high ceilings, private balcony, glass-walled shower, and fully equipped kitchen.', '[\"Balcony\",\"Kitchen\",\"WiFi\",\"Air Conditioning\",\"Elevator\",\"Smart TV\"]', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'),
(24, 14, 'Atlantic Horizon Double', 'double', 170.00, 2, 'Spacious room with large glass doors opening to the Atlantic ocean, modern furnishings, and a sleek bath.', '[\"Ocean View\",\"WiFi\",\"Air Conditioning\",\"Mini Bar\",\"Desk\",\"Safe\"]', 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'),
(25, 14, 'Casablanca Ocean Panorama Suite', 'suite', 320.00, 2, 'Stunning luxury suite featuring 180-degree ocean views, marble tub, private balcony, and access to Executive Club.', '[\"Ocean View\",\"Private Balcony\",\"WiFi\",\"Air Conditioning\",\"Executive Lounge\",\"Mini Bar\"]', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'),
(26, 15, 'Gauthier Sky Penthouse', 'double', 130.00, 2, 'Luxury top-floor apartment with massive outdoor terrace, design kitchen, fireplace, and private parking space.', '[\"Huge Terrace\",\"Kitchen\",\"WiFi\",\"Fireplace\",\"Air Conditioning\",\"Private Parking\"]', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'),
(27, 16, 'Strait-View Deluxe Room', 'double', 155.00, 2, 'Stunning views overlooking the Mediterranean bay, decorated with authentic Moroccan wood-carvings.', '[\"Bay View\",\"WiFi\",\"Air Conditioning\",\"Mini Bar\",\"Coffee Machine\"]', 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80'),
(28, 16, 'Royal Andalusian Suite', 'suite', 290.00, 2, 'Extravagant suite with separate living salon, marble bath, private terrace, and access to health club.', '[\"Private Terrace\",\"WiFi\",\"Air Conditioning\",\"Mini Bar\",\"Sauna Access\"]', 'https://images.unsplash.com/photo-1576085898323-2183fa9bc3a0?auto=format&fit=crop&w=800&q=80'),
(29, 17, 'Beachfront Superior Room', 'double', 165.00, 2, 'Located steps away from Agadir beach. Includes a private terrace, king size bed, and smart controls.', '[\"Private Terrace\",\"Beach Access\",\"WiFi\",\"Air Conditioning\",\"Mini Bar\"]', 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80'),
(30, 17, 'Agadir Imperial Lagoon Suite', 'suite', 330.00, 3, 'Exquisite suite offering swim-up access to the lagoon pool, private sun loungers, and butler service.', '[\"Swim-Up Access\",\"Butler Service\",\"WiFi\",\"Air Conditioning\",\"Mini Bar\",\"Breakfast Included\"]', 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'),
(31, 18, 'Traditional Blue Room', 'double', 75.00, 2, 'Cozy and intimate room painted in traditional indigo-blue shades, with handwoven carpets and en-suite shower.', '[\"Medina View\",\"WiFi\",\"Heating\",\"Breakfast Included\",\"Tea Station\"]', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'),
(32, 18, 'Rif Mountain Vista Room', 'suite', 110.00, 2, 'Stunning top-floor suite with private terrace doors opening to views of the Rif mountain ranges.', '[\"Private Terrace\",\"Rif Mountain View\",\"WiFi\",\"Heating\",\"Fireplace\"]', 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Admin', 'LUNSOLE', 'admin@lunsole.com', '$2a$10$foYklJw8QiCWMN/tVbT4L.p0YNZSDhJs2xfAj/U1WpjCTkekHGtGS', 'admin', '2026-08-29 23:06:37'),
(2, 'Test', 'User', 'user@lunsole.com', '$2a$10$lmYNa.EEF.fyzUqkmjZmN.Klej0V3oaeozdZDM/egT5n7XfINp1XO', 'user', '2026-08-30 16:22:05'),
(3, 'fatim zahrae', 'tijani', 'luna.1@gmil.com', '$2a$10$VMqU4K0JnuJw1kv1ySABsesr.M9g8cUh/vJgIkZZScc4ooalAi7pS', 'user', '2026-09-03 15:40:40');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `accommodations`
--
ALTER TABLE `accommodations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_city_country` (`city`,`country`),
  ADD KEY `idx_coordinates` (`latitude`,`longitude`);

--
-- Index pour la table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `idx_check_in_out` (`check_in`,`check_out`);

--
-- Index pour la table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_acc` (`user_id`,`accommodation_id`),
  ADD KEY `accommodation_id` (`accommodation_id`);

--
-- Index pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `accommodation_id` (`accommodation_id`);

--
-- Index pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `accommodation_id` (`accommodation_id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `accommodations`
--
ALTER TABLE `accommodations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT pour la table `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
