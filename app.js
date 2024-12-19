require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Set logo URL for all views
app.use((req, res, next) => {
    res.locals.logoUrl = process.env.URL_LOGO || 'https://minio01.agendero.com/api/v1/buckets/apisite/objects/download?preview=true&prefix=logo.png&version_id=null';
    next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/');
    }
};

// Routes
app.get('/', (req, res) => {
    res.render('login', { 
        path: '/',
        logoUrl: res.locals.logoUrl 
    });
});

app.post('/login', (req, res) => {
    const { phone } = req.body;
    // Remove todos os caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    if (cleanPhone && cleanPhone.length === 11) {
        req.session.user = { 
            phone: cleanPhone,
            formattedPhone: phone 
        };
        res.redirect('/agenda');
    } else {
        res.redirect('/');
    }
});

app.get('/agenda', requireAuth, (req, res) => {
    res.render('agenda', { 
        user: req.session.user,
        path: '/agenda'
    });
});

app.get('/settings', requireAuth, (req, res) => {
    res.render('settings', { 
        user: req.session.user,
        path: '/settings'
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
