// Application data
const appData = {
  app_info: {
    name: "चेtanā",
    tagline: "Awakening Minds, Nurturing Wellbeing"
  },
  sample_professionals: [
    { name: "Dr. Sarah Seikh", specialty: "Clinical Psychology", rating: 4.8, experience: "8 years", available_slots: ["10:00 AM", "2:00 PM", "4:00 PM"] },
    { name: "Dr. Manish Chand", specialty: "Psychiatry", rating: 4.9, experience: "12 years", available_slots: ["9:00 AM", "1:00 PM", "3:00 PM"] },
    { name: "Dr. Priya Sharma", specialty: "Counseling Psychology", rating: 4.7, experience: "6 years", available_slots: ["11:00 AM", "3:00 PM", "5:00 PM"] }
  ],
  assessment_questions: [
    { id: 1, question: "Over the last 2 weeks, how often have you been bothered by little interest or pleasure in doing things?", type: "PHQ-9", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 2, question: "Over the last 2 weeks, how often have you been bothered by feeling down, depressed, or hopeless?", type: "PHQ-9", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] },
    { id: 3, question: "Over the last 2 weeks, how often have you been bothered by trouble falling or staying asleep?", type: "PHQ-9", options: ["Not at all", "Several days", "More than half the days", "Nearly every day"] }
  ],
  community_posts: [
    { id: 1, title: "Dealing with anxiety during exams", author: "Anonymous User", content: "I've been struggling with test anxiety. Any tips that have worked for you?", upvotes: 12, comments: 8, time: "2 hours ago" },
    { id: 2, title: "Meditation apps that actually work?", author: "MindfulStudent", content: "Looking for recommendations for good meditation apps for beginners.", upvotes: 24, comments: 15, time: "5 hours ago" }
  ],
  chat_messages: [
    { sender: "ai", message: "Hello! I'm your AI therapist. How are you feeling today?", time: "Just now" }
  ],
  quick_responses: ["I feel anxious", "I can't sleep", "I need relaxation", "I'm feeling overwhelmed"]
};

let currentScreen = 'chat-screen';  // Demo chat by default
let currentTheme = 'dark';          // Dark mode default
let chatCount = parseInt(localStorage.getItem('demoChatCount')) || 0;
const DAILY_CHAT_LIMIT = 50;
let previousScreen = 'dashboard-screen';

// Reset daily chat count once a day
(function resetChatCountDaily() {
  const lastDate = localStorage.getItem('lastChatDate');
  const today = new Date().toISOString().slice(0, 10);
  if (lastDate !== today) {
    chatCount = 0;
    localStorage.setItem('lastChatDate', today);
    localStorage.setItem('demoChatCount', chatCount);
  }
})();

// Screen switching
window.showScreen = function(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    if (screen.id === screenId) {
      screen.classList.add('active');
      screen.classList.remove('hidden');
    } else {
      screen.classList.remove('active');
      screen.classList.add('hidden');
    }
  });
  currentScreen = screenId;
};

function showWelcomePopup() {
  const popup = document.getElementById('welcome-popup');
  if (!popup) return;
  popup.classList.add('show');
  popup.classList.remove('hide');
  popup.style.pointerEvents = 'auto';
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hide');
    popup.style.pointerEvents = 'none';
  }, 3000);
}

// Call from your existing showChat function:
window.showChat = function() {
  showScreen('chat-screen');
  const overlay = document.getElementById('chat-overlay') || document.getElementById('chat-entry-overlay');
  if(overlay) overlay.classList.remove('hidden');
  showWelcomePopup();
};


window.showPreviousScreen = function() {
  showScreen(previousScreen || 'dashboard-screen');
};

// Login/Register overlay handlers
window.userChooseLogin = function() {
  document.getElementById('chat-entry-overlay').classList.add('hidden');
  showScreen('login-screen');
};

window.userContinueGuest = function() {
  document.getElementById('chat-entry-overlay').classList.add('hidden');
};

function showWelcomePopup() {
  const popup = document.getElementById('welcome-popup');
  if (!popup) return;
  
  // Reset hide/show classes to trigger animation
  popup.classList.remove('hide');
  popup.classList.add('show');
  popup.style.pointerEvents = 'auto'; // allow interaction if needed
  
  // Hide after 3 seconds
  setTimeout(() => {
    popup.classList.remove('show');
    popup.classList.add('hide');
    popup.style.pointerEvents = 'none';
  }, 3000);
}

// In your showChat function, call showWelcomePopup:
window.showChat = function() {
  showScreen('chat-screen');
  document.getElementById('chat-entry-overlay').classList.remove('hidden');
  showWelcomePopup();
};

window.showLoginScreen = function() {
  document.getElementById('chat-limit-modal').classList.add('hidden');
  showScreen('login-screen');
};

// Permissions modal controls
window.showPermissions = function() {
  document.getElementById('permissions-modal').classList.remove('hidden');
};

window.continueToDashboard = function() {
  document.getElementById('permissions-modal').classList.add('hidden');
  showScreen('dashboard-screen');
};

// Emergency modal
window.showEmergency = function() {
  document.getElementById('emergency-modal').classList.remove('hidden');
};
window.closeEmergency = function() {
  document.getElementById('emergency-modal').classList.add('hidden');
};

// Toggle dark/light theme
window.toggleTheme = function() {
  const body = document.body;
  const icons = document.querySelectorAll('.theme-icon');
  if (currentTheme === 'light') {
    body.setAttribute('data-theme', 'dark');
    icons.forEach(i => i.textContent = '☀️');
    currentTheme = 'dark';
  } else {
    body.setAttribute('data-theme', 'light');
    icons.forEach(i => i.textContent = '🌙');
    currentTheme = 'light';
  }
};

// Dummy login validation
window.handleLogin = function() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!email || !password) {
    alert('Please enter email and password.');
    return;
  }
  if (email === 'user@example.com' && password === 'password123') {
    alert('Login successful.');
    showPermissions();
  } else {
    alert('Invalid credentials. Use user@example.com / password123');
  }
};

// Dummy register validation
window.handleRegister = function() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const phone = document.getElementById('register-phone').value.trim();
  const password = document.getElementById('register-password').value.trim();

  if (!name || !email || !phone || !password) {
    alert('Please fill all the required fields.');
    return;
  }

  // Simple dummy validation could go here
  alert('Registration successful! Please login.');
  showScreen('login-screen');
};

// Simple dummy create account
window.handleCreateAccount = function() {
  const name = document.getElementById('register-name').value.trim();
  const email = document.getElementById('register-email').value.trim();
  const phone = document.getElementById('register-phone').value.trim();
  const dob = document.getElementById('register-dob').value;
  const password = document.getElementById('register-password').value.trim();

  if(!name || !email || !phone || !dob || !password) {
    alert('Please fill all required fields.');
    return;
  }

  // Validate date of birth (example: should be a valid date in the past)
  const dobDate = new Date(dob);
  const now = new Date();
  if (isNaN(dobDate.getTime()) || dobDate >= now) {
    alert('Please enter a valid date of birth.');
    return;
  }


  // Optionally validate other fields further (email format, phone format etc)
  
  // After successful validations, show permissions modal and hide register screen
  showPermissions();
  document.getElementById('register-screen').classList.remove('active');
};

// Chat message sending with overlay and limit enforcement
window.sendMessage = function() {
  if (chatCount >= DAILY_CHAT_LIMIT) {
    document.getElementById('chat-limit-modal').classList.remove('hidden');
    return;
  }
  const overlay = document.getElementById('chat-entry-overlay');
  if (overlay && !overlay.classList.contains('hidden')) {
    alert('Please choose Login/Register or Continue as Guest.');
    return;
  }
  const input = document.getElementById('message-input');
  const message = input.value.trim();
  if (!message) return;
  addMessage('user', message);
  input.value = '';
  chatCount++;
  localStorage.setItem('demoChatCount', chatCount);
  setTimeout(() => {
    const responses = [
      "I understand how you're feeling. Can you tell me more about what's troubling you?",
      "That sounds challenging. Have you tried any coping strategies before?",
      "Thank you for sharing that with me. Let's explore some techniques that might help.",
      "It's completely normal to feel this way. You're taking a positive step by reaching out.",
      "I'm here to support you. Would you like to try a breathing exercise together?"
    ];
    addMessage('ai', responses[Math.floor(Math.random() * responses.length)]);
  }, 1000);
};

window.sendQuickMessage = function(message) {
  addMessage('user', message);
  setTimeout(() => {
    let response = '';
    if (message.includes('anxious')) {
      response = "I can help you with anxiety. Let's try a simple breathing exercise: Breathe in for 4 counts, hold for 4, then exhale for 6. Would you like to practice this together?";
    } else if (message.includes('sleep')) {
      response = "Sleep difficulties can be really challenging. Have you tried establishing a bedtime routine? I can suggest some relaxation techniques that might help.";
    } else if (message.includes('relaxation')) {
      response = "Great choice! Let's start with a progressive muscle relaxation. Begin by tensing and then relaxing your shoulders. How does that feel?";
    } else {
      response = "Thank you for sharing that. I'm here to listen and support you. Can you tell me more about what you're experiencing?";
    }
    addMessage('ai', response);
  }, 1000);
};

// Add a chat message to UI
function addMessage(sender, message) {
  const chatMessages = document.getElementById('chat-messages');
  if (!chatMessages) return;
  const div = document.createElement('div');
  div.className = `message ${sender}-message`;
  const now = new Date();
  div.innerHTML = `<div class="message-bubble">${message}</div><div class="message-time">${now.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})}</div>`;
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

window.handleEnter = function(e) {
  if (e.key === 'Enter') sendMessage();
};

document.addEventListener('DOMContentLoaded', () => {
  showScreen(currentScreen);
  showChat();
});
