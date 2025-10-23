// This Map will store connected users (userID -> username)
// Using a Map is better than an object for this
const connectedUsers = new Map();

function socketHandler(io) {
  
  io.on('connection', (socket) => {
    
    // 'socket.user' was attached by our auth middleware in server.js
    const { username, id: userId } = socket.user;
    console.log(`User connected: ${username} (Socket: ${socket.id})`);

    // Add user to our connected list
    connectedUsers.set(userId, username);

    // Announce user join to everyone *else*
    socket.broadcast.emit('system_message', {
      message: `${username} joined the chat`,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    });

    // Send the updated user list to *everyone*
    io.emit('user_list', Array.from(connectedUsers.values()));

    // --- Handle Chat Messages ---
    socket.on('send_message', (data) => {
      // We use the authenticated username from socket.user
      const messageData = {
        username: username, 
        message: data.message,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        userId: userId // Use the persistent DB user ID
      };
      // Broadcast to everyone
      io.emit('receive_message', messageData);
    });

    // --- Handle Disconnect ---
    socket.on('disconnect', () => {
      console.log(`${username} left the chat`);
      
      // Remove user from the list
      connectedUsers.delete(userId);

      // Broadcast user left message
      io.emit('system_message', {
        message: `${username} left the chat`,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      });

      // Send the final user list
      io.emit('user_list', Array.from(connectedUsers.values()));
    });
  });
}

module.exports = socketHandler;