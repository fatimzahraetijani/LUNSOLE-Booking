const db = require('../config/db');

// @desc    Get reviews for a single accommodation
// @route   GET /api/accommodations/:id/reviews
// @access  Public
const getAccommodationReviews = async (req, res) => {
  const { id } = req.params;

  try {
    const query = `
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        u.first_name, u.last_name
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.accommodation_id = ?
      ORDER BY r.created_at DESC
    `;

    const [reviews] = await db.query(query, [id]);
    
    // Get average rating and count
    const [stats] = await db.query(
      'SELECT AVG(rating) as avg_rating, COUNT(id) as count FROM reviews WHERE accommodation_id = ?',
      [id]
    );

    res.json({
      reviews,
      avgRating: stats[0].avg_rating ? parseFloat(stats[0].avg_rating).toFixed(1) : '0.0',
      reviewsCount: stats[0].count || 0
    });
  } catch (error) {
    console.error('Error fetching reviews:', error.message);
    res.status(500).json({ message: 'Server error fetching reviews' });
  }
};

// @desc    Create a review for an accommodation
// @route   POST /api/accommodations/:id/reviews
// @access  Private
const createReview = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment || comment.trim() === '') {
    return res.status(400).json({ message: 'Rating and review comment are required' });
  }

  const ratingVal = parseInt(rating, 10);
  if (isNaN(ratingVal) || ratingVal < 1 || ratingVal > 5) {
    return res.status(400).json({ message: 'Rating must be a whole number between 1 and 5' });
  }

  try {
    // Check if accommodation exists
    const [accRows] = await db.query('SELECT id FROM accommodations WHERE id = ?', [id]);
    if (accRows.length === 0) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    // Insert the review
    const [result] = await db.query(
      `INSERT INTO reviews (user_id, accommodation_id, rating, comment)
       VALUES (?, ?, ?, ?)`,
      [userId, id, ratingVal, comment.trim()]
    );

    // Fetch details of the newly inserted review to return
    const [newReviewRows] = await db.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.first_name, u.last_name 
       FROM reviews r 
       INNER JOIN users u ON r.user_id = u.id 
       WHERE r.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      message: 'Review submitted successfully',
      review: newReviewRows[0]
    });
  } catch (error) {
    console.error('Error creating review:', error.message);
    res.status(500).json({ message: 'Server error submitting review' });
  }
};

module.exports = {
  getAccommodationReviews,
  createReview
};
