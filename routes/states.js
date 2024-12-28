const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Get states list
router.get('/', async (req, res) => {
    try {
        const language = req.language || 'pt';
        const statesPath = path.join(__dirname, `../locales/${language}/states.json`);
        const statesData = await fs.readFile(statesPath, 'utf8');
        const states = JSON.parse(statesData);
        res.json(states);
    } catch (error) {
        console.error('Error loading states:', error);
        res.status(500).json({ error: 'Error loading states' });
    }
});

module.exports = router;
