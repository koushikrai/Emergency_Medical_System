const express = require('express');
const cors = require('cors');
const logger = require('../logger');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/emergency', require('./routes/emergencyRoutes'));

// Centralized Error-Handling Middleware
app.use((err, req, res, next) => {
    // Log error using logger
    logger.error({
        message: err.message,
        stack: err.stack,
        details: err.details || 'No additional details provided.',
    });

    // Respond to the client
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        details: err.details || 'An unexpected error occurred.',
    });
});

// Export the app
module.exports = app;
