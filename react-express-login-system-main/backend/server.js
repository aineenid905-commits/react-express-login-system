
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const uri = process.env.MONGO_URI;

let client;
let users;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174'
    ],
    credentials: true
}));

app.use(express.json());

app.use(session({
    name: 'login.sid',
    secret: process.env.SESSION_SECRET || 'replace-this-with-a-long-random-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: uri,
        dbName: 'loginDB',
        collectionName: 'sessions'
    }),
    cookie: {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.get('/', (req, res) => {
    res.send('Backend is running!');
});

// Register a new user
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
                console.error('Session save error:', error);
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
        res.status(500).json({
            success: false,
            message: 'Registration failed. Please try again.'
        });
    }
});

// Log in an existing user
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
        res.status(500).json({
            success: false,
            message: 'An error occurred during login.'
        });
    }
});

// Return the currently logged-in user's profile
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

        res.json({
            id: user._id.toString(),
            name: user.name,
            email: user.email
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Could not load profile.'
        });
    }
});

// Log out
app.post('/logout', (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                message: 'Logout failed.'
            });
        }

        res.clearCookie('login.sid');
        res.json({
            success: true,
            message: 'Logged out successfully.'
        });
    });
});

async function startServer() {
    try {
        if (!uri) {
            throw new Error('MONGO_URI is missing from your .env file.');
        }

        client = new MongoClient(uri);
        await client.connect();

        const db = client.db('loginDB');
        users = db.collection('users');

        await users.createIndex({ email: 1 }, { unique: true });

        console.log('Connected to MongoDB Atlas successfully');

        app.listen(PORT, () => {
            console.log(`Example app listening on port ${PORT}`);
        });
    } catch (error) {
        console.error('Server startup failed:', error.message);
        process.exit(1);
    }
}

startServer();

