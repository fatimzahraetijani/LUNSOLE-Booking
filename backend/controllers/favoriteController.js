const db = require('../config/db');

// @desc    Add accommodation to user favorites
// @route   POST /api/favorites/:accommodationId
// @access  Private
const addFavorite = async (req, res) => {
  const userId = req.user.id;
  const { accommodationId } = req.params;

  try {
    // Check if accommodation exists
    const [accRows] = await db.query('SELECT id FROM accommodations WHERE id = ?', [accommodationId]);
    if (accRows.length === 0) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Insert favorite (ignores duplicate key conflict if user already favorited it)
    await db.query(
      'INSERT IGNORE INTO favorites (user_id, accommodation_id) VALUES (?, ?)',
      [userId, accommodationId]
    );

    res.status(201).json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error.message);
    res.status(500).json({ message: 'Server error adding favorite' });
  }
};

// @desc    Remove accommodation from user favorites
// @route   DELETE /api/favorites/:accommodationId
// @access  Private
const removeFavorite = async (req, res) => {
  const userId = req.user.id;
  const { accommodationId } = req.params;

  try {
    await db.query(
      'DELETE FROM favorites WHERE user_id = ? AND accommodation_id = ?',
      [userId, accommodationId]
    );

    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error.message);
    res.status(500).json({ message: 'Server error removing favorite' });
  }
};

// @desc    Get user's favorites
// @route   GET /api/favorites
// @access  Private
const getFavorites = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT 
        a.id, a.name, a.description, a.type, a.country, a.city, 
        a.address, a.latitude, a.longitude, a.stars, a.image_url,
        MIN(r.price_per_night) AS min_price,
        MAX(r.capacity) AS max_capacity
      FROM favorites f
      INNER JOIN accommodations a ON f.accommodation_id = a.id
      LEFT JOIN rooms r ON a.id = r.accommodation_id
      WHERE f.user_id = ?
      GROUP BY a.id, a.name, a.description, a.type, a.country, a.city, a.address, a.latitude, a.longitude, a.stars, a.image_url
    `;

    const [favorites] = await db.query(query, [userId]);
    res.json(favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error.message);
    res.status(500).json({ message: 'Server error fetching favorites' });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites
};
