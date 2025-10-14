// PWA Integration for चेtanā - Extends existing functionality
(function() {
    'use strict';

    // Extend existing app with PWA features
    function initializePWAIntegration() {
        // Add offline data storage to existing functions
        enhanceAssessmentStorage();
        enhanceMoodTracking();
        enhanceChatHistory();
        setupOfflineNotifications();
        addPWAToTranslations();
    }

    // Enhance assessment storage with offline capability
    function enhanceAssessmentStorage() {
        const originalCalculateScores = window.calculateScores;
        if (originalCalculateScores) {
            window.calculateScores = function() {
                const result = originalCalculateScores.apply(this, arguments);
                
                // Store assessment data offline if available
                if (window.pwaManager && !navigator.onLine) {
                    const assessmentData = {
                        timestamp: Date.now(),
                        scores: result,
                        answers: window.userAnswers,
                        synced: false
                    };
                    
                    window.pwaManager.storeOfflineData('assessments', assessmentData)
                        .then(() => {
                            console.log('PWA: Assessment stored offline');
                            showOfflineMessage('Assessment saved offline. Will sync when connected.');
                        })
                        .catch(err => console.error('PWA: Failed to store assessment offline', err));
                }
                
                return result;
            };
        }
    }

    // Enhance mood tracking with offline capability
    function enhanceMoodTracking() {
        const originalSaveMood = window.saveMood;
        if (originalSaveMood) {
            window.saveMood = function(mood, date) {
                const result = originalSaveMood.apply(this, arguments);
                
                // Store mood data offline if available
                if (window.pwaManager && !navigator.onLine) {
                    const moodData = {
                        mood: mood,
                        date: date || new Date().toISOString().split('T')[0],
                        timestamp: Date.now(),
                        synced: false
                    };
                    
                    window.pwaManager.storeOfflineData('moods', moodData)
                        .then(() => {
                            console.log('PWA: Mood stored offline');
                            showOfflineMessage('Mood saved offline. Will sync when connected.');
                        })
                        .catch(err => console.error('PWA: Failed to store mood offline', err));
                }
                
                return result;
            };
        }
    }

    // Enhance chat history with offline storage
    function enhanceChatHistory() {
        const originalAddMessage = window.addMessage;
        if (originalAddMessage) {
            window.addMessage = function(containerId, sender, message) {
                const result = originalAddMessage.apply(this, arguments);
                
                // Store chat history offline
                if (window.pwaManager) {
                    const chatData = {
                        containerId: containerId,
                        sender: sender,
                        message: message,
                        timestamp: Date.now()
                    };
                    
                    window.pwaManager.storeOfflineData('chatHistory', chatData)
                        .catch(err => console.error('PWA: Failed to store chat offline', err));
                }
                
                return result;
            };
        }
    }

    // Setup offline notifications
    function setupOfflineNotifications() {
        // Override notification functions to work offline
        if (window.showNotification) {
            const originalShowNotification = window.showNotification;
            window.showNotification = function(title, message, type) {
                // Show notification even when offline
                if (!navigator.onLine) {
                    // Use local notification instead of server-based
                    showLocalNotification(title, message, type);
                    return;
                }
                return originalShowNotification.apply(this, arguments);
            };
        }
    }

    // Show local notification for offline use
    function showLocalNotification(title, message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <strong>${title}</strong>
                <p>${message}</p>
            </div>
            <button class="notification-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    // Show offline-specific messages
    function showOfflineMessage(message) {
        const offlineToast = document.createElement('div');
        offlineToast.className = 'offline-toast';
        offlineToast.innerHTML = `
            <div class="offline-content">
                <i class="fas fa-wifi-slash"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(offlineToast);
        
        setTimeout(() => {
            if (offlineToast.parentElement) {
                offlineToast.remove();
            }
        }, 3000);
    }

    // Add PWA-related translations
    function addPWAToTranslations() {
        if (window.translations) {
            // Add PWA translations to all languages
            Object.keys(window.translations).forEach(lang => {
                const pwaTranslations = {
                    'install_app': lang === 'hi' ? 'ऐप इंस्टॉल करें' : 
                                  lang === 'bn' ? 'অ্যাপ ইনস্টল করুন' :
                                  lang === 'te' ? 'యాప్ ఇన్స్టాల్ చేయండి' :
                                  lang === 'mr' ? 'अॅप इन्स्टॉल करा' :
                                  lang === 'ta' ? 'ஆப்ஸை நிறுவுங்கள்' :
                                  lang === 'gu' ? 'એપ્લિકેશન ઇન્સ્ટોલ કરો' :
                                  lang === 'kn' ? 'ಆ್ಯಪ್ ಇನ್ಸ್ಟಾಲ್ ಮಾಡಿ' :
                                  'Install App',
                    'offline_mode': lang === 'hi' ? 'ऑफलाइन मोड' :
                                   lang === 'bn' ? 'অফলাইন মোড' :
                                   lang === 'te' ? 'ఆఫ్లైన్ మోడ్' :
                                   lang === 'mr' ? 'ऑफलाइन मोड' :
                                   lang === 'ta' ? 'ஆஃப்லைன் பயன்முறை' :
                                   lang === 'gu' ? 'ઓફલાઇન મોડ' :
                                   lang === 'kn' ? 'ಆಫ್ಲೈನ್ ಮೋಡ್' :
                                   'Offline Mode',
                    'sync_when_online': lang === 'hi' ? 'ऑनलाइन होने पर सिंक होगा' :
                                       lang === 'bn' ? 'অনলাইনে এলে সিঙ্ক হবে' :
                                       lang === 'te' ? 'ఆన్లైన్ అయినప్పుడు సింక్ అవుతుంది' :
                                       lang === 'mr' ? 'ऑनलाइन झाल्यावर सिंक होईल' :
                                       lang === 'ta' ? 'ஆன்லைனில் வரும்போது ஒத்திசைக்கும்' :
                                       lang === 'gu' ? 'ઓનલાઇન થાય ત્યારે સિંક થશે' :
                                       lang === 'kn' ? 'ಆನ್ಲೈನ್ ಆದಾಗ ಸಿಂಕ್ ಆಗುತ್ತದೆ' :
                                       'Will sync when online'
                };
                
                Object.assign(window.translations[lang], pwaTranslations);
            });
        }
    }

    // Enhance existing notification system for PWA
    function enhanceNotificationSystem() {
        // Notification permissions are now handled manually in settings only
        console.log('PWA: Notification system enhanced - permissions handled manually');
    }

    function requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('PWA: Notification permission:', permission);
                updateNotificationStatus(permission);
            });
        }
    }

    function updateNotificationStatus(permission) {
        const statusElement = document.getElementById('notification-status');
        if (statusElement) {
            const currentLang = localStorage.getItem('selectedLanguage') || 'en';
            const status = permission === 'granted' ? 
                (currentLang === 'hi' ? 'पुश नोटिफिकेशन सक्षम' : 'Push notifications enabled') :
                (currentLang === 'hi' ? 'पुश नोटिफिकेशन अक्षम' : 'Push notifications disabled');
            statusElement.textContent = status;
        }
    }

    // Add PWA-specific event listeners
    function addPWAEventListeners() {
        // Handle app shortcuts
        if (window.location.search.includes('shortcut=')) {
            const urlParams = new URLSearchParams(window.location.search);
            const shortcut = urlParams.get('shortcut');
            
            // Wait for app to initialize
            setTimeout(() => {
                if (shortcut === 'chat' && typeof showScreen === 'function') {
                    showScreen('demo-chat-screen');
                } else if (shortcut === 'assessment' && typeof showScreen === 'function') {
                    showScreen('assessment-screen');
                }
            }, 1000);
        }

        // Handle online/offline events
        window.addEventListener('online', () => {
            console.log('PWA: App is online');
            hideOfflineIndicator();
            if (window.pwaManager) {
                window.pwaManager.syncOfflineData();
            }
        });

        window.addEventListener('offline', () => {
            console.log('PWA: App is offline');
            showOfflineIndicator();
        });
    }

    function showOfflineIndicator() {
        let indicator = document.getElementById('offline-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.className = 'offline-indicator';
            indicator.innerHTML = `
                <i class="fas fa-wifi-slash"></i>
                <span>You're offline. Some features may be limited.</span>
            `;
            document.body.appendChild(indicator);
        }
        indicator.style.display = 'flex';
    }

    function hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // Initialize PWA integration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePWAIntegration);
    } else {
        initializePWAIntegration();
    }

    // Add event listeners
    addPWAEventListeners();
    enhanceNotificationSystem();

    // Export functions for global use
    window.pwaIntegration = {
        showOfflineMessage,
        showLocalNotification,
        requestNotificationPermission
    };

})();