const mongoose = require('mongoose');

// Define the schema for hospitals
const hospitalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true, // Hospital name is mandatory
    },
    address: {
        type: String,
        required: true, // Address is mandatory
    },
    location: {
        lat: {
            type: Number,
            required: true, // Latitude is mandatory
        },
        lng: {
            type: Number,
            required: true, // Longitude is mandatory
        },
    },
    phone: {
        type: String, // Optional: Phone number for the hospital
    },
    services: {
        type: [String], // Optional: Array of services provided by the hospital
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now, // Automatically set the timestamp for when the hospital is added
    },
});

// Create and export the model
const Hospital = mongoose.model('Hospital', hospitalSchema);

module.exports = Hospital;
