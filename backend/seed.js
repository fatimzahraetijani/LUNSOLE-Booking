const mysql = require('mysql2/promise');
require('dotenv').config();

const SEED_ACCOMMODATIONS = [
  {
    name: 'LUNSOLE Rabat Grand Hotel',
    type: 'hotel',
    country: 'Morocco',
    city: 'Rabat',
    address: 'Avenue Mohammed V, Centre Ville, Rabat',
    latitude: 34.0181,
    longitude: -6.8358,
    stars: 5,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: 'Experience unmatched luxury in the heart of Morocco\'s capital. LUNSOLE Rabat Grand Hotel offers presidential suites, five-star wellness spas, and exquisite fine dining near the Royal Palace.',
    rooms: [
      {
        name: 'Superior Executive Suite',
        type: 'double',
        price_per_night: 180.00,
        capacity: 2,
        description: 'Chic Parisian-Moroccan fusion design, plush king size bed, smart work area, and luxury marble bathroom.',
        amenities: JSON.stringify(['WiFi', 'Air Conditioning', 'Mini Bar', 'City View', 'Breakfast Included']),
        image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Royal Ocean Penthouse',
        type: 'suite',
        price_per_night: 350.00,
        capacity: 2,
        description: 'Exquisite suite with panoramic ocean views, private hot tub, exclusive lounge access, and butler service.',
        amenities: JSON.stringify(['Private Hot Tub', 'Butler Service', 'WiFi', 'Mini Bar', 'Ocean View', 'Lounge Access']),
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Rabat Marina Residence',
    type: 'apartment',
    country: 'Morocco',
    city: 'Rabat',
    address: 'Marina de Bouregreg, Rabat',
    latitude: 34.0252,
    longitude: -6.8285,
    stars: 4,
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80',
    description: 'Chic waterfront apartments offering the ultimate lock-and-go convenience. Enjoy stunning views of the marina, private yacht docks, and easy access to the historical Hassan Tower.',
    rooms: [
      {
        name: 'Marina Yacht-View Flat',
        type: 'double',
        price_per_night: 110.00,
        capacity: 2,
        description: 'A stylish 1-bedroom apartment featuring a private terrace overlooking yachts, fully fitted kitchen, and laundry.',
        amenities: JSON.stringify(['Terrace', 'Kitchen', 'WiFi', 'Air Conditioning', 'Washing Machine']),
        image_url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Marina Duplex Penthouse',
        type: 'family',
        price_per_night: 220.00,
        capacity: 4,
        description: 'Spacious two-level duplex penthouse with floor-to-ceiling windows, huge sunset deck, and 2 en-suite bedrooms.',
        amenities: JSON.stringify(['Sunset Deck', 'Kitchen', 'WiFi', 'Air Conditioning', 'Gym Access', 'Parking']),
        image_url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Palais Riad LUNSOLE Marrakech',
    type: 'hotel',
    country: 'Morocco',
    city: 'Marrakech',
    address: 'Derb Jdid, Medina, Marrakech',
    latitude: 31.6214,
    longitude: -7.9944,
    stars: 5,
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    description: 'An architectural masterpiece in the historic Medina of Marrakech. Immerse yourself in ultimate tranquility with a central heated swimming pool, traditional hammam, and Moroccan gourmet dining on the rooftop.',
    rooms: [
      {
        name: 'Moroccan Patio Suite',
        type: 'suite',
        price_per_night: 240.00,
        capacity: 2,
        description: 'Exquisite suite overlooking the central garden pool, featuring hand-carved cedarwood walls and tadelakt bathroom.',
        amenities: JSON.stringify(['Pool Access', 'WiFi', 'Air Conditioning', 'Fireplace', 'Hammam Access']),
        image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Sultan Grand Royal Suite',
        type: 'family',
        price_per_night: 480.00,
        capacity: 4,
        description: 'The riad\'s largest suite. Features two bedrooms, private plunge pool on the rooftop, and dedicated host.',
        amenities: JSON.stringify(['Private Plunge Pool', 'Butler Service', 'WiFi', 'Fireplace', 'Rooftop Lounge']),
        image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Gueliz Chic Loft & Spa',
    type: 'apartment',
    country: 'Morocco',
    city: 'Marrakech',
    address: 'Avenue Hassan II, Gueliz, Marrakech',
    latitude: 31.6348,
    longitude: -8.0125,
    stars: 4,
    image_url: 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=800&q=80',
    description: 'Modern architectural loft situated in the upscale Gueliz neighborhood. Surrounded by high-end fashion boutiques, chic French-Moroccan bistros, and trendy art galleries.',
    rooms: [
      {
        name: 'Gueliz Executive Loft',
        type: 'double',
        price_per_night: 95.00,
        capacity: 2,
        description: 'Industrial-chic loft with high ceilings, private balcony, glass-walled shower, and fully equipped kitchen.',
        amenities: JSON.stringify(['Balcony', 'Kitchen', 'WiFi', 'Air Conditioning', 'Elevator', 'Smart TV']),
        image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'LUNSOLE Casablanca Oceanfront',
    type: 'hotel',
    country: 'Morocco',
    city: 'Casablanca',
    address: 'Boulevard de la Corniche, Ain Diab, Casablanca',
    latitude: 33.5951,
    longitude: -7.6322,
    stars: 5,
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    description: 'A spectacular oasis overlooking the Atlantic Ocean. Blends modern soaring architecture with warm Moroccan hospitality, featuring direct beach access, an infinity pool, and premium business facilities.',
    rooms: [
      {
        name: 'Atlantic Horizon Double',
        type: 'double',
        price_per_night: 170.00,
        capacity: 2,
        description: 'Spacious room with large glass doors opening to the Atlantic ocean, modern furnishings, and a sleek bath.',
        amenities: JSON.stringify(['Ocean View', 'WiFi', 'Air Conditioning', 'Mini Bar', 'Desk', 'Safe']),
        image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Casablanca Ocean Panorama Suite',
        type: 'suite',
        price_per_night: 320.00,
        capacity: 2,
        description: 'Stunning luxury suite featuring 180-degree ocean views, marble tub, private balcony, and access to Executive Club.',
        amenities: JSON.stringify(['Ocean View', 'Private Balcony', 'WiFi', 'Air Conditioning', 'Executive Lounge', 'Mini Bar']),
        image_url: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'Gauthier Boutique Penthouse',
    type: 'apartment',
    country: 'Morocco',
    city: 'Casablanca',
    address: 'Rue Gauthier, Casablanca',
    latitude: 33.5901,
    longitude: -7.6582,
    stars: 4,
    image_url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=800&q=80',
    description: 'Sophisticated penthouse in Casablanca\'s trendiest residential quarters. Experience complete tranquility with premium soundproofing, designer furniture, and a vast wrap-around sky terrace.',
    rooms: [
      {
        name: 'Gauthier Sky Penthouse',
        type: 'double',
        price_per_night: 130.00,
        capacity: 2,
        description: 'Luxury top-floor apartment with massive outdoor terrace, design kitchen, fireplace, and private parking space.',
        amenities: JSON.stringify(['Huge Terrace', 'Kitchen', 'WiFi', 'Fireplace', 'Air Conditioning', 'Private Parking']),
        image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'LUNSOLE El Minzah Resort',
    type: 'hotel',
    country: 'Morocco',
    city: 'Tangier',
    address: 'Rue de la Liberte, Tangier',
    latitude: 35.7725,
    longitude: -5.7997,
    stars: 5,
    image_url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=800&q=80',
    description: 'Step into legendary luxury where high society and historical glamour meet. Features lush Andalusian gardens, views of the Strait of Gibraltar, an outdoor pool, and classic wood-paneled piano bars.',
    rooms: [
      {
        name: 'Strait-View Deluxe Room',
        type: 'double',
        price_per_night: 155.00,
        capacity: 2,
        description: 'Stunning views overlooking the Mediterranean bay, decorated with authentic Moroccan wood-carvings.',
        amenities: JSON.stringify(['Bay View', 'WiFi', 'Air Conditioning', 'Mini Bar', 'Coffee Machine']),
        image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Royal Andalusian Suite',
        type: 'suite',
        price_per_night: 290.00,
        capacity: 2,
        description: 'Extravagant suite with separate living salon, marble bath, private terrace, and access to health club.',
        amenities: JSON.stringify(['Private Terrace', 'WiFi', 'Air Conditioning', 'Mini Bar', 'Sauna Access']),
        image_url: 'https://images.unsplash.com/photo-1576085898323-2183fa9bc3a0?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'LUNSOLE Agadir Bay Palace',
    type: 'hotel',
    country: 'Morocco',
    city: 'Agadir',
    address: 'Boulevard du 20 Aout, Agadir',
    latitude: 30.4132,
    longitude: -9.6052,
    stars: 5,
    image_url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    description: 'A luxurious beach resort with spectacular views of Agadir\'s crescent bay. Features a huge lagoon-style swimming pool, private cabanas, tennis courts, and custom-designed Moroccan wellness treatments.',
    rooms: [
      {
        name: 'Beachfront Superior Room',
        type: 'double',
        price_per_night: 165.00,
        capacity: 2,
        description: 'Located steps away from Agadir beach. Includes a private terrace, king size bed, and smart controls.',
        amenities: JSON.stringify(['Private Terrace', 'Beach Access', 'WiFi', 'Air Conditioning', 'Mini Bar']),
        image_url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Agadir Imperial Lagoon Suite',
        type: 'suite',
        price_per_night: 330.00,
        capacity: 3,
        description: 'Exquisite suite offering swim-up access to the lagoon pool, private sun loungers, and butler service.',
        amenities: JSON.stringify(['Swim-Up Access', 'Butler Service', 'WiFi', 'Air Conditioning', 'Mini Bar', 'Breakfast Included']),
        image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80'
      }
    ]
  },
  {
    name: 'LUNSOLE Blue Riad Guesthouse',
    type: 'guesthouse',
    country: 'Morocco',
    city: 'Chefchaouen',
    address: 'Avenue Hassan I, Medina, Chefchaouen',
    latitude: 35.1688,
    longitude: -5.2631,
    stars: 4,
    image_url: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80',
    description: 'Immerse yourself in Chefchaouen\'s blue-washed architecture. This charming boutique riad guesthouse offers a panoramic terrace overlooking the Rif Mountains, wood fires, and traditional home-cooked tagines.',
    rooms: [
      {
        name: 'Traditional Blue Room',
        type: 'double',
        price_per_night: 75.00,
        capacity: 2,
        description: 'Cozy and intimate room painted in traditional indigo-blue shades, with handwoven carpets and en-suite shower.',
        amenities: JSON.stringify(['Medina View', 'WiFi', 'Heating', 'Breakfast Included', 'Tea Station']),
        image_url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'
      },
      {
        name: 'Rif Mountain Vista Room',
        type: 'suite',
        price_per_night: 110.00,
        capacity: 2,
        description: 'Stunning top-floor suite with private terrace doors opening to views of the Rif mountain ranges.',
        amenities: JSON.stringify(['Private Terrace', 'Rif Mountain View', 'WiFi', 'Heating', 'Fireplace']),
        image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80'
      }
    ]
  }
];

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'lunsole_booking',
    waitForConnections: true,
    connectionLimit: 5
  });

  try {
    console.log('🧹 Clearing existing bookings, reviews, favorites, rooms, and accommodations...');
    await pool.query('DELETE FROM bookings');
    await pool.query('DELETE FROM reviews');
    await pool.query('DELETE FROM favorites');
    await pool.query('DELETE FROM rooms');
    await pool.query('DELETE FROM accommodations');

    console.log('🌱 Seeding Morocco accommodations and rooms...');
    for (const acc of SEED_ACCOMMODATIONS) {
      const [accResult] = await pool.query(
        `INSERT INTO accommodations (name, description, type, country, city, address, latitude, longitude, stars, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [acc.name, acc.description, acc.type, acc.country, acc.city, acc.address, acc.latitude, acc.longitude, acc.stars, acc.image_url]
      );

      const accId = accResult.insertId;
      console.log(`Added Accommodation: ${acc.name} (ID: ${accId})`);

      for (const room of acc.rooms) {
        await pool.query(
          `INSERT INTO rooms (accommodation_id, name, type, price_per_night, capacity, description, amenities, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [accId, room.name, room.type, room.price_per_night, room.capacity, room.description, room.amenities, room.image_url]
        );
        console.log(`  Added Room: ${room.name}`);
      }
    }

    console.log('🎉 Seeding successfully completed!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}

seed();
