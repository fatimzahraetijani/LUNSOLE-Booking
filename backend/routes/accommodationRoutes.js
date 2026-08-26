const express = require('express');
const router = express.Router();
const { getAccommodations, getAccommodationById, createAccommodation } = require('../controllers/accommodationController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// Public routes
router.get('/', getAccommodations);
router.get('/:id', getAccommodationById);

// Reviews sub-route
const reviewRoutes = require('./reviewRoutes');
router.use('/:id/reviews', reviewRoutes);

// Admin only route
router.post('/', protect, adminOnly, createAccommodation);

module.exports = router;
