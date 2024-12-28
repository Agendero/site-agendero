const express = require('express');
const router = express.Router();

// Helper function to format phone number
const formatPhoneNumber = (number) => {
    if (!number) return '';
    
    // Remove non-numeric characters
    const cleaned = number.toString().replace(/\D/g, '');
    
    // Check if it has the correct number of digits
    if (cleaned.length !== 11) return number;
    
    // Format as (XX) XXXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

// Login page
router.get('/', (req, res) => {
    res.render('login', { 
        path: '/',
        logoUrl: res.locals.logoUrl 
    });
});

// Login process
router.post('/login', (req, res) => {
    const { phone } = req.body;
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone && cleanPhone.length === 11) {
        req.session.user = { 
            phone: cleanPhone,
            formattedPhone: formatPhoneNumber(phone) 
        };
        res.redirect('/agenda');
    } else {
        res.redirect('/');
    }
});

// Language switcher
router.post('/change-language', (req, res) => {
    const { language } = req.body;
    if (['pt', 'en', 'es'].includes(language)) {
        res.cookie('language', language, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
        res.redirect('back');
    } else {
        res.status(400).json({ error: 'Invalid language' });
    }
});

module.exports = router;
