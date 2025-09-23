document.addEventListener('DOMContentLoaded', () => {
    // --- STATE VARIABLES ---
    let currentScreen = 'login-screen';
    let chatCount = parseInt(localStorage.getItem('demoChatCount')) || 0;
    const DAILY_CHAT_LIMIT = 50;
    let currentTheme = 'dark';
    let allQuestions = [];
    let currentQuestionIndex = 0;
    let userAnswers = {};
    let progressChart;
    
    // API Base URL
    const API_BASE = '';
    
    // --- DATA & CONFIG ---
    const dummyAiResponses = [
        "Thank you for sharing. How does that make you feel?",
        "I understand. Could you tell me more about what's on your mind?",
        "That sounds challenging. I'm here to listen.",
        "It takes courage to open up about that. What are your thoughts on it?",
        "I hear you. Let's explore that feeling a bit more."
    ];

    const assessmentData = {
        phq9: {
            title: "Depression (PHQ-9)",
            questions: ["Little interest or pleasure in doing things.","Feeling down, depressed, or hopeless.","Trouble falling or staying asleep, or sleeping too much.","Feeling tired or having little energy.","Poor appetite or overeating.","Feeling bad about yourself — or that you are a failure or have let yourself or your family down.","Trouble concentrating on things, such as reading the newspaper or watching television.","Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual.","Thoughts that you would be better off dead or of hurting yourself in some way."],
            options: [{ text: "Not at all", value: 0 },{ text: "Several days", value: 1 },{ text: "More than half the days", value: 2 },{ text: "Nearly every day", value: 3 }]
        },
        gad7: {
            title: "Anxiety (GAD-7)",
            questions: ["Feeling nervous, anxious, or on edge.","Not being able to stop or control worrying.","Worrying too much about different things.","Trouble relaxing.","Being so restless that it's hard to sit still.","Becoming easily annoyed or irritable.","Feeling afraid as if something awful might happen."],
            options: [{ text: "Not at all", value: 0 },{ text: "Several days", value: 1 },{ text: "More than half the days", value: 2 },{ text: "Nearly every day", value: 3 }]
        },
        pss: {
            title: "Stress (PSS-10)",
            questions: ["In the last month, how often have you been upset because of something that happened unexpectedly?","In the last month, how often have you felt that you were unable to control the important things in your life?","In the last month, how often have you felt nervous and 'stressed'?","In the last month, how often have you felt confident about your ability to handle your personal problems?","In the last month, how often have you felt that things were going your way?","In the last month, how often have you found that you could not cope with all the things that you had to do?","In the last month, how often have you been able to control irritations in your life?","In the last month, how often have you felt that you were on top of things?","In the last month, how often have you been angered because of things that were outside of your control?","In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"],
            options: [{ text: "Never", value: 0 },{ text: "Almost Never", value: 1 },{ text: "Sometimes", value: 2 },{ text: "Fairly Often", value: 3 },{ text: "Very Often", value: 4 }],
            reverseScore: [3, 4, 6, 7] // 0-indexed questions
        }
    };

    const screens = document.querySelectorAll('.screen');
    const modals = document.querySelectorAll('.modal');
    
    const setAppHeight = () => document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
    
    function showScreen(screenId) {
        currentScreen = screenId;
        screens.forEach(screen => screen.classList.toggle('active', screen.id === screenId));
        const activeScreen = document.querySelector('.screen.active');
        if (activeScreen) activeScreen.scrollTop = 0;
    }

    function showModal(modalId) { 
        document.getElementById(modalId)?.classList.add('active'); 
    }
    
    function hideModals() { 
        modals.forEach(modal => modal.classList.remove('active')); 
    }

    function applyTheme(theme) {
        currentTheme = theme;
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        document.querySelectorAll('.theme-icon').forEach(icon => { 
            icon.textContent = theme === 'dark' ? '☀' : '🌙'; 
        });
        if (progressChart) {
            const textColor = getComputedStyle(document.body).getPropertyValue('--text-primary');
            const gridColor = getComputedStyle(document.body).getPropertyValue('--border');
            progressChart.options.scales.x.ticks.color = textColor;
            progressChart.options.scales.y.ticks.color = textColor;
            progressChart.options.scales.x.grid.color = gridColor;
            progressChart.options.scales.y.grid.color = gridColor;
            progressChart.update();
        }
    }

    function showToast() {
        const toast = document.getElementById('toast-notification');
        if (!toast) return;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }

    function addMessage(containerId, sender, text) {
        const chatMessages = document.getElementById(containerId);
        if (!chatMessages) return;
        const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `<div class="message-bubble">${text}</div><div class="message-time">${time}</div>`;
        chatMessages.appendChild(messageDiv);
        
        // Auto-scroll to bottom with smooth animation
        const container = chatMessages.parentElement;
        setTimeout(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }
    
    function showTypingIndicator(containerId) {
        const chatMessages = document.getElementById(containerId);
        if (!chatMessages) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing-message';
        typingDiv.innerHTML = `
            <div class="typing-indicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        
        // Auto-scroll to show typing indicator
        const container = chatMessages.parentElement;
        setTimeout(() => {
            container.scrollTo({
                top: container.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
        
        return typingDiv;
    }
    
    function removeTypingIndicator(containerId) {
        const chatMessages = document.getElementById(containerId);
        const typingMessage = chatMessages?.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
    }

    function handleQuickMessage(type, message) {
        if (!message) return;
        const isDemo = type === 'demo';
        if (isDemo && chatCount >= DAILY_CHAT_LIMIT) {
            showModal('limit-reached-modal');
            return;
        }
        const containerId = isDemo ? 'demo-chat-messages' : 'therapist-chat-messages';
        addMessage(containerId, 'user', message);
        if (isDemo) {
            chatCount++;
            localStorage.setItem('demoChatCount', chatCount);
        }
        
        // Show typing indicator
        showTypingIndicator(containerId);
        
        setTimeout(() => {
            removeTypingIndicator(containerId);
            const randomResponse = dummyAiResponses[Math.floor(Math.random() * dummyAiResponses.length)];
            addMessage(containerId, 'ai', randomResponse);
        }, 2000);
    }

    function handleSendMessage(type) {
        const isDemo = type === 'demo';
        const input = document.getElementById(isDemo ? 'demo-message-input' : 'therapist-message-input');
        const message = input.value.trim();
        if (message) {
            handleQuickMessage(type, message); 
            input.value = '';
        }
    }

    async function handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const loginBtn = document.getElementById('login-btn');
        
        if (!email || !password) {
            alert('Please enter email and password.');
            return;
        }
        
        loginBtn.innerHTML = '<span class="loader"></span>Logging in...';
        loginBtn.classList.add('loading');
        
        try {
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                
                if (data.isAdmin) {
                    loadAdminPanel();
                    showScreen('admin-screen');
                } else {
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateWelcomeMessage(data.user.name);
                    showModal('permissions-modal');
                }
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            alert('Connection error. Please try again.');
        } finally {
            loginBtn.innerHTML = 'Login';
            loginBtn.classList.remove('loading');
        }
    }

    async function handleCreateAccount() {
        const name = document.getElementById('register-name')?.value.trim();
        const dob = document.getElementById('register-dob')?.value;
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value.trim();
        const createBtn = document.getElementById('create-account-btn');
        
        if (!name || !dob || !email || !password) {
            alert('Please fill all fields.');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        createBtn.innerHTML = '<span class="loader"></span>Creating Account...';
        createBtn.classList.add('loading');
        
        try {
            const response = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, dob })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Account created successfully! Please log in.');
                showScreen('login-screen');
            } else {
                alert(data.error || 'Registration failed');
            }
        } catch (err) {
            alert('Connection error. Please try again.');
        } finally {
            createBtn.innerHTML = 'Create Account';
            createBtn.classList.remove('loading');
        }
    }

    function setupAllQuestions() {
        allQuestions = [];
        const { phq9, gad7, pss } = assessmentData;
        phq9.questions.forEach((q, i) => allQuestions.push({ test: 'phq9', name: `phq9-q${i}`, text: q, options: phq9.options }));
        gad7.questions.forEach((q, i) => allQuestions.push({ test: 'gad7', name: `gad7-q${i}`, text: q, options: gad7.options }));
        pss.questions.forEach((q, i) => allQuestions.push({ test: 'pss', name: `pss-q${i}`, text: q, options: pss.options, reverse: pss.reverseScore.includes(i) }));
    }

    function startAssessment() {
        currentQuestionIndex = 0;
        userAnswers = {};
        renderCurrentQuestion();
        showScreen('assessment-screen');
    }

    function renderCurrentQuestion() {
        if (currentQuestionIndex < 0 || currentQuestionIndex >= allQuestions.length) return;
        const question = allQuestions[currentQuestionIndex];
        const container = document.getElementById('assessment-question-container');
        let optionsHTML = '<div class="options-group">';
        question.options.forEach(opt => {
            const id = `${question.name}-opt${opt.value}`;
            const isChecked = userAnswers[question.name] === opt.value;
            optionsHTML += `<input type="radio" id="${id}" name="${question.name}" value="${opt.value}" ${isChecked ? 'checked' : ''} required><label for="${id}">${opt.text}</label>`;
        });
        optionsHTML += '</div>';
        container.innerHTML = `<div class="question-card"><p>${question.text}</p>${optionsHTML}</div>`;
        updateAssessmentNav();
    }

    function updateAssessmentNav() {
        const progressText = document.getElementById('progress-text');
        const progressBar = document.getElementById('progress-bar');
        const prevBtn = document.getElementById('prev-question-btn');
        const nextBtn = document.getElementById('next-question-btn');
        const progressPercent = ((currentQuestionIndex + 1) / allQuestions.length) * 100;
        progressBar.style.width = `${progressPercent}%`;
        progressText.textContent = `Question ${currentQuestionIndex + 1} of ${allQuestions.length}`;
        prevBtn.disabled = currentQuestionIndex === 0;
        nextBtn.textContent = (currentQuestionIndex === allQuestions.length - 1) ? 'See My Results' : 'Next';
    }

    function saveCurrentAnswer() {
        const currentQuestion = allQuestions[currentQuestionIndex];
        const selectedOption = document.querySelector(`input[name="${currentQuestion.name}"]:checked`);
        if (selectedOption) {
            userAnswers[currentQuestion.name] = parseInt(selectedOption.value);
            return true;
        }
        return false;
    }

    function calculateScores() {
        // Show loading screen
        const resultsContainer = document.querySelector('#results-screen .page-content');
        resultsContainer.innerHTML = `
            <div class="results-loading">
                <div class="loader"></div>
                <h3>Calculating your results...</h3>
                <p>Please wait while we analyze your responses.</p>
            </div>
        `;
        showScreen('results-screen');
        
        setTimeout(() => {
            let scores = { phq9: 0, gad7: 0, pss: 0 };
            allQuestions.forEach(q => {
                let value = userAnswers[q.name] || 0;
                if (q.test === 'pss' && q.reverse) {
                    value = 4 - value;
                }
                scores[q.test] += value;
            });
            saveAssessmentResult(scores);
            displayResults(scores);
        }, 2500);
    }
    
    async function saveAssessmentResult(scores) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        try {
            await fetch(`${API_BASE}/api/assessments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    phq9: scores.phq9,
                    gad7: scores.gad7,
                    pss: scores.pss
                })
            });
        } catch (err) {
            console.error('Failed to save assessment:', err);
        }
    }

    function displayResults(scores) {
        const getInterpretation = (test, score) => {
            if (test === 'phq9') {
                if (score <= 4) return "Minimal depression"; 
                if (score <= 9) return "Mild depression"; 
                if (score <= 14) return "Moderate depression"; 
                if (score <= 19) return "Moderately severe depression"; 
                return "Severe depression";
            }
            if (test === 'gad7') {
                if (score <= 4) return "Minimal anxiety"; 
                if (score <= 9) return "Mild anxiety"; 
                if (score <= 14) return "Moderate anxiety"; 
                return "Severe anxiety";
            }
            if (test === 'pss') {
                if (score <= 13) return "Low perceived stress"; 
                if (score <= 26) return "Moderate perceived stress"; 
                return "High perceived stress";
            }
        };
        
        // Restore original results container structure
        const resultsContainer = document.querySelector('#results-screen .page-content');
        resultsContainer.className = 'page-content results-container';
        resultsContainer.innerHTML = `
            <p style="color: var(--text-secondary);">This is not a diagnosis. Please consult a healthcare professional for a formal evaluation.</p>
            <div id="phq9-results" class="score-card"></div>
            <div id="gad7-results" class="score-card"></div>
            <div id="pss-results" class="score-card"></div>
        `;
        
        document.getElementById('phq9-results').innerHTML = `<h2>Depression (PHQ-9)</h2><p class="score">${scores.phq9}</p><p class="interpretation">${getInterpretation('phq9', scores.phq9)}</p>`;
        document.getElementById('gad7-results').innerHTML = `<h2>Anxiety (GAD-7)</h2><p class="score">${scores.gad7}</p><p class="interpretation">${getInterpretation('gad7', scores.gad7)}</p>`;
        document.getElementById('pss-results').innerHTML = `<h2>Stress (PSS-10)</h2><p class="score">${scores.pss}</p><p class="interpretation">${getInterpretation('pss', scores.pss)}</p>`;
    }

    async function renderProgressChart() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        const chartEl = document.getElementById('progress-chart');
        const promptEl = document.getElementById('progress-prompt');
        
        try {
            const response = await fetch(`${API_BASE}/api/assessments?userId=${currentUser.id}`);
            const data = await response.json();
            const history = data.assessments || [];
            
            if (history.length === 0) {
                chartEl.style.display = 'none';
                promptEl.style.display = 'block';
                return;
            }
            
            chartEl.style.display = 'block';
            promptEl.style.display = 'none';
            
            const labels = history.map(item => new Date(item.assessment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            const phq9Data = history.map(item => item.phq9_score);
            const gad7Data = history.map(item => item.gad7_score);
            const pssData = history.map(item => item.pss_score);
            
            const textColor = getComputedStyle(document.body).getPropertyValue('--text-primary');
            const gridColor = getComputedStyle(document.body).getPropertyValue('--border');
            
            if (progressChart) progressChart.destroy();
            
            progressChart = new Chart(chartEl.getContext('2d'), {
                type: 'line',
                data: {
                    labels,
                    datasets: [
                        { label: 'Depression (PHQ-9)', data: phq9Data, borderColor: '#FF6384', tension: 0.1 },
                        { label: 'Anxiety (GAD-7)', data: gad7Data, borderColor: '#36A2EB', tension: 0.1 },
                        { label: 'Stress (PSS-10)', data: pssData, borderColor: '#FFCE56', tension: 0.1 }
                    ]
                },
                options: {
                    scales: { 
                        y: { beginAtZero: true, ticks: { color: textColor }, grid: { color: gridColor } }, 
                        x: { ticks: { color: textColor }, grid: { color: gridColor } } 
                    },
                    plugins: { legend: { labels: { color: textColor } } }
                }
            });
        } catch (err) {
            console.error('Failed to load progress data:', err);
            chartEl.style.display = 'none';
            promptEl.style.display = 'block';
        }
    }

    function updateWelcomeMessage(username) {
        const welcomeHeading = document.getElementById('welcome-heading');
        if (welcomeHeading) {
            welcomeHeading.textContent = `Welcome, ${username}`;
        }
        
        // Update profile screen
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (profileName && currentUser) {
            profileName.textContent = currentUser.name;
        }
        if (profileEmail && currentUser) {
            profileEmail.textContent = currentUser.email;
        }
    }
    
    function checkCurrentUser() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            updateWelcomeMessage(currentUser.name);
            return true;
        }
        return false;
    }
    
    function logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
        showScreen('login-screen');
    }

    async function loadAdminPanel() {
        try {
            const response = await fetch(`${API_BASE}/api/admin/users`);
            const data = await response.json();
            
            document.getElementById('total-users').textContent = data.totalUsers;
            document.getElementById('total-assessments').textContent = data.totalAssessments;
            
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = '';
            
            data.users.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.innerHTML = `
                    <div class="user-header">
                        <div>
                            <div class="user-name">${user.name}</div>
                            <div class="user-email">${user.email}</div>
                        </div>
                        <button class="delete-user-btn" onclick="deleteUser(${user.id})">Delete</button>
                    </div>
                    <div class="user-details">
                        <div>DOB: ${user.dob || 'N/A'}</div>
                        <div>Assessments: ${user.assessment_count}</div>
                        <div>Joined: ${new Date(user.created_at).toLocaleDateString()}</div>
                    </div>
                `;
                usersList.appendChild(userCard);
            });
        } catch (err) {
            console.error('Failed to load admin data:', err);
        }
    }
    
    async function deleteUser(userId) {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                await fetch(`${API_BASE}/api/admin/users?userId=${userId}`, { method: 'DELETE' });
                loadAdminPanel();
            } catch (err) {
                alert('Failed to delete user');
            }
        }
    }
    
    window.deleteUser = deleteUser;

    function initializeApp() {
        window.addEventListener('resize', setAppHeight);
        setAppHeight();
        setupAllQuestions();
        applyTheme(localStorage.getItem('theme') || 'dark');
        
        // Check if user is already logged in
        if (checkCurrentUser()) {
            showScreen('dashboard-screen');
        } else {
            showScreen(currentScreen);
        }
        
        setTimeout(() => showToast(), 500);

        // Add all event listeners
        document.getElementById('login-btn')?.addEventListener('click', handleLogin);
        document.getElementById('go-to-register-btn')?.addEventListener('click', () => showScreen('register-screen'));
        document.getElementById('create-account-btn')?.addEventListener('click', handleCreateAccount);
        document.getElementById('back-to-login-btn')?.addEventListener('click', () => showScreen('login-screen'));
        document.getElementById('guest-login-btn')?.addEventListener('click', () => { 
            showScreen('demo-chat-screen'); 
            addMessage('demo-chat-messages', 'ai', "Welcome to the demo chat."); 
        });
        document.getElementById('profile-btn')?.addEventListener('click', () => showScreen('profile-screen'));
        document.getElementById('profile-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('logout-btn')?.addEventListener('click', logout);
        document.getElementById('profile-theme-toggle')?.addEventListener('click', () => {
            applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
            document.getElementById('profile-theme-toggle').textContent = currentTheme === 'dark' ? 'Dark' : 'Light';
        });
        document.getElementById('admin-logout-btn')?.addEventListener('click', () => showScreen('login-screen'));
        document.getElementById('demo-chat-login-btn')?.addEventListener('click', () => showScreen('login-screen'));
        document.getElementById('demo-send-btn')?.addEventListener('click', () => handleSendMessage('demo'));
        document.getElementById('demo-message-input')?.addEventListener('keypress', e => { 
            if (e.key === 'Enter') handleSendMessage('demo'); 
        });
        document.getElementById('theme-toggle-global')?.addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));
        document.getElementById('go-to-therapist-chat-btn')?.addEventListener('click', () => { 
            showScreen('therapist-chat-screen'); 
            addMessage('therapist-chat-messages', 'ai', "Welcome back."); 
        });
        document.getElementById('therapist-chat-home-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('therapist-send-btn')?.addEventListener('click', () => handleSendMessage('therapist'));
        document.getElementById('therapist-message-input')?.addEventListener('keypress', e => { 
            if (e.key === 'Enter') handleSendMessage('therapist'); 
        });
        document.querySelectorAll('#demo-chat-screen .quick-btn').forEach(btn => 
            btn.addEventListener('click', () => handleQuickMessage('demo', btn.dataset.message))
        );
        document.querySelectorAll('#therapist-chat-screen .quick-btn').forEach(btn => 
            btn.addEventListener('click', () => handleQuickMessage('therapist', btn.dataset.message))
        );
        document.getElementById('emergency-btn')?.addEventListener('click', () => showModal('emergency-modal'));
        document.getElementById('emergency-modal-close-btn')?.addEventListener('click', hideModals);
        document.getElementById('limit-modal-login-btn')?.addEventListener('click', () => { 
            hideModals(); 
            showScreen('login-screen'); 
        });
        document.getElementById('limit-modal-close-btn')?.addEventListener('click', hideModals);
        document.getElementById('grant-permissions-btn')?.addEventListener('click', () => {
            console.log('Permissions granted:', {
                location: document.getElementById('location-permission').checked,
                microphone: document.getElementById('microphone-permission').checked,
                notifications: document.getElementById('notifications-permission').checked
            });
            hideModals(); 
            showScreen('dashboard-screen');
        });
        document.getElementById('skip-permissions-btn')?.addEventListener('click', () => { 
            console.log('Permissions skipped.'); 
            hideModals(); 
            showScreen('dashboard-screen'); 
        });
        document.getElementById('go-to-assessment-btn')?.addEventListener('click', startAssessment);
        document.getElementById('assessment-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('results-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('go-to-resources-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('resources-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('go-to-progress-btn')?.addEventListener('click', () => { 
            renderProgressChart(); 
            showScreen('progress-screen'); 
        });
        document.getElementById('progress-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('prev-question-btn')?.addEventListener('click', () => {
            saveCurrentAnswer();
            if (currentQuestionIndex > 0) {
                currentQuestionIndex--;
                renderCurrentQuestion();
            }
        });
        document.getElementById('next-question-btn')?.addEventListener('click', () => {
            if (saveCurrentAnswer()) {
                if (currentQuestionIndex < allQuestions.length - 1) {
                    currentQuestionIndex++;
                    renderCurrentQuestion();
                } else {
                    calculateScores();
                }
            } else {
                alert('Please select an answer to continue.');
            }
        });
    }
    
    initializeApp();
});