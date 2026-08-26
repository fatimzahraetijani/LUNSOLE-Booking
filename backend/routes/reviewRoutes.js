const express = require('express');
const router = express.Router({ mergeParams: true }); // Need mergeParams to access :id from parent router
const { getAccommodationReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', getAccommodationReviews);
router.post('/', protect, createReview);

module.exports = router;
