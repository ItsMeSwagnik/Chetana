// Enhanced Voice Chat with Multilingual Support and Better Integration
class VoiceChat {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentLanguage = 'en-US';
        this.currentChatType = null;
        this.isStarting = false;
        this.languageMap = {
            'en': 'en-US',
            'hi': 'hi-IN',
            'bn': 'bn-IN',
            'te': 'te-IN',
            'mr': 'mr-IN',
            'ta': 'ta-IN',
            'gu': 'gu-IN',
            'kn': 'kn-IN'
        };
    }

    init() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            this.setupRecognition();
            this.setupEventListeners();
            return true;
        }
        return false;
    }

    setupRecognition() {
        if (!this.recognition) return;
        
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.currentLanguage;
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.handleVoiceInput(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            this.isStarting = false;
        };

        this.recognition.onend = () => {
            this.isListening = false;
            this.isStarting = false;
            if (this.currentChatType) {
                this.updateVoiceButton(this.currentChatType, false);
            }
        };
    }

    setupEventListeners() {
        // Use event delegation for better compatibility
        document.addEventListener('click', (e) => {
            if (e.target.id === 'demo-voice-btn') {
                e.preventDefault();
                this.toggleListening('demo');
            } else if (e.target.id === 'therapist-voice-btn') {
                e.preventDefault();
                this.toggleListening('therapist');
            }
        });
    }

    setLanguage(langCode) {
        console.log('setLanguage called with:', langCode);
        const mappedLang = this.languageMap[langCode];
        console.log('Mapped language:', mappedLang);
        
        this.currentLanguage = mappedLang || 'en-US';
        
        if (this.recognition) {
            this.recognition.lang = this.currentLanguage;
            console.log('Recognition language updated to:', this.recognition.lang);
            
            // If currently listening, restart with new language
            if (this.isListening) {
                console.log('Restarting recognition with new language');
                this.recognition.abort();
                setTimeout(() => {
                    if (this.currentChatType) {
                        this.startListening(this.currentChatType);
                    }
                }, 100);
            }
        } else {
            console.log('Recognition not available');
        }
        
        // Save to localStorage
        localStorage.setItem('voiceChatLanguage', langCode);
        console.log('Voice chat language set to:', this.currentLanguage);
    }

    toggleListening(chatType) {
        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening(chatType);
        }
    }

    startListening(chatType) {
        if (!this.recognition || this.isStarting || this.isListening) return;
        
        this.isStarting = true;
        this.currentChatType = chatType;
        this.updateVoiceButton(chatType, true);
        
        try {
            // Ensure recognition is stopped before starting
            this.recognition.abort();
            setTimeout(() => {
                try {
                    this.recognition.start();
                    this.isListening = true;
                    this.isStarting = false;
                } catch (error) {
                    console.error('Failed to start recognition:', error);
                    this.isStarting = false;
                    this.isListening = false;
                    this.updateVoiceButton(chatType, false);
                }
            }, 100);
        } catch (error) {
            console.error('Failed to start recognition:', error);
            this.isStarting = false;
            this.isListening = false;
            this.updateVoiceButton(chatType, false);
        }
    }

    stopListening() {
        this.isListening = false;
        this.isStarting = false;
        if (this.recognition) {
            try {
                this.recognition.abort();
            } catch (error) {
                // Ignore errors when stopping
            }
        }
        if (this.currentChatType) {
            this.updateVoiceButton(this.currentChatType, false);
            this.currentChatType = null;
        }
    }

    updateVoiceButton(chatType, isListening) {
        const btnId = chatType === 'demo' ? 'demo-voice-btn' : 'therapist-voice-btn';
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.toggle('listening', isListening);
            btn.innerHTML = isListening ? '🔴' : '🎤';
            btn.title = isListening ? 'Stop listening' : 'Voice to text';
        }
    }

    handleVoiceInput(transcript) {
        const inputId = this.currentChatType === 'demo' ? 'demo-message-input' : 'therapist-message-input';
        const input = document.getElementById(inputId);
        if (input) {
            input.value = transcript;
            // Trigger send message with current language context
            if (typeof handleSendMessage === 'function') {
                handleSendMessage(this.currentChatType);
            } else {
                const sendBtnId = this.currentChatType === 'demo' ? 'demo-send-btn' : 'therapist-send-btn';
                const sendBtn = document.getElementById(sendBtnId);
                if (sendBtn) {
                    sendBtn.click();
                }
            }
        }
    }

    speak(text, langCode = 'en') {
        if (!this.synthesis) return;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.languageMap[langCode] || 'en-US';
        utterance.rate = 0.8;
        utterance.pitch = 1;
        
        this.synthesis.speak(utterance);
    }
}

// Initialize voice chat
let voiceChat = null;

function initializeVoiceChat() {
    console.log('Initializing voice chat...');
    
    if (!voiceChat) {
        voiceChat = new VoiceChat();
        window.voiceChat = voiceChat; // Ensure global access
    }
    
    if (voiceChat.init()) {
        console.log('Voice chat initialized successfully');
        // Set language based on saved preference or current app language
        const savedVoiceLang = localStorage.getItem('voiceChatLanguage');
        const currentLang = savedVoiceLang || localStorage.getItem('selectedLanguage') || 'en';
        console.log('Setting initial voice language to:', currentLang);
        voiceChat.setLanguage(currentLang);
        return true;
    } else {
        console.log('Voice chat not supported in this browser');
        // Hide voice buttons if not supported
        document.querySelectorAll('.voice-btn, #demo-voice-btn, #therapist-voice-btn').forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        return false;
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeVoiceChat);
} else {
    initializeVoiceChat();
}

// Make globally available
window.voiceChat = voiceChat;
window.initializeVoiceChat = initializeVoiceChat;
window.VoiceChat = VoiceChat;