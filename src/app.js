const express = require('express');
const path = require('path');

const app = express();

// --- Middleware ---
// To parse JSON request bodies
app.use(express.json());

// Serve static files (your HTML, CSS, client-side JS)
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- API Routes ---
// Mount your API routes from src/routes/index.js
// All routes will be prefixed with /api
app.use('/api', require('./routes'));

module.exports = app;