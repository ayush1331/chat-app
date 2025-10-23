const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Store connected users
const users = {};

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // User joins chat
  socket.on('user_join', (username) => {
    users[socket.id] = username;
    console.log(`${username} joined the chat`);
    
    // Broadcast user joined message
    io.emit('system_message', {
      message: `${username} joined the chat`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });
    
    // Send updated user list
    io.emit('user_list', Object.values(users));
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    const username = users[socket.id];
    const messageData = {
      username: username,
      message: data.message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      userId: socket.id
    };
    
    // Broadcast message to all users
    io.emit('receive_message', messageData);
  });

  // User disconnects
  socket.on('disconnect', () => {
    const username = users[socket.id];
    if (username) {
      console.log(`${username} left the chat`);
      delete users[socket.id];
      
      // Broadcast user left message
      io.emit('system_message', {
        message: `${username} left the chat`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });
      
      // Send updated user list
      io.emit('user_list', Object.values(users));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});