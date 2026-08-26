const express = require('express');
const router = express.Router();
const {
  getStats,
  getUsers,
  deleteUser,
  getAccommodationsList,
  createAccommodation,
  updateAccommodation,
  deleteAccommodation,
  getBookingsList,
  updateBookingStatus,
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getReviews,
  deleteReview
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middlewares/authMiddleware');

// All admin routes are protected by auth token and require admin role
router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.delete('/users/:id', deleteUser);

router.get('/accommodations', getAccommodationsList);
router.post('/accommodations', createAccommodation);
router.put('/accommodations/:id', updateAccommodation);
router.delete('/accommodations/:id', deleteAccommodation);

// Rooms CRUD
router.get('/rooms', getRooms);
router.post('/rooms', createRoom);
router.put('/rooms/:id', updateRoom);
router.delete('/rooms/:id', deleteRoom);

// Bookings
router.get('/bookings', getBookingsList);
router.put('/bookings/:id', updateBookingStatus);

// Reviews management
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

module.exports = router;
