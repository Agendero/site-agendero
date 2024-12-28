const express = require('express');
const router = express.Router();

// Agenda page
router.get('/', (req, res) => {
    res.render('agenda', { 
        user: req.session.user,
        path: '/agenda'
    });
});

module.exports = router;
