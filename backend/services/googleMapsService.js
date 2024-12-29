const NodeCache = require('node-cache');
const axios = require('axios');
const Hospital = require('../models/Hospital'); // Import the Hospital model

const cache = new NodeCache({ stdTTL: 600 }); // Cache items for 10 minutes
const googleMapsAPI = process.env.GOOGLE_MAPS_API_KEY;

async function geocodeAddress(address) {
    const cacheKey = `geocode-${address}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsAPI}`;
    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
        throw new Error(`Geocoding failed: ${response.data.status}`);
    }

    const location = response.data.results[0].geometry.location;
    cache.set(cacheKey, location); // Store result in cache
    return location;
}

async function findNearbyHospitals(lat, lng) {
    const cacheKey = `hospitals-${lat}-${lng}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&type=hospital&key=${googleMapsAPI}`;
    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
        throw new Error(`Places API failed: ${response.data.status}`);
    }

    const hospitals = response.data.results;

    // Save new hospitals to the database and return the updated list
    const savedHospitals = await saveHospitals(hospitals);

    cache.set(cacheKey, savedHospitals); // Store result in cache
    return savedHospitals;
}

async function saveHospitals(hospitals) {
    const savedHospitals = [];

    for (const hospital of hospitals) {
        // Check if the hospital already exists in the database
        let existingHospital = await Hospital.findOne({ placeId: hospital.place_id });

        if (!existingHospital) {
            // If the hospital does not exist, create a new one
            const newHospital = new Hospital({
                name: hospital.name,
                address: hospital.vicinity,
                location: {
                    lat: hospital.geometry.location.lat,
                    lng: hospital.geometry.location.lng,
                },
                placeId: hospital.place_id, // Store the unique place ID from the API
                phone: hospital.formatted_phone_number || '',
                services: hospital.types || [], // Can be modified as needed
            });

            existingHospital = await newHospital.save();
        }

        savedHospitals.push(existingHospital);
    }

    return savedHospitals;
}

async function getDirections(origin, destinationPlaceId) {
    const cacheKey = `directions-${origin.lat}-${origin.lng}-${destinationPlaceId}`;
    if (cache.has(cacheKey)) {
        return cache.get(cacheKey);
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=place_id:${destinationPlaceId}&key=${googleMapsAPI}`;
    const response = await axios.get(url);

    if (response.data.status !== 'OK') {
        throw new Error(`Directions API failed: ${response.data.status}`);
    }

    const route = response.data.routes[0];
    cache.set(cacheKey, route); // Store result in cache
    return route;
}

module.exports = { geocodeAddress, findNearbyHospitals, getDirections };
