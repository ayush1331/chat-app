const jwt = require('jsonwebtoken');

// This function is for protecting API routes (e.g., /api/profile)
// We aren't using it yet, but it's good to have.
module.exports = function(req, res, next) {
  // Get token from the 'x-auth-token' header
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};