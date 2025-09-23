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
    
    // Dummy therapist data
    const therapists = [
        { id: 1, name: "Dr. Sarah Johnson", specialty: "Anxiety & Depression", rating: 4.9, reviews: 127, distance: "0.8 km", price: "$80/session", image: "👩‍⚕️" },
        { id: 2, name: "Dr. Michael Chen", specialty: "Trauma & PTSD", rating: 4.8, reviews: 89, distance: "1.2 km", price: "$90/session", image: "👨‍⚕️" },
        { id: 3, name: "Dr. Emily Rodriguez", specialty: "Relationship Counseling", rating: 4.7, reviews: 156, distance: "1.5 km", price: "$75/session", image: "👩‍⚕️" },
        { id: 4, name: "Dr. James Wilson", specialty: "Stress Management", rating: 4.9, reviews: 203, distance: "2.1 km", price: "$85/session", image: "👨‍⚕️" }
    ];
    
    // Booking requests storage
    let bookingRequests = JSON.parse(localStorage.getItem('bookingRequests')) || [];
    
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
        console.log('🔐 Frontend: Login attempt started');
        
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();
        const loginBtn = document.getElementById('login-btn');
        
        console.log('📝 Frontend: Login data:', { email, hasPassword: !!password });
        
        if (!email || !password) {
            console.log('❌ Frontend: Missing credentials');
            alert('Please enter email and password.');
            return;
        }
        
        loginBtn.innerHTML = '<span class="loader"></span>Logging in...';
        loginBtn.classList.add('loading');
        
        try {
            console.log('🌐 Frontend: Making API request to:', `${API_BASE}/api/login`);
            
            const response = await fetch(`${API_BASE}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            console.log('📡 Frontend: API response status:', response.status);
            console.log('📡 Frontend: API response headers:', Object.fromEntries(response.headers.entries()));
            
            const responseText = await response.text();
            console.log('📦 Frontend: Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                console.error('🔴 Frontend: JSON parse error:', parseErr);
                throw new Error('Server returned invalid response: ' + responseText.substring(0, 100));
            }
            console.log('📦 Frontend: Parsed response data:', data);
            
            if (data.success) {
                console.log('✅ Frontend: Login successful');
                localStorage.setItem('token', data.token);
                
                if (data.isAdmin) {
                    console.log('👑 Frontend: Admin login detected');
                    loadAdminPanel();
                    showScreen('admin-screen');
                } else {
                    console.log('👤 Frontend: Regular user login');
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateWelcomeMessage(data.user.name);
                    showModal('permissions-modal');
                }
            } else {
                console.log('❌ Frontend: Login failed:', data.error);
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('🔴 Frontend: Login error details:', {
                message: err.message,
                stack: err.stack,
                name: err.name,
                timestamp: new Date().toISOString()
            });
            alert('Connection error. Please try again.');
        } finally {
            loginBtn.innerHTML = 'Login';
            loginBtn.classList.remove('loading');
        }
    }

    async function handleCreateAccount() {
        console.log('📝 Frontend: Registration attempt started');
        
        const name = document.getElementById('register-name')?.value.trim();
        const dob = document.getElementById('register-dob')?.value;
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value.trim();
        const createBtn = document.getElementById('create-account-btn');
        
        console.log('📝 Frontend: Registration data:', { name, dob, email, hasPassword: !!password });
        
        if (!name || !dob || !email || !password) {
            console.log('❌ Frontend: Missing registration fields');
            alert('Please fill all fields.');
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Frontend: Invalid email format');
            alert('Please enter a valid email address.');
            return;
        }
        
        createBtn.innerHTML = '<span class="loader"></span>Creating Account...';
        createBtn.classList.add('loading');
        
        try {
            console.log('🌐 Frontend: Making registration API request');
            
            const response = await fetch(`${API_BASE}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, dob })
            });
            
            console.log('📡 Frontend: Registration response status:', response.status);
            
            const responseText = await response.text();
            console.log('📦 Frontend: Raw registration response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                console.error('🔴 Frontend: Registration JSON parse error:', parseErr);
                throw new Error('Server returned invalid response: ' + responseText.substring(0, 100));
            }
            console.log('📦 Frontend: Parsed registration data:', data);
            
            if (data.success) {
                console.log('✅ Frontend: Registration successful');
                alert('Account created successfully! Please log in.');
                showScreen('login-screen');
            } else {
                console.log('❌ Frontend: Registration failed:', data.error);
                alert(data.error || 'Registration failed');
            }
        } catch (err) {
            console.error('🔴 Frontend: Registration error:', err);
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
        console.log('📝 Starting new assessment at:', new Date().toISOString());
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
            console.log('📋 User answers:', userAnswers);
            
            allQuestions.forEach(q => {
                let value = userAnswers[q.name] || 0;
                if (q.test === 'pss' && q.reverse) {
                    value = 4 - value;
                }
                scores[q.test] += value;
            });
            
            console.log('📊 Calculated scores:', scores);
            saveAssessmentResult(scores);
            displayResults(scores);
        }, 2500);
    }
    
    async function saveAssessmentResult(scores) {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        try {
            console.log('💾 Saving assessment result:', { scores, responses: userAnswers });
            
            const response = await fetch(`${API_BASE}/api/assessments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    phq9: scores.phq9,
                    gad7: scores.gad7,
                    pss: scores.pss,
                    responses: userAnswers,
                    assessmentDate: new Date().toLocaleDateString('en-CA')
                })
            });
            
            const result = await response.json();
            if (result.success) {
                console.log('✅ Assessment saved successfully');
            } else {
                console.error('❌ Failed to save assessment:', result.error);
            }
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
            <button id="results-view-progress-btn" class="btn btn--primary" style="margin-top: 20px;">📈 View My Progress</button>
        `;
        
        document.getElementById('phq9-results').innerHTML = `<h2>Depression (PHQ-9)</h2><p class="score">${scores.phq9}</p><p class="interpretation">${getInterpretation('phq9', scores.phq9)}</p>`;
        document.getElementById('gad7-results').innerHTML = `<h2>Anxiety (GAD-7)</h2><p class="score">${scores.gad7}</p><p class="interpretation">${getInterpretation('gad7', scores.gad7)}</p>`;
        document.getElementById('pss-results').innerHTML = `<h2>Stress (PSS-10)</h2><p class="score">${scores.pss}</p><p class="interpretation">${getInterpretation('pss', scores.pss)}</p>`;
        
        // Add event listener to the dynamically created button
        document.getElementById('results-view-progress-btn')?.addEventListener('click', () => { 
            renderProgressChart(); 
            showScreen('progress-screen'); 
        });
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
            
            const labels = history.map(item => {
                const date = new Date(item.assessment_date);
                return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
            });
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
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const responseText = await response.text();
            let data;
            
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                console.error('Admin API returned HTML:', responseText.substring(0, 200));
                throw new Error('Admin API returned invalid response');
            }
            
            // Handle missing or invalid data
            const users = data.users || [];
            const regularUsers = users.filter(user => !user.isadmin);
            
            document.getElementById('total-users').textContent = regularUsers.length;
            document.getElementById('total-assessments').textContent = data.totalAssessments || 0;
            
            // Add recent assessments info if element exists
            const recentAssessmentsEl = document.getElementById('recent-assessments');
            if (recentAssessmentsEl && data.recentAssessments !== undefined) {
                recentAssessmentsEl.textContent = data.recentAssessments;
            }
            
            const usersList = document.getElementById('users-list');
            usersList.innerHTML = '';
            
            if (regularUsers.length === 0) {
                usersList.innerHTML = '<p>No users found.</p>';
                return;
            }
            
            regularUsers.forEach(user => {
                const userCard = document.createElement('div');
                userCard.className = 'user-card';
                userCard.innerHTML = `
                    <div class="user-header">
                        <div>
                            <div class="user-name">${user.name || 'Unknown'}</div>
                            <div class="user-email">${user.email || 'No email'}</div>
                        </div>
                        <button class="view-reports-btn" onclick="viewUserReports(${user.id}, '${user.name || 'User'}')">View Reports</button>
                        <button class="delete-user-btn" onclick="deleteUser(${user.id})">Delete</button>
                    </div>
                    <div class="user-details">
                        <div>DOB: ${user.dob || 'N/A'}</div>
                        <div>Assessments: ${user.assessment_count || 0}</div>
                        <div>Last Assessment: ${user.last_assessment ? new Date(user.last_assessment).toLocaleDateString() : 'Never'}</div>
                        <div>Joined: ${user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</div>
                    </div>
                `;
                usersList.appendChild(userCard);
            });
        } catch (err) {
            console.error('Failed to load admin data:', err);
            document.getElementById('users-list').innerHTML = `<p>Error loading admin data: ${err.message}</p>`;
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
    
    async function viewUserReports(userId, userName) {
        try {
            console.log('Loading reports for user:', userId, userName);
            const response = await fetch(`${API_BASE}/api/assessments?userId=${userId}`);
            console.log('Response status:', response.status);
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);
            
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseErr) {
                console.error('JSON parse error:', parseErr);
                console.error('Response was HTML, likely 404 or server error');
                throw new Error('API endpoint not found or server error');
            }
            
            console.log('Parsed data:', data);
            
            if (data.assessments && data.assessments.length > 0) {
                displayUserReports(userId, userName, data.assessments);
                showScreen('user-reports-screen');
            } else {
                alert(`${userName} has no assessment reports yet.`);
            }
        } catch (err) {
            console.error('Failed to load user reports:', err);
            alert('Failed to load user reports: ' + err.message);
        }
    }
    
    function displayUserReports(userId, userName, assessments) {
        console.log('Displaying reports for:', userName, 'with', assessments.length, 'assessments');
        
        // Update screen title
        const titleEl = document.getElementById('user-reports-title');
        if (titleEl) titleEl.textContent = `${userName}'s Assessment Reports`;
        
        // Display latest assessment results
        const latest = assessments[0];
        if (latest) {
            displayUserResults({
                phq9: latest.phq9_score || 0,
                gad7: latest.gad7_score || 0,
                pss: latest.pss_score || 0
            });
            
            // Render progress chart
            renderUserProgressChart(assessments);
        } else {
            console.error('No assessment data found');
        }
    }
    
    function displayUserResults(scores) {
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
        
        document.getElementById('user-phq9-results').innerHTML = `<h2>Depression (PHQ-9)</h2><p class="score">${scores.phq9}</p><p class="interpretation">${getInterpretation('phq9', scores.phq9)}</p>`;
        document.getElementById('user-gad7-results').innerHTML = `<h2>Anxiety (GAD-7)</h2><p class="score">${scores.gad7}</p><p class="interpretation">${getInterpretation('gad7', scores.gad7)}</p>`;
        document.getElementById('user-pss-results').innerHTML = `<h2>Stress (PSS-10)</h2><p class="score">${scores.pss}</p><p class="interpretation">${getInterpretation('pss', scores.pss)}</p>`;
    }
    
    function renderUserProgressChart(history) {
        const chartEl = document.getElementById('user-progress-chart');
        
        const labels = history.map(item => {
            const date = new Date(item.assessment_date);
            return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
        });
        const phq9Data = history.map(item => item.phq9_score);
        const gad7Data = history.map(item => item.gad7_score);
        const pssData = history.map(item => item.pss_score);
        
        const textColor = getComputedStyle(document.body).getPropertyValue('--text-primary');
        const gridColor = getComputedStyle(document.body).getPropertyValue('--border');
        
        if (window.userProgressChart) window.userProgressChart.destroy();
        
        window.userProgressChart = new Chart(chartEl.getContext('2d'), {
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
    }
    
    let currentTherapistIndex = 0;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let isSwipeEnabled = true;
    
    function loadTherapists() {
        currentTherapistIndex = 0;
        showCurrentTherapist();
        setupSwipeListeners();
    }
    
    function showCurrentTherapist() {
        if (currentTherapistIndex >= therapists.length) {
            showNoMoreTherapists();
            return;
        }
        
        const therapist = therapists[currentTherapistIndex];
        const stars = '⭐'.repeat(Math.floor(therapist.rating)) + (therapist.rating % 1 ? '✨' : '');
        const therapistCard = document.getElementById('therapist-card');
        
        therapistCard.innerHTML = `
            <div class="therapist-profile">
                <div class="therapist-image">${therapist.image}</div>
                <h2>${therapist.name}</h2>
                <p class="specialty">${therapist.specialty}</p>
                <div class="rating">${stars} ${therapist.rating}</div>
                <div class="reviews">${therapist.reviews} reviews</div>
                <div class="details">
                    <div class="detail-item">
                        <span class="icon">📍</span>
                        <span>${therapist.distance} away</span>
                    </div>
                    <div class="detail-item">
                        <span class="icon">💰</span>
                        <span>${therapist.price}</span>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('therapist-counter').textContent = `${currentTherapistIndex + 1}/${therapists.length}`;
        therapistCard.style.transform = 'translateX(0) rotate(0deg)';
        therapistCard.style.opacity = '1';
    }
    
    function showNoMoreTherapists() {
        const therapistCard = document.getElementById('therapist-card');
        therapistCard.innerHTML = `
            <div class="no-more-therapists">
                <h2>🎉 That's all!</h2>
                <p>You've seen all available therapists in your area.</p>
                <button onclick="resetTherapists()" class="btn btn--primary">Start Over</button>
            </div>
        `;
        document.getElementById('therapist-counter').style.display = 'none';
        isSwipeEnabled = false;
    }
    
    function resetTherapists() {
        currentTherapistIndex = 0;
        document.getElementById('therapist-counter').style.display = 'block';
        isSwipeEnabled = true;
        showCurrentTherapist();
    }
    
    function setupSwipeListeners() {
        const card = document.getElementById('therapist-card');
        
        card.addEventListener('touchstart', handleTouchStart, { passive: true });
        card.addEventListener('touchmove', handleTouchMove, { passive: true });
        card.addEventListener('touchend', handleTouchEnd);
        
        card.addEventListener('mousedown', handleMouseStart);
        card.addEventListener('mousemove', handleMouseMove);
        card.addEventListener('mouseup', handleMouseEnd);
        card.addEventListener('mouseleave', handleMouseEnd);
    }
    
    function handleTouchStart(e) {
        if (!isSwipeEnabled) return;
        startX = e.touches[0].clientX;
        isDragging = true;
    }
    
    function handleMouseStart(e) {
        if (!isSwipeEnabled) return;
        startX = e.clientX;
        isDragging = true;
        e.preventDefault();
    }
    
    function handleTouchMove(e) {
        if (!isDragging || !isSwipeEnabled) return;
        currentX = e.touches[0].clientX;
        updateCardPosition();
    }
    
    function handleMouseMove(e) {
        if (!isDragging || !isSwipeEnabled) return;
        currentX = e.clientX;
        updateCardPosition();
    }
    
    function updateCardPosition() {
        const diff = currentX - startX;
        const card = document.getElementById('therapist-card');
        const rotation = diff * 0.1;
        const opacity = Math.max(0.5, 1 - Math.abs(diff) / 300);
        
        card.style.transform = `translateX(${diff}px) rotate(${rotation}deg)`;
        card.style.opacity = opacity;
    }
    
    function handleTouchEnd() {
        handleSwipeEnd();
    }
    
    function handleMouseEnd() {
        handleSwipeEnd();
    }
    
    function handleSwipeEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        const threshold = 100;
        
        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                bookCurrentTherapist();
            } else {
                passCurrentTherapist();
            }
        } else {
            // Snap back
            const card = document.getElementById('therapist-card');
            card.style.transform = 'translateX(0) rotate(0deg)';
            card.style.opacity = '1';
        }
        
        currentX = 0;
        startX = 0;
    }
    
    function passCurrentTherapist() {
        nextTherapist();
    }
    
    function bookCurrentTherapist() {
        if (currentTherapistIndex >= therapists.length) return;
        const therapist = therapists[currentTherapistIndex];
        addBookingRequest(therapist.id, therapist.name);
        nextTherapist();
    }
    
    function nextTherapist() {
        const card = document.getElementById('therapist-card');
        card.style.transform = 'translateX(0) rotate(0deg)';
        card.style.opacity = '1';
        
        currentTherapistIndex++;
        setTimeout(() => {
            showCurrentTherapist();
        }, 300);
    }
    
    function addBookingRequest(therapistId, therapistName) {
        const request = {
            id: Date.now(),
            therapistId,
            therapistName,
            status: 'Pending',
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString()
        };
        bookingRequests.push(request);
        localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
        alert(`💚 Booking request sent to ${therapistName}!`);
    }
    
    function loadBookingRequests() {
        const requestsList = document.getElementById('requests-list');
        
        if (bookingRequests.length === 0) {
            requestsList.innerHTML = '<p>No booking requests yet.</p>';
            return;
        }
        
        requestsList.innerHTML = '';
        bookingRequests.forEach(request => {
            const requestCard = document.createElement('div');
            requestCard.className = 'request-card';
            requestCard.innerHTML = `
                <div class="request-header">
                    <h3>${request.therapistName}</h3>
                    <span class="status ${request.status.toLowerCase()}">${request.status}</span>
                </div>
                <div class="request-details">
                    <p>📅 ${request.date} at ${request.time}</p>
                </div>
                <button onclick="cancelRequest(${request.id})" class="cancel-btn">Cancel Request</button>
            `;
            requestsList.appendChild(requestCard);
        });
    }
    
    function cancelRequest(requestId) {
        if (confirm('Are you sure you want to cancel this booking request?')) {
            bookingRequests = bookingRequests.filter(req => req.id !== requestId);
            localStorage.setItem('bookingRequests', JSON.stringify(bookingRequests));
            loadBookingRequests();
        }
    }
    
    window.deleteUser = deleteUser;
    window.viewUserReports = viewUserReports;
    window.cancelRequest = cancelRequest;
    window.resetTherapists = resetTherapists;

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
        document.getElementById('user-reports-back-btn')?.addEventListener('click', () => showScreen('admin-screen'));
        document.getElementById('user-reports-dashboard-btn')?.addEventListener('click', () => showScreen('admin-screen'));
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
        document.getElementById('results-view-progress-btn')?.addEventListener('click', () => { 
            renderProgressChart(); 
            showScreen('progress-screen'); 
        });
        document.getElementById('go-to-resources-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('resources-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('go-to-progress-btn')?.addEventListener('click', () => { 
            renderProgressChart(); 
            showScreen('progress-screen'); 
        });
        document.getElementById('progress-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('go-to-booking-btn')?.addEventListener('click', () => {
            loadTherapists();
            showScreen('booking-screen');
        });
        document.getElementById('booking-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('pass-btn')?.addEventListener('click', passCurrentTherapist);
        document.getElementById('book-btn')?.addEventListener('click', bookCurrentTherapist);
        document.getElementById('view-requests-btn')?.addEventListener('click', () => {
            loadBookingRequests();
            showScreen('requests-screen');
        });
        document.getElementById('requests-back-btn')?.addEventListener('click', () => showScreen('booking-screen'));
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