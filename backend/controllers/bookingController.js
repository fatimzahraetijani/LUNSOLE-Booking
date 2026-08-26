const db = require('../config/db');

// Helper to calculate number of nights
const getNumberOfNights = (checkInStr, checkOutStr) => {
  const checkIn = new Date(checkInStr);
  const checkOut = new Date(checkOutStr);
  const diffTime = checkOut - checkIn;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  const { roomId, checkIn, checkOut, guestsCount } = req.body;
  const userId = req.user.id;

  if (!roomId || !checkIn || !checkOut || !guestsCount) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Validate dates
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return res.status(400).json({ message: 'Invalid check-in or check-out date' });
  }

  if (checkInDate < today) {
    return res.status(400).json({ message: 'Check-in date cannot be in the past' });
  }

  if (checkOutDate <= checkInDate) {
    return res.status(400).json({ message: 'Check-out date must be after check-in date' });
  }

  try {
    // 1. Check if room exists
    const [roomRows] = await db.query('SELECT * FROM rooms WHERE id = ?', [roomId]);
    if (roomRows.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    const room = roomRows[0];

    // 2. Validate guests capacity
    if (guestsCount > room.capacity) {
      return res.status(400).json({ message: `Guests count exceeds room capacity of ${room.capacity}` });
    }

    // 3. Check for overlapping bookings
    const [overlapRows] = await db.query(
      `SELECT * FROM bookings 
       WHERE room_id = ? 
         AND status != 'cancelled'
         AND check_in < ? 
         AND check_out > ?`,
      [roomId, checkOut, checkIn]
    );

    if (overlapRows.length > 0) {
      return res.status(400).json({ message: 'Room is already booked for these dates' });
    }

    // 4. Calculate total price
    const nights = getNumberOfNights(checkIn, checkOut);
    const totalPrice = room.price_per_night * nights;

    // 5. Store booking in database
    const [result] = await db.query(
      `INSERT INTO bookings (user_id, room_id, check_in, check_out, total_price, status, guests_count)
       VALUES (?, ?, ?, ?, ?, 'confirmed', ?)`,
      [userId, roomId, checkIn, checkOut, totalPrice, guestsCount]
    );

    res.status(201).json({
      message: 'Booking created successfully',
      bookingId: result.insertId,
      totalPrice,
      nights
    });
  } catch (error) {
    console.error('Error creating booking:', error.message);
    res.status(500).json({ message: 'Server error creating booking' });
  }
};

// @desc    Get user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res) => {
  const userId = req.user.id;

  try {
    const query = `
      SELECT 
        b.id AS booking_id, b.check_in, b.check_out, b.total_price, b.status, b.guests_count, b.created_at,
        r.id AS room_id, r.name AS room_name, r.type AS room_type, r.price_per_night,
        a.id AS accommodation_id, a.name AS accommodation_name, a.city, a.country, a.address, a.image_url AS accommodation_image
      FROM bookings b
      INNER JOIN rooms r ON b.room_id = r.id
      INNER JOIN accommodations a ON r.accommodation_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `;

    const [bookings] = await db.query(query, [userId]);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// @desc    Get details of a single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const query = `
      SELECT 
        b.id AS booking_id, b.user_id, b.check_in, b.check_out, b.total_price, b.status, b.guests_count, b.created_at,
        r.id AS room_id, r.name AS room_name, r.type AS room_type, r.price_per_night,
        a.id AS accommodation_id, a.name AS accommodation_name, a.city, a.country, a.address, a.image_url AS accommodation_image
      FROM bookings b
      INNER JOIN rooms r ON b.room_id = r.id
      INNER JOIN accommodations a ON r.accommodation_id = a.id
      WHERE b.id = ?
    `;

    const [rows] = await db.query(query, [id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = rows[0];

    // Check if user owns the booking or is admin
    if (booking.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this booking' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking details:', error.message);
    res.status(500).json({ message: 'Server error fetching booking details' });
  }
};

// @desc    Cancel a booking
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Check if booking exists and get owner
    const [bookingRows] = await db.query('SELECT user_id, status FROM bookings WHERE id = ?', [id]);
    if (bookingRows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingRows[0];

    // Check ownership or admin privilege
    if (booking.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    // Update booking status to cancelled
    await db.query('UPDATE bookings SET status = \'cancelled\' WHERE id = ?', [id]);

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling booking:', error.message);
    res.status(500).json({ message: 'Server error cancelling booking' });
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking
};
