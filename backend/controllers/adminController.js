const db = require('../config/db');

// @desc    Get administrative statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const [[usersCount]] = await db.query('SELECT COUNT(*) as count FROM users');
    const [[accCount]] = await db.query('SELECT COUNT(*) as count FROM accommodations');
    const [[roomsCount]] = await db.query('SELECT COUNT(*) as count FROM rooms');
    const [[bookingsCount]] = await db.query('SELECT COUNT(*) as count FROM bookings');

    // Booking status counts
    const [statusRows] = await db.query(
      'SELECT status, COUNT(*) as count FROM bookings GROUP BY status'
    );

    const statusCounts = {
      pending: 0,
      confirmed: 0,
      cancelled: 0
    };

    statusRows.forEach(row => {
      statusCounts[row.status] = row.count;
    });

    // Total estimated revenue from active bookings (confirmed/pending)
    const [[revenueRow]] = await db.query(
      'SELECT SUM(total_price) as total FROM bookings WHERE status != \'cancelled\''
    );
    const estimatedRevenue = revenueRow.total || 0;

    res.json({
      totalUsers: usersCount.count,
      totalAccommodations: accCount.count,
      totalRooms: roomsCount.count,
      totalBookings: bookingsCount.count,
      statusCounts,
      estimatedRevenue: parseFloat(estimatedRevenue).toFixed(2)
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error.message);
    res.status(500).json({ message: 'Server error fetching admin stats' });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, first_name, last_name, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Error fetching users list:', error.message);
    res.status(500).json({ message: 'Server error fetching users list' });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    // Prevent deleting oneself
    if (parseInt(id, 10) === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own admin account' });
    }

    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

// @desc    Get all accommodations (admin list)
// @route   GET /api/admin/accommodations
// @access  Private/Admin
const getAccommodationsList = async (req, res) => {
  try {
    const [accommodations] = await db.query('SELECT * FROM accommodations ORDER BY created_at DESC');
    res.json(accommodations);
  } catch (error) {
    console.error('Error fetching accommodations:', error.message);
    res.status(500).json({ message: 'Server error fetching accommodations' });
  }
};

// @desc    Create accommodation (handled in accommodationController, but added here for redundancy/restfulness)
// @route   POST /api/admin/accommodations
// @access  Private/Admin
const createAccommodation = async (req, res) => {
  const { name, description, type, country, city, address, latitude, longitude, stars, image_url } = req.body;

  if (!name || !description || !type || !country || !city || !address) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO accommodations (name, description, type, country, city, address, latitude, longitude, stars, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, description, type, country, city, address, latitude || 0, longitude || 0, stars || 0, image_url]
    );

    res.status(201).json({ message: 'Accommodation created', id: result.insertId });
  } catch (error) {
    console.error('Error creating accommodation:', error.message);
    res.status(500).json({ message: 'Server error creating accommodation' });
  }
};

// @desc    Update accommodation details
// @route   PUT /api/admin/accommodations/:id
// @access  Private/Admin
const updateAccommodation = async (req, res) => {
  const { id } = req.params;
  const { name, description, type, country, city, address, latitude, longitude, stars, image_url } = req.body;

  try {
    const [check] = await db.query('SELECT id FROM accommodations WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Accommodation not found' });
    }

    await db.query(
      `UPDATE accommodations 
       SET name = ?, description = ?, type = ?, country = ?, city = ?, address = ?, latitude = ?, longitude = ?, stars = ?, image_url = ?
       WHERE id = ?`,
      [name, description, type, country, city, address, latitude || 0, longitude || 0, stars || 0, image_url, id]
    );

    res.json({ message: 'Accommodation updated successfully' });
  } catch (error) {
    console.error('Error updating accommodation:', error.message);
    res.status(500).json({ message: 'Server error updating accommodation' });
  }
};

// @desc    Delete accommodation
// @route   DELETE /api/admin/accommodations/:id
// @access  Private/Admin
const deleteAccommodation = async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM accommodations WHERE id = ?', [id]);
    res.json({ message: 'Accommodation deleted successfully' });
  } catch (error) {
    console.error('Error deleting accommodation:', error.message);
    res.status(500).json({ message: 'Server error deleting accommodation' });
  }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getBookingsList = async (req, res) => {
  try {
    const query = `
      SELECT 
        b.id AS booking_id, b.check_in, b.check_out, b.total_price, b.status, b.guests_count, b.created_at,
        u.first_name, u.last_name, u.email,
        r.name AS room_name,
        a.name AS accommodation_name
      FROM bookings b
      INNER JOIN users u ON b.user_id = u.id
      INNER JOIN rooms r ON b.room_id = r.id
      INNER JOIN accommodations a ON r.accommodation_id = a.id
      ORDER BY b.created_at DESC
    `;
    const [bookings] = await db.query(query);
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error.message);
    res.status(500).json({ message: 'Server error fetching bookings' });
  }
};

// @desc    Update booking status
// @route   PUT /api/admin/bookings/:id
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid booking status' });
  }

  try {
    const [check] = await db.query('SELECT id FROM bookings WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Error updating booking status:', error.message);
    res.status(500).json({ message: 'Server error updating booking status' });
  }
};

// @desc    Get all rooms (admin list)
// @route   GET /api/admin/rooms
// @access  Private/Admin
const getRooms = async (req, res) => {
  try {
    const [rooms] = await db.query(`
      SELECT r.*, a.name AS accommodation_name 
      FROM rooms r
      INNER JOIN accommodations a ON r.accommodation_id = a.id
      ORDER BY r.id DESC
    `);
    
    // Format JSON array response
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

    res.json(formattedRooms);
  } catch (error) {
    console.error('Error fetching rooms:', error.message);
    res.status(500).json({ message: 'Server error fetching rooms' });
  }
};

// @desc    Create a room (admin)
// @route   POST /api/admin/rooms
// @access  Private/Admin
const createRoom = async (req, res) => {
  const { accommodation_id, name, type, price_per_night, capacity, description, amenities, image_url } = req.body;

  if (!accommodation_id || !name || !type || price_per_night === undefined || capacity === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const finalAmenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);

  try {
    const [result] = await db.query(
      `INSERT INTO rooms (accommodation_id, name, type, price_per_night, capacity, description, amenities, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [accommodation_id, name, type, price_per_night, capacity, description || '', finalAmenities, image_url || '']
    );

    res.status(201).json({ message: 'Room created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating room:', error.message);
    res.status(500).json({ message: 'Server error creating room' });
  }
};

// @desc    Update a room (admin)
// @route   PUT /api/admin/rooms/:id
// @access  Private/Admin
const updateRoom = async (req, res) => {
  const { id } = req.params;
  const { accommodation_id, name, type, price_per_night, capacity, description, amenities, image_url } = req.body;

  if (!accommodation_id || !name || !type || price_per_night === undefined || capacity === undefined) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  const finalAmenities = typeof amenities === 'string' ? amenities : JSON.stringify(amenities || []);

  try {
    const [check] = await db.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await db.query(
      `UPDATE rooms 
       SET accommodation_id = ?, name = ?, type = ?, price_per_night = ?, capacity = ?, description = ?, amenities = ?, image_url = ?
       WHERE id = ?`,
      [accommodation_id, name, type, price_per_night, capacity, description || '', finalAmenities, image_url || '', id]
    );

    res.json({ message: 'Room updated successfully' });
  } catch (error) {
    console.error('Error updating room:', error.message);
    res.status(500).json({ message: 'Server error updating room' });
  }
};

// @desc    Delete a room (admin)
// @route   DELETE /api/admin/rooms/:id
// @access  Private/Admin
const deleteRoom = async (req, res) => {
  const { id } = req.params;

  try {
    const [check] = await db.query('SELECT id FROM rooms WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }

    await db.query('DELETE FROM rooms WHERE id = ?', [id]);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error.message);
    res.status(500).json({ message: 'Server error deleting room' });
  }
};

// @desc    Get all reviews (admin list)
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getReviews = async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, a.name AS accommodation_name, u.first_name, u.last_name, u.email
      FROM reviews r
      INNER JOIN accommodations a ON r.accommodation_id = a.id
      INNER JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews list:', error.message);
    res.status(500).json({ message: 'Server error fetching reviews list' });
  }
};

// @desc    Delete a review (admin)
// @route   DELETE /api/admin/reviews/:id
// @access  Private/Admin
const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    const [check] = await db.query('SELECT id FROM reviews WHERE id = ?', [id]);
    if (check.length === 0) {
      return res.status(404).json({ message: 'Review not found' });
    }

    await db.query('DELETE FROM reviews WHERE id = ?', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error.message);
    res.status(500).json({ message: 'Server error deleting review' });
  }
};

module.exports = {
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
};
