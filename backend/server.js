const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require('./routes/authRoutes');
const accommodationRoutes = require('./routes/accommodationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const adminRoutes = require('./routes/adminRoutes');
const aiRoutes = require('./routes/aiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/accommodations', accommodationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/ai', aiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: "LUNSOLE Booking API is running",
    project: "LUNSOLE Booking"
  });
});

// Simple health check / test route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'LUNSOLE Booking API is running successfully',
    timestamp: new Date()
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('💥 Global Error Caught:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Server is listening on http://localhost:${PORT}`);
});
