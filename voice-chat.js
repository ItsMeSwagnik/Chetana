// Voice Chat with Multilingual Support
class VoiceChat {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.currentLanguage = 'en-US';
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
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = this.currentLanguage;
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.handleVoiceInput(transcript);
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.stopListening();
        };
    }

    setupEventListeners() {
        // Use event delegation to handle dynamically created buttons
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
        this.currentLanguage = this.languageMap[langCode] || 'en-US';
        if (this.recognition) {
            this.recognition.lang = this.currentLanguage;
        }
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
        if (!this.recognition) return;
        
        this.currentChatType = chatType;
        this.isListening = true;
        this.updateVoiceButton(chatType, true);
        
        try {
            this.recognition.start();
        } catch (error) {
            console.error('Failed to start recognition:', error);
            this.stopListening();
        }
    }

    stopListening() {
        this.isListening = false;
        if (this.recognition) {
            this.recognition.stop();
        }
        this.updateVoiceButton(this.currentChatType, false);
    }

    updateVoiceButton(chatType, isListening) {
        const btnId = chatType === 'demo' ? 'demo-voice-btn' : 'therapist-voice-btn';
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.toggle('listening', isListening);
            btn.innerHTML = isListening ? '🔴' : '🎤';
        }
    }

    handleVoiceInput(transcript) {
        const inputId = this.currentChatType === 'demo' ? 'demo-message-input' : 'therapist-message-input';
        const input = document.getElementById(inputId);
        if (input) {
            input.value = transcript;
            // Trigger send message using the global function
            if (typeof window.handleSendMessage === 'function') {
                window.handleSendMessage(this.currentChatType);
            } else {
                // Fallback: trigger click on send button
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
    if (!voiceChat) {
        voiceChat = new VoiceChat();
    }
    
    if (voiceChat.init()) {
        console.log('Voice chat initialized successfully');
        // Set language based on current app language
        const currentLang = localStorage.getItem('selectedLanguage') || 'en';
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