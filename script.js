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
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id) {
                console.log('📊 Loading progress screen data for user:', currentUser.id);
                setTimeout(async () => {
                    try {
                        console.log('📊 Starting mood chart render...');
                        if (typeof renderMoodChart === 'function') {
                            await renderMoodChart();
                            console.log('📊 Mood chart render completed');
                        } else {
                            console.error('❌ renderMoodChart function not found');
                        }
                        
                        console.log('🏆 Starting milestones check...');
                        if (typeof checkMilestones === 'function') {
                            await checkMilestones();
                            console.log('🏆 Milestones check completed');
                        } else {
                            console.error('❌ checkMilestones function not found');
                        }
                        
                        console.log('🏆 Starting milestones render...');
                        if (typeof renderMilestones === 'function') {
                            await renderMilestones();
                            console.log('🏆 Milestones render completed');
                        } else {
                            console.error('❌ renderMilestones function not found');
                        }
                    } catch (err) {
                        console.error('❌ Error loading progress data:', err);
                        console.error('❌ Error stack:', err.stack);
                    }
                }, 100);
            } else {
                console.log('⚠️ No user found for progress screen');
            }
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
            
            const response = await fetch(`${API_BASE}/api/users?action=login`, {
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
                    // Use the admin user data from server response if available
                    const adminUser = data.user || { id: 'admin', name: 'Admin', email: 'admin@chetana.com', isAdmin: true };
                    localStorage.setItem('currentUser', JSON.stringify(adminUser));
                    updateWelcomeMessage(adminUser.name || 'Admin');
                    loadAdminPanel();
                    showScreen('admin-screen');
                } else {
                    console.log('👤 Frontend: Regular user login');
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    updateWelcomeMessage(data.user.name);
                    
                    // Initialize forum user immediately after login
                    try {
                        const forumResponse = await fetch(`${API_BASE}/api/forum?action=user&userId=${data.user.id}`);
                        if (forumResponse.ok) {
                            const forumData = await forumResponse.json();
                            if (forumData.success) {
                                const updatedUser = { ...data.user, forum_uid: forumData.username };
                                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                                updateWelcomeMessage(updatedUser.name);
                                // Update profile forum UID immediately
                                const profileForumUid = document.getElementById('profile-forum-uid');
                                if (profileForumUid) {
                                    profileForumUid.textContent = forumData.username;
                                }
                            }
                        }
                    } catch (err) {
                        console.error('Failed to initialize forum user:', err);
                    }
                    
                    // Load mood chart and milestones immediately after login
                    setTimeout(async () => {
                        // Load today's mood first
                        const moodSlider = document.getElementById('mood-slider');
                        if (moodSlider) {
                            const loadTodaysMood = async () => {
                                try {
                                    console.log('😊 Loading today\'s mood for user:', data.user.id);
                                    const today = new Date().toISOString().split('T')[0];
                                    const response = await fetch(`${API_BASE}/api/moods?userId=${data.user.id}`);
                                    const moodData = await response.json();
                                    if (moodData.success && moodData.moods && moodData.moods.length > 0) {
                                        const todaysMood = moodData.moods.find(m => {
                                            const moodDate = new Date(m.mood_date).toISOString().split('T')[0];
                                            return moodDate === today;
                                        });
                                        if (todaysMood) {
                                            moodSlider.value = todaysMood.mood_rating;
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
                                            const mood = moodData[todaysMood.mood_rating];
                                            const moodEmoji = document.getElementById('current-mood-emoji');
                                            const moodText = document.getElementById('current-mood-text');
                                            if (moodEmoji) moodEmoji.textContent = mood.emoji;
                                            if (moodText) moodText.textContent = mood.text;
                                        }
                                    }
                                } catch (err) {
                                    console.error('😊 Failed to load today\'s mood:', err);
                                }
                            };
                            await loadTodaysMood();
                        }
                        
                        if (typeof renderMoodChart === 'function') await renderMoodChart();
                        if (typeof checkMilestones === 'function') await checkMilestones();
                        if (typeof renderMilestones === 'function') await renderMilestones();
                    }, 500);
                    
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
        const dob = document.getElementById('register-dob')?.value.trim();
        const email = document.getElementById('register-email')?.value.trim();
        const password = document.getElementById('register-password')?.value.trim();
        const createBtn = document.getElementById('create-account-btn');
        
        console.log('📝 Frontend: Registration data:', { name, dob, email, hasPassword: !!password });
        
        if (!name || !dob || !email || !password) {
            console.log('❌ Frontend: Missing registration fields');
            alert('Please fill all fields.');
            return;
        }
        
        // Validate date format if manually typed (DD/MM/YYYY)
        if (dob && dob.includes('/')) {
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
            if (!dateRegex.test(dob)) {
                alert('Please enter date in DD/MM/YYYY format (e.g., 15/03/1990)');
                return;
            }
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
            
            const response = await fetch(`${API_BASE}/api/users?action=register`, {
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
        // Show consent screen first
        document.getElementById('assessment-consent').style.display = 'block';
        document.getElementById('assessment-content').style.display = 'none';
        showScreen('assessment-screen');
    }
    
    async function loadDataPrivacyInfo() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser || !currentUser.id) {
            document.getElementById('assessment-count').textContent = 'Please log in';
            document.getElementById('mood-count').textContent = 'Please log in';
            document.getElementById('account-date').textContent = 'Please log in';
            return;
        }
        
        try {
            // Fetch fresh user data from database
            const userResponse = await fetch(`${API_BASE}/api/users/${currentUser.id}`);
            const userData = await userResponse.json();
            console.log('User data from database:', userData);
            
            // Load assessment count
            const assessmentResponse = await fetch(`${API_BASE}/api/assessments?userId=${currentUser.id}`);
            const assessmentData = await assessmentResponse.json();
            const assessmentCount = assessmentData.assessments ? assessmentData.assessments.length : 0;
            document.getElementById('assessment-count').textContent = `${assessmentCount} assessments completed`;
            
            // Load mood count
            const moodResponse = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
            const moodData = await moodResponse.json();
            const moodCount = moodData.success && moodData.moods ? moodData.moods.length : 0;
            document.getElementById('mood-count').textContent = `${moodCount} mood entries recorded`;
            
            // Account creation date from database
            let accountDate = 'Unknown';
            if (userData.success && userData.user) {
                const user = userData.user;
                console.log('User object fields:', Object.keys(user));
                console.log('Full user object:', user);
                
                // Try all possible date fields
                const dateFields = ['created_at', 'createdAt', 'date_created', 'registration_date', 'signup_date', 'joined_date', 'account_created'];
                for (const field of dateFields) {
                    if (user[field]) {
                        accountDate = new Date(user[field]).toLocaleDateString();
                        console.log(`Found date in field ${field}:`, user[field]);
                        break;
                    }
                }
                
                // If still unknown, use today's date as fallback
                if (accountDate === 'Unknown') {
                    accountDate = new Date().toLocaleDateString();
                    console.log('No creation date found, using current date as fallback');
                }
            }
            document.getElementById('account-date').textContent = accountDate;
            
        } catch (err) {
            console.error('Failed to load data privacy info:', err);
            document.getElementById('assessment-count').textContent = 'Error loading data';
            document.getElementById('mood-count').textContent = 'Error loading data';
            document.getElementById('account-date').textContent = 'Error loading data';
        }
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
                
                // Check and update milestones after assessment
                setTimeout(async () => {
                    if (typeof checkMilestones === 'function') await checkMilestones();
                }, 1000);
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
        const profileForumUid = document.getElementById('profile-forum-uid');
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        if (profileName && currentUser) {
            profileName.textContent = currentUser.name;
        }
        if (profileEmail && currentUser) {
            profileEmail.textContent = currentUser.email;
        }
        
        // Update forum username in profile
        if (profileForumUid) {
            if (currentUser && currentUser.forum_uid) {
                profileForumUid.textContent = currentUser.forum_uid;
            } else {
                profileForumUid.textContent = 'Not set (visit forum to generate)';
            }
        }
    }
    
    async function checkCurrentUser() {
        try {
            const response = await fetch(`${API_BASE}/api/session`);
            const data = await response.json();
            
            console.log('🔍 Checking current user session:', data);
            
            if (data.success && data.user) {
                updateWelcomeMessage(data.user.name || 'User');
                return data.user;
            }
        } catch (err) {
            console.error('Session check failed:', err);
        }
        console.log('❌ No valid session found');
        return null;
    }
    
    async function restoreUserFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        try {
            // Handle simple token format (admin-token)
            if (token === 'admin-token') {
                const adminUser = { id: 'admin', name: 'Admin', email: 'admin@chetana.com', isAdmin: true };
                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                updateWelcomeMessage('Admin');
                loadAdminPanel();
                showScreen('admin-screen');
                return;
            }
            
            // Handle JWT tokens
            if (token.includes('.')) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const userId = payload.userId;
                const isAdmin = payload.isAdmin;
                
                if (isAdmin) {
                    console.log('👑 Admin token detected, restoring admin session');
                    const adminUser = { id: userId || 'admin', name: 'Admin', email: 'admin@chetana.com', isAdmin: true };
                    localStorage.setItem('currentUser', JSON.stringify(adminUser));
                    updateWelcomeMessage('Admin');
                    loadAdminPanel();
                    showScreen('admin-screen');
                    return;
                }
                
                if (userId) {
                    // Fetch regular user data from database
                    const response = await fetch(`${API_BASE}/api/users/${userId}`);
                    const data = await response.json();
                    
                    if (data.success && data.user) {
                        localStorage.setItem('currentUser', JSON.stringify(data.user));
                        updateWelcomeMessage(data.user.name);
                        showScreen('dashboard-screen');
                    }
                }
            }
        } catch (err) {
            console.error('Failed to restore user from token:', err);
            localStorage.removeItem('token');
            localStorage.removeItem('currentUser');
        }
    }
    
    function logout() {
        console.log('🚪 Logging out user...');
        // Clear all localStorage data
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        console.log('🧹 Session cleared');
        showScreen('login-screen');
    }

    async function loadAdminPanel() {
        try {
            const response = await fetch(`${API_BASE}/api/users?action=admin`);
            
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
                        <button class="view-reports-btn" data-user-id="${user.id}" data-user-name="${user.name || 'User'}">View Reports</button>
                        <button class="delete-user-btn" data-user-id="${user.id}">Delete</button>
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
    
    async function loadReports() {
        try {
            console.log('Loading reports from API...');
            const response = await fetch(`${API_BASE}/api/forum?action=reports`);
            console.log('Reports API response status:', response.status);
            
            if (response.ok) {
                const reports = await response.json();
                console.log('Reports data received:', reports);
                displayReports(reports);
            } else {
                console.error('Reports API failed with status:', response.status);
                const errorText = await response.text();
                console.error('Error response:', errorText);
                displayReports([]);
            }
        } catch (err) {
            console.error('Failed to load reports:', err);
            displayReports([]);
        }
    }
    
    function displayReports(reports) {
        const container = document.getElementById('reports-list');
        console.log('Displaying reports:', reports.length, 'reports');
        
        if (!container) {
            console.error('Reports list container not found');
            return;
        }
        
        if (reports.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No reports to review.</p>';
            return;
        }
        
        container.innerHTML = reports.map(report => `
            <div class="report-card" style="background: var(--surface); padding: 1.5rem; border-radius: var(--radius-base); border: 1px solid var(--border); margin-bottom: 1rem;">
                <div class="report-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <span class="report-type" style="background: var(--primary-color); color: white; padding: 0.25rem 0.75rem; border-radius: 15px; font-size: 0.8rem; text-transform: uppercase;">${report.type}</span>
                    <span class="report-date" style="color: var(--text-secondary); font-size: 0.9rem;">${new Date(report.created_at).toLocaleDateString()}</span>
                </div>
                <div class="report-content" style="margin-bottom: 1rem;">
                    <p style="margin: 0.5rem 0; color: var(--text-primary);"><strong>Content:</strong> ${report.content_preview || 'N/A'}</p>
                    <p style="margin: 0.5rem 0; color: var(--text-primary);"><strong>Author:</strong> ${report.author_uid || 'Unknown'}</p>
                    <p style="margin: 0.5rem 0; color: var(--text-primary);"><strong>Reason:</strong> ${report.reason}</p>
                    <p style="margin: 0.5rem 0; color: var(--text-primary);"><strong>Reporter:</strong> ${report.reporter_uid}</p>
                </div>
                <div class="report-actions" style="display: flex; gap: 1rem;">
                    <button class="btn btn--danger" onclick="resolveReport(${report.id}, 'delete')" style="background: var(--danger); color: white; border: none; padding: 0.5rem 1rem; border-radius: var(--radius-base); cursor: pointer;">Delete Content</button>
                    <button class="btn btn--outline" onclick="resolveReport(${report.id}, 'dismiss')" style="background: transparent; border: 2px solid var(--primary-color); color: var(--primary-color); padding: 0.5rem 1rem; border-radius: var(--radius-base); cursor: pointer;">Dismiss Report</button>
                </div>
            </div>
        `).join('');
        
        console.log('Reports HTML generated and inserted');
    }
    
    async function resolveReport(reportId, action) {
        try {
            const response = await fetch(`${API_BASE}/api/forum?action=resolve-report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reportId, action })
            });
            if (response.ok) {
                alert(`Report ${action}d successfully!`);
                loadReports();
            }
        } catch (err) {
            alert('Failed to resolve report');
        }
    }
    
    window.resolveReport = resolveReport;
    
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
                <button class="btn btn--primary reset-therapists-btn" onclick="resetTherapists()">Start Over</button>
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
                <button class="cancel-btn" data-request-id="${request.id}">Cancel Request</button>
            `;
            requestsList.appendChild(requestCard);
        });
        
        // Add event listeners to cancel buttons
        requestsList.querySelectorAll('.cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const requestId = parseInt(btn.dataset.requestId);
                cancelRequest(requestId);
            });
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
    window.loadReports = loadReports;
    window.displayReports = displayReports;
    
    // Make resetTherapists globally available
    window.resetTherapists = resetTherapists;
    
    // Global functions for mood tracking and milestones
    async function renderMoodChart() {
        const canvas = document.getElementById('mood-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let moodHistory = [];
        
        // Get current user
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('No user found for mood chart');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--text-secondary');
            ctx.font = '16px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText('Please log in to view mood data', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Fetch mood data from database
        if (currentUser && currentUser.id) {
            try {
                console.log('📊 Chart: Fetching mood data for user:', currentUser.id);
                const response = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                const data = await response.json();
                console.log('📊 Chart: Database response:', data);
                
                if (data.success && data.moods && data.moods.length > 0) {
                    moodHistory = data.moods.map(m => ({
                        date: new Date(m.mood_date).toLocaleDateString(),
                        mood: m.mood_rating
                    })).sort((a, b) => new Date(b.date) - new Date(a.date));
                    console.log('📊 Chart: Processed mood history:', moodHistory);
                } else {
                    console.log('📊 Chart: No mood data found in database response');
                    moodHistory = [];
                }
            } catch (err) {
                console.error('📊 Chart: Failed to fetch mood data:', err);
                moodHistory = [];
            }
        } else {
            console.log('📊 Chart: No user ID available');
            moodHistory = [];
        }
        
        console.log('📊 Chart: Rendering chart with', moodHistory.length, 'mood entries');
        
        // Ensure canvas is visible and properly sized
        if (canvas) {
            canvas.style.display = 'block';
            canvas.width = 400;
            canvas.height = 200;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (moodHistory.length === 0) {
            console.log('📊 Chart: No mood data to display');
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
        console.log('📊 Chart: Last 7 days data:', last7Days);
        
        if (last7Days.length === 0) {
            console.log('📊 Chart: No data in last 7 days');
            updateMoodStats([]);
            return;
        }
        
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
        console.log('📊 Chart: Chart rendering completed');
    }
    
    async function renderMilestones() {
        const container = document.getElementById('milestones-container');
        if (!container) return;
        
        let milestones = [];
        
        // Get current user
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('No user found for milestones');
            container.innerHTML = '<p class="section-prompt">Please log in to view milestones!</p>';
            return;
        }
        
        // Fetch milestones from database
        if (currentUser && currentUser.id) {
            try {
                console.log('🏆 Fetching milestones for user:', currentUser.id);
                const response = await fetch(`${API_BASE}/api/milestones?userId=${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log('🏆 Database milestones response:', data);
                    if (data.success && data.milestones) {
                        console.log('🏆 Raw milestones from DB:', data.milestones);
                        if (data.milestones.length > 0) {
                            milestones = data.milestones.map(m => ({
                                id: m.milestone_id,
                                icon: m.icon,
                                title: m.title,
                                description: m.description,
                                date: new Date(m.achieved_date).toLocaleDateString(),
                                achieved: true
                            }));
                            console.log('🏆 Processed milestones:', milestones);
                        }
                    } else {
                        console.log('🏆 No milestones found in database or API error');
                    }
                }
            } catch (err) {
                console.error('🏆 Milestones API error:', err);
            }
        } else {
            console.log('🏆 No user ID available for milestones');
        }
        
        console.log('🏆 Final milestones to render:', milestones.length);
        console.log('🏆 Container element found:', !!container);
        
        if (milestones.length === 0) {
            container.innerHTML = '<p class="section-prompt">Complete assessments to unlock milestones!</p>';
            console.log('🏆 No milestones, showing prompt');
            return;
        }
        
        const milestonesHTML = milestones.map(milestone => `
            <div class="milestone-card achieved" style="border: 2px solid #4CAF50; padding: 15px; margin: 10px 0; border-radius: 8px; background: rgba(76, 175, 80, 0.1);">
                <div style="font-size: 24px; margin-bottom: 10px;">${milestone.icon}</div>
                <div>
                    <h3 style="color: #4CAF50; margin: 0 0 5px 0;">${milestone.title}</h3>
                    <p style="margin: 0 0 5px 0;">${milestone.description}</p>
                    <p style="font-size: 12px; color: #666; margin: 0;">Achieved on ${milestone.date}</p>
                </div>
            </div>
        `).join('');
        
        console.log('🏆 Generated HTML length:', milestonesHTML.length);
        container.innerHTML = milestonesHTML;
        console.log('🏆 Milestones HTML set successfully');
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
    
    async function checkMilestones() {
        let assessments = [];
        let moodHistory = [];
        
        // Get current user
        let currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) {
            console.log('No user found, skipping milestone check');
            return;
        }
        
        // Fetch data from database
        if (currentUser && currentUser.id) {
            try {
                console.log('🏆 Fetching data for milestone check, user:', currentUser.id);
                
                // Fetch assessments from database
                const assessmentResponse = await fetch(`${API_BASE}/api/assessments?userId=${currentUser.id}`);
                const assessmentData = await assessmentResponse.json();
                console.log('🏆 Assessment data for milestones:', assessmentData);
                if (assessmentData.assessments && assessmentData.assessments.length > 0) {
                    assessments = assessmentData.assessments;
                }
                
                // Fetch mood data from database
                const moodResponse = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                const moodData = await moodResponse.json();
                console.log('🏆 Mood data for milestones:', moodData);
                if (moodData.success && moodData.moods && moodData.moods.length > 0) {
                    moodHistory = moodData.moods;
                }
            } catch (err) {
                console.error('🏆 Failed to fetch data for milestones:', err);
                return;
            }
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
        
        // Save new milestones to database
        if (newMilestones.length > 0) {
            console.log('🏆 Saving', newMilestones.length, 'new milestones to database');
            
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
                    if (response.ok) {
                        console.log('✅ Milestone saved to database:', milestone.title);
                    } else {
                        console.error('❌ Failed to save milestone to database:', milestone.title);
                    }
                } catch (err) {
                    console.error('❌ Error saving milestone to database:', err);
                }
            }
        }
        
        if (newMilestones.length > 0) {
            await renderMilestones();
        }
    }
    
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
        
        document.getElementById('save-entry')?.addEventListener('click', async () => {
            const text = document.getElementById('journal-text').value;
            const selectedMood = document.querySelector('.mood-btn.selected');
            const moodRating = selectedMood ? parseInt(selectedMood.dataset.mood) : null;
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            
            if (!text.trim()) {
                alert('Please write something in your journal entry.');
                return;
            }
            
            if (!currentUser) {
                alert('Please log in to save journal entries.');
                return;
            }
            
            console.log('📝 Saving journal entry:', { userId: currentUser.id, textLength: text.length, moodRating });
            
            try {
                const response = await fetch(`${API_BASE}/api/data?type=journal`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        entryText: text.trim(),
                        moodRating: moodRating
                    })
                });
                
                const result = await response.json();
                console.log('📝 Journal save result:', result);
                
                if (result.success) {
                    document.getElementById('journal-text').value = '';
                    document.querySelectorAll('.mood-btn').forEach(b => b.classList.remove('selected'));
                    
                    // Reload journal entries to show the new entry
                    await loadJournalEntries();
                    
                    alert('📝 Journal entry saved successfully!');
                    console.log('✅ Journal entry saved and list refreshed');
                } else {
                    throw new Error(result.error || 'Failed to save entry');
                }
            } catch (err) {
                console.error('📝 Failed to save journal entry:', err);
                alert('Failed to save entry: ' + err.message);
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
        
        async function loadJournalEntries() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                console.log('📝 No user found for journal entries load');
                return;
            }
            
            try {
                console.log('📝 Loading journal entries for user:', currentUser.id);
                const response = await fetch(`${API_BASE}/api/data?type=journal&userId=${currentUser.id}`);
                const data = await response.json();
                console.log('📝 Journal entries response:', data);
                
                const entries = data.entries || [];
                console.log('📝 Found journal entries:', entries.length);
                
                const list = document.getElementById('journal-entries-list');
                if (!list) {
                    console.log('📝 Journal entries list element not found');
                    return;
                }
                
                if (entries.length === 0) {
                    list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 1rem;">No journal entries yet. Write your first entry above!</p>';
                    return;
                }
                
                list.innerHTML = entries.map((entry, index) => {
                    const entryDate = entry.formatted_date || new Date(entry.entry_date).toLocaleDateString();
                    const entryTime = entry.formatted_time || new Date(entry.created_at).toLocaleTimeString();
                    const moodEmoji = entry.mood_rating ? ['😢','😔','😐','🙂','😊'][entry.mood_rating-1] : '';
                    const entryPreview = entry.entry_text.length > 100 ? entry.entry_text.substring(0, 100) + '...' : entry.entry_text;
                    
                    return `<div class="journal-entry-item" style="border: 1px solid var(--border); border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem; background: var(--surface);">
                        <div class="entry-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <div class="entry-date" style="font-weight: 500; color: var(--text-primary);">${entryDate} ${entryTime}</div>
                            ${moodEmoji ? `<span class="entry-mood" style="font-size: 1.2rem;">${moodEmoji}</span>` : ''}
                        </div>
                        <div class="entry-text" style="color: var(--text-secondary); line-height: 1.4;">${entryPreview}</div>
                    </div>`;
                }).join('');
                
                console.log('📝 Journal entries loaded successfully');
            } catch (err) {
                console.error('📝 Failed to load journal entries:', err);
                const list = document.getElementById('journal-entries-list');
                if (list) {
                    list.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 1rem;">Error loading journal entries. Please try again.</p>';
                }
            }
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
        async function saveActivityPlanner(isAutoSave = false) {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                console.log('📅 No user found for activity planner save');
                return;
            }
            
            console.log(`📅 ${isAutoSave ? 'Auto-' : 'Manual '}saving activity planner for user:`, currentUser.id);
            
            // Show auto-save indicator
            const statusDiv = document.getElementById('activity-save-status');
            if (isAutoSave && statusDiv) {
                statusDiv.style.display = 'block';
                statusDiv.style.background = '#fff3cd';
                statusDiv.style.color = '#856404';
                statusDiv.innerHTML = '🔄 Auto-saving...';
            }
            
            const savePromises = [];
            document.querySelectorAll('.day-column').forEach(dayCol => {
                const day = dayCol.querySelector('h4').textContent;
                const activities = [];
                dayCol.querySelectorAll('.activity-slot').forEach(slot => {
                    const activity = slot.textContent.trim();
                    if (activity && activity !== 'Add activity...') {
                        activities.push(activity);
                    }
                });
                
                console.log(`📅 ${day}: ${activities.length} activities`);
                
                const savePromise = fetch(`${API_BASE}/api/data?type=activities`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        dayName: day,
                        activities: activities
                    })
                }).then(response => response.json())
                .then(result => {
                    if (result.success) {
                        console.log(`✅ ${day} activities saved successfully`);
                    } else {
                        console.error(`❌ Failed to save ${day} activities:`, result.error);
                        throw new Error(`Failed to save ${day} activities: ${result.error}`);
                    }
                }).catch(err => {
                    console.error(`❌ Network error saving ${day} activities:`, err);
                    throw err;
                });
                
                savePromises.push(savePromise);
            });
            
            try {
                await Promise.all(savePromises);
                console.log(`📅 All activity planner data ${isAutoSave ? 'auto-' : ''}saved successfully`);
                
                // Show auto-save success briefly
                if (isAutoSave && statusDiv) {
                    statusDiv.style.background = '#d4edda';
                    statusDiv.style.color = '#155724';
                    statusDiv.innerHTML = '✅ Auto-saved';
                    
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 2000);
                }
                
            } catch (err) {
                console.error('📅 Error in activity planner save:', err);
                
                // Show auto-save error
                if (isAutoSave && statusDiv) {
                    statusDiv.style.background = '#f8d7da';
                    statusDiv.style.color = '#721c24';
                    statusDiv.innerHTML = '❌ Auto-save failed';
                    
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
                }
                
                throw err;
            }
        }
        
        // Load activity planner data
        async function loadActivityPlanner() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                console.log('📅 No user found for activity planner load');
                return;
            }
            
            try {
                console.log('📅 Loading activity planner for user:', currentUser.id);
                const response = await fetch(`${API_BASE}/api/data?type=activities&userId=${currentUser.id}`);
                const data = await response.json();
                console.log('📅 Activity planner response:', data);
                
                const activitiesData = data.activities || [];
                console.log('📅 Found activities data:', activitiesData.length, 'entries');
                
                document.querySelectorAll('.day-column').forEach(dayCol => {
                    const day = dayCol.querySelector('h4').textContent;
                    const slots = dayCol.querySelectorAll('.activity-slot');
                    const dayData = activitiesData.find(a => a.day_name === day);
                    const activities = dayData ? dayData.activities : [];
                    
                    console.log(`📅 ${day}: loading ${activities.length} activities`);
                    
                    // Clear existing content first
                    slots.forEach(slot => {
                        slot.textContent = 'Add activity...';
                        slot.removeAttribute('data-filled');
                    });
                    
                    // Load saved activities
                    slots.forEach((slot, index) => {
                        if (activities[index]) {
                            slot.textContent = activities[index];
                            slot.setAttribute('data-filled', 'true');
                            console.log(`📅 ${day} slot ${index}: ${activities[index]}`);
                        }
                    });
                });
                
                console.log('📅 Activity planner loaded successfully');
            } catch (err) {
                console.error('📅 Failed to load activities:', err);
            }
        }
        
        // Manual save button functionality
        document.getElementById('save-activity-planner-btn')?.addEventListener('click', async () => {
            console.log('📅 Manual save button clicked');
            const saveBtn = document.getElementById('save-activity-planner-btn');
            const statusDiv = document.getElementById('activity-save-status');
            
            // Clear any pending auto-save
            clearTimeout(activitySaveTimeout);
            
            // Show loading state
            saveBtn.innerHTML = '⏳ Saving...';
            saveBtn.disabled = true;
            
            try {
                await saveActivityPlanner();
                
                // Show success message
                statusDiv.style.display = 'block';
                statusDiv.style.background = '#d4edda';
                statusDiv.style.color = '#155724';
                statusDiv.innerHTML = '✅ Activity plan saved successfully!';
                
                console.log('📅 Manual save completed successfully');
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
                
            } catch (err) {
                console.error('📅 Manual save failed:', err);
                
                // Show error message
                statusDiv.style.display = 'block';
                statusDiv.style.background = '#f8d7da';
                statusDiv.style.color = '#721c24';
                statusDiv.innerHTML = '❌ Failed to save activity plan. Please try again.';
                
                // Hide error message after 5 seconds
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 5000);
            } finally {
                // Restore button state
                saveBtn.innerHTML = '💾 Save Activity Plan';
                saveBtn.disabled = false;
            }
        });
        
        // Clear all activities button
        document.getElementById('clear-activity-planner-btn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clear all activities? This action cannot be undone.')) {
                // Clear any pending auto-save
                clearTimeout(activitySaveTimeout);
                
                document.querySelectorAll('.activity-slot').forEach(slot => {
                    slot.textContent = 'Add activity...';
                    slot.removeAttribute('data-filled');
                });
                
                // Save the cleared state (manual save)
                try {
                    await saveActivityPlanner(false); // false = manual save
                    
                    const statusDiv = document.getElementById('activity-save-status');
                    statusDiv.style.display = 'block';
                    statusDiv.style.background = '#fff3cd';
                    statusDiv.style.color = '#856404';
                    statusDiv.innerHTML = '🗑️ All activities cleared and saved!';
                    
                    setTimeout(() => {
                        statusDiv.style.display = 'none';
                    }, 3000);
                } catch (err) {
                    console.error('Failed to save cleared activities:', err);
                    alert('Activities cleared but failed to save. Please try saving manually.');
                }
            }
        });
        
        // Auto-save planner on changes with debouncing
        let activitySaveTimeout;
        
        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('activity-slot')) {
                console.log('📅 Activity slot changed, scheduling auto-save...');
                clearTimeout(activitySaveTimeout);
                activitySaveTimeout = setTimeout(async () => {
                    console.log('📅 Auto-saving activity planner...');
                    try {
                        await saveActivityPlanner(true); // true = isAutoSave
                        console.log('📅 Auto-save completed successfully');
                    } catch (err) {
                        console.error('📅 Auto-save failed:', err);
                    }
                }, 3000); // 3 second delay for auto-save
            }
        });
        
        // Auto-save on blur (when user clicks away from a slot)
        document.addEventListener('focusout', (e) => {
            if (e.target.classList.contains('activity-slot')) {
                console.log('📅 Activity slot lost focus, scheduling immediate save...');
                clearTimeout(activitySaveTimeout);
                activitySaveTimeout = setTimeout(async () => {
                    console.log('📅 Auto-saving on blur...');
                    try {
                        await saveActivityPlanner(true); // true = isAutoSave
                        console.log('📅 Blur auto-save completed');
                    } catch (err) {
                        console.error('📅 Blur auto-save failed:', err);
                    }
                }, 1000); // 1 second delay on blur
            }
        });
        
        // Load saved planner and journal data on page load
        setTimeout(() => {
            loadActivityPlanner();
            loadJournalEntries();
        }, 500);
        
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
                        console.log('😊 Loading today\'s mood for user:', currentUser.id);
                        const today = new Date().toISOString().split('T')[0];
                        const response = await fetch(`${API_BASE}/api/moods?userId=${currentUser.id}`);
                        const data = await response.json();
                        console.log('😊 Today\'s mood response:', data);
                        if (data.success && data.moods && data.moods.length > 0) {
                            const todaysMood = data.moods.find(m => {
                                const moodDate = new Date(m.mood_date).toISOString().split('T')[0];
                                return moodDate === today;
                            });
                            console.log('😊 Today\'s mood found:', todaysMood);
                            if (todaysMood) {
                                moodSlider.value = todaysMood.mood_rating;
                                updateMoodDisplay(todaysMood.mood_rating);
                                console.log('😊 Mood slider updated to:', todaysMood.mood_rating);
                            }
                        }
                    } catch (err) {
                        console.error('😊 Failed to load today\'s mood:', err);
                    }
                }
            };
            
            // loadTodaysMood will be called after login
        }
        
        // Save mood functionality
        document.getElementById('save-mood-btn')?.addEventListener('click', async () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            const today = new Date().toISOString().split('T')[0];
            const moodValue = parseInt(moodSlider.value);
            
            if (!currentUser || !currentUser.id) {
                alert('Please log in to save your mood.');
                return;
            }
            
            console.log('💾 Saving mood:', { userId: currentUser.id, date: today, mood: moodValue });
            
            try {
                const response = await fetch(`${API_BASE}/api/data?type=moods`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: currentUser.id,
                        moodDate: today,
                        moodRating: moodValue
                    })
                });
                
                const result = await response.json();
                console.log('📦 Mood save result:', result);
                
                if (result.success) {
                    alert('Mood saved successfully! 😊');
                    console.log('✅ Mood saved to database');
                    
                    // Refresh mood chart only
                    await renderMoodChart();
                } else {
                    throw new Error(result.error || 'Failed to save mood');
                }
            } catch (err) {
                console.error('❌ Failed to save mood:', err);
                alert('Failed to save mood. Please try again.');
            }
        });
        
        // renderMoodChart moved to global scope
        
        // updateMoodStats moved to global scope
        
        // checkMilestones moved to global scope
        
        // renderMilestones moved to global scope
        
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

                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(100, 100, 100);
                    doc.text('Chetana - Awakening Minds, Nurturing Wellbeing', 55, pageHeight - 15);
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

    async function initializeApp() {
        window.addEventListener('resize', setAppHeight);
        setAppHeight();
        setupAllQuestions();
        applyTheme('dark'); // Default theme, no localStorage
        
        // Try to restore user from token first
        await restoreUserFromToken();
        
        // Check if user has active session
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (currentUser) {
            // Enhanced admin detection - check multiple conditions
            if (currentUser.isAdmin === true || 
                currentUser.email === 'admin@chetana.com' ||
                currentUser.id === 'admin' ||
                (currentUser.name && currentUser.name.toLowerCase() === 'admin')
            ) {
                console.log('👑 Admin user detected on refresh, showing admin panel');
                console.log('👑 Admin user data:', currentUser);
                loadAdminPanel();
                showScreen('admin-screen');
            } else {
                console.log('👤 Regular user detected, showing dashboard');
                showScreen('dashboard-screen');
                // Load mood chart and milestones for existing user
                setTimeout(async () => {
                    if (typeof renderMoodChart === 'function') await renderMoodChart();
                    if (typeof checkMilestones === 'function') await checkMilestones();
                    if (typeof renderMilestones === 'function') await renderMilestones();
                }, 1000);
            }
        } else {
            showScreen(currentScreen);
        }
        
        setTimeout(() => showToast(), 500);

        // Add all event listeners
        document.getElementById('login-btn')?.addEventListener('click', handleLogin);
        document.getElementById('go-to-register-btn')?.addEventListener('click', () => showScreen('register-screen'));
        document.getElementById('create-account-btn')?.addEventListener('click', handleCreateAccount);
        
        // DOB input type switching
        const dobInput = document.getElementById('register-dob');
        if (dobInput) {
            dobInput.addEventListener('focus', () => {
                dobInput.type = 'date';
            });
            dobInput.addEventListener('blur', () => {
                if (!dobInput.value) dobInput.type = 'text';
            });
        }
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
        document.getElementById('admin-logout-btn')?.addEventListener('click', logout);
        document.getElementById('user-reports-back-btn')?.addEventListener('click', () => showScreen('admin-screen'));
        document.getElementById('user-reports-dashboard-btn')?.addEventListener('click', () => showScreen('admin-screen'));
        
        // Admin forum access
        document.getElementById('admin-forum-btn')?.addEventListener('click', async () => {
            showScreen('forum-screen');
            await initializeForumUser();
            await loadForumData();
            setupForumHandlers();
        });
        
        // Admin reports
        document.getElementById('admin-reports-btn')?.addEventListener('click', async () => {
            console.log('Admin reports button clicked');
            try {
                await loadReports();
                showScreen('admin-reports-screen');
            } catch (err) {
                console.error('Error loading reports:', err);
                alert('Failed to load reports. Please try again.');
            }
        });
        
        // Admin reports back button
        document.getElementById('admin-reports-back-btn')?.addEventListener('click', () => {
            showScreen('admin-screen');
        });
        
        // Admin cleanup duplicate posts
        document.getElementById('cleanup-admin-posts-btn')?.addEventListener('click', async () => {
            if (confirm('Are you sure you want to clean up duplicate admin posts? This will remove extra welcome posts.')) {
                try {
                    const response = await fetch(`${API_BASE}/api/forum?action=cleanup-admin-posts`);
                    const result = await response.json();
                    if (result.success) {
                        alert(result.message || 'Duplicate admin posts cleaned up successfully!');
                    } else {
                        alert('Failed to cleanup posts: ' + (result.error || 'Unknown error'));
                    }
                } catch (err) {
                    console.error('Cleanup error:', err);
                    alert('Error cleaning up posts. Please try again.');
                }
            }
        });
        document.getElementById('demo-chat-login-btn')?.addEventListener('click', () => showScreen('login-screen'));
        document.getElementById('demo-send-btn')?.addEventListener('click', () => handleSendMessage('demo'));
        document.getElementById('demo-message-input')?.addEventListener('keypress', e => { 
            if (e.key === 'Enter') handleSendMessage('demo'); 
        });
        // Theme toggle functionality - handle all theme toggle buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.theme-toggle')) {
                applyTheme(currentTheme === 'dark' ? 'light' : 'dark');
            }
        });
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

        // Forum functionality
        let currentCommunity = '';
        let currentPost = null;
        let userAura = 0;
        let anonymousUsername = null;
        
        // Rate limiting for API calls
        let lastApiCall = 0;
        const API_RATE_LIMIT = 3000; // 3 seconds between calls
        
        async function rateLimitedFetch(url, options = {}) {
            const now = Date.now();
            const timeSinceLastCall = now - lastApiCall;
            
            if (timeSinceLastCall < API_RATE_LIMIT) {
                await new Promise(resolve => setTimeout(resolve, API_RATE_LIMIT - timeSinceLastCall));
            }
            
            lastApiCall = Date.now();
            return fetch(url, options);
        }
        
        // Helper function to update comment count in community view
        function updateCommentCountInCommunity(postId) {
            const commentCountEl = document.querySelector(`[data-post-id="${postId}"] .comment-count`);
            if (commentCountEl && currentPost) {
                commentCountEl.textContent = `${currentPost.comment_count || 0} comments`;
            }
        }


        document.getElementById('go-to-forum-btn')?.addEventListener('click', async () => {
            showScreen('forum-screen');
            await initializeForumUser();
            await loadForumData();
            setupForumHandlers();
        });

        document.getElementById('forum-back-btn')?.addEventListener('click', () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && (currentUser.isAdmin || currentUser.email === 'admin@chetana.com')) {
                showScreen('admin-screen');
            } else {
                showScreen('dashboard-screen');
            }
        });

        async function initializeForumUser() {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                alert('Please log in to access the community forum.');
                return;
            }
            
            try {
                // Handle admin user specially
                if (currentUser.isAdmin || currentUser.email === 'admin@chetana.com') {
                    anonymousUsername = 'admin';
                    userAura = 0;
                    
                    const profileForumUid = document.getElementById('profile-forum-uid');
                    if (profileForumUid) {
                        profileForumUid.textContent = anonymousUsername;
                    }
                    
                    currentUser.forum_uid = anonymousUsername;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    return;
                }
                
                // Handle regular users
                if (!currentUser.id) {
                    alert('Please log in to access the community forum.');
                    return;
                }
                
                const response = await fetch(`${API_BASE}/api/forum?action=user&userId=${currentUser.id}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        anonymousUsername = data.username;
                        userAura = data.auraPoints;
                        
                        const profileForumUid = document.getElementById('profile-forum-uid');
                        if (profileForumUid) {
                            profileForumUid.textContent = anonymousUsername;
                        }
                        
                        currentUser.forum_uid = anonymousUsername;
                        localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    }
                }
            } catch (err) {
                console.log('Forum user initialization failed:', err);
            }
        }
        
        async function loadForumData() {
            if (anonymousUsername) {
                const usernameEl = document.getElementById('forum-username');
                const auraEl = document.getElementById('user-aura');
                if (usernameEl) usernameEl.textContent = anonymousUsername;
                if (auraEl) auraEl.textContent = userAura + ' aura';
            }
            await loadCommunityStats();
        }
        
        let forum = null;
        
        function setupForumHandlers() {
            if (typeof initializeForum === 'function') {
                forum = initializeForum(anonymousUsername, currentCommunity, currentPost, showScreen);
                
                // Community navigation
                document.querySelectorAll('.community-card').forEach(card => {
                    card.addEventListener('click', (e) => {
                        if (e.target.classList.contains('join-btn')) return;
                        const newCommunity = card.dataset.community;
                        currentCommunity = newCommunity;
                        document.getElementById('community-title').textContent = 'c/' + currentCommunity;
                        showScreen('community-screen');
                        // Update the forum instance's current community and reload posts
                        if (forum && forum.updateCommunity) {
                            forum.updateCommunity(newCommunity);
                            forum.loadPosts();
                        }
                    });
                });
                
                // Remove existing event listeners to prevent duplicates
                const createPostBtn = document.getElementById('create-post-btn');
                const submitPostBtn = document.getElementById('submit-post-btn');
                const cancelPostBtn = document.getElementById('cancel-post-btn');
                const submitCommentBtn = document.getElementById('submit-comment-btn');
                
                // Clone and replace to remove all existing listeners
                if (createPostBtn) {
                    const newCreatePostBtn = createPostBtn.cloneNode(true);
                    createPostBtn.parentNode.replaceChild(newCreatePostBtn, createPostBtn);
                    newCreatePostBtn.addEventListener('click', () => {
                        document.getElementById('create-post-modal').classList.add('active');
                    });
                }
                
                if (submitPostBtn) {
                    const newSubmitPostBtn = submitPostBtn.cloneNode(true);
                    submitPostBtn.parentNode.replaceChild(newSubmitPostBtn, submitPostBtn);
                    newSubmitPostBtn.addEventListener('click', async () => {
                        const title = document.getElementById('post-title').value.trim();
                        const content = document.getElementById('post-content').value.trim();
                        
                        if (title && content) {
                            if (await forum.createPost(title, content)) {
                                document.getElementById('create-post-modal').classList.remove('active');
                                document.getElementById('post-title').value = '';
                                document.getElementById('post-content').value = '';
                            }
                        } else {
                            alert('Please fill in both title and content');
                        }
                    });
                }
                
                if (cancelPostBtn) {
                    const newCancelPostBtn = cancelPostBtn.cloneNode(true);
                    cancelPostBtn.parentNode.replaceChild(newCancelPostBtn, cancelPostBtn);
                    newCancelPostBtn.addEventListener('click', () => {
                        document.getElementById('create-post-modal').classList.remove('active');
                        document.getElementById('post-title').value = '';
                        document.getElementById('post-content').value = '';
                    });
                }
                
                if (submitCommentBtn) {
                    const newSubmitCommentBtn = submitCommentBtn.cloneNode(true);
                    submitCommentBtn.parentNode.replaceChild(newSubmitCommentBtn, submitCommentBtn);
                    newSubmitCommentBtn.addEventListener('click', async () => {
                        const content = document.getElementById('comment-input').value.trim();
                        if (content) {
                            if (await forum.createComment(content)) {
                                document.getElementById('comment-input').value = '';
                                // Update comment count in the current post
                                if (currentPost) {
                                    currentPost.comment_count = (currentPost.comment_count || 0) + 1;
                                    updateCommentCountInCommunity(currentPost.id);
                                }
                            }
                        }
                    });
                }
                
                // Join button functionality with backend integration
                document.querySelectorAll('.join-btn').forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        e.stopPropagation();
                        const community = btn.dataset.community;
                        const isJoined = btn.classList.contains('joined');
                        
                        if (!anonymousUsername) {
                            alert('Please log in to join communities.');
                            return;
                        }
                        
                        try {
                            const action = isJoined ? 'leave' : 'join';
                            console.log('Join/Leave attempt:', { community, anonymousUsername, action, isJoined });
                            
                            // Make API call to join/leave community
                            const response = await fetch(`${API_BASE}/api/forum?action=join`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    community: community,
                                    userUid: anonymousUsername,
                                    action: action
                                })
                            });
                            
                            console.log('Join/Leave response status:', response.status);
                            
                            if (response.ok) {
                                const result = await response.json();
                                console.log('Join/Leave result:', result);
                                if (result.success) {
                                    // Update UI only after successful server response
                                    btn.classList.toggle('joined', !isJoined);
                                    btn.textContent = isJoined ? 'Join' : 'Joined';
                                    
                                    // Update member count
                                    const memberCountEl = btn.parentElement.querySelector('.member-count');
                                    if (memberCountEl) {
                                        const currentCount = parseInt(memberCountEl.textContent) || 0;
                                        const newCount = isJoined ? currentCount - 1 : currentCount + 1;
                                        memberCountEl.textContent = `${Math.max(0, newCount)} members`;
                                    }
                                } else {
                                    console.error('Join/Leave failed:', result.error);
                                    alert(`Failed to ${action} community: ${result.error || 'Unknown error'}`);
                                }
                            } else {
                                const errorText = await response.text();
                                console.error('Join/Leave HTTP error:', response.status, errorText);
                                alert(`Failed to ${action} community. Please try again.`);
                            }
                        } catch (err) {
                            console.error('Community join/leave error:', err);
                            alert('Error updating membership. Please try again.');
                        }
                    });
                });
                
                // Load user memberships to set initial button states
                setTimeout(() => {
                    loadUserMemberships();
                }, 100);
            }
        }

        async function loadCommunityStats() {
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=stats`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.stats) {
                        const stats = data.stats.communities || {};
                        document.querySelectorAll('.community-card').forEach(card => {
                            const community = card.dataset.community;
                            const memberCount = card.querySelector('.member-count');
                            memberCount.textContent = (stats[community] || 0) + ' members';
                        });
                    }
                }
            } catch (err) {
                console.log('Forum stats not available');
            }
        }
        
        async function loadUserMemberships() {
            if (!anonymousUsername) return;
            
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=memberships&userUid=${encodeURIComponent(anonymousUsername)}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.memberships) {
                        document.querySelectorAll('.join-btn').forEach(btn => {
                            const community = btn.dataset.community;
                            const isJoined = data.memberships.includes(community);
                            btn.classList.toggle('joined', isJoined);
                            btn.textContent = isJoined ? 'Joined' : 'Join';
                        });
                    }
                }
            } catch (err) {
                console.error('Failed to load user memberships:', err);
            }
        }
        
        async function checkMembership(community) {
            if (!anonymousUsername) return false;
            
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=memberships&userUid=${encodeURIComponent(anonymousUsername)}`);
                if (response.ok) {
                    const data = await response.json();
                    return data.success && data.memberships.includes(community);
                }
            } catch (err) {
                console.error('Check membership error:', err);
            }
            return false;
        }

        // Initialize forum system
        let forumAPI = null;
        
        document.getElementById('community-back-btn')?.addEventListener('click', () => {
            showScreen('forum-screen');
        });
        
        document.getElementById('post-back-btn')?.addEventListener('click', () => {
            showScreen('community-screen');
        });






        
        // Post detail view
        async function openPost(postId) {
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=posts&postId=${postId}&userUid=${anonymousUsername}`);
                if (response.ok) {
                    currentPost = await response.json();
                    displayPostDetail();
                    loadComments(postId);
                    showScreen('post-screen');
                }
            } catch (err) {
                console.log('Post detail not available');
            }
        }

        function displayPostDetail() {
            if (!currentPost) return;
            
            const voteScore = (currentPost.upvotes || 0) - (currentPost.downvotes || 0);
            const isOwnPost = currentPost.author_uid === anonymousUsername;
            const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
            const canDelete = isOwnPost || isAdmin;
            const voteButtonsDisabled = isOwnPost ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
            const isPinned = currentPost.pinned;
            
            // Check user's vote state
            const userVote = currentPost.user_vote;
            const upvoteActive = userVote === 'upvote' ? 'active' : '';
            const downvoteActive = userVote === 'downvote' ? 'active' : '';
            
            document.getElementById('post-detail').innerHTML = `
                <div class="post-card ${isPinned ? 'pinned-post' : ''}">
                    <div class="post-header">
                        <span class="post-author">${currentPost.author_uid}</span>
                        <span class="post-time">${new Date(currentPost.created_at).toLocaleDateString()}</span>
                        ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                        ${canDelete ? `<button class="delete-btn" data-post-id="${currentPost.id}" data-type="post">🗑️ Delete Post</button>` : ''}
                    </div>
                    <h2 class="post-title">${currentPost.title}</h2>
                    <p class="post-content">${currentPost.content}</p>
                    <div class="post-actions">
                        <div class="vote-buttons">
                            <button class="vote-btn upvote ${upvoteActive}" data-post-id="${currentPost.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                            <span class="vote-count">${voteScore}</span>
                            <button class="vote-btn downvote ${downvoteActive}" data-post-id="${currentPost.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.querySelectorAll('#post-detail .vote-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => {
                    votePost(btn.dataset.postId, btn.dataset.type);
                });
            });
            
            document.querySelectorAll('#post-detail .delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    deleteContent(btn.dataset.type, btn.dataset.postId);
                });
            });
        }

        // Comments
        async function loadComments(postId) {
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=comments&postId=${postId}&userUid=${anonymousUsername}`);
                if (response.ok) {
                    const comments = await response.json();
                    displayComments(comments);
                } else {
                    displayComments([]);
                }
            } catch (err) {
                displayComments([]);
            }
        }

        function displayComments(comments) {
            const container = document.getElementById('comments-container');
            if (comments.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No comments yet. Be the first to comment!</p>';
                return;
            }
            
            container.innerHTML = comments.map(comment => {
                const voteScore = (comment.upvotes || 0) - (comment.downvotes || 0);
                const isOwnComment = comment.author_uid === anonymousUsername;
                const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
                const canDelete = isOwnComment || isAdmin;
                const voteButtonsDisabled = isOwnComment ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
                const isPinned = comment.pinned;
                
                // Check user's vote state
                const userVote = comment.user_vote;
                const upvoteActive = userVote === 'upvote' ? 'active' : '';
                const downvoteActive = userVote === 'downvote' ? 'active' : '';
                
                return `
                    <div class="comment ${comment.parent_id ? 'reply' : ''} ${isPinned ? 'pinned-comment' : ''}">
                        <div class="comment-header">
                            <span class="comment-author">${comment.author_uid}</span>
                            <span class="comment-time">${new Date(comment.created_at).toLocaleDateString()}</span>
                            ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                            ${canDelete ? `<button class="delete-btn" data-comment-id="${comment.id}" data-type="comment">🗑️</button>` : ''}
                        </div>
                        <p class="comment-content">${comment.content}</p>
                        <div class="comment-actions">
                            <div class="vote-buttons">
                                <button class="vote-btn upvote ${upvoteActive}" data-comment-id="${comment.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                                <span class="vote-count">${voteScore}</span>
                                <button class="vote-btn downvote ${downvoteActive}" data-comment-id="${comment.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                            </div>
                            <button class="reply-btn" data-comment-id="${comment.id}">Reply</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.vote-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => {
                    voteComment(btn.dataset.commentId, btn.dataset.type);
                });
            });
            
            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    deleteContent(btn.dataset.type, btn.dataset.commentId);
                });
            });
        }

        const userVotes = {}; // Track user votes: {postId: 'upvote'|'downvote'|null}
        
        async function votePost(postId, voteType) {
            if (!anonymousUsername) {
                alert('Please refresh the page and try again.');
                return;
            }
            
            const currentVote = userVotes[`post-${postId}`];
            const voteCountEl = document.querySelector(`[data-post-id="${postId}"] .vote-count`);
            const upBtn = document.querySelector(`[data-post-id="${postId}"] .upvote`);
            const downBtn = document.querySelector(`[data-post-id="${postId}"] .downvote`);
            
            let currentCount = parseInt(voteCountEl.textContent) || 0;
            let newVote = null;
            
            if (currentVote === voteType) {
                // Remove vote if clicking same button
                currentCount += voteType === 'upvote' ? -1 : 1;
                newVote = null;
            } else {
                // Add new vote or switch vote
                if (currentVote) {
                    // Switch from opposite vote
                    currentCount += voteType === 'upvote' ? 2 : -2;
                } else {
                    // First vote
                    currentCount += voteType === 'upvote' ? 1 : -1;
                }
                newVote = voteType;
            }
            
            // Update UI
            voteCountEl.textContent = currentCount;
            userVotes[`post-${postId}`] = newVote;
            
            // Update button states
            upBtn.classList.toggle('active', newVote === 'upvote');
            downBtn.classList.toggle('active', newVote === 'downvote');
            
            // Send to server in background
            fetch(`${API_BASE}/api/forum?action=vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    postId: parseInt(postId), 
                    voteType, 
                    voterUid: anonymousUsername 
                })
            }).catch(() => {});
        }

        async function voteComment(commentId, voteType) {
            if (!anonymousUsername) {
                alert('Please refresh the page and try again.');
                return;
            }
            
            const currentVote = userVotes[`comment-${commentId}`];
            const voteCountEl = document.querySelector(`[data-comment-id="${commentId}"] .vote-count`);
            const upBtn = document.querySelector(`[data-comment-id="${commentId}"] .upvote`);
            const downBtn = document.querySelector(`[data-comment-id="${commentId}"] .downvote`);
            
            if (!voteCountEl || !upBtn || !downBtn) {
                console.error('Vote elements not found for comment:', commentId);
                return;
            }
            
            let currentCount = parseInt(voteCountEl.textContent) || 0;
            let newVote = null;
            
            if (currentVote === voteType) {
                // Remove vote if clicking same button
                currentCount += voteType === 'upvote' ? -1 : 1;
                newVote = null;
            } else {
                // Add new vote or switch vote
                if (currentVote) {
                    // Switch from opposite vote
                    currentCount += voteType === 'upvote' ? 2 : -2;
                } else {
                    // First vote
                    currentCount += voteType === 'upvote' ? 1 : -1;
                }
                newVote = voteType;
            }
            
            // Update UI
            voteCountEl.textContent = currentCount;
            userVotes[`comment-${commentId}`] = newVote;
            
            // Update button states
            upBtn.classList.toggle('active', newVote === 'upvote');
            downBtn.classList.toggle('active', newVote === 'downvote');
            
            // Send to server in background
            fetch(`${API_BASE}/api/forum?action=vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    commentId: parseInt(commentId), 
                    voteType, 
                    voterUid: anonymousUsername 
                })
            }).catch(() => {});
        }
        
        async function deleteContent(type, id) {
            if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
                return;
            }
            
            if (!anonymousUsername) {
                alert('Please refresh the page and try again.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=delete-content`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        type, 
                        id: parseInt(id), 
                        authorUid: anonymousUsername 
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
                        
                        if (type === 'post') {
                            // If we're viewing the post detail, go back to community
                            if (currentPost && currentPost.id == id) {
                                showScreen('community-screen');
                                loadPosts();
                            } else {
                                loadPosts();
                            }
                        } else if (type === 'comment') {
                            // Refresh comments
                            if (currentPost) {
                                loadComments(currentPost.id);
                            }
                        }
                    } else {
                        alert(result.error || `Failed to delete ${type}`);
                    }
                } else {
                    const errorText = await response.text();
                    console.error(`Delete ${type} request failed:`, response.status, errorText);
                    alert(`Failed to delete ${type}. Please try again.`);
                }
            } catch (err) {
                console.error(`Delete ${type} error:`, err);
                alert('Network error. Please check your connection and try again.');
            }
        }

        // Initialize join buttons when forum loads
        setTimeout(() => {
            if (typeof loadUserMemberships === 'function') {
                loadUserMemberships();
            }
        }, 100);

        // Posts functionality
        async function loadPosts() {
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=posts&community=${currentCommunity}&userUid=${anonymousUsername}`);
                if (response.ok) {
                    const posts = await response.json();
                    displayPosts(posts);
                } else {
                    displayPosts([]);
                }
            } catch (err) {
                displayPosts([]);
            }
        }

        function displayPosts(posts) {
            const container = document.getElementById('posts-container');
            if (posts.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No posts yet. Be the first to post!</p>';
                return;
            }
            
            container.innerHTML = posts.map(post => {
                const voteScore = (post.upvotes || 0) - (post.downvotes || 0);
                const isOwnPost = post.author_uid === anonymousUsername;
                const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
                const canDelete = isOwnPost || isAdmin;
                const voteButtonsDisabled = isOwnPost ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
                const isPinned = post.pinned;
                
                // Check user's vote state
                const userVote = post.user_vote;
                const upvoteActive = userVote === 'upvote' ? 'active' : '';
                const downvoteActive = userVote === 'downvote' ? 'active' : '';
                
                // Ensure comment count is properly displayed
                const commentCount = parseInt(post.comment_count) || 0;
                console.log(`Post ${post.id} comment count:`, commentCount, 'from data:', post.comment_count);
                
                return `
                    <div class="post-card ${isPinned ? 'pinned-post' : ''}" data-post-id="${post.id}">
                        <div class="post-header">
                            <span class="post-author">${post.author_uid}</span>
                            <span class="post-time">${new Date(post.created_at).toLocaleDateString()}</span>
                            ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                            ${canDelete ? `<button class="delete-btn" data-post-id="${post.id}" data-type="post">🗑️</button>` : ''}
                        </div>
                        <h3 class="post-title">${post.title}</h3>
                        <p class="post-content">${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}</p>
                        <div class="post-actions">
                            <div class="vote-buttons">
                                <button class="vote-btn upvote ${upvoteActive}" data-post-id="${post.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                                <span class="vote-count">${voteScore}</span>
                                <button class="vote-btn downvote ${downvoteActive}" data-post-id="${post.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                            </div>
                            <span class="comment-count">${commentCount} comments</span>
                        </div>
                    </div>
                `;
            }).join('');
            
            // Add click handlers
            container.querySelectorAll('.post-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    if (e.target.classList.contains('vote-btn') || e.target.classList.contains('delete-btn')) return;
                    const postId = card.dataset.postId;
                    openPost(postId);
                });
            });
            
            container.querySelectorAll('.vote-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    votePost(btn.dataset.postId, btn.dataset.type);
                });
            });
            
            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteContent(btn.dataset.type, btn.dataset.postId);
                });
            });
        }

        // Create post
        document.getElementById('create-post-btn')?.addEventListener('click', () => {
            document.getElementById('create-post-modal').classList.add('active');
        });

        document.getElementById('cancel-post-btn')?.addEventListener('click', () => {
            document.getElementById('create-post-modal').classList.remove('active');
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
        });
        
        // Report modal handlers
        document.getElementById('submit-report-btn')?.addEventListener('click', async () => {
            const selectedReason = document.querySelector('input[name="report-reason"]:checked');
            const details = document.getElementById('report-details').value.trim();
            
            if (!selectedReason) {
                alert('Please select a reason for reporting.');
                return;
            }
            
            let reason = selectedReason.value;
            if (reason === 'Other' && details) {
                reason = details;
            } else if (details) {
                reason += ': ' + details;
            }
            
            if (reason.length < 5) {
                alert('Please provide a reason with at least 5 characters.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=report`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        type: window.currentReportType,
                        id: parseInt(window.currentReportId),
                        reason,
                        reporterUid: anonymousUsername
                    })
                });
                
                if (response.ok) {
                    alert('Report submitted successfully!');
                    document.getElementById('report-modal').classList.remove('active');
                    document.querySelectorAll('input[name="report-reason"]').forEach(r => r.checked = false);
                    document.getElementById('report-details').value = '';
                } else {
                    const errorData = await response.text();
                    console.error('Report failed:', response.status, errorData);
                    alert('Failed to submit report');
                }
            } catch (err) {
                console.error('Report error:', err);
                alert('Error submitting report');
            }
        });
        
        document.getElementById('cancel-report-btn')?.addEventListener('click', () => {
            document.getElementById('report-modal').classList.remove('active');
            document.querySelectorAll('input[name="report-reason"]').forEach(r => r.checked = false);
            document.getElementById('report-details').value = '';
        });
        
        // Community rules modal handlers
        document.getElementById('rules-agreement-checkbox')?.addEventListener('change', (e) => {
            const agreeBtn = document.getElementById('agree-rules-btn');
            if (agreeBtn) {
                agreeBtn.disabled = !e.target.checked;
            }
        });
        
        document.getElementById('agree-rules-btn')?.addEventListener('click', () => {
            const community = document.getElementById('community-rules-title').textContent.replace('c/', '').replace(' Community Rules', '');
            localStorage.setItem(`rules_agreed_${community}_${anonymousUsername}`, 'true');
            document.getElementById('community-rules-modal').classList.remove('active');
            document.getElementById('rules-agreement-checkbox').checked = false;
            document.getElementById('agree-rules-btn').disabled = true;
        });
        
        document.getElementById('cancel-rules-btn')?.addEventListener('click', () => {
            document.getElementById('community-rules-modal').classList.remove('active');
            document.getElementById('rules-agreement-checkbox').checked = false;
            document.getElementById('agree-rules-btn').disabled = true;
        });



        // Post detail view
        async function openPost(postId) {
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=posts&postId=${postId}&userUid=${anonymousUsername}`);
                if (response.ok) {
                    currentPost = await response.json();
                    displayPostDetail();
                    loadComments(postId);
                    showScreen('post-screen');
                }
            } catch (err) {
                console.log('Post detail not available');
            }
        }

        function displayPostDetail() {
            if (!currentPost) return;
            
            const voteScore = (currentPost.upvotes || 0) - (currentPost.downvotes || 0);
            const isOwnPost = currentPost.author_uid === anonymousUsername;
            const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
            const canDelete = isOwnPost || isAdmin;
            const voteButtonsDisabled = isOwnPost ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
            const isPinned = currentPost.pinned;
            
            // Check user's vote state
            const userVote = currentPost.user_vote;
            const upvoteActive = userVote === 'upvote' ? 'active' : '';
            const downvoteActive = userVote === 'downvote' ? 'active' : '';
            
            document.getElementById('post-detail').innerHTML = `
                <div class="post-card ${isPinned ? 'pinned-post' : ''}">
                    <div class="post-header">
                        <span class="post-author">${currentPost.author_uid}</span>
                        <span class="post-time">${new Date(currentPost.created_at).toLocaleDateString()}</span>
                        ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                        ${canDelete ? `<button class="delete-btn" data-post-id="${currentPost.id}" data-type="post">🗑️ Delete Post</button>` : ''}
                    </div>
                    <h2 class="post-title">${currentPost.title}</h2>
                    <p class="post-content">${currentPost.content}</p>
                    <div class="post-actions">
                        <div class="vote-buttons">
                            <button class="vote-btn upvote ${upvoteActive}" data-post-id="${currentPost.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                            <span class="vote-count">${voteScore}</span>
                            <button class="vote-btn downvote ${downvoteActive}" data-post-id="${currentPost.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                        </div>
                    </div>
                </div>
            `;
            
            document.querySelectorAll('#post-detail .vote-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => {
                    votePost(btn.dataset.postId, btn.dataset.type);
                });
            });
            
            document.querySelectorAll('#post-detail .delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    deleteContent(btn.dataset.type, btn.dataset.postId);
                });
            });
        }

        document.getElementById('post-back-btn')?.addEventListener('click', () => {
            showScreen('community-screen');
        });

        // Comments
        async function loadComments(postId) {
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=comments&postId=${postId}&userUid=${anonymousUsername}`);
                if (response.ok) {
                    const comments = await response.json();
                    displayComments(comments);
                } else {
                    displayComments([]);
                }
            } catch (err) {
                displayComments([]);
            }
        }

        function displayComments(comments) {
            const container = document.getElementById('comments-container');
            if (comments.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No comments yet. Be the first to comment!</p>';
                return;
            }
            
            container.innerHTML = comments.map(comment => {
                const voteScore = (comment.upvotes || 0) - (comment.downvotes || 0);
                const isOwnComment = comment.author_uid === anonymousUsername;
                const isAdmin = anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin';
                const canDelete = isOwnComment || isAdmin;
                const voteButtonsDisabled = isOwnComment ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
                const isPinned = comment.pinned;
                
                // Check user's vote state
                const userVote = comment.user_vote;
                const upvoteActive = userVote === 'upvote' ? 'active' : '';
                const downvoteActive = userVote === 'downvote' ? 'active' : '';
                
                return `
                    <div class="comment ${comment.parent_id ? 'reply' : ''} ${isPinned ? 'pinned-comment' : ''}">
                        <div class="comment-header">
                            <span class="comment-author">${comment.author_uid}</span>
                            <span class="comment-time">${new Date(comment.created_at).toLocaleDateString()}</span>
                            ${isPinned ? '<span class="pin-badge">📌 Pinned</span>' : ''}
                            ${canDelete ? `<button class="delete-btn" data-comment-id="${comment.id}" data-type="comment">🗑️</button>` : ''}
                        </div>
                        <p class="comment-content">${comment.content}</p>
                        <div class="comment-actions">
                            <div class="vote-buttons">
                                <button class="vote-btn upvote ${upvoteActive}" data-comment-id="${comment.id}" data-type="upvote" ${voteButtonsDisabled}>▲</button>
                                <span class="vote-count">${voteScore}</span>
                                <button class="vote-btn downvote ${downvoteActive}" data-comment-id="${comment.id}" data-type="downvote" ${voteButtonsDisabled}>▼</button>
                            </div>
                            <button class="reply-btn" data-comment-id="${comment.id}">Reply</button>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.querySelectorAll('.vote-btn:not([disabled])').forEach(btn => {
                btn.addEventListener('click', () => {
                    voteComment(btn.dataset.commentId, btn.dataset.type);
                });
            });
            
            container.querySelectorAll('.delete-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    deleteContent(btn.dataset.type, btn.dataset.commentId);
                });
            });
        }



        document.getElementById('post-back-btn')?.addEventListener('click', () => {
            showScreen('community-screen');
        });

        // Rate limiting removed for direct API access
        
        // Reply to comment function
        window.replyToComment = function(commentId) {
            const replyInput = document.getElementById('comment-input');
            replyInput.focus();
            replyInput.placeholder = `Replying to comment...`;
            replyInput.dataset.replyTo = commentId;
        };
        
        // Make deleteContent globally available
        window.deleteContent = async function(type, id) {
            if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
            
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=delete-content`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type, id: parseInt(id), authorUid: anonymousUsername })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        alert(`${type} deleted successfully!`);
                        if (type === 'post') {
                            loadPosts();
                        } else if (type === 'comment' && currentPost) {
                            loadComments(currentPost.id);
                        }
                    } else {
                        alert(result.error || `Failed to delete ${type}`);
                    }
                } else {
                    alert(`Failed to delete ${type}`);
                }
            } catch (err) {
                alert('Error deleting content');
            }
        };
        
        // Fix comment count and delete buttons in templates
        function fixForumTemplates() {
            // This will be called after DOM updates to fix any remaining issues
            setTimeout(() => {
                document.querySelectorAll('.comment-count').forEach(el => {
                    if (el.textContent.includes('0 comments') && el.dataset.actualCount) {
                        el.textContent = `${el.dataset.actualCount} comments`;
                    }
                });
            }, 100);
        }
        
        async function votePost(postId, voteType) {
            if (!anonymousUsername) {
                alert('Please refresh the page and try again.');
                return;
            }
            
            const currentVote = userVotes[`post-${postId}`];
            const voteCountEl = document.querySelector(`[data-post-id="${postId}"] .vote-count`);
            const upBtn = document.querySelector(`[data-post-id="${postId}"] .upvote`);
            const downBtn = document.querySelector(`[data-post-id="${postId}"] .downvote`);
            
            let currentCount = parseInt(voteCountEl.textContent) || 0;
            let newVote = null;
            
            if (currentVote === voteType) {
                // Remove vote if clicking same button
                currentCount += voteType === 'upvote' ? -1 : 1;
                newVote = null;
            } else {
                // Add new vote or switch vote
                if (currentVote) {
                    // Switch from opposite vote
                    currentCount += voteType === 'upvote' ? 2 : -2;
                } else {
                    // First vote
                    currentCount += voteType === 'upvote' ? 1 : -1;
                }
                newVote = voteType;
            }
            
            // Update UI
            voteCountEl.textContent = currentCount;
            userVotes[`post-${postId}`] = newVote;
            
            // Update button states
            upBtn.classList.toggle('active', newVote === 'upvote');
            downBtn.classList.toggle('active', newVote === 'downvote');
            
            // Send to server in background
            fetch(`${API_BASE}/api/forum?action=vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    postId: parseInt(postId), 
                    voteType, 
                    voterUid: anonymousUsername 
                })
            }).catch(() => {});
        }

        async function voteComment(commentId, voteType) {
            if (!anonymousUsername) {
                alert('Please refresh the page and try again.');
                return;
            }
            
            const currentVote = userVotes[`comment-${commentId}`];
            const voteCountEl = document.querySelector(`[data-comment-id="${commentId}"] .vote-count`);
            const upBtn = document.querySelector(`[data-comment-id="${commentId}"] .upvote`);
            const downBtn = document.querySelector(`[data-comment-id="${commentId}"] .downvote`);
            
            let currentCount = parseInt(voteCountEl.textContent) || 0;
            let newVote = null;
            
            if (currentVote === voteType) {
                // Remove vote if clicking same button
                currentCount += voteType === 'upvote' ? -1 : 1;
                newVote = null;
            } else {
                // Add new vote or switch vote
                if (currentVote) {
                    // Switch from opposite vote
                    currentCount += voteType === 'upvote' ? 2 : -2;
                } else {
                    // First vote
                    currentCount += voteType === 'upvote' ? 1 : -1;
                }
                newVote = voteType;
            }
            
            // Update UI
            voteCountEl.textContent = currentCount;
            userVotes[`comment-${commentId}`] = newVote;
            
            // Update button states
            upBtn.classList.toggle('active', newVote === 'upvote');
            downBtn.classList.toggle('active', newVote === 'downvote');
            
            // Send to server in background
            fetch(`${API_BASE}/api/forum?action=vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    commentId: parseInt(commentId), 
                    voteType, 
                    voterUid: anonymousUsername 
                })
            }).catch(() => {});
        }
        
        async function updateUserAura() {
            // Disabled to prevent rate limiting
            console.log('Aura update skipped to prevent rate limits');
        }
        
        async function deleteContent(type, id) {
            if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) {
                return;
            }
            
            if (!anonymousUsername) {
                alert('Please refresh the page and try again.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/api/forum?action=delete-content`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        type, 
                        id: parseInt(id), 
                        authorUid: anonymousUsername 
                    })
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`);
                        
                        if (type === 'post') {
                            // If we're viewing the post detail, go back to community
                            if (currentPost && currentPost.id == id) {
                                showScreen('community-screen');
                                loadPosts();
                            } else {
                                loadPosts();
                            }
                        } else if (type === 'comment') {
                            // Refresh comments
                            if (currentPost) {
                                loadComments(currentPost.id);
                            }
                        }
                    } else {
                        alert(result.error || `Failed to delete ${type}`);
                    }
                } else {
                    const errorText = await response.text();
                    console.error(`Delete ${type} request failed:`, response.status, errorText);
                    alert(`Failed to delete ${type}. Please try again.`);
                }
            } catch (err) {
                console.error(`Delete ${type} error:`, err);
                alert('Network error. Please check your connection and try again.');
            }
        }
        
        // Reply to comment function
        window.replyToComment = function(commentId) {
            const replyInput = document.getElementById('comment-input');
            replyInput.focus();
            replyInput.placeholder = `Replying to comment...`;
            replyInput.dataset.replyTo = commentId;
        };
        
        // Create welcome posts for each community on first load
        async function createWelcomePosts() {
            if (anonymousUsername === 'u/kklt3o' || anonymousUsername === 'admin@chetana.com' || anonymousUsername === 'admin') {
                const welcomePosts = [
                    {
                        community: 'depression',
                        title: 'Welcome to c/depression - Community Guidelines',
                        content: 'Welcome to our depression support community! This is a safe space for sharing experiences, offering support, and finding resources. Please be respectful, kind, and supportive to all members. Remember that this community is for peer support and should not replace professional medical advice.'
                    },
                    {
                        community: 'anxiety',
                        title: 'Welcome to c/anxiety - Community Guidelines', 
                        content: 'Welcome to our anxiety support community! Here you can share your experiences with anxiety, learn coping strategies, and support others on their journey. Please maintain a supportive and understanding environment. If you are experiencing a panic attack or crisis, please seek immediate professional help.'
                    },
                    {
                        community: 'stress',
                        title: 'Welcome to c/stress - Community Guidelines',
                        content: 'Welcome to our stress management community! This space is dedicated to sharing stress management techniques, discussing work-life balance, and supporting each other through challenging times. Please be respectful and constructive in your interactions.'
                    }
                ];
                
                for (const post of welcomePosts) {
                    try {
                        // Check if welcome post already exists
                        const existingResponse = await fetch(`${API_BASE}/api/forum?action=posts&community=${post.community}`);
                        if (existingResponse.ok) {
                            const existingPosts = await existingResponse.json();
                            const hasWelcomePost = existingPosts.some(p => p.title.includes('Welcome') && p.title.includes('Guidelines'));
                            
                            if (!hasWelcomePost) {
                                await fetch(`${API_BASE}/api/forum?action=posts`, {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        title: post.title,
                                        content: post.content,
                                        community: post.community,
                                        authorUid: anonymousUsername
                                    })
                                });
                            }
                        }
                    } catch (err) {
                        console.log('Failed to create welcome post for', post.community);
                    }
                }
            }
        }
        document.getElementById('limit-modal-login-btn')?.addEventListener('click', () => { 
            hideModals(); 
            showScreen('login-screen'); 
        });
        document.getElementById('limit-modal-close-btn')?.addEventListener('click', hideModals);
        
        // Data Privacy screen event listeners
        document.getElementById('data-privacy-btn')?.addEventListener('click', () => {
            loadDataPrivacyInfo();
            showScreen('data-privacy-screen');
        });
        document.getElementById('data-privacy-back-btn')?.addEventListener('click', () => showScreen('profile-screen'));
        
        // Export data button event listener
        document.getElementById('export-data-btn')?.addEventListener('click', () => {
            showModal('export-modal');
        });
        
        // Delete account button event listener
        document.getElementById('delete-account-btn')?.addEventListener('click', () => {
            showModal('delete-account-modal');
        });
        
        // Privacy policy link in permissions modal
        document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        
        // Privacy consent checkbox handler
        document.getElementById('privacy-consent')?.addEventListener('change', (e) => {
            const grantBtn = document.getElementById('grant-permissions-btn');
            if (grantBtn) {
                grantBtn.disabled = !e.target.checked;
            }
        });
        
        // Grant permissions button
        document.getElementById('grant-permissions-btn')?.addEventListener('click', () => {
            const privacyConsent = document.getElementById('privacy-consent');
            if (privacyConsent && privacyConsent.checked) {
                hideModals();
                showScreen('dashboard-screen');
            } else {
                alert('You must agree to the Privacy Policy to continue.');
            }
        });
        
        // Privacy policy back button - return to data privacy screen
        document.getElementById('privacy-back-btn')?.addEventListener('click', () => {
            showScreen('data-privacy-screen');
        });
        
        // View privacy policy button in data privacy screen
        document.getElementById('view-privacy-policy-btn')?.addEventListener('click', () => {
            showScreen('privacy-policy-screen');
        });
        
        // Export all data button in data privacy screen
        document.getElementById('export-all-data-btn')?.addEventListener('click', () => {
            showModal('export-modal');
        });
        document.getElementById('export-all-data-btn')?.addEventListener('click', () => {
            showModal('export-modal');
        });
        document.getElementById('view-privacy-policy-btn')?.addEventListener('click', () => {
            showScreen('privacy-policy-screen');
        });
        document.getElementById('privacy-back-btn')?.addEventListener('click', () => showScreen('data-privacy-screen'));
        document.getElementById('delete-account-btn')?.addEventListener('click', () => {
            showModal('delete-account-modal');
        });
        
        // Privacy policy link in permissions modal - special handling
        document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            // Store current modal state
            const permissionsModal = document.getElementById('permissions-modal');
            permissionsModal.style.display = 'none';
            
            // Create a special privacy policy screen without home button
            const privacyScreen = document.getElementById('privacy-policy-screen');
            const privacyHeader = privacyScreen.querySelector('.page-header');
            const privacyContent = privacyScreen.querySelector('.page-content');
            
            // Replace header with special version
            privacyHeader.innerHTML = `
                <div class="header-side-panel"></div>
                <h2 class="header-title">Privacy & Policy</h2>
                <div class="header-controls">
                    <button class="theme-toggle"><span class="theme-icon">🌙</span></button>
                </div>
            `;
            
            // Add checkbox at the bottom of privacy content
            const existingContent = privacyContent.innerHTML;
            privacyContent.innerHTML = existingContent + `
                <div class="privacy-consent" style="margin-top: 2rem; padding: 1rem; border: 2px solid var(--primary-color); border-radius: 8px; background: var(--surface);">
                    <label class="permission-item privacy-item">
                        <input type="checkbox" id="privacy-modal-consent" required>
                        <span class="permission-icon">🔒</span>
                        <div class="permission-text">
                            <strong>I agree to the Privacy Policy & DPDP Act Compliance</strong>
                            <small>Required to use the app and store your health data securely.</small>
                        </div>
                    </label>
                    <button id="privacy-modal-continue-btn" class="btn btn--primary" disabled style="margin-top: 1rem;">Continue</button>
                </div>
            `;
            
            showScreen('privacy-policy-screen');
            
            // Handle the new checkbox and continue button
            document.getElementById('privacy-modal-consent')?.addEventListener('change', (e) => {
                const continueBtn = document.getElementById('privacy-modal-continue-btn');
                if (continueBtn) {
                    continueBtn.disabled = !e.target.checked;
                }
            });
            
            document.getElementById('privacy-modal-continue-btn')?.addEventListener('click', () => {
                // Check the original privacy consent checkbox
                const originalConsent = document.getElementById('privacy-consent');
                if (originalConsent) {
                    originalConsent.checked = true;
                    // Enable the grant permissions button
                    const grantBtn = document.getElementById('grant-permissions-btn');
                    if (grantBtn) {
                        grantBtn.disabled = false;
                    }
                }
                
                // Return to dashboard and show permissions modal
                showScreen('dashboard-screen');
                permissionsModal.style.display = 'flex';
                
                // Restore original privacy screen content
                privacyHeader.innerHTML = `
                    <div class="header-side-panel"><button id="privacy-back-btn" class="back-btn">🏠</button></div>
                    <h2 class="header-title">Privacy & Policy</h2>
                    <div class="header-controls">
                        <button class="theme-toggle"><span class="theme-icon">🌙</span></button>
                    </div>
                `;
                privacyContent.innerHTML = existingContent;
            });
        });
        
        // Privacy consent checkbox handler
        document.getElementById('privacy-consent')?.addEventListener('change', (e) => {
            const grantBtn = document.getElementById('grant-permissions-btn');
            if (grantBtn) {
                grantBtn.disabled = !e.target.checked;
            }
        });
        document.getElementById('grant-permissions-btn')?.addEventListener('click', async () => {
            console.log('Permissions granted:', {
                location: document.getElementById('location-permission').checked,
                microphone: document.getElementById('microphone-permission').checked,
                notifications: document.getElementById('notifications-permission').checked
            });
            hideModals(); 
            showScreen('dashboard-screen');
            
            // Load mood chart and milestones after reaching dashboard
            setTimeout(async () => {
                if (typeof renderMoodChart === 'function') await renderMoodChart();
                if (typeof renderMilestones === 'function') await renderMilestones();
            }, 200);
        });
        document.getElementById('skip-permissions-btn')?.addEventListener('click', async () => {
            const privacyConsent = document.getElementById('privacy-consent');
            if (!privacyConsent || !privacyConsent.checked) {
                alert('You must agree to the Privacy Policy to continue.');
                return;
            }
            console.log('Permissions skipped.'); 
            hideModals(); 
            showScreen('dashboard-screen');
            
            // Load mood chart and milestones after reaching dashboard
            setTimeout(async () => {
                if (typeof renderMoodChart === 'function') await renderMoodChart();
                if (typeof renderMilestones === 'function') await renderMilestones();
            }, 200);
        });
        
        // Privacy policy consent checkbox validation
        document.getElementById('privacy-consent')?.addEventListener('change', (e) => {
            const grantBtn = document.getElementById('grant-permissions-btn');
            const skipBtn = document.getElementById('skip-permissions-btn');
            if (grantBtn) {
                grantBtn.disabled = !e.target.checked;
            }
            if (skipBtn) {
                skipBtn.disabled = !e.target.checked;
            }
        });
        
        // Privacy policy links
        document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            hideModals();
            showScreen('privacy-policy-screen');
        });
        
        document.getElementById('assessment-privacy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        
        // Privacy policy back button
        document.getElementById('privacy-back-btn')?.addEventListener('click', () => {
            showScreen('dashboard-screen');
        });
        
        // Data & Privacy management
        document.getElementById('data-privacy-btn')?.addEventListener('click', () => {
            loadDataPrivacyInfo();
            showScreen('data-privacy-screen');
        });
        
        document.getElementById('data-privacy-back-btn')?.addEventListener('click', () => {
            showScreen('profile-screen');
        });
        
        // Assessment consent validation
        document.getElementById('assessment-data-consent')?.addEventListener('change', (e) => {
            const startBtn = document.getElementById('start-assessment-btn');
            if (startBtn) {
                startBtn.disabled = !e.target.checked;
            }
        });
        
        // Start assessment after consent
        document.getElementById('start-assessment-btn')?.addEventListener('click', () => {
            const consentCheckbox = document.getElementById('assessment-data-consent');
            if (consentCheckbox && consentCheckbox.checked) {
                document.getElementById('assessment-consent').style.display = 'none';
                document.getElementById('assessment-content').style.display = 'block';
                setupAllQuestions();
                currentQuestionIndex = 0;
                userAnswers = {};
                renderCurrentQuestion();
            }
        });
        
        // Data privacy actions
        document.getElementById('export-all-data-btn')?.addEventListener('click', () => {
            showModal('export-modal');
        });
        
        document.getElementById('view-privacy-policy-btn')?.addEventListener('click', () => {
            showScreen('privacy-policy-screen');
        });
        
        document.getElementById('delete-account-btn')?.addEventListener('click', () => {
            showModal('delete-account-modal');
        });
        
        // Delete account confirmation
        document.getElementById('delete-confirmation-checkbox')?.addEventListener('change', (e) => {
            const confirmBtn = document.getElementById('confirm-delete-btn');
            if (confirmBtn) {
                confirmBtn.disabled = !e.target.checked;
            }
        });
        
        document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.id) {
                alert('No user account found.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/api/users/${currentUser.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Your account and all data have been permanently deleted.');
                    localStorage.clear();
                    hideModals();
                    showScreen('login-screen');
                } else {
                    throw new Error(result.error || 'Failed to delete account');
                }
            } catch (err) {
                console.error('Failed to delete account:', err);
                alert('Failed to delete account. Please try again or contact support.');
            }
        });
        
        document.getElementById('cancel-delete-btn')?.addEventListener('click', () => {
            hideModals();
        });
        
        // Consent management toggles
        document.getElementById('health-data-consent')?.addEventListener('change', async (e) => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id) {
                try {
                    await fetch(`${API_BASE}/api/users/${currentUser.id}/consent`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            healthDataConsent: e.target.checked
                        })
                    });
                } catch (err) {
                    console.error('Failed to update consent:', err);
                }
            }
        });
        
        document.getElementById('analytics-consent')?.addEventListener('change', async (e) => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id) {
                try {
                    await fetch(`${API_BASE}/api/users/${currentUser.id}/consent`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            analyticsConsent: e.target.checked
                        })
                    });
                } catch (err) {
                    console.error('Failed to update consent:', err);
                }
            }
        });
        
        document.getElementById('research-consent')?.addEventListener('change', async (e) => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id) {
                try {
                    await fetch(`${API_BASE}/api/users/${currentUser.id}/consent`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            researchConsent: e.target.checked
                        })
                    });
                } catch (err) {
                    console.error('Failed to update consent:', err);
                }
            }
        });
        document.getElementById('go-to-assessment-btn')?.addEventListener('click', startAssessment);
        document.getElementById('assessment-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('results-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('results-view-progress-btn')?.addEventListener('click', () => { 
            renderProgressChart(); 
            showScreen('progress-screen'); 
        });
        document.getElementById('go-to-resources-btn')?.addEventListener('click', () => {
            showScreen('resources-screen');
        });

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
        document.getElementById('go-to-progress-btn')?.addEventListener('click', async () => { 
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (currentUser && currentUser.id) {
                console.log('📊 Go to progress clicked for user:', currentUser.id);
                await renderProgressChart(); 
                showScreen('progress-screen');
                
                // Force load mood chart and milestones immediately
                setTimeout(async () => {
                    console.log('📊 Force loading mood chart and milestones...');
                    try {
                        await renderMoodChart();
                        await renderMilestones();
                        console.log('📊 Force loading completed');
                    } catch (err) {
                        console.error('❌ Force loading error:', err);
                    }
                }, 200);
            } else {
                alert('Please log in to view your progress.');
            }
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
        
        // Forum join button event listeners
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('join-btn')) {
                const community = e.target.dataset.community;
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                
                if (!currentUser) {
                    alert('Please log in to join communities.');
                    return;
                }
                
                const isJoined = e.target.classList.contains('joined');
                const action = isJoined ? 'leave' : 'join';
                
                // Disable button during request
                e.target.disabled = true;
                const originalText = e.target.textContent;
                const originalClass = e.target.classList.contains('joined');
                e.target.textContent = 'Loading...';
                
                try {
                    const userResponse = await fetch(`/api/forum?action=user&userId=${currentUser.id}`);
                    const userData = await userResponse.json();
                    
                    if (!userData.success) {
                        alert('Failed to get user data');
                        e.target.textContent = originalText;
                        e.target.disabled = false;
                        return;
                    }
                    
                    const response = await fetch('/api/forum?action=join', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            community,
                            userUid: userData.username,
                            action
                        })
                    });
                    
                    const result = await response.json();
                    
                    if (response.ok && result.success) {
                        // Update button state immediately and persistently
                        if (action === 'join') {
                            e.target.textContent = 'Joined';
                            e.target.classList.add('joined');
                        } else {
                            e.target.textContent = 'Join';
                            e.target.classList.remove('joined');
                        }
                        
                        // Force reload memberships after a short delay to ensure server state is updated
                        setTimeout(async () => {
                            await loadCommunityMemberships();
                        }, 500);
                    } else {
                        alert('Failed to update membership');
                        e.target.textContent = originalText;
                        if (originalClass) {
                            e.target.classList.add('joined');
                        } else {
                            e.target.classList.remove('joined');
                        }
                    }
                } catch (err) {
                    console.error('Membership update error:', err);
                    alert('Error updating membership');
                    e.target.textContent = originalText;
                    if (originalClass) {
                        e.target.classList.add('joined');
                    } else {
                        e.target.classList.remove('joined');
                    }
                } finally {
                    e.target.disabled = false;
                }
            }
        });
        
        // Add missing event listeners for wellness resources
        document.getElementById('go-to-resources-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        
        // Wellness resource navigation
        document.getElementById('understanding-depression-btn')?.addEventListener('click', () => showScreen('understanding-depression-screen'));
        document.getElementById('behavioral-activation-btn')?.addEventListener('click', () => showScreen('behavioral-activation-screen'));
        document.getElementById('breathing-exercise-btn')?.addEventListener('click', () => showScreen('breathing-exercise-screen'));
        document.getElementById('writing-journal-btn')?.addEventListener('click', () => showScreen('writing-journal-screen'));
        document.getElementById('mindfulness-meditation-btn')?.addEventListener('click', () => showScreen('mindfulness-meditation-screen'));
        document.getElementById('relax-environment-btn')?.addEventListener('click', () => showScreen('relax-environment-screen'));
        
        // Back buttons for wellness screens
        document.getElementById('resources-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('depression-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('behavioral-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('breathing-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('journal-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('mindfulness-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('relax-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        
        // Assessment and progress navigation
        document.getElementById('go-to-assessment-btn')?.addEventListener('click', () => startAssessment());
        document.getElementById('assessment-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('results-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('go-to-progress-btn')?.addEventListener('click', () => showScreen('progress-screen'));
        document.getElementById('progress-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        
        // Assessment consent and navigation
        document.getElementById('assessment-data-consent')?.addEventListener('change', (e) => {
            const startBtn = document.getElementById('start-assessment-btn');
            if (startBtn) {
                startBtn.disabled = !e.target.checked;
            }
        });
        
        document.getElementById('start-assessment-btn')?.addEventListener('click', () => {
            document.getElementById('assessment-consent').style.display = 'none';
            document.getElementById('assessment-content').style.display = 'block';
            currentQuestionIndex = 0;
            userAnswers = {};
            renderCurrentQuestion();
        });
        
        document.getElementById('prev-question-btn')?.addEventListener('click', () => {
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
                alert('Please select an answer before continuing.');
            }
        });
        
        // Booking navigation
        document.getElementById('go-to-booking-btn')?.addEventListener('click', () => {
            loadTherapists();
            showScreen('booking-screen');
        });
        document.getElementById('booking-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('view-requests-btn')?.addEventListener('click', () => {
            loadBookingRequests();
            showScreen('requests-screen');
        });
        document.getElementById('requests-back-btn')?.addEventListener('click', () => showScreen('booking-screen'));
        
        // Privacy and data management
        document.getElementById('data-privacy-btn')?.addEventListener('click', () => {
            loadDataPrivacyInfo();
            showScreen('data-privacy-screen');
        });
        document.getElementById('data-privacy-back-btn')?.addEventListener('click', () => showScreen('profile-screen'));
        document.getElementById('view-privacy-policy-btn')?.addEventListener('click', () => showScreen('privacy-policy-screen'));
        document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        document.getElementById('assessment-privacy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        document.getElementById('privacy-back-btn')?.addEventListener('click', () => showScreen('data-privacy-screen'));
        
        // Export and delete account
        document.getElementById('export-all-data-btn')?.addEventListener('click', () => showModal('export-modal'));
        document.getElementById('delete-account-btn')?.addEventListener('click', () => showModal('delete-account-modal'));
        
        // Modal handlers
        document.getElementById('grant-permissions-btn')?.addEventListener('click', () => {
            hideModals();
            showScreen('dashboard-screen');
        });
        
        document.getElementById('privacy-consent')?.addEventListener('change', (e) => {
            const grantBtn = document.getElementById('grant-permissions-btn');
            if (grantBtn) {
                grantBtn.disabled = !e.target.checked;
            }
        });
        
        document.getElementById('limit-modal-login-btn')?.addEventListener('click', () => {
            hideModals();
            showScreen('login-screen');
        });
        
        document.getElementById('limit-modal-close-btn')?.addEventListener('click', hideModals);
        
        // Therapist swipe actions
        document.getElementById('pass-btn')?.addEventListener('click', passCurrentTherapist);
        document.getElementById('book-btn')?.addEventListener('click', bookCurrentTherapist);
        
        // Wellness resource navigation
        document.getElementById('understanding-depression-btn')?.addEventListener('click', () => showScreen('understanding-depression-screen'));
        document.getElementById('behavioral-activation-btn')?.addEventListener('click', () => showScreen('behavioral-activation-screen'));
        document.getElementById('breathing-exercise-btn')?.addEventListener('click', () => showScreen('breathing-exercise-screen'));
        document.getElementById('writing-journal-btn')?.addEventListener('click', () => showScreen('writing-journal-screen'));
        document.getElementById('mindfulness-meditation-btn')?.addEventListener('click', () => showScreen('mindfulness-meditation-screen'));
        document.getElementById('relax-environment-btn')?.addEventListener('click', () => showScreen('relax-environment-screen'));
        
        // Back buttons for wellness screens
        document.getElementById('resources-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('depression-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('behavioral-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('breathing-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('journal-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('mindfulness-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('relax-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        
        // Assessment and progress navigation
        document.getElementById('go-to-assessment-btn')?.addEventListener('click', () => startAssessment());
        document.getElementById('assessment-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('results-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));

        document.getElementById('progress-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        
        // Booking navigation
        document.getElementById('go-to-booking-btn')?.addEventListener('click', () => {
            loadTherapists();
            showScreen('booking-screen');
        });
        document.getElementById('booking-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('view-requests-btn')?.addEventListener('click', () => {
            loadBookingRequests();
            showScreen('requests-screen');
        });
        document.getElementById('requests-back-btn')?.addEventListener('click', () => showScreen('booking-screen'));
        
        // Privacy and data management
        document.getElementById('data-privacy-btn')?.addEventListener('click', () => {
            loadDataPrivacyInfo();
            showScreen('data-privacy-screen');
        });
        document.getElementById('data-privacy-back-btn')?.addEventListener('click', () => showScreen('profile-screen'));
        document.getElementById('view-privacy-policy-btn')?.addEventListener('click', () => showScreen('privacy-policy-screen'));
        document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        document.getElementById('assessment-privacy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        document.getElementById('privacy-back-btn')?.addEventListener('click', () => showScreen('data-privacy-screen'));
        
        // Export and delete account
        document.getElementById('export-all-data-btn')?.addEventListener('click', () => showModal('export-modal'));
        document.getElementById('delete-account-btn')?.addEventListener('click', () => showModal('delete-account-modal'));
        
        // Wellness resource navigation
        document.getElementById('understanding-depression-btn')?.addEventListener('click', () => showScreen('understanding-depression-screen'));
        document.getElementById('behavioral-activation-btn')?.addEventListener('click', () => showScreen('behavioral-activation-screen'));
        document.getElementById('breathing-exercise-btn')?.addEventListener('click', () => showScreen('breathing-exercise-screen'));
        document.getElementById('writing-journal-btn')?.addEventListener('click', () => showScreen('writing-journal-screen'));
        document.getElementById('mindfulness-meditation-btn')?.addEventListener('click', () => showScreen('mindfulness-meditation-screen'));
        document.getElementById('relax-environment-btn')?.addEventListener('click', () => showScreen('relax-environment-screen'));
        
        // Back buttons for wellness resources
        document.getElementById('depression-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('behavioral-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('breathing-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('journal-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('mindfulness-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('relax-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('resources-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        
        // Privacy and data management
        document.getElementById('data-privacy-btn')?.addEventListener('click', () => {
            loadDataPrivacyInfo();
            showScreen('data-privacy-screen');
        });
        document.getElementById('data-privacy-back-btn')?.addEventListener('click', () => showScreen('profile-screen'));
        document.getElementById('privacy-back-btn')?.addEventListener('click', () => showScreen('data-privacy-screen'));
        document.getElementById('view-privacy-policy-btn')?.addEventListener('click', () => showScreen('privacy-policy-screen'));
        document.getElementById('privacy-policy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        document.getElementById('assessment-privacy-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            showScreen('privacy-policy-screen');
        });
        
        // Assessment and progress navigation
        document.getElementById('go-to-assessment-btn')?.addEventListener('click', () => {
            startAssessment();
        });
        document.getElementById('assessment-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('results-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('progress-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        
        // Booking navigation
        document.getElementById('go-to-booking-btn')?.addEventListener('click', () => {
            loadTherapists();
            showScreen('booking-screen');
        });
        document.getElementById('booking-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('view-requests-btn')?.addEventListener('click', () => {
            loadBookingRequests();
            showScreen('requests-screen');
        });
        document.getElementById('requests-back-btn')?.addEventListener('click', () => showScreen('booking-screen'));
        document.getElementById('resources-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('understanding-depression-btn')?.addEventListener('click', () => showScreen('understanding-depression-screen'));
        document.getElementById('depression-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('behavioral-activation-btn')?.addEventListener('click', () => showScreen('behavioral-activation-screen'));
        document.getElementById('behavioral-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('breathing-exercise-btn')?.addEventListener('click', () => showScreen('breathing-exercise-screen'));
        document.getElementById('breathing-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('writing-journal-btn')?.addEventListener('click', () => showScreen('writing-journal-screen'));
        document.getElementById('journal-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('mindfulness-meditation-btn')?.addEventListener('click', () => showScreen('mindfulness-meditation-screen'));
        document.getElementById('mindfulness-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        document.getElementById('relax-environment-btn')?.addEventListener('click', () => showScreen('relax-environment-screen'));
        document.getElementById('relax-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
        
        // Assessment screen event listeners
        document.getElementById('go-to-assessment-btn')?.addEventListener('click', startAssessment);
        document.getElementById('assessment-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        document.getElementById('results-back-btn')?.addEventListener('click', () => showScreen('dashboard-screen'));
        
        // Assessment consent handling
        document.getElementById('assessment-data-consent')?.addEventListener('change', (e) => {
            const startBtn = document.getElementById('start-assessment-btn');
            if (startBtn) {
                startBtn.disabled = !e.target.checked;
            }
        });
        
        document.getElementById('start-assessment-btn')?.addEventListener('click', () => {
            setupAllQuestions();
            currentQuestionIndex = 0;
            userAnswers = {};
            document.getElementById('assessment-consent').style.display = 'none';
            document.getElementById('assessment-content').style.display = 'block';
            renderCurrentQuestion();
        });
        
        // Delete account modal handlers
        document.getElementById('delete-confirmation-checkbox')?.addEventListener('change', (e) => {
            const confirmBtn = document.getElementById('confirm-delete-btn');
            if (confirmBtn) {
                confirmBtn.disabled = !e.target.checked;
            }
        });
        
        document.getElementById('cancel-delete-btn')?.addEventListener('click', hideModals);
        document.getElementById('confirm-delete-btn')?.addEventListener('click', async () => {
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser || !currentUser.id) {
                alert('Please log in to delete your account.');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE}/api/users/${currentUser.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' }
                });
                
                const result = await response.json();
                if (result.success) {
                    alert('Account deleted successfully. You will be logged out.');
                    logout();
                } else {
                    alert('Failed to delete account: ' + (result.error || 'Unknown error'));
                }
            } catch (err) {
                console.error('Delete account error:', err);
                alert('Error deleting account. Please try again.');
            }
        });
    }
    
    // Make functions globally available
    window.showScreen = showScreen;
    window.showReportModal = function(type, id) {
        window.currentReportType = type;
        window.currentReportId = id;
        document.getElementById('report-modal').classList.add('active');
    };
    
    // Load community memberships when forum screen is shown
    async function loadCommunityMemberships() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        try {
            const userResponse = await fetch(`/api/forum?action=user&userId=${currentUser.id}`);
            const userData = await userResponse.json();
            
            if (!userData.success) return;
            
            const membershipResponse = await fetch(`/api/forum?action=memberships&userUid=${encodeURIComponent(userData.username)}`);
            const membershipData = await membershipResponse.json();
            
            if (membershipData.success) {
                // Update button states based on actual memberships from server
                document.querySelectorAll('.join-btn').forEach(btn => {
                    const community = btn.dataset.community;
                    const isJoined = membershipData.memberships.includes(community);
                    
                    // Only update if the state is different to avoid flickering
                    const currentlyJoined = btn.classList.contains('joined');
                    if (isJoined !== currentlyJoined) {
                        if (isJoined) {
                            btn.textContent = 'Joined';
                            btn.classList.add('joined');
                        } else {
                            btn.textContent = 'Join';
                            btn.classList.remove('joined');
                        }
                    }
                });
            }
            
            const statsResponse = await fetch('/api/forum?action=stats');
            const statsData = await statsResponse.json();
            
            if (statsData.success) {
                document.querySelectorAll('.community-card').forEach(card => {
                    const community = card.dataset.community;
                    const memberCountEl = card.querySelector('.member-count');
                    if (memberCountEl && statsData.stats.communities[community] !== undefined) {
                        memberCountEl.textContent = `${statsData.stats.communities[community]} members`;
                    } else if (memberCountEl) {
                        memberCountEl.textContent = '0 members';
                    }
                });
            }
        } catch (err) {
            console.error('Failed to load community memberships:', err);
        }
    }
    
    const originalShowScreen = window.showScreen;
    window.showScreen = function(screenId) {
        originalShowScreen(screenId);
        if (screenId === 'forum-screen') {
            // Load memberships immediately and then again after a short delay to ensure accuracy
            loadCommunityMemberships();
            setTimeout(loadCommunityMemberships, 500);
        }
    };
    
    document.getElementById('go-to-forum-btn')?.addEventListener('click', () => {
        // Load memberships when forum button is clicked
        setTimeout(loadCommunityMemberships, 100);
    });
    
    initializeApp();
});
// Add event listeners for new anxiety and stress screens
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('understanding-anxiety-btn')?.addEventListener('click', () => showScreen('understanding-anxiety-screen'));
    document.getElementById('understanding-stress-btn')?.addEventListener('click', () => showScreen('understanding-stress-screen'));
    document.getElementById('anxiety-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
    document.getElementById('stress-back-btn')?.addEventListener('click', () => showScreen('resources-screen'));
});