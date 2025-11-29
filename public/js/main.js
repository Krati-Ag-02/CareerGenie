// Chatbot Functions
function openChatbot() {
    const modal = document.getElementById('chatbotModal');
    modal.classList.add('active');
    
    // Add welcome message if first time
    const messages = document.getElementById('chatMessages');
    if (messages.children.length === 0) {
        addMessage('bot', 'Hello! I\'m your CareerGenie assistant. How can I help you today?');
    }
}

function closeChatbot() {
    const modal = document.getElementById('chatbotModal');
    modal.classList.remove('active');
}

function handleChatKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessage('user', message);
    input.value = '';
    
    // Show loading
    addMessage('bot', '<div class="loading"></div>');
    
    try {
        const response = await fetch('/api/chatbot/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        
        // Remove loading
        const messages = document.getElementById('chatMessages');
        messages.removeChild(messages.lastChild);
        
        if (data.success) {
            addMessage('bot', data.response);
        } else {
            addMessage('bot', 'Sorry, I encountered an error. Please try again.');
        }
    } catch (error) {
        console.error('Chat error:', error);
        const messages = document.getElementById('chatMessages');
        messages.removeChild(messages.lastChild);
        addMessage('bot', 'Sorry, I\'m having trouble connecting. Please try again.');
    }
}

function addMessage(type, text) {
    const messages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = text;
    messages.appendChild(messageDiv);
    messages.scrollTop = messages.scrollHeight;
}

// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/check');
        const data = await response.json();
        return data.authenticated;
    } catch (error) {
        return false;
    }
}

// Show loading indicator
function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading" style="border-color: var(--primary); border-top-color: transparent;"></div>';
    }
}

// Show error message
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = `<p style="color: var(--danger); text-align: center;">${message}</p>`;
    }
}