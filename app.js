require('dotenv').config();
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');

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

// API proxy routes
app.get('/api/companies', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies`, {
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

app.get('/api/companies/:id', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies/${req.params.id}`, {
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to fetch company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.post('/api/companies', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies`, {
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to create company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.put('/api/companies/:id', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies/${req.params.id}`, {
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to update company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.delete('/api/companies/:id', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies/${req.params.id}`, {
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to delete company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

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
            formattedPhone: formatPhoneNumber(phone) 
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

app.get('/companies', requireAuth, async (req, res) => {
    try {
        const lang = req.query.lang || 'pt';
        // Garantindo que não há barras duplicadas
        const baseUrl = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
        const url = `${baseUrl}/companies`;
                
        const headers = getApiHeaders();
        const apiResponse = await fetch(url, {
            headers: headers
        });

        if (!apiResponse.ok) {
            const errorText = await apiResponse.text();
            console.error('API Error Response:', errorText);
            try {
                const jsonError = JSON.parse(errorText);
                throw new Error(jsonError.message || `API responded with status: ${apiResponse.status}`);
            } catch (e) {
                throw new Error(`API responded with status: ${apiResponse.status}. Response: ${errorText}`);
            }
        }

        const companies = await apiResponse.json();

        res.render('companies', { 
            user: req.session.user,
            companies: companies,
            lang: lang,
            formatPhoneNumber: formatPhoneNumber,
            path: '/companies'
        });
    } catch (error) {
        console.error('Error fetching companies:', error);
        console.error('Stack trace:', error.stack);
        res.render('companies', { 
            user: req.session.user,
            companies: [],
            lang: req.query.lang || 'pt',
            formatPhoneNumber: formatPhoneNumber,
            path: '/companies',
            error: `Failed to fetch companies: ${error.message}`
        });
    }
});

app.get('/empresa', requireAuth, (req, res) => {
    res.redirect('/companies?lang=pt');
});

// Companies API Routes
app.get('/api/companies/:id', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies/${req.params.id}`, {
            headers: getApiHeaders()
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            try {
                const jsonError = JSON.parse(errorText);
                console.error('Parsed API Error:', jsonError);
                throw new Error(jsonError.message || `API responded with status: ${response.status}`);
            } catch (e) {
                throw new Error(`API responded with status: ${response.status}. Response: ${errorText}`);
            }
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching company:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to fetch company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.post('/api/companies', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies`, {
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to create company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.put('/api/companies/:id', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies/${req.params.id}`, {
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to update company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

app.delete('/api/companies/:id', requireAuth, async (req, res) => {
    try {
        const response = await fetch(`${apiBaseUrl}/companies/${req.params.id}`, {
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
        console.error('Stack trace:', error.stack);
        res.status(500).json({ 
            error: 'Failed to delete company', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
