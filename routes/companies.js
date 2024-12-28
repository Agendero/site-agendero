const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

// Helper function to get API headers
const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key-admin': process.env.Authentication__ApiKey,
    'Accept': 'application/json'
});

// Get all companies
router.get('/', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/companies`, {
            headers: getApiHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.status(500).json({ error: 'Failed to fetch companies', details: error.message });
    }
});

// Get company by ID
router.get('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/companies/${req.params.id}`, {
            headers: getApiHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            try {
                const jsonError = JSON.parse(errorText);
                throw new Error(jsonError.message || `API responded with status: ${response.status}`);
            } catch (e) {
                throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
            }
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching company:', error);
        res.status(500).json({ 
            error: 'Failed to fetch company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Create new company
router.post('/', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/companies`, {
            method: 'POST',
            headers: getApiHeaders(),
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            try {
                const jsonError = JSON.parse(errorText);
                throw new Error(jsonError.message || `API responded with status: ${response.status}`);
            } catch (e) {
                throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
            }
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error creating company:', error);
        res.status(500).json({ 
            error: 'Failed to create company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update company
router.put('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/companies/${req.params.id}`, {
            method: 'PUT',
            headers: getApiHeaders(),
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            try {
                const jsonError = JSON.parse(errorText);
                throw new Error(jsonError.message || `API responded with status: ${response.status}`);
            } catch (e) {
                throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
            }
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error updating company:', error);
        res.status(500).json({ 
            error: 'Failed to update company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Delete company
router.delete('/:id', async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/companies/${req.params.id}`, {
            method: 'DELETE',
            headers: getApiHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            try {
                const jsonError = JSON.parse(errorText);
                throw new Error(jsonError.message || `API responded with status: ${response.status}`);
            } catch (e) {
                throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
            }
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error deleting company:', error);
        res.status(500).json({ 
            error: 'Failed to delete company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

module.exports = router;
