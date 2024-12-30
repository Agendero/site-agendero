const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Helper function to get API headers
const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key-admin': process.env.Authentication__ApiKey,
    'Accept': 'application/json'
});

// Get all specialties
router.get('/', async (req, res) => {
    try {
        console.log('Fetching specialties from:', `${process.env.URL_API}/specialties`);
        console.log('Using headers:', getApiHeaders());
        
        const response = await fetch(`${process.env.URL_API}/specialties`, {
            headers: getApiHeaders()
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response body:', errorText);
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        console.log('Received data:', data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching specialties:', error);
        res.status(500).json({ error: 'Failed to fetch specialties', details: error.message });
    }
});

// Get specialty by ID
router.get('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/specialties/${req.params.id}`, {
            headers: getApiHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching specialty:', error);
        res.status(500).json({ error: 'Failed to fetch specialty', details: error.message });
    }
});

// Create new specialty
router.post('/', async (req, res) => {
    try {
        const specialty = {
            name: req.body.name,
            description: req.body.description
        };

        const response = await fetch(`${process.env.URL_API}/specialties`, {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(specialty)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating specialty:', error);
        res.status(500).json({ error: 'Failed to create specialty', details: error.message });
    }
});

// Update specialty
router.put('/:id', async (req, res) => {
    try {
        const specialty = {
            name: req.body.name,
            description: req.body.description
        };

        const response = await fetch(`${process.env.URL_API}/specialties/${req.params.id}`, {
            method: 'PUT',
            headers: getApiHeaders(),
            body: JSON.stringify(specialty)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error updating specialty:', error);
        res.status(500).json({ error: 'Failed to update specialty', details: error.message });
    }
});

// Delete specialty
router.delete('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/specialties/${req.params.id}`, {
            method: 'DELETE',
            headers: getApiHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error deleting specialty:', error);
        res.status(500).json({ error: 'Failed to delete specialty', details: error.message });
    }
});

module.exports = router;
