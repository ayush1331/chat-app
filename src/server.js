// --- 1. Load Environment Variables ---
// This *must* be at the top
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

// --- 2. Import Dependencies ---
const http = require('http');
const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');

// --- 3. Import App Modules ---
const app = require('./app'); // Your configured Express app
const connectDB = require('./config/db'); // Your DB connection function
const socketHandler = require('./services/socketHandler'); // Your socket logic

// --- 4. Connect to Database ---
connectDB();

// --- 5. Create Servers ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

// --- 6. Socket.io Authentication Middleware (Step 4) ---
// This is the most important part!
// It runs before 'io.on('connection')'
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: No token provided.'));
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user info to the socket
    socket.user = decoded.user;
    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token.'));
  }
});

// --- 7. Initialize Socket.io Handler ---
// Pass the 'io' instance to your socket logic
socketHandler(io);

// --- 8. Start Server ---
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});