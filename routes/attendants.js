const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Helper function to get API headers
const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key-admin': process.env.Authentication__ApiKey,
    'Accept': 'application/json'
});

// Get all attendants
router.get('/', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/attendants`, {
            headers: getApiHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching attendants:', error);
        res.status(500).json({ error: 'Failed to fetch attendants', details: error.message });
    }
});

// Get attendant by ID
router.get('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/attendants/${req.params.id}`, {
            headers: getApiHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching attendant:', error);
        res.status(500).json({ error: 'Failed to fetch attendant', details: error.message });
    }
});

// Create new attendant
router.post('/', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/attendants`, {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating attendant:', error);
        res.status(500).json({ error: 'Failed to create attendant', details: error.message });
    }
});

// Update attendant
router.put('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/attendants/${req.params.id}`, {
            method: 'PUT',
            headers: getApiHeaders(),
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error updating attendant:', error);
        res.status(500).json({ error: 'Failed to update attendant', details: error.message });
    }
});

// Delete attendant
router.delete('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/attendants/${req.params.id}`, {
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
        console.error('Error deleting attendant:', error);
        res.status(500).json({ error: 'Failed to delete attendant', details: error.message });
    }
});

module.exports = router;
