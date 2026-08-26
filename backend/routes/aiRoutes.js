const express = require('express');
const router = express.Router();
const { getAIRecommendations } = require('../controllers/aiController');

router.post('/recommend', getAIRecommendations);

module.exports = router;
