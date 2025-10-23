// Wait for the DOM to be fully loaded before running any script
document.addEventListener('DOMContentLoaded', () => {

    // --- DOM Elements ---
    // All these variables are now INSIDE the listener
    const authView = document.getElementById('auth-view');
    const chatView = document.getElementById('chat-view');

    // Auth Forms
    const loginForm = document.getElementById('login-form');
    const loginUsernameInput = document.getElementById('login-username');
    const loginPasswordInput = document.getElementById('login-password');
    const loginError = document.getElementById('login-error');

    const registerForm = document.getElementById('register-form');
    const registerUsernameInput = document.getElementById('register-username');
    const registerPasswordInput = document.getElementById('register-password');
    const registerError = document.getElementById('register-error');
    const registerSuccess = document.getElementById('register-success');

    const loginFormContainer = document.getElementById('login-form-container');
    const registerFormContainer = document.getElementById('register-form-container');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');

    // Chat View
    const messageContainer = document.getElementById('message-container');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const userList = document.getElementById('user-list');
    const myUsernameSpan = document.getElementById('my-username');
    const logoutBtn = document.getElementById('logout-btn');

    // Global socket variable
    let socket;
    // Store our own username
    let myUsername = '';


    // --- View Switching ---
    function showChatView() {
        authView.classList.remove('active');
        chatView.classList.add('active');
    }

    function showAuthView() {
        chatView.classList.remove('active');
        authView.classList.add('active');
        // Default to login form
        showLogin();
    }

    function showLogin() {
        registerFormContainer.style.display = 'none';
        loginFormContainer.style.display = 'block';
    }

    function showRegister() {
        loginFormContainer.style.display = 'none';
        registerFormContainer.style.display = 'block';
    }

    // --- API & Socket Functions ---

    /**
    * Handles the login form submission.
    */
    async function handleLogin(e) {
        e.preventDefault();
        const username = loginUsernameInput.value;
        const password = loginPasswordInput.value;
        
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                loginError.textContent = data.msg || 'Login failed';
                return;
            }

            // --- Success! ---
            debugger;
            loginError.textContent = '';
            const token = data.token;
            localStorage.setItem('chat_token', token); // Save token
            myUsername = username; // Save our username
            connectToChat(token); // Connect to chat

        } catch (err) {
            console.error('Error during login:', err); // Added for debugging
            loginError.textContent = 'Server error. Please try again.';
        }
    }

    /**
    * Handles the registration form submission.
    */
    async function handleRegister(e) {
        e.preventDefault();
        const username = registerUsernameInput.value;
        const password = registerPasswordInput.value;
        
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                registerError.textContent = data.msg || 'Registration failed';
                registerSuccess.textContent = '';
                return;
            }

            // --- Success! ---
            registerError.textContent = '';
            registerSuccess.textContent = 'Registration successful! Please log in.';
            registerForm.reset();
            
            // Wait 2 seconds, then switch to login
            setTimeout(() => {
                showLogin();
                registerSuccess.textContent = '';
            }, 2000);

        } catch (err) {
            console.error('Error during registration:', err); // Added for debugging
            registerError.textContent = 'Server error. Please try again.';
        }
    }

    /**
    * Connects to Socket.io and sets up all listeners.
    */
    function connectToChat(token) {
        // Show the chat view
        showChatView();
        myUsernameSpan.textContent = myUsername;
        messageContainer.innerHTML = ''; // Clear old messages

        // Connect with our auth token
        socket = io({
            auth: {
                token: token
            }
        });

        // --- Socket Event Listeners ---
        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            handleLogout(); 
            loginError.textContent = 'Authentication failed. Please log in again.';
        });

        socket.on('system_message', (data) => {
            renderMessage(data, 'system-message');
        });

        socket.on('receive_message', (data) => {
            const type = data.username === myUsername ? 'my-message' : 'other-message';
            renderMessage(data, type);
        });

        socket.on('user_list', (users) => {
            userList.innerHTML = ''; // Clear old list
            users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = user;
                userList.appendChild(li);
            });
        });
    }

    /**
    * Renders a message object to the chat window.
    */
    function renderMessage(data, type) {
        const { username, message, timestamp } = data;

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', type);

        const messageInfo = document.createElement('div');
        messageInfo.classList.add('message-info');

        if (type === 'other-message') {
            messageInfo.textContent = `${username} at ${timestamp}`;
        }
        else if (type === 'my-message') {
            messageInfo.textContent = `You at ${timestamp}`;
        }
        else if (type === 'system-message') {
            messageInfo.textContent = message;
        }
        
        messageDiv.appendChild(messageInfo);

        if (type !== 'system-message') {
            const messageBubble = document.createElement('div');
            messageBubble.classList.add('message-bubble');
            messageBubble.textContent = message;
            messageDiv.appendChild(messageBubble);
        }

        messageContainer.appendChild(messageDiv);
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }

    /**
    * Handles sending a chat message.
    */
    function handleSendMessage(e) {
        e.preventDefault();
        const msg = messageInput.value;
        
        if (msg.trim() && socket) {
            socket.emit('send_message', { message: msg });
            messageInput.value = ''; // Clear input
        }
    }

    /**
    * Handles logging out.
    */
    function handleLogout() {
        localStorage.removeItem('chat_token'); // Clear token
        if (socket) {
            socket.disconnect(); // Disconnect from server
        }
        myUsername = '';
        showAuthView();
    }


    // --- Main Execution ---
    function main() {
        // --- Bind Event Listeners ---
        // These can only be bound *after* the DOM is loaded
        loginForm.addEventListener('submit', handleLogin);
        registerForm.addEventListener('submit', handleRegister);
        chatForm.addEventListener('submit', handleSendMessage);
        logoutBtn.addEventListener('click', handleLogout);
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });

        // --- Check for existing token on page load ---
        const token = localStorage.getItem('chat_token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                myUsername = payload.user.username;
                connectToChat(token);
            } catch (err) {
                console.error("Invalid token on load:", err);
                handleLogout();
                showAuthView();
            }

        } else {
            showAuthView();
        }
    }

    // Run the app
    main();

}); // <-- The closing bracket for the DOMContentLoaded listener