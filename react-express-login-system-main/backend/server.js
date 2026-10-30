
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

let client;
let users;

app.set('trust proxy', 1);

// CORS: allow the deployed frontend and local development

app.use(cors({
    origin: [
        'https://react-express-login-system-src.vercel.app',
        'https://react-express-login-system-6.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));




app.use(express.json());

// Sessions and cross-site cookies
app.use(session({
    name: 'login.sid',
    secret: process.env.SESSION_SECRET || 'replace-this-with-a-long-random-secret',
    resave: false,
    saveUninitialized: false,
    store: MONGO_URI
        ? MongoStore.create({
            mongoUrl: MONGO_URI,
            dbName: 'loginDB',
            collectionName: 'sessions'
        })
        : undefined,
    cookie: {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Basic health check
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Backend is running!'
    });
});

// Register
app.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirmPassword } = req.body;

        if (!name || !email || !password || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all fields.'
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match.'
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters.'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await users.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const result = await users.insertOne({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            createdAt: new Date()
        });

        req.session.userId = result.insertedId.toString();

        req.session.save((error) => {
            if (error) {
                console.error('Registration session error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Account created, but session setup failed. Please log in.'
                });
            }

            return res.status(201).json({
                success: true,
                message: 'Registration successful.',
                user: {
                    id: result.insertedId.toString(),
                    name: name.trim(),
                    email: normalizedEmail
                }
            });
        });
    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Login
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const user = await users.findOne({
            email: email.trim().toLowerCase()
        });

        if (!user || !user.password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        req.session.userId = user._id.toString();

        req.session.save((error) => {
            if (error) {
                console.error('Login session error:', error);
                return res.status(500).json({
                    success: false,
                    message: 'Could not create login session.'
                });
            }

            return res.json({
                success: true,
                message: 'Login successful.',
                user: {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'An error occurred during login.'
        });
    }
});

// Get current user's profile
app.get('/profile', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.status(401).json({
                success: false,
                message: 'Please log in.'
            });
        }

        if (!ObjectId.isValid(req.session.userId)) {
            return res.status(401).json({
                success: false,
                message: 'Invalid session. Please log in again.'
            });
        }

        const user = await users.findOne(
            { _id: new ObjectId(req.session.userId) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please log in again.'
            });
        }

        return res.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Profile error:', error);

        return res.status(500).json({
            success: false,
            message: 'Could not load profile.'
        });
    }
});

// Logout
app.post('/logout', (req, res) => {
    if (!req.session) {
        res.clearCookie('login.sid', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        return res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    }

    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);

            return res.status(500).json({
                success: false,
                message: 'Logout failed.'
            });
        }

        res.clearCookie('login.sid', {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            path: '/'
        });

        return res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
});

// Start server after MongoDB connects
async function startServer() {
    try {
        if (!MONGO_URI) {
            throw new Error('MONGO_URI is missing from the Render environment variables.');
        }

        client = new MongoClient(MONGO_URI);
        await client.connect();

        const db = client.db('loginDB');
        users = db.collection('users');

        await users.createIndex(
            { email: 1 },
            { unique: true }
        );

        console.log('Connected to MongoDB Atlas successfully');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Backend is running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error);
        process.exit(1);
    }
}

startServer();

