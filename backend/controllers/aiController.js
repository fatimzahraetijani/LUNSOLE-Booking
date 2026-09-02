const db = require('../config/db');

// @desc    Recommend accommodations using natural language query parser
// @route   POST /api/ai/recommend
// @access  Public
const getAIRecommendations = async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === '') {
    return res.status(400).json({ message: 'Query prompt is required' });
  }

  const prompt = query.toLowerCase();

  // 1. Extract City
  let detectedCity = null;
  const cities = ['rabat', 'marrakech', 'casablanca', 'tangier', 'agadir', 'chefchaouen', 'kyoto', 'paris', 'santorini', 'maldives'];
  cities.forEach(city => {
    if (prompt.includes(city)) {
      detectedCity = city;
    }
  });

  // 2. Extract Type
  let detectedType = null;
  const types = ['hotel', 'apartment', 'villa', 'guesthouse'];
  types.forEach(type => {
    if (prompt.includes(type)) {
      detectedType = type;
    }
  });

  // 3. Extract Guests Capacity
  let detectedGuests = null;
  const guestsRegex = /(?:for\s+)?(\d+)\s*(?:people|person|guest|guests|pax)/;
  const guestsMatch = prompt.match(guestsRegex);
  if (guestsMatch) {
    detectedGuests = parseInt(guestsMatch[1], 10);
  }

  // 4. Extract Price Limit
  let detectedMaxPrice = null;
  // Patterns like "under 500", "below 1500 mad", "less than 200$"
  const priceRegex = /(?:under|below|less than|max|maximum|budget of)\s*(?:mad|usd|eur|\$)?\s*(\d+)/i;
  const priceMatch = prompt.match(priceRegex);
  if (priceMatch) {
    detectedMaxPrice = parseFloat(priceMatch[1]);
    // Currency conversion from MAD to USD
    if (prompt.includes('mad') || prompt.includes('dirham') || prompt.includes('dh')) {
      detectedMaxPrice = detectedMaxPrice / 10;
    }
  }

  try {
    // 5. Query Database
    let sql = `
      SELECT 
        a.id, a.name, a.description, a.type, a.country, a.city, 
        a.address, a.latitude, a.longitude, a.stars, a.image_url,
        MIN(r.price_per_night) AS min_price,
        MAX(r.capacity) AS max_capacity
      FROM accommodations a
      INNER JOIN rooms r ON a.id = r.accommodation_id
    `;
    
    const whereClauses = [];
    const queryParams = [];

    if (detectedCity) {
      whereClauses.push('a.city LIKE ?');
      queryParams.push(`%${detectedCity}%`);
    }

    if (detectedType) {
      whereClauses.push('a.type = ?');
      queryParams.push(detectedType);
    }

    if (detectedGuests) {
      whereClauses.push('r.capacity >= ?');
      queryParams.push(detectedGuests);
    }

    if (detectedMaxPrice) {
      whereClauses.push('r.price_per_night <= ?');
      queryParams.push(detectedMaxPrice);
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ');
    }

    sql += ' GROUP BY a.id, a.name, a.description, a.type, a.country, a.city, a.address, a.latitude, a.longitude, a.stars, a.image_url';

    const [accommodations] = await db.query(sql, queryParams);

    // 6. Formulate AI Response Message
    let message = 'I have analyzed your request. ';
    const filtersUsed = [];
    if (detectedCity) filtersUsed.push(`in ${detectedCity}`);
    if (detectedType) filtersUsed.push(`matching type "${detectedType}"`);
    if (detectedGuests) filtersUsed.push(`fitting at least ${detectedGuests} guests`);
    if (detectedMaxPrice) filtersUsed.push(`under $${detectedMaxPrice} per night`);

    if (filtersUsed.length > 0) {
      message += `I searched for properties ${filtersUsed.join(', ')}. `;
    } else {
      message += "I couldn't extract specific constraints, so I'm showing some of our premium listings.";
    }

    if (accommodations.length > 0) {
      message += `I found ${accommodations.length} exclusive recommendations for you:`;
    } else {
      message += " Unfortunately, no properties match all these parameters in our database currently.";
    }

    res.json({
      message,
      accommodations,
      parameters: {
        city: detectedCity,
        type: detectedType,
        guests: detectedGuests,
        maxPrice: detectedMaxPrice
      }
    });
  } catch (error) {
    console.error('AI assistant error:', error.message);
    res.status(500).json({ message: 'Server error processing AI recommendation' });
  }
};

module.exports = {
  getAIRecommendations
};
