const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
} = require('../controllers/bookingController');
const { protect } = require('../middlewares/authMiddleware');

// All booking routes require authentication
router.use(protect);

router.post('/', createBooking);
router.get('/my-bookings', getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

module.exports = router;
