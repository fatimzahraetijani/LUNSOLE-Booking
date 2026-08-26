const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites } = require('../controllers/favoriteController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/', getFavorites);
router.post('/:accommodationId', addFavorite);
router.delete('/:accommodationId', removeFavorite);

module.exports = router;
