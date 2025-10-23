const socket = io();

let isJoined = false;
let currentUsername = '';

const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const usersList = document.getElementById('usersList');
const chatTitle = document.getElementById('chatTitle');
const userCount = document.getElementById('userCount');

// Join chat
joinBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  
  if (!username) {
    alert('Please enter your name');
    return;
  }

  if (username.length < 2) {
    alert('Name must be at least 2 characters');
    return;
  }

  currentUsername = username;
  isJoined = true;
  
  socket.emit('user_join', username);
  
  // Update UI
  usernameInput.disabled = true;
  joinBtn.disabled = true;
  messageInput.disabled = false;
  sendBtn.disabled = false;
  chatTitle.textContent = `Welcome, ${username}!`;
  
  messageInput.focus();
});

// Send message
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  
  if (!message || !isJoined) {
    return;
  }

  socket.emit('send_message', { message });
  messageInput.value = '';
  messageInput.focus();
}

// Receive messages
socket.on('receive_message', (data) => {
  displayMessage(data);
});

// System messages
socket.on('system_message', (data) => {
  displaySystemMessage(data);
});

// Update user list
socket.on('user_list', (users) => {
  updateUserList(users);
  userCount.textContent = `${users.length} online`;
});

function displayMessage(data) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${data.userId === socket.id ? 'own' : 'other'}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  const senderDiv = document.createElement('div');
  senderDiv.className = 'message-sender';
  senderDiv.textContent = data.username;
  
  const textDiv = document.createElement('div');
  textDiv.textContent = data.message;
  
  const timestampDiv = document.createElement('div');
  timestampDiv.className = 'message-timestamp';
  timestampDiv.textContent = data.timestamp;
  
  contentDiv.appendChild(senderDiv);
  contentDiv.appendChild(textDiv);
  contentDiv.appendChild(timestampDiv);
  messageDiv.appendChild(contentDiv);
  
  messagesContainer.appendChild(messageDiv);
  scrollToBottom();
}

function displaySystemMessage(data) {
  const systemDiv = document.createElement('div');
  systemDiv.className = 'system-message';
  systemDiv.innerHTML = `<strong>${data.message}</strong> <span>${data.timestamp}</span>`;
  
  messagesContainer.appendChild(systemDiv);
  scrollToBottom();
}

function updateUserList(users) {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user;
    usersList.appendChild(li);
  });
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Handle Enter key on username input
usernameInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    joinBtn.click();
  }
});