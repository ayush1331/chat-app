const express = require('express');
const router = express.Router();

// Mount the auth routes
// All routes in 'auth.js' will be prefixed with /auth
router.use('/auth', require('./auth'));

module.exports = router;