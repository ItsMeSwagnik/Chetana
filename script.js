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
        
        // Load data when showing progress screen
        if (screenId === 'progress-screen') {
            setTimeout(() => {
                if (typeof renderMoodChart === 'function') renderMoodChart();
                if (typeof renderMilestones === 'function') renderMilestones();
                if (typeof checkMilestones === 'function') checkMilestones();
            }, 100);
        }
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
                
                if (data.offline) {
                    alert('⚠️ Connected in offline mode. Some features may be limited.');
                }
                
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
                if (data.error.includes('ENOTFOUND')) {
                    alert('Connection error. Try:\n• demo@chetana.com / demo123\n• user@example.com / password\n• test@test.com / 123456');
                } else {
                    alert(data.error || 'Login failed');
                }
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
                
                // Save to local storage for milestones
                const assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
                assessmentHistory.unshift({
                    date: new Date().toLocaleDateString(),
                    phq9: scores.phq9,
                    gad7: scores.gad7,
                    pss: scores.pss
                });
                
                // Keep only last 10 assessments
                if (assessmentHistory.length > 10) {
                    assessmentHistory.splice(10);
                }
                
                localStorage.setItem('assessmentHistory', JSON.stringify(assessmentHistory));
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
        const token = localStorage.getItem('token');
        if (currentUser && token) {
            updateWelcomeMessage(currentUser.name);
            return true;
        } else if (token && !currentUser) {
            // Token exists but user data is missing, try to restore from token
            restoreUserFromToken();
            return false;
        }
        return false;
    }
    
    async function restoreUserFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            // Decode token to get user ID (simple JWT decode)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const userId = payload.userId;
            
            if (userId) {
                // Fetch user data from database
                const response = await fetch(`${API_BASE}/api/users/${userId}`);
                const data = await response.json();
                
                if (data.success && data.user) {
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateWelcomeMessage(data.user.name);
                    showScreen('dashboard-screen');
                }
            }
        } catch (err) {
            console.error('Failed to restore user from token:', err);
            localStorage.removeItem('token');
        }
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
    
    // Wellness Features
    function initWellnessFeatures() {
        // Breathing Exercise
        let breathingInterval;
        document.getElementById('start-breathing')?.addEventListener('click', () => {
            const circle = document.getElementById('breathing-circle');
            const text = document.getElementById('breathing-text');
            const startBtn = document.getElementById('start-breathing');
            const stopBtn = document.getElementById('stop-breathing');
            
            startBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
            
            let phase = 0; // 0=inhale, 1=hold, 2=exhale
            let count = 0;
            
            breathingInterval = setInterval(() => {
                if (phase === 0) { // Inhale
                    circle.className = 'breathing-circle inhale';
                    text.textContent = `Inhale ${4-count}`;
                    if (++count >= 4) { phase = 1; count = 0; }
                } else if (phase === 1) { // Hold
                    circle.className = 'breathing-circle hold';
                    text.textContent = `Hold ${7-count}`;
                    if (++count >= 7) { phase = 2; count = 0; }
                } else { // Exhale
                    circle.className = 'breathing-circle exhale';
                    text.textContent = `Exhale ${8-count}`;
                    if (++count >= 8) { phase = 0; count = 0; }
                }
            }, 1000);
        });
        
        document.getElementById('stop-breathing')?.addEventListener('click', () => {
            clearInterval(breathingInterval);
            document.getElementById('breathing-circle').className = 'breathing-circle';
            document.getElementById('breathing-text').textContent = 'Ready to begin?';
            document.getElementById('start-breathing').style.display = 'inline-block';
            document.getElementById('stop-breathing').style.display = 'none';
        });
        
        // Meditation Timer
        let meditationInterval;
        let meditationTime = 600; // 10 minutes
        document.getElementById('start-meditation')?.addEventListener('click', () => {
            const timerText = document.getElementById('timer-text');
            const startBtn = document.getElementById('start-meditation');
            const pauseBtn = document.getElementById('pause-meditation');
            const stopBtn = document.getElementById('stop-meditation');
            
            startBtn.style.display = 'none';
            pauseBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
            
            meditationInterval = setInterval(() => {
                meditationTime--;
                const mins = Math.floor(meditationTime / 60);
                const secs = meditationTime % 60;
                timerText.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                
                if (meditationTime <= 0) {
                    clearInterval(meditationInterval);
                    // Play notification sound
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();
                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);
                    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                    oscillator.type = 'sine';
                    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
                    oscillator.start(audioContext.currentTime);
                    oscillator.stop(audioContext.currentTime + 1);
                    alert('🧘 Meditation complete! Well done!');
                    document.getElementById('start-meditation').style.display = 'inline-block';
                    pauseBtn.style.display = 'none';
                    stopBtn.style.display = 'none';
                    meditationTime = 600;
                    timerText.textContent = '10:00';
                }
            }, 1000);
        });
        
        document.getElementById('stop-meditation')?.addEventListener('click', () => {
            clearInterval(meditationInterval);
            meditationTime = 600;
            document.getElementById('timer-text').textContent = '10:00';
            document.getElementById('start-meditation').style.display = 'inline-block';
            document.getElementById('pause-meditation').style.display = 'none';
            document.getElementById('stop-meditation').style.display = 'none';
        });
        
        // Journal functionality
        document.querySelectorAll('.prompt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const prompt = btn.dataset.prompt;
                const textarea = document.getElementById('journal-text');
                textarea.value = prompt + '\n\n';
                textarea.focus();
            });
        });
        
        // Behavioral Activation - Activity Ideas functionality
        document.querySelectorAll('.activity-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                const activity = tag.textContent;
                const activeSlot = document.querySelector('.activity-slot:focus');
                if (activeSlot) {
                    activeSlot.textContent = activity;
                    activeSlot.blur();
                } else {
                    // Find first empty slot
                    const emptySlot = document.querySelector('.activity-slot[contenteditable="true"]:not([data-filled])');
                    if (emptySlot) {
                        emptySlot.textContent = activity;
                        emptySlot.setAttribute('data-filled', 'true');
                    }
                }
            });
        });
        
        // Activity planner slots functionality
        document.querySelectorAll('.activity-slot').forEach(slot => {
            slot.addEventListener('focus', () => {
                if (slot.textContent === 'Add activity...') {
                    slot.textContent = '';
                }
            });
            
            slot.addEventListener('blur', () => {
                if (slot.textContent.trim() === '') {
                    slot.textContent = 'Add activity...';
                    slot.removeAttribute('data-filled');
                } else {
                    slot.setAttribute('data-filled', 'true');
                }
            });
            
            slot.addEventListener('input', () => {
                if (slot.textContent.trim() !== '') {
                    slot.setAttribute('data-filled', 'true');
                }
            });
        });
        
        document.getElementById('save-entry')?.addEventListener('click', () => {
            const text = document.getElementById('journal-text').value;
            if (text.trim()) {
                const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                entries.unshift({ date: new Date().toLocaleDateString(), text });
                localStorage.setItem('journalEntries', JSON.stringify(entries));
                loadJournalEntries();
                alert('Entry saved!');
            }
        });
        
        document.getElementById('clear-entry')?.addEventListener('click', () => {
            document.getElementById('journal-text').value = '';
        });
        
        document.querySelectorAll('.mood-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                localStorage.setItem('todayMood', btn.dataset.mood);
            });
        });
        
        function loadJournalEntries() {
            const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
            const list = document.getElementById('journal-entries-list');
            list.innerHTML = entries.slice(0, 5).map((entry, index) => 
                `<div class="journal-entry-item">
                    <div class="entry-header">
                        <div class="entry-date">${entry.date}</div>
                        <button class="delete-entry-btn" onclick="deleteJournalEntry(${index})">Delete</button>
                    </div>
                    <div class="entry-text">${entry.text.substring(0, 100)}...</div>
                </div>`
            ).join('');
        }
        
        window.deleteJournalEntry = function(index) {
            if (confirm('Delete this journal entry?')) {
                const entries = JSON.parse(localStorage.getItem('journalEntries') || '[]');
                entries.splice(index, 1);
                localStorage.setItem('journalEntries', JSON.stringify(entries));
                loadJournalEntries();
            }
        }
        
        // Environment selector with auto video and audio switching
        document.querySelectorAll('.env-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                switchEnvironment(btn.dataset.env);
            });
        });
        
        // Audio and Video Management
        let currentAudio = null;
        let currentVideo = null;
        let relaxTimer = null;
        let isPlaying = false;
        let audioType = 'html5'; // 'html5' or 'webaudio'
        
        function switchEnvironment(envType) {
            // Update button states
            document.querySelectorAll('.env-btn').forEach(b => b.classList.remove('active'));
            document.querySelector(`[data-env="${envType}"]`).classList.add('active');
            
            // Switch video scenes
            document.querySelectorAll('.environment-scene').forEach(s => {
                s.classList.remove('active');
                const video = s.querySelector('.environment-video');
                if (video) {
                    video.pause();
                    video.currentTime = 0;
                }
            });
            
            const activeScene = document.querySelector(`.${envType}-scene`);
            if (activeScene) {
                activeScene.classList.add('active');
                const video = activeScene.querySelector('.environment-video');
                if (video) {
                    currentVideo = video;
                    // Start video if audio is playing
                    if (isPlaying) {
                        setTimeout(() => {
                            video.play().catch(() => {});
                        }, 100);
                    }
                }
            }
            
            // Auto-switch audio if playing
            if (isPlaying) {
                setTimeout(() => playEnvironmentAudio(envType), 50);
            }
        }
        
        function stopCurrentAudio() {
            if (currentAudio) {
                if (audioType === 'html5' && currentAudio.pause) {
                    currentAudio.pause();
                    currentAudio.currentTime = 0;
                } else if (audioType === 'webaudio' && currentAudio.stop) {
                    currentAudio.stop();
                }
                currentAudio = null;
            }
        }
        
        function playEnvironmentAudio(envType = null) {
            const activeEnv = envType || document.querySelector('.env-btn.active')?.dataset.env || 'forest';
            
            // Stop current audio
            stopCurrentAudio();
            
            // Get new audio element
            const audioElement = document.getElementById(`${activeEnv}-audio`);
            
            if (audioElement && audioElement.canPlayType && audioElement.canPlayType('audio/mpeg')) {
                audioType = 'html5';
                currentAudio = audioElement;
                
                // Set volume from slider
                const volume = document.getElementById('volume-slider').value / 100;
                currentAudio.volume = volume;
                
                // Play audio with error handling
                currentAudio.play().catch(() => {
                    console.log('Audio not available for', activeEnv);
                });
            } else {
                console.log('Audio not available for', activeEnv);
            }
            
            // Start video if available
            if (currentVideo) {
                setTimeout(() => {
                    currentVideo.play().catch(() => {});
                }, 100);
            }
        }
        

        
        function stopEnvironmentAudio() {
            stopCurrentAudio();
            
            if (currentVideo) {
                currentVideo.pause();
                currentVideo.currentTime = 0;
            }
        }
        
        // Play/Stop button handlers
        document.getElementById('play-audio')?.addEventListener('click', async () => {
            document.getElementById('play-audio').style.display = 'none';
            document.getElementById('stop-audio').style.display = 'inline-block';
            isPlaying = true;
            
            // Enable audio context on user interaction
            try {
                if (window.AudioContext || window.webkitAudioContext) {
                    const ctx = new (window.AudioContext || window.webkitAudioContext)();
                    if (ctx.state === 'suspended') {
                        await ctx.resume();
                    }
                    ctx.close();
                }
            } catch(e) {}
            
            playEnvironmentAudio();
        });
        
        document.getElementById('stop-audio')?.addEventListener('click', () => {
            document.getElementById('stop-audio').style.display = 'none';
            document.getElementById('play-audio').style.display = 'inline-block';
            isPlaying = false;
            stopEnvironmentAudio();
        });
        
        // Volume control with real-time updates
        document.getElementById('volume-slider')?.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            
            if (currentAudio) {
                if (audioType === 'html5' && currentAudio.volume !== undefined) {
                    currentAudio.volume = volume;
                } else if (audioType === 'webaudio' && currentAudio.gainNode) {
                    try {
                        currentAudio.gainNode.gain.setValueAtTime(volume * 0.1, currentAudio.audioContext.currentTime);
                    } catch(e) {}
                }
            }
        });
        
        // Initialize first environment
        switchEnvironment('forest');
        
        // Save activity planner data
        function saveActivityPlanner() {
            const plannerData = {};
            document.querySelectorAll('.day-column').forEach(dayCol => {
                const day = dayCol.querySelector('h4').textContent;
                const activities = [];
                dayCol.querySelectorAll('.activity-slot').forEach(slot => {
                    const activity = slot.textContent.trim();
                    if (activity && activity !== 'Add activity...') {
                        activities.push(activity);
                    }
                });
                plannerData[day] = activities;
            });
            localStorage.setItem('activityPlanner', JSON.stringify(plannerData));
        }
        
        // Load activity planner data
        function loadActivityPlanner() {
            const saved = localStorage.getItem('activityPlanner');
            if (saved) {
                const plannerData = JSON.parse(saved);
                document.querySelectorAll('.day-column').forEach(dayCol => {
                    const day = dayCol.querySelector('h4').textContent;
                    const slots = dayCol.querySelectorAll('.activity-slot');
                    const activities = plannerData[day] || [];
                    
                    slots.forEach((slot, index) => {
                        if (activities[index]) {
                            slot.textContent = activities[index];
                            slot.setAttribute('data-filled', 'true');
                        }
                    });
                });
            }
        }
        
        // Auto-save planner on changes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('activity-slot')) {
                setTimeout(saveActivityPlanner, 500);
            }
        });
        
        // Load saved planner data on page load
        loadActivityPlanner();
        
        // Mood Tracker functionality
        const moodSlider = document.getElementById('mood-slider');
        const moodEmoji = document.getElementById('current-mood-emoji');
        const moodText = document.getElementById('current-mood-text');
        
        const moodData = {
            1: { emoji: '😢', text: 'Very Low' },
            2: { emoji: '😞', text: 'Low' },
            3: { emoji: '😔', text: 'Poor' },
            4: { emoji: '😕', text: 'Below Average' },
            5: { emoji: '😐', text: 'Neutral' },
            6: { emoji: '🙂', text: 'Okay' },
            7: { emoji: '😊', text: 'Good' },
            8: { emoji: '😄', text: 'Great' },
            9: { emoji: '😁', text: 'Excellent' },
            10: { emoji: '🤩', text: 'Amazing' }
        };
        
        function updateMoodDisplay(value) {
            const mood = moodData[value];
            if (moodEmoji) moodEmoji.textContent = mood.emoji;
            if (moodText) moodText.textContent = mood.text;
        }
        
        if (moodSlider) {
            moodSlider.addEventListener('input', (e) => {
                updateMoodDisplay(e.target.value);
            });
            
            // Load today's mood from database if exists
            const loadTodaysMood = async () => {
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                if (currentUser && currentUser.id) {
                    try {
                        const today = new Date().toISOString().split('T')[0];
                        const response = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                        const data = await response.json();
                        if (data.success && data.moods) {
                            const todaysMood = data.moods.find(m => m.mood_date === today);
                            if (todaysMood) {
                                moodSlider.value = todaysMood.mood_rating;
                                updateMoodDisplay(todaysMood.mood_rating);
                            }
                        }
                    } catch (err) {
                        console.error('Failed to load today\'s mood:', err);
                    }
                }
            };
            loadTodaysMood();
        }
        
        // Save mood functionality
        document.getElementById('save-mood-btn')?.addEventListener('click', async () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const today = new Date().toISOString().split('T')[0];
            const moodValue = parseInt(moodSlider.value);
            
            console.log('💾 Saving mood:', { userId: currentUser?.id, date: today, mood: moodValue });
            console.log('💾 Current user object:', currentUser);
            
            // Always save to localStorage first
            const localMoods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
            const existingIndex = localMoods.findIndex(m => m.date === today);
            
            if (existingIndex >= 0) {
                localMoods[existingIndex].mood = moodValue;
            } else {
                localMoods.unshift({ date: today, mood: moodValue });
            }
            
            // Keep only last 30 days
            if (localMoods.length > 30) {
                localMoods.splice(30);
            }
            
            localStorage.setItem('moodHistory', JSON.stringify(localMoods));
            console.log('✅ Mood saved to localStorage');
            
            // Also save to database if user is logged in
            if (currentUser && currentUser.id) {
                try {
                    console.log('🌐 Making mood API request...');
                    const response = await fetch(`${API_BASE}/api/moods`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            userId: currentUser.id,
                            moodDate: today,
                            moodRating: moodValue
                        })
                    });
                    
                    console.log('📡 Mood API response status:', response.status);
                    const result = await response.json();
                    console.log('📦 Mood API result:', result);
                    
                    if (result.success) {
                        alert('Mood saved successfully! 😊');
                        console.log('✅ Mood saved to both localStorage and database');
                    } else {
                        throw new Error(result.error || 'Failed to save mood');
                    }
                } catch (err) {
                    console.error('❌ Failed to save mood to database:', err);
                    alert('Mood saved locally (offline mode)');
                }
            } else {
                console.log('⚠️ No user logged in, saved locally only');
                alert('Mood saved locally');
            }
            
            renderMoodChart();
            renderMilestones();
            checkMilestones();
        });
        
        // Render mood trend chart
        async function renderMoodChart() {
            const canvas = document.getElementById('mood-chart');
            if (!canvas) return;
            
            const ctx = canvas.getContext('2d');
            let moodHistory = [];
            
            // Always try to get current user (including token restoration)
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const token = localStorage.getItem('token');
            
            // If no user but token exists, try to restore user
            if (!currentUser && token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.userId) {
                        const userResponse = await fetch(`${API_BASE}/api/users/${payload.userId}`);
                        const userData = await userResponse.json();
                        if (userData.success) {
                            currentUser = userData.user;
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                            updateWelcomeMessage(currentUser.name);
                        }
                    }
                } catch (err) {
                    console.error('Failed to restore user for mood chart:', err);
                }
            }
            
            // Get data from both localStorage and database
            let dbMoods = [];
            let localMoods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
            
            // Fetch from database if user is logged in
            if (currentUser && currentUser.id) {
                try {
                    console.log('📊 Chart: Fetching mood data from database...');
                    const response = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                    const data = await response.json();
                    console.log('📊 Chart: Database mood data:', data);
                    
                    if (data.success && data.moods && data.moods.length > 0) {
                        dbMoods = data.moods.map(m => ({
                            date: m.mood_date,
                            mood: m.mood_rating
                        }));
                        console.log('📊 Chart: Database mood history:', dbMoods);
                    }
                } catch (err) {
                    console.error('📊 Chart: Failed to fetch mood data from database:', err);
                }
            }
            
            // Merge localStorage and database data, prioritizing database for logged-in users
            const moodMap = new Map();
            
            // Add localStorage data first
            localMoods.forEach(mood => {
                moodMap.set(mood.date, mood.mood);
            });
            
            // Override with database data if available
            dbMoods.forEach(mood => {
                moodMap.set(mood.date, mood.mood);
            });
            
            // Convert back to array and sort by date
            moodHistory = Array.from(moodMap.entries())
                .map(([date, mood]) => ({ date: new Date(date).toDateString(), mood }))
                .sort((a, b) => new Date(b.date) - new Date(a.date));
            
            console.log('📊 Chart: Final merged mood history:', moodHistory);
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            if (moodHistory.length === 0) {
                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary');
                ctx.font = '16px Poppins';
                ctx.textAlign = 'center';
                ctx.fillText('No mood data recorded yet', canvas.width / 2, canvas.height / 2);
                ctx.fillText('Save your first mood to see trends!', canvas.width / 2, canvas.height / 2 + 25);
                updateMoodStats([]);
                return;
            }
            
            // Get last 7 days
            const last7Days = moodHistory.slice(0, 7).reverse();
            
            // Draw grid
            ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--border');
            ctx.lineWidth = 1;
            
            for (let i = 1; i <= 10; i++) {
                const y = (canvas.height - 40) - ((i - 1) * (canvas.height - 80) / 9);
                ctx.beginPath();
                ctx.moveTo(40, y);
                ctx.lineTo(canvas.width - 20, y);
                ctx.stroke();
            }
            
            // Draw mood line and points
            if (last7Days.length > 0) {
                ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--primary-color');
                ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--primary-color');
                
                if (last7Days.length > 1) {
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    
                    last7Days.forEach((entry, index) => {
                        const x = 40 + (index * (canvas.width - 60) / (last7Days.length - 1));
                        const y = (canvas.height - 40) - ((entry.mood - 1) * (canvas.height - 80) / 9);
                        
                        if (index === 0) {
                            ctx.moveTo(x, y);
                        } else {
                            ctx.lineTo(x, y);
                        }
                    });
                    
                    ctx.stroke();
                }
                
                // Draw points
                last7Days.forEach((entry, index) => {
                    const x = last7Days.length === 1 ? canvas.width / 2 : 40 + (index * (canvas.width - 60) / (last7Days.length - 1));
                    const y = (canvas.height - 40) - ((entry.mood - 1) * (canvas.height - 80) / 9);
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, 2 * Math.PI);
                    ctx.fill();
                });
            }
            
            updateMoodStats(last7Days);
        }
        
        function updateMoodStats(moodData) {
            const avgElement = document.getElementById('avg-mood');
            const trendElement = document.getElementById('mood-trend');
            
            if (!avgElement || !trendElement) return;
            
            if (!moodData || moodData.length === 0) {
                avgElement.textContent = '-';
                trendElement.textContent = 'No data yet';
                trendElement.style.color = getComputedStyle(document.body).getPropertyValue('--text-secondary');
                return;
            }
            
            // Calculate average
            const average = moodData.reduce((sum, entry) => sum + entry.mood, 0) / moodData.length;
            avgElement.textContent = average.toFixed(1);
            
            // Calculate trend
            if (moodData.length < 2) {
                trendElement.textContent = 'Stable';
            } else {
                const first = moodData[0].mood;
                const last = moodData[moodData.length - 1].mood;
                const diff = last - first;
                
                if (diff > 0.5) {
                    trendElement.textContent = '📈 Improving';
                    trendElement.style.color = '#2ed573';
                } else if (diff < -0.5) {
                    trendElement.textContent = '📉 Declining';
                    trendElement.style.color = '#ff4757';
                } else {
                    trendElement.textContent = '➡️ Stable';
                    trendElement.style.color = getComputedStyle(document.body).getPropertyValue('--text-primary');
                }
            }
        }
        
        // Milestones system
        async function checkMilestones() {
            let assessments = [];
            let moodHistory = [];
            
            // Always try to get current user (including token restoration)
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                console.log('No user found, skipping milestone check');
                return;
            }
            const token = localStorage.getItem('token');
            
            // If no user but token exists, try to restore user
            if (!currentUser && token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.userId) {
                        const userResponse = await fetch(`${API_BASE}/api/users/${payload.userId}`);
                        const userData = await userResponse.json();
                        if (userData.success) {
                            currentUser = userData.user;
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        }
                    }
                } catch (err) {
                    console.error('Failed to restore user for milestones:', err);
                }
            }
            
            // Get data from both localStorage and database
            let localAssessments = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
            let localMoods = JSON.parse(localStorage.getItem('moodHistory') || '[]');
            
            // Fetch from database if user is logged in
            if (currentUser && currentUser.id) {
                try {
                    // Fetch assessments from database
                    const assessmentResponse = await fetch(`${API_BASE}/api/assessments?userId=${currentUser.id}`);
                    const assessmentData = await assessmentResponse.json();
                    if (assessmentData.assessments) {
                        assessments = assessmentData.assessments;
                    }
                    
                    // Fetch mood data from database
                    const moodResponse = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                    const moodData = await moodResponse.json();
                    if (moodData.success && moodData.moods) {
                        moodHistory = moodData.moods;
                    }
                } catch (err) {
                    console.error('Failed to fetch data for milestones:', err);
                }
            }
            
            // Use localStorage data if database data is not available
            if (assessments.length === 0 && localAssessments.length > 0) {
                assessments = localAssessments;
            }
            if (moodHistory.length === 0 && localMoods.length > 0) {
                moodHistory = localMoods;
            }
            
            // Get existing milestones from database
            let existingMilestones = [];
            try {
                const milestonesResponse = await fetch(`${API_BASE}/api/milestones?userId=${currentUser.id}`);
                if (milestonesResponse.ok) {
                    const milestonesData = await milestonesResponse.json();
                    if (milestonesData.success && milestonesData.milestones) {
                        existingMilestones = milestonesData.milestones;
                    }
                }
            } catch (err) {
                console.error('Failed to fetch existing milestones:', err);
            }

            
            // Check for new milestones against existing ones
            const newMilestones = [];
            
            // First assessment milestone
            if (assessments.length >= 1 && !existingMilestones.find(m => m.milestone_id === 'first_assessment')) {
                newMilestones.push({
                    id: 'first_assessment',
                    icon: '🎯',
                    title: 'First Step Taken',
                    description: 'Completed your first mental health assessment',
                    date: new Date().toLocaleDateString(),
                    achieved: true
                });
            }
            
            // First mood entry milestone
            if (moodHistory.length >= 1 && !existingMilestones.find(m => m.milestone_id === 'first_mood')) {
                newMilestones.push({
                    id: 'first_mood',
                    icon: '😊',
                    title: 'Mood Tracking Started',
                    description: 'Recorded your first mood entry',
                    date: new Date().toLocaleDateString(),
                    achieved: true
                });
            }
            
            // Mood tracking milestone (7 days)
            if (moodHistory.length >= 7 && !existingMilestones.find(m => m.milestone_id === 'mood_week')) {
                newMilestones.push({
                    id: 'mood_week',
                    icon: '📈',
                    title: 'Mood Tracker Champion',
                    description: 'Tracked your mood for 7 days',
                    date: new Date().toLocaleDateString(),
                    achieved: true
                });
            }
            
            // Assessment consistency milestone
            if (assessments.length >= 3 && !existingMilestones.find(m => m.milestone_id === 'assessment_consistency')) {
                newMilestones.push({
                    id: 'assessment_consistency',
                    icon: '📋',
                    title: 'Consistent Tracker',
                    description: 'Completed 3 mental health assessments',
                    date: new Date().toLocaleDateString(),
                    achieved: true
                });
            }
            
            // Improvement milestone (only for assessments)
            if (assessments.length >= 2) {
                const latest = assessments[0];
                const previous = assessments[1];
                
                const improvements = [];
                if ((latest.phq9_score || latest.phq9) < (previous.phq9_score || previous.phq9)) improvements.push('Depression');
                if ((latest.gad7_score || latest.gad7) < (previous.gad7_score || previous.gad7)) improvements.push('Anxiety');
                if ((latest.pss_score || latest.pss) < (previous.pss_score || previous.pss)) improvements.push('Stress');
                
                if (improvements.length > 0 && !existingMilestones.find(m => m.milestone_id === 'improvement')) {
                    newMilestones.push({
                        id: 'improvement',
                        icon: '🌟',
                        title: 'Progress Made',
                        description: `Improved in: ${improvements.join(', ')}`,
                        date: new Date().toLocaleDateString(),
                        achieved: true
                    });
                }
            }
            
            // Save new milestones to both localStorage and database
            if (newMilestones.length > 0) {
                // Save to localStorage first
                const localMilestones = JSON.parse(localStorage.getItem('milestones') || '[]');
                newMilestones.forEach(milestone => {
                    if (!localMilestones.find(m => m.id === milestone.id)) {
                        localMilestones.push(milestone);
                    }
                });
                localStorage.setItem('milestones', JSON.stringify(localMilestones));
                console.log('✅ Milestones saved to localStorage');
                
                // Also save to database if user is logged in
                if (currentUser && currentUser.id) {
                    for (const milestone of newMilestones) {
                        try {
                            const response = await fetch(`${API_BASE}/api/milestones`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    userId: currentUser.id,
                                    milestoneId: milestone.id,
                                    icon: milestone.icon,
                                    title: milestone.title,
                                    description: milestone.description,
                                    achievedDate: milestone.date
                                })
                            });
                            if (!response.ok) {
                                console.error('Failed to save milestone to database');
                            } else {
                                console.log('✅ Milestone saved to database:', milestone.title);
                            }
                        } catch (err) {
                            console.error('Error saving milestone to database:', err);
                        }
                    }
                }
            }
            await renderMilestones();
        }
        
        async function renderMilestones() {
            const container = document.getElementById('milestones-container');
            if (!container) return;
            
            let milestones = [];
            
            // Try to get current user (including token restoration)
            let currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const token = localStorage.getItem('token');
            
            // If no user but token exists, try to restore user
            if (!currentUser && token) {
                try {
                    const payload = JSON.parse(atob(token.split('.')[1]));
                    if (payload.userId) {
                        const userResponse = await fetch(`${API_BASE}/api/users/${payload.userId}`);
                        const userData = await userResponse.json();
                        if (userData.success) {
                            currentUser = userData.user;
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));
                        }
                    }
                } catch (err) {
                    console.error('Failed to restore user for milestones:', err);
                }
            }
            
            // Get data from both localStorage and database
            let dbMilestones = [];
            let localMilestones = JSON.parse(localStorage.getItem('milestones') || '[]');
            
            // Fetch from database if user is logged in
            if (currentUser && currentUser.id) {
                try {
                    const response = await fetch(`${API_BASE}/api/milestones?userId=${currentUser.id}`);
                    if (response.ok) {
                        const data = await response.json();
                        if (data.success && data.milestones) {
                            dbMilestones = data.milestones.map(m => ({
                                id: m.milestone_id,
                                icon: m.icon,
                                title: m.title,
                                description: m.description,
                                date: new Date(m.achieved_date).toLocaleDateString(),
                                achieved: true
                            }));
                        }
                    }
                } catch (err) {
                    console.error('Milestones API error:', err);
                }
            }
            
            // Merge localStorage and database data, prioritizing database for logged-in users
            const milestoneMap = new Map();
            
            // Add localStorage data first
            localMilestones.forEach(milestone => {
                milestoneMap.set(milestone.id, milestone);
            });
            
            // Override with database data if available
            dbMilestones.forEach(milestone => {
                milestoneMap.set(milestone.id, milestone);
            });
            
            // Convert back to array
            milestones = Array.from(milestoneMap.values());
            
            console.log('Final merged milestones:', milestones);
            
            if (milestones.length === 0) {
                container.innerHTML = '<p class="section-prompt">Complete assessments to unlock milestones!</p>';
                return;
            }
            
            container.innerHTML = milestones.map(milestone => `
                <div class="milestone-card ${milestone.achieved ? 'achieved' : ''}">
                    <div class="milestone-icon">${milestone.icon}</div>
                    <div class="milestone-content">
                        <h3 class="milestone-title">${milestone.title}</h3>
                        <p class="milestone-description">${milestone.description}</p>
                        ${milestone.achieved ? `<p class="milestone-date">Achieved on ${milestone.date}</p>` : ''}
                    </div>
                </div>
            `).join('');
        }
        
        // Export functionality
        document.getElementById('export-progress-btn')?.addEventListener('click', () => {
            showModal('export-modal');
        });
        
        document.getElementById('export-modal-close-btn')?.addEventListener('click', hideModals);
        

        
        // CSV Export
        document.getElementById('export-csv-btn')?.addEventListener('click', async () => {
            let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Guest User', dob: null };
            
            // Fetch complete user data from database if logged in
            if (currentUser && currentUser.id) {
                try {
                    const userResponse = await fetch(`${API_BASE}/api/users/${currentUser.id}`);
                    const userData = await userResponse.json();
                    if (userData.success && userData.user) {
                        currentUser = userData.user;
                    }
                } catch (err) {
                    console.error('Failed to fetch user data:', err);
                }
            }
            let assessments = [];
            let moodHistory = [];
            
            console.log('CSV Current user data:', currentUser);
            // Fetch data from database if user is logged in
            if (currentUser && currentUser.id) {
                try {
                    console.log('🔍 CSV: Fetching data for user ID:', currentUser.id);
                    
                    // Fetch assessments
                    const assessmentResponse = await fetch(`${API_BASE}/api/assessments?userId=${currentUser.id}`);
                    const assessmentData = await assessmentResponse.json();
                    console.log('📊 CSV: Assessment data:', assessmentData);
                    if (assessmentData.assessments && assessmentData.assessments.length > 0) {
                        assessments = assessmentData.assessments.map(a => ({
                            date: new Date(a.assessment_date).toLocaleDateString(),
                            phq9: a.phq9_score,
                            gad7: a.gad7_score,
                            pss: a.pss_score
                        }));
                    }
                    
                    // Fetch mood data
                    console.log('😊 CSV: Fetching mood data...');
                    const moodResponse = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                    const moodData = await moodResponse.json();
                    console.log('😊 CSV: Mood data response:', moodData);
                    if (moodData.success && moodData.moods) {
                        moodHistory = moodData.moods.map(m => ({
                            date: new Date(m.mood_date).toLocaleDateString(),
                            mood: m.mood_rating
                        }));
                        console.log('😊 CSV: Processed mood history:', moodHistory);
                    }
                } catch (err) {
                    console.error('Failed to fetch data from database:', err);
                }
            }
            
            // No localStorage fallback - only use database data for logged-in users
            if (!currentUser || !currentUser.id) {
                alert('Please log in to export your data.');
                return;
            }
            
            let milestones = [];
            // Fetch milestones from database if user is logged in
            if (currentUser && currentUser.id) {
                try {
                    const milestonesResponse = await fetch(`${API_BASE}/api/milestones?userId=${currentUser.id}`);
                    if (milestonesResponse.ok) {
                        const milestonesData = await milestonesResponse.json();
                        if (milestonesData.success && milestonesData.milestones) {
                            milestones = milestonesData.milestones;
                        }
                    }
                } catch (err) {
                    console.log('Milestones API not available for CSV export');
                }
            }
            
            // No localStorage fallback for milestones - only use database data
            
            const userAge = currentUser.dob ? new Date().getFullYear() - new Date(currentUser.dob).getFullYear() : 'Unknown';
            
            // Create proper CSV with BOM for Excel compatibility
            let csvContent = '\uFEFF'; // BOM for UTF-8
            csvContent += `Patient Name: ${currentUser.name}\r\n`;
            const formattedDob = currentUser.dob ? new Date(currentUser.dob).toLocaleDateString() : 'Not provided';
            csvContent += `Date of Birth: ${formattedDob}\r\n`;
            csvContent += `Age: ${userAge}\r\n`;
            csvContent += `Report Generated: ${new Date().toLocaleDateString()}\r\n\r\n`;
            csvContent += 'Type,Date,PHQ-9 Score,PHQ-9 Level,GAD-7 Score,GAD-7 Level,PSS-10 Score,PSS-10 Level,Mood Rating\r\n';
            
            // Helper function to get interpretation
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
            
            assessments.forEach(assessment => {
                csvContent += `Assessment,"${assessment.date}",${assessment.phq9},"${getInterpretation('phq9', assessment.phq9)}",${assessment.gad7},"${getInterpretation('gad7', assessment.gad7)}",${assessment.pss},"${getInterpretation('pss', assessment.pss)}",\r\n`;
            });
            
            moodHistory.forEach(mood => {
                csvContent += `Mood,"${mood.date}",,,,,,,${mood.mood}\r\n`;
            });
            
            // Add milestones section
            if (milestones.length > 0) {
                csvContent += '\r\nMilestones:\r\n';
                csvContent += 'Title,Description,Date Achieved\r\n';
                milestones.forEach(milestone => {
                    const title = milestone.title || '';
                    const description = milestone.description || '';
                    const date = milestone.achieved_date ? new Date(milestone.achieved_date).toLocaleDateString() : (milestone.date || '');
                    csvContent += `"${title}","${description}","${date}"\r\n`;
                });
            }
            
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chetana_progress_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            alert('📊 CSV data downloaded successfully!');
        });
        
        // PDF Export
        document.getElementById('export-pdf-btn')?.addEventListener('click', async () => {
            if (!window.jspdf || !window.jspdf.jsPDF) {
                alert('PDF library not loaded. Please refresh the page.');
                return;
            }
            
            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF();
                let currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Guest User', dob: null };
                
                // Fetch complete user data from database if logged in
                if (currentUser && currentUser.id) {
                    try {
                        const userResponse = await fetch(`${API_BASE}/api/users/${currentUser.id}`);
                        const userData = await userResponse.json();
                        if (userData.success && userData.user) {
                            currentUser = userData.user;
                        }
                    } catch (err) {
                        console.error('Failed to fetch user data:', err);
                    }
                }
                let assessments = [];
                let moodHistory = [];
                
                console.log('PDF Current user data:', currentUser);
                // Fetch data from database if user is logged in
                if (currentUser && currentUser.id) {
                    try {
                        console.log('🔍 PDF: Fetching data for user ID:', currentUser.id);
                        
                        // Fetch assessments
                        const assessmentResponse = await fetch(`${API_BASE}/api/assessments?userId=${currentUser.id}`);
                        const assessmentData = await assessmentResponse.json();
                        console.log('📊 PDF: Assessment data:', assessmentData);
                        if (assessmentData.assessments && assessmentData.assessments.length > 0) {
                            assessments = assessmentData.assessments.map(a => ({
                                date: new Date(a.assessment_date).toLocaleDateString(),
                                phq9: a.phq9_score,
                                gad7: a.gad7_score,
                                pss: a.pss_score
                            }));
                        }
                        
                        // Fetch mood data
                        console.log('😊 PDF: Fetching mood data...');
                        const moodResponse = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                        const moodData = await moodResponse.json();
                        console.log('😊 PDF: Mood data response:', moodData);
                        if (moodData.success && moodData.moods) {
                            moodHistory = moodData.moods.map(m => ({
                                date: new Date(m.mood_date).toLocaleDateString(),
                                mood: m.mood_rating
                            }));
                            console.log('😊 PDF: Processed mood history:', moodHistory);
                        }
                    } catch (err) {
                        console.error('Failed to fetch data from database:', err);
                    }
                }
                
                // No localStorage fallback - only use database data for logged-in users
                if (!currentUser || !currentUser.id) {
                    alert('Please log in to export your data.');
                    return;
                }
                
                let milestones = [];
                
                // Fetch milestones from database if user is logged in
                if (currentUser && currentUser.id) {
                    try {
                        const milestonesResponse = await fetch(`${API_BASE}/api/milestones?userId=${currentUser.id}`);
                        if (milestonesResponse.ok) {
                            const milestonesData = await milestonesResponse.json();
                            if (milestonesData.success && milestonesData.milestones) {
                                milestones = milestonesData.milestones.map(m => ({
                                    title: m.title,
                                    description: m.description,
                                    date: new Date(m.achieved_date).toLocaleDateString()
                                }));
                            }
                        }
                    } catch (err) {
                        console.log('Milestones API not available for PDF export');
                    }
                }
                
                // No localStorage fallback for milestones - only use database data
                const userAge = currentUser.dob ? new Date().getFullYear() - new Date(currentUser.dob).getFullYear() : 'Unknown';
                
                // Helper function to get interpretation
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
                
                let yPos = 20;
                
                // Title
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text('Your Mental Health Progress Report', 20, yPos);
                yPos += 15;
                
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                doc.text(`Patient: ${currentUser.name}`, 20, yPos);
                yPos += 8;
                const formattedDob = currentUser.dob ? new Date(currentUser.dob).toLocaleDateString() : 'Not provided';
                doc.text(`Date of Birth: ${formattedDob}`, 20, yPos);
                yPos += 8;
                doc.text(`Age: ${userAge} years`, 20, yPos);
                yPos += 8;
                doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPos);
                yPos += 20;
                
                // Helper function to add footer
                function addPDFFooter(doc, pageNum) {
                    const pageHeight = doc.internal.pageSize.height;
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(135, 206, 235);
                    doc.text('Chetana', 20, pageHeight - 15);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    doc.text(' - Awakening Minds, Nurturing Wellbeing', 55, pageHeight - 15);
                    doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - 30, pageHeight - 15);
                    doc.setTextColor(0, 0, 0);
                }
                
                let pageNumber = 1;
                addPDFFooter(doc, pageNumber);
                
                // Assessment History
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Assessment History', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                
                if (assessments.length === 0) {
                    doc.text('No assessments completed yet.', 20, yPos);
                    yPos += 10;
                } else {
                    assessments.forEach((assessment, index) => {
                        if (yPos > 270) {
                            doc.addPage();
                            pageNumber++;
                            addPDFFooter(doc, pageNumber);
                            yPos = 20;
                        }
                        
                        doc.text(`${index + 1}. Date: ${assessment.date}`, 20, yPos);
                        yPos += 6;
                        doc.text(`   PHQ-9 (Depression): ${assessment.phq9} - ${getInterpretation('phq9', assessment.phq9)}`, 25, yPos);
                        yPos += 6;
                        doc.text(`   GAD-7 (Anxiety): ${assessment.gad7} - ${getInterpretation('gad7', assessment.gad7)}`, 25, yPos);
                        yPos += 6;
                        doc.text(`   PSS-10 (Stress): ${assessment.pss} - ${getInterpretation('pss', assessment.pss)}`, 25, yPos);
                        yPos += 10;
                    });
                }
                
                yPos += 10;
                
                // Mood History
                if (yPos > 250) {
                    doc.addPage();
                    pageNumber++;
                    addPDFFooter(doc, pageNumber);
                    yPos = 20;
                }
                
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Mood History (Last 7 days)', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                
                if (moodHistory.length === 0) {
                    doc.text('No mood data recorded yet.', 20, yPos);
                    yPos += 10;
                } else {
                    moodHistory.slice(0, 7).forEach(mood => {
                        if (yPos > 270) {
                            doc.addPage();
                            pageNumber++;
                            addPDFFooter(doc, pageNumber);
                            yPos = 20;
                        }
                        doc.text(`${mood.date}: ${mood.mood}/10`, 20, yPos);
                        yPos += 6;
                    });
                }
                
                yPos += 10;
                
                // Milestones
                if (yPos > 250) {
                    doc.addPage();
                    pageNumber++;
                    addPDFFooter(doc, pageNumber);
                    yPos = 20;
                }
                
                doc.setFontSize(16);
                doc.setFont('helvetica', 'bold');
                doc.text('Milestones Achieved', 20, yPos);
                yPos += 10;
                
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                
                if (milestones.length === 0) {
                    doc.text('No milestones achieved yet.', 20, yPos);
                    yPos += 10;
                } else {
                    milestones.forEach(milestone => {
                        if (yPos > 270) {
                            doc.addPage();
                            pageNumber++;
                            addPDFFooter(doc, pageNumber);
                            yPos = 20;
                        }
                        doc.text(`${milestone.title} - ${milestone.description}`, 20, yPos);
                        yPos += 6;
                        doc.text(`Achieved on: ${milestone.date}`, 25, yPos);
                        yPos += 10;
                    });
                }
                
                // Add visual chart - ALWAYS include if we have assessment data
                console.log('Chart data check - assessments length:', assessments.length);
                if (assessments.length >= 1) {
                    // Ensure we have space for the chart
                    if (yPos > 120) {
                        doc.addPage();
                        pageNumber++;
                        addPDFFooter(doc, pageNumber);
                        yPos = 20;
                    }
                    
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Visual Progress Chart', 20, yPos);
                    yPos += 15;
                    
                    // Prepare chart data (reverse to show chronological order)
                    const chartData = assessments.slice(0, 10).reverse();
                    console.log('Chart data for PDF:', chartData);
                    const chartWidth = 160;
                    const chartHeight = 90;
                    const chartX = 20;
                    const chartY = yPos;
                    
                    // Calculate max score for scaling
                    const maxScore = Math.max(30, ...chartData.flatMap(d => [d.phq9, d.gad7, d.pss]));
                    
                    // Draw chart background
                    doc.setFillColor(248, 249, 250);
                    doc.rect(chartX - 5, chartY - 5, chartWidth + 10, chartHeight + 10, 'F');
                    
                    // Draw axes
                    doc.setDrawColor(0, 0, 0);
                    doc.setLineWidth(1);
                    doc.line(chartX, chartY + chartHeight, chartX + chartWidth, chartY + chartHeight); // X-axis
                    doc.line(chartX, chartY, chartX, chartY + chartHeight); // Y-axis
                    
                    // Draw grid lines
                    doc.setDrawColor(200, 200, 200);
                    doc.setLineWidth(0.3);
                    for (let i = 1; i <= 5; i++) {
                        const gridY = chartY + (chartHeight * i / 5);
                        doc.line(chartX, gridY, chartX + chartWidth, gridY);
                    }
                    
                    // Y-axis labels
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    for (let i = 0; i <= 5; i++) {
                        const value = Math.round((maxScore * (5 - i)) / 5);
                        const labelY = chartY + (chartHeight * i / 5) + 2;
                        doc.text(value.toString(), chartX - 15, labelY);
                    }
                    
                    if (chartData.length === 1) {
                        // Single data point - show as bars
                        const data = chartData[0];
                        const barWidth = 15;
                        const spacing = 25;
                        const startX = chartX + 30;
                        
                        // PHQ-9 bar
                        const phq9Height = (data.phq9 * chartHeight) / maxScore;
                        doc.setFillColor(255, 99, 132);
                        doc.rect(startX, chartY + chartHeight - phq9Height, barWidth, phq9Height, 'F');
                        doc.setFontSize(7);
                        doc.setTextColor(0, 0, 0);
                        doc.text('PHQ-9', startX - 2, chartY + chartHeight + 10);
                        doc.text(data.phq9.toString(), startX + 5, chartY + chartHeight - phq9Height - 3);
                        
                        // GAD-7 bar
                        const gad7Height = (data.gad7 * chartHeight) / maxScore;
                        doc.setFillColor(54, 162, 235);
                        doc.rect(startX + spacing, chartY + chartHeight - gad7Height, barWidth, gad7Height, 'F');
                        doc.text('GAD-7', startX + spacing - 2, chartY + chartHeight + 10);
                        doc.text(data.gad7.toString(), startX + spacing + 5, chartY + chartHeight - gad7Height - 3);
                        
                        // PSS bar
                        const pssHeight = (data.pss * chartHeight) / maxScore;
                        doc.setFillColor(255, 206, 86);
                        doc.rect(startX + spacing * 2, chartY + chartHeight - pssHeight, barWidth, pssHeight, 'F');
                        doc.text('PSS-10', startX + spacing * 2 - 2, chartY + chartHeight + 10);
                        doc.text(data.pss.toString(), startX + spacing * 2 + 5, chartY + chartHeight - pssHeight - 3);
                        
                    } else {
                        // Multiple data points - show as line chart
                        const stepX = chartWidth / Math.max(1, chartData.length - 1);
                        
                        // PHQ-9 line (red)
                        doc.setDrawColor(255, 99, 132);
                        doc.setLineWidth(2);
                        for (let i = 0; i < chartData.length - 1; i++) {
                            const x1 = chartX + (i * stepX);
                            const y1 = chartY + chartHeight - (chartData[i].phq9 * chartHeight / maxScore);
                            const x2 = chartX + ((i + 1) * stepX);
                            const y2 = chartY + chartHeight - (chartData[i + 1].phq9 * chartHeight / maxScore);
                            doc.line(x1, y1, x2, y2);
                        }
                        
                        // PHQ-9 points
                        doc.setFillColor(255, 99, 132);
                        for (let i = 0; i < chartData.length; i++) {
                            const x = chartX + (i * stepX);
                            const y = chartY + chartHeight - (chartData[i].phq9 * chartHeight / maxScore);
                            doc.circle(x, y, 2, 'F');
                        }
                        
                        // GAD-7 line (blue)
                        doc.setDrawColor(54, 162, 235);
                        doc.setLineWidth(2);
                        for (let i = 0; i < chartData.length - 1; i++) {
                            const x1 = chartX + (i * stepX);
                            const y1 = chartY + chartHeight - (chartData[i].gad7 * chartHeight / maxScore);
                            const x2 = chartX + ((i + 1) * stepX);
                            const y2 = chartY + chartHeight - (chartData[i + 1].gad7 * chartHeight / maxScore);
                            doc.line(x1, y1, x2, y2);
                        }
                        
                        // GAD-7 points
                        doc.setFillColor(54, 162, 235);
                        for (let i = 0; i < chartData.length; i++) {
                            const x = chartX + (i * stepX);
                            const y = chartY + chartHeight - (chartData[i].gad7 * chartHeight / maxScore);
                            doc.circle(x, y, 2, 'F');
                        }
                        
                        // PSS line (yellow/orange)
                        doc.setDrawColor(255, 140, 0);
                        doc.setLineWidth(2);
                        for (let i = 0; i < chartData.length - 1; i++) {
                            const x1 = chartX + (i * stepX);
                            const y1 = chartY + chartHeight - (chartData[i].pss * chartHeight / maxScore);
                            const x2 = chartX + ((i + 1) * stepX);
                            const y2 = chartY + chartHeight - (chartData[i + 1].pss * chartHeight / maxScore);
                            doc.line(x1, y1, x2, y2);
                        }
                        
                        // PSS points
                        doc.setFillColor(255, 140, 0);
                        for (let i = 0; i < chartData.length; i++) {
                            const x = chartX + (i * stepX);
                            const y = chartY + chartHeight - (chartData[i].pss * chartHeight / maxScore);
                            doc.circle(x, y, 2, 'F');
                        }
                    }
                    
                    // Enhanced Legend with colored boxes
                    yPos += chartHeight + 20;
                    doc.setFontSize(9);
                    doc.setTextColor(0, 0, 0);
                    
                    // PHQ-9 legend
                    doc.setFillColor(255, 99, 132);
                    doc.rect(20, yPos - 3, 8, 3, 'F');
                    doc.text('PHQ-9 (Depression)', 32, yPos);
                    
                    // GAD-7 legend
                    doc.setFillColor(54, 162, 235);
                    doc.rect(80, yPos - 3, 8, 3, 'F');
                    doc.text('GAD-7 (Anxiety)', 92, yPos);
                    
                    // PSS legend
                    doc.setFillColor(255, 140, 0);
                    doc.rect(140, yPos - 3, 8, 3, 'F');
                    doc.text('PSS-10 (Stress)', 152, yPos);
                    
                    yPos += 15;
                    
                    // Chart interpretation note
                    doc.setFontSize(8);
                    doc.setTextColor(100, 100, 100);
                    doc.text('Note: Lower scores indicate better mental health outcomes.', 20, yPos);
                    yPos += 10;
                }
                
                // Footer
                if (yPos > 250) {
                    doc.addPage();
                    pageNumber++;
                    addPDFFooter(doc, pageNumber);
                    yPos = 20;
                }
                
                yPos += 20;
                doc.setFontSize(8);
                doc.setFont('helvetica', 'italic');
                doc.text('Note: This report contains your personal mental health data. Keep it secure.', 20, yPos);
                
                // Ensure footer is on final page
                addPDFFooter(doc, pageNumber);
                
                // Save PDF
                doc.save(`chetana_report_${new Date().toISOString().split('T')[0]}.pdf`);
                alert('📄 PDF report with visual chart downloaded successfully!');
                
            } catch (error) {
                console.error('PDF generation error:', error);
                try {
                    const { jsPDF } = window.jspdf;
                    const doc = new jsPDF();
                    doc.text('Chetana Progress Report', 20, 20);
                    doc.text('Error: Chart features not supported', 20, 40);
                    doc.save(`chetana_report_${new Date().toISOString().split('T')[0]}.pdf`);
                    alert('📄 Basic PDF downloaded (chart unavailable)');
                } catch (fallbackError) {
                    console.error('Fallback PDF error:', fallbackError);
                    alert('Error generating PDF. Please try again.');
                }
            }
        });
        
        // Initialize progress dashboard
        async function initProgressDashboard() {
            console.log('🚀 Initializing progress dashboard...');
            await renderMoodChart();
            await checkMilestones();
            await renderMilestones();
            console.log('✅ Progress dashboard initialized');
        }
        
        // Initialize on page load
        initProgressDashboard();
        
        // Relaxation timer functionality
        document.querySelectorAll('.timer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const minutes = parseInt(btn.dataset.time);
                
                if (relaxTimer) {
                    clearInterval(relaxTimer);
                }
                
                let timeLeft = minutes * 60;
                const display = document.getElementById('relax-timer-display');
                
                relaxTimer = setInterval(() => {
                    const mins = Math.floor(timeLeft / 60);
                    const secs = timeLeft % 60;
                    display.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
                    
                    if (timeLeft <= 0) {
                        clearInterval(relaxTimer);
                        alert('🧘 Relaxation time complete!');
                        document.querySelectorAll('.timer-btn').forEach(b => b.classList.remove('active'));
                        display.textContent = '00:00';
                    }
                    timeLeft--;
                }, 1000);
            });
        });
        
        // Load journal entries on init
        loadJournalEntries();
        
        // Initialize activity planner
        loadActivityPlanner();
        

        
        // Handle video loading states
        document.querySelectorAll('.environment-video').forEach(video => {
            const loadingDiv = video.nextElementSibling;
            
            video.addEventListener('loadstart', () => {
                if (loadingDiv && loadingDiv.classList.contains('video-loading')) {
                    loadingDiv.style.display = 'flex';
                }
            });
            
            video.addEventListener('canplay', () => {
                if (loadingDiv && loadingDiv.classList.contains('video-loading')) {
                    loadingDiv.style.display = 'none';
                }
            });
            
            video.addEventListener('error', () => {
                if (loadingDiv && loadingDiv.classList.contains('video-loading')) {
                    loadingDiv.innerHTML = '<p>Video not available</p>';
                }
            });
        });
    }

    function initializeApp() {
        window.addEventListener('resize', setAppHeight);
        setAppHeight();
        setupAllQuestions();
        applyTheme(localStorage.getItem('theme') || 'dark');
        
        // Check if user is already logged in or can be restored from token
        if (checkCurrentUser()) {
            showScreen('dashboard-screen');
        } else {
            const token = localStorage.getItem('token');
            if (token) {
                restoreUserFromToken();
            } else {
                showScreen(currentScreen);
            }
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
        
        // Wellness resource event listeners
        document.getElementById('understanding-depression-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('understanding-depression-screen');
        });
        document.getElementById('behavioral-activation-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('behavioral-activation-screen');
        });
        document.getElementById('breathing-exercise-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('breathing-exercise-screen');
        });
        document.getElementById('mindfulness-meditation-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('mindfulness-meditation-screen');
        });
        document.getElementById('writing-journal-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('writing-journal-screen');
        });
        document.getElementById('relax-environment-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('relax-environment-screen');
        });
        
        // Back buttons for wellness screens
        document.getElementById('depression-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('behavioral-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('breathing-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('mindfulness-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('journal-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('relax-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        
        // Wellness functionality
        initWellnessFeatures();
        document.getElementById('go-to-progress-btn')?.addEventListener('click', () => { 
            renderProgressChart(); 
            showScreen('progress-screen');
            setTimeout(() => {
                if (typeof renderMoodChart === 'function') renderMoodChart();
                if (typeof renderMilestones === 'function') renderMilestones();
                if (typeof checkMilestones === 'function') checkMilestones();
            }, 50);
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