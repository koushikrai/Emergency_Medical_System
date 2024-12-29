const express = require('express');
const { handleEmergency } = require('../controllers/emergencyController');

const router = express.Router();

// Route to handle emergencies
router.post('/', handleEmergency);

module.exports = router;
