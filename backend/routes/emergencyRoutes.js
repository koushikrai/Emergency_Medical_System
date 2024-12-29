const express = require('express');
const { handleEmergency } = require('../controllers/emergencyController');

const router = express.Router();

// Route to handle finding nearest hospital (now part of the emergency handler)
router.post('/nearest-hospital', handleEmergency);

// General route to handle emergencies
router.post('/', handleEmergency);

module.exports = router;
