const express = require('express');
const router = express.Router();
const { handlePostEvent } = require('../controllers/eventController');

// POST /api/v1/events
router.post('/', handlePostEvent);

module.exports = router;
