require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const fetch = require('node-fetch');
const fs = require('fs').promises;

// Import i18n configuration
require('./config/i18n');

// Import routes
const authRoutes = require('./routes/auth');
const companiesRoutes = require('./routes/companies');
const attendantsRoutes = require('./routes/attendants');
const specialtiesRoutes = require('./routes/specialties');
const statesRoutes = require('./routes/states');
const agendaRoutes = require('./routes/agenda');

const app = express();
const port = process.env.PORT || 3000;
const apiBaseUrl = process.env.URL_API || 'https://api.agendero.com';

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// i18n middleware
app.use(i18nextMiddleware.handle(i18next));

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

// Função helper para criar headers padrão
const getApiHeaders = () => ({
    'Content-Type': 'application/json',
    'x-api-key-admin': process.env.Authentication__ApiKey,
    'Accept': 'application/json'
});

// Função para formatar número de telefone
const formatPhoneNumber = (number) => {
    if (!number) return '';
    
    // Remove tudo que não for número
    const cleaned = number.toString().replace(/\D/g, '');
    
    // Verifica se tem a quantidade correta de dígitos
    if (cleaned.length !== 11) return number;
    
    // Formata o número como (XX) XXXXX-XXXX
    return `(${cleaned.substring(0, 2)}) ${cleaned.substring(2, 7)}-${cleaned.substring(7)}`;
};

// Apply routes
app.use('/', authRoutes);
app.use('/api/companies', requireAuth, companiesRoutes);
app.use('/api/attendants', requireAuth, attendantsRoutes);
app.use('/api/specialties', requireAuth, specialtiesRoutes);
app.use('/api/states', statesRoutes);
app.use('/agenda', requireAuth, agendaRoutes);

// Settings page route
app.get('/settings', requireAuth, (req, res) => {
    res.render('settings', { 
        user: req.session.user,
        path: '/settings'
    });
});

// Specialties page route
app.get('/especialidades', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/specialties`, {
            headers: getApiHeaders()
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const specialties = await response.json();
        
        res.render('specialties', { 
            user: req.session.user,
            specialties: specialties,
            path: '/especialidades'
        });
    } catch (error) {
        console.error('Error fetching specialties:', error);
        res.render('specialties', { 
            user: req.session.user,
            specialties: [],
            path: '/especialidades',
            error: `Failed to fetch specialties: ${error.message}`
        });
    }
});

// Language switcher endpoint
app.post('/change-language', (req, res) => {
    const { language } = req.body;
    if (['pt', 'en', 'es'].includes(language)) {
        res.cookie('language', language, { maxAge: 365 * 24 * 60 * 60 * 1000 }); // 1 year
        res.redirect('back');
    } else {
        res.status(400).json({ error: 'Invalid language' });
    }
});

// Companies page route
app.get('/empresas', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies`, {
            headers: getApiHeaders()
        });

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const companies = await response.json();
        res.render('companies', { 
            user: req.session.user,
            companies: companies,
            path: '/empresas',
            formatPhoneNumber: formatPhoneNumber
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        res.render('companies', { 
            user: req.session.user,
            companies: [],
            path: '/empresas',
            error: 'Failed to fetch companies',
            formatPhoneNumber: formatPhoneNumber
        });
    }
});

app.get('/empresa', requireAuth, async (req, res) => {
    res.render('companies', { path: '/empresa' });
});

// Route to attendants page
app.get('/atendentes', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${process.env.URL_API}/attendants`, {
            headers: {
                'x-api-key-admin': process.env.Authentication__ApiKey,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const attendants = await response.json();
        res.render('attendants', { 
            path: '/atendentes',
            attendants: attendants 
        });
    } catch (error) {
        console.error('Error fetching attendants:', error);
        res.render('attendants', { 
            path: '/atendentes',
            attendants: [],
            error: 'Error fetching attendants data'
        });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
