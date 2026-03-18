const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-varnguard-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://<user>:<pass>@cluster0.mongodb.net/varnguard';
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000/analyze';

app.use(cors());
app.use(express.json());

// --- MongoDB Setup ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const scanSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    url: { type: String, required: true },
    riskScore: { type: Number, required: true },
    summary: { type: [String], required: true },
    timestamp: { type: Date, default: Date.now }
});

const Scan = mongoose.model('Scan', scanSchema);

// --- JWT Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access token required' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid or expired token' });
        req.user = user;
        next();
    });
};

// --- Routes ---
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'VarnGuard Node API' });
});

// Temporary endpoint to get a token for testing
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    // In a real app, authenticate against a DB here
    const user = { id: username || 'test-user-id', role: 'user' };
    const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
});

app.post('/api/scan', authenticateToken, async (req, res) => {
    const { text, url } = req.body;

    if (!text || !url) {
        return res.status(400).json({ error: 'Missing text or url in request body' });
    }

    try {
        // Forward to Python AI service
        const aiResponse = await axios.post(AI_SERVICE_URL, { text });
        
        const { riskScore, summary } = aiResponse.data;

        // Log to MongoDB
        const newScan = new Scan({
            userId: req.user.id,
            url,
            riskScore,
            summary
        });
        await newScan.save();

        // Return AI response back to extension
        res.json({ riskScore, summary });
        
    } catch (error) {
        console.error('Error during scan process:', error.message);
        if (error.response) {
            // Forward error from AI service if it's an HTTP error
            res.status(error.response.status).json({ error: 'AI service error', details: error.response.data });
        } else {
            res.status(500).json({ error: 'Internal server error during scan' });
        }
    }
});

app.get('/api/scans', authenticateToken, async (req, res) => {
    try {
        // Fetch all scans for the authenticated user, newest first
        const scans = await Scan.find({ userId: req.user.id }).sort({ timestamp: -1 });
        res.json(scans);
    } catch (error) {
        console.error('Error fetching scans:', error.message);
        res.status(500).json({ error: 'Failed to fetch scan history' });
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
