const https = require('https');

// Helper to make HTTPS requests to Nominatim
const nominatimRequest = (url) => {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'LUNSOLE-Booking-App/1.0 (contact@lunsole.com)'
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(new Error('Invalid response format from Nominatim'));
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
};

// @desc    Geocode a query
// @route   GET /api/locations/search
// @access  Public
const searchLocations = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === '') {
    return res.status(400).json({ message: 'Query parameter q is required' });
  }

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=5`;

  try {
    const results = await nominatimRequest(url);
    
    // Map to a clean structure
    const formatted = results.map(item => {
      const address = item.address || {};
      const city = address.city || address.town || address.village || address.municipality || address.suburb || '';
      const country = address.country || '';
      
      return {
        city,
        country,
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        formattedAddress: item.display_name
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Geocoding error:', error.message);
    res.status(500).json({ message: 'Error performing destination search' });
  }
};

// @desc    Reverse geocode coordinates
// @route   GET /api/locations/reverse
// @access  Public
const reverseGeocode = async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ message: 'Coordinates (lat and lon) are required' });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?lat=${parseFloat(lat)}&lon=${parseFloat(lon)}&format=json&addressdetails=1`;

  try {
    const result = await nominatimRequest(url);
    const address = result.address || {};
    const city = address.city || address.town || address.village || address.municipality || '';
    const country = address.country || '';

    res.json({
      city,
      country,
      formattedAddress: result.display_name
    });
  } catch (error) {
    console.error('Reverse geocoding error:', error.message);
    res.status(500).json({ message: 'Error performing reverse geocoding' });
  }
};

module.exports = {
  searchLocations,
  reverseGeocode
};
