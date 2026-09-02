const db = require('../config/db');
const https = require('https');

// Helper for HTTP requests (Google Places API New)
const fetchGooglePlacesAccommodations = (searchQuery, apiKey) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      textQuery: searchQuery
    });

    const options = {
      hostname: 'places.googleapis.com',
      path: '/v1/places:searchText',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.primaryType'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(responseData);
          if (parsed.places) {
            resolve(parsed.places);
          } else {
            resolve([]);
          }
        } catch (error) {
          console.error('Error parsing Google API response:', error);
          resolve([]); // Fail gracefully
        }
      });
    });

    req.on('error', (err) => {
      console.error('Google API error:', err);
      resolve([]); // Fail gracefully
    });

    req.write(data);
    req.end();
  });
};


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
      LEFT JOIN rooms r ON a.id = r.accommodation_id
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

    query += ' GROUP BY a.id, a.name, a.description, a.type, a.country, a.city, a.address, a.latitude, a.longitude, a.stars, a.image_url';
    query += orderBy;

    const [localAccommodations] = await db.query(query, queryParams);
    
    let allAccommodations = localAccommodations.map(acc => ({ ...acc, source: 'local' }));

    // Fetch Google Places API accommodations
    const googleApiKey = process.env.GOOGLE_PLACES_API_KEY;
    
    // We trigger external search if city is provided, or if lat/lng is provided
    if ((city || (userLat && userLng)) && googleApiKey) {
      let searchQuery = 'accommodations';
      if (city) {
        searchQuery = `hotels and accommodations in ${city}`;
      } else if (userLat && userLng) {
        // If they only searched by distance/map, find near lat/lng (Note: textQuery handles lat/lng poorly unless formatted, but we'll try)
        searchQuery = `hotels near ${userLat}, ${userLng}`;
      }

      const externalPlaces = await fetchGooglePlacesAccommodations(searchQuery, googleApiKey);
      
      const externalMapped = externalPlaces
        .map((place) => {
          let extType = 'hotel';
          const primaryType = place.primaryType || '';
          if (primaryType.includes('apartment')) extType = 'apartment';
          else if (primaryType.includes('villa')) extType = 'villa';
          else if (primaryType.includes('guest_house')) extType = 'guesthouse';
          else if (primaryType.includes('hostel')) extType = 'hostel';

          // Respect type filter
          if (type && type !== 'all' && extType !== type) {
            return null;
          }

          let lat = null;
          let lng = null;
          if (place.location) {
            lat = place.location.latitude;
            lng = place.location.longitude;
          }

          // Calculate basic distance if user provided lat/lng
          let calcDist = null;
          if (userLat && userLng && lat && lng) {
            const uLat = parseFloat(userLat);
            const uLng = parseFloat(userLng);
            if (!isNaN(uLat) && !isNaN(uLng)) {
              const R = 6371; // Radius of the earth in km
              const dLat = (lat - uLat) * (Math.PI / 180);
              const dLon = (lng - uLng) * (Math.PI / 180);
              const a = 
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(uLat * (Math.PI / 180)) * Math.cos(lat * (Math.PI / 180)) * 
                Math.sin(dLon / 2) * Math.sin(dLon / 2); 
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
              calcDist = R * c; 
            }
          }

          return {
            id: `ext_${place.id}`,
            name: place.displayName ? place.displayName.text : 'Unnamed Accommodation',
            description: place.formattedAddress || 'A comfortable stay at this location.',
            type: extType,
            country: '', // Google Places formatted address usually includes country, parsing it is complex
            city: city || '', // We assume city from search query
            address: place.formattedAddress || '',
            latitude: lat,
            longitude: lng,
            stars: place.rating || null, // Using Google rating as stars
            image_url: null, // Placeholder handled by frontend
            min_price: null,
            max_capacity: null,
            distance: calcDist,
            source: 'google_places'
          };
        })
        .filter(item => item !== null);

      allAccommodations = [...allAccommodations, ...externalMapped];
      
      // Re-sort by distance if sorting was applied
      if (orderBy) {
        allAccommodations.sort((a, b) => (a.distance || 0) - (b.distance || 0));
      }
    }

    res.json(allAccommodations);
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
