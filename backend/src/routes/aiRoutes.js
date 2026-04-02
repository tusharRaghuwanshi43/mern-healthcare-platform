const express = require('express');
const { analyzeSymptoms } = require('../controllers/aiController');

const router = express.Router();

// Route: POST /api/ai/analyze-symptoms
router.post('/analyze-symptoms', analyzeSymptoms);

module.exports = router;
