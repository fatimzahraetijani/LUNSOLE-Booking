const express = require('express');
const router = express.Router();
const { searchLocations, reverseGeocode } = require('../controllers/locationController');

router.get('/search', searchLocations);
router.get('/reverse', reverseGeocode);

module.exports = router;
