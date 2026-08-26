const db = require('../config/db');

// @desc    Get all accommodations with optional search & filter parameters
// @route   GET /api/accommodations
// @access  Public
const getAccommodations = async (req, res) => {
  const { city, type, min_price, minPrice, max_price, maxPrice, capacity, guests, latitude, lat, longitude, lng } = req.query;
  const finalMinPrice = min_price || minPrice;
  const finalMaxPrice = max_price || maxPrice;
  const finalCapacity = capacity || guests;
  const userLat = latitude || lat;
  const userLng = longitude || lng;

  try {
    let distanceSelect = '';
    let orderBy = '';
    if (userLat && userLng) {
      const latVal = parseFloat(userLat);
      const lngVal = parseFloat(userLng);
      if (!isNaN(latVal) && !isNaN(lngVal)) {
        distanceSelect = `, (6371 * acos(cos(radians(${latVal})) * cos(radians(a.latitude)) * cos(radians(a.longitude) - radians(${lngVal})) + sin(radians(${latVal})) * sin(radians(a.latitude)))) AS distance`;
        orderBy = ' ORDER BY distance ASC';
      }
    }

    let query = `
      SELECT 
        a.id, a.name, a.description, a.type, a.country, a.city, 
        a.address, a.latitude, a.longitude, a.stars, a.image_url,
        MIN(r.price_per_night) AS min_price,
        MAX(r.capacity) AS max_capacity
        ${distanceSelect}
      FROM accommodations a
      INNER JOIN rooms r ON a.id = r.accommodation_id
    `;
    
    const whereClauses = [];
    const queryParams = [];

    // City search (case-insensitive partial match)
    if (city && city.trim() !== '') {
      whereClauses.push('a.city LIKE ?');
      queryParams.push(`%${city.trim()}%`);
    }

    // Type filter
    if (type && type !== 'all') {
      whereClauses.push('a.type = ?');
      queryParams.push(type);
    }

    // Capacity filter (at least one room fits the requested capacity)
    if (finalCapacity) {
      whereClauses.push('r.capacity >= ?');
      queryParams.push(parseInt(finalCapacity, 10));
    }

    // Price range filters (filtered at the room level)
    if (finalMinPrice) {
      whereClauses.push('r.price_per_night >= ?');
      queryParams.push(parseFloat(finalMinPrice));
    }
    if (finalMaxPrice) {
      whereClauses.push('r.price_per_night <= ?');
      queryParams.push(parseFloat(finalMaxPrice));
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += ' GROUP BY a.id';
    query += orderBy;

    const [accommodations] = await db.query(query, queryParams);
    res.json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error.message);
    res.status(500).json({ message: 'Server error fetching accommodations' });
  }
};

// @desc    Get details of a single accommodation (including rooms)
// @route   GET /api/accommodations/:id
// @access  Public
const getAccommodationById = async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch accommodation details
    const [accRows] = await db.query('SELECT * FROM accommodations WHERE id = ?', [id]);
    if (accRows.length === 0) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    const accommodation = accRows[0];

    // Fetch associated rooms
    const [rooms] = await db.query('SELECT * FROM rooms WHERE accommodation_id = ?', [id]);
    
    // Parse amenities JSON if necessary (mysql2 returns it parsed if field is JSON type, but just in case)
    const formattedRooms = rooms.map(room => {
      let amenities = room.amenities;
      if (typeof amenities === 'string') {
        try {
          amenities = JSON.parse(amenities);
        } catch (e) {
          amenities = [];
        }
      }
      return { ...room, amenities };
    });

    res.json({
      ...accommodation,
      rooms: formattedRooms
    });
  } catch (error) {
    console.error('Error fetching accommodation details:', error.message);
    res.status(500).json({ message: 'Server error fetching accommodation details' });
  }
};

// @desc    Create a new accommodation
// @route   POST /api/accommodations
// @access  Private/Admin
const createAccommodation = async (req, res) => {
  const { name, description, type, country, city, address, latitude, longitude, stars, image_url } = req.body;

  if (!name || !description || !type || !country || !city || !address || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO accommodations (name, description, type, country, city, address, latitude, longitude, stars, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, type, country, city, address, latitude, longitude, stars || 0, image_url]
    );

    res.status(201).json({
      message: 'Accommodation created successfully',
      accommodationId: result.insertId
    });
  } catch (error) {
    console.error('Error creating accommodation:', error.message);
    res.status(500).json({ message: 'Server error creating accommodation' });
  }
};

module.exports = {
  getAccommodations,
  getAccommodationById,
  createAccommodation
};
