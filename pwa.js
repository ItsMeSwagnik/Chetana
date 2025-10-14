// PWA functionality for चेtanā
class PWAManager {
    constructor() {
        this.deferredPrompt = null;
        this.isInstalled = false;
        this.isOnline = navigator.onLine;
        this.db = null;
        this.init();
    }

    async init() {
        await this.initIndexedDB();
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineHandling();
        // Removed automatic setupPushNotifications() call
        this.handleShortcuts();
        this.setupBackgroundSync();
    }

    // Service Worker Registration
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js');
                console.log('PWA: Service Worker registered successfully', registration);
                
                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            this.showUpdateAvailable();
                        }
                    });
                });
            } catch (error) {
                console.error('PWA: Service Worker registration failed', error);
            }
        }
    }

    // Install Prompt Handling
    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallButton();
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA: App installed successfully');
            this.isInstalled = true;
            this.hideInstallButton();
            this.showInstallSuccess();
        });
    }

    showInstallButton() {
        const installButton = document.getElementById('install-pwa-btn');
        if (installButton) {
            installButton.style.display = 'block';
            installButton.addEventListener('click', () => this.promptInstall());
        } else {
            // Create install button if it doesn't exist
            this.createInstallButton();
        }
    }

    createInstallButton() {
        const installBtn = document.createElement('button');
        installBtn.id = 'install-pwa-btn';
        installBtn.className = 'install-pwa-btn';
        installBtn.innerHTML = `
            <i class="fas fa-download"></i>
            <span data-translate="install_app">Install App</span>
        `;
        installBtn.addEventListener('click', () => this.promptInstall());
        
        // Add to header or appropriate location
        const header = document.querySelector('.header') || document.body;
        header.appendChild(installBtn);
    }

    async promptInstall() {
        if (!this.deferredPrompt) return;

        this.deferredPrompt.prompt();
        const { outcome } = await this.deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('PWA: User accepted install prompt');
        } else {
            console.log('PWA: User dismissed install prompt');
        }
        
        this.deferredPrompt = null;
    }

    hideInstallButton() {
        const installButton = document.getElementById('install-pwa-btn');
        if (installButton) {
            installButton.style.display = 'none';
        }
    }

    showInstallSuccess() {
        const message = document.createElement('div');
        message.className = 'install-success-message';
        message.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <span>चेtanā installed successfully!</span>
            </div>
        `;
        document.body.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    }

    // Offline Handling
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineIndicator();
            this.syncOfflineData();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineIndicator();
        });

        // Initial check
        if (!this.isOnline) {
            this.showOfflineIndicator();
        }
    }

    showOfflineIndicator() {
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

    hideOfflineIndicator() {
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // IndexedDB Setup
    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('ChetanaDB', 1);
            
            request.onerror = () => reject(request.error);
            
            request.onsuccess = () => {
                this.db = request.result;
                console.log('PWA: IndexedDB initialized');
                resolve();
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('assessments')) {
                    const assessmentStore = db.createObjectStore('assessments', { keyPath: 'id', autoIncrement: true });
                    assessmentStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('moods')) {
                    const moodStore = db.createObjectStore('moods', { keyPath: 'id', autoIncrement: true });
                    moodStore.createIndex('date', 'date', { unique: false });
                }
                
                if (!db.objectStoreNames.contains('chatHistory')) {
                    const chatStore = db.createObjectStore('chatHistory', { keyPath: 'id', autoIncrement: true });
                    chatStore.createIndex('timestamp', 'timestamp', { unique: false });
                }
            };
        });
    }

    // Offline Data Storage
    async storeOfflineData(storeName, data) {
        if (!this.db) return;
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(data);
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getOfflineData(storeName) {
        if (!this.db) return [];
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Background Sync
    setupBackgroundSync() {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            console.log('PWA: Background sync supported');
        }
    }

    async requestBackgroundSync(tag) {
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
        }
    }

    async syncOfflineData() {
        try {
            await this.requestBackgroundSync('background-sync-assessment');
            await this.requestBackgroundSync('background-sync-mood');
            console.log('PWA: Background sync requested');
        } catch (error) {
            console.error('PWA: Background sync failed', error);
        }
    }

    // Push Notifications
    async setupPushNotifications() {
        console.log('PWA: Push notifications disabled');
        return; // Early return to disable push notifications
    }

    async subscribeToPush() {
        try {
            const registration = await navigator.serviceWorker.ready;
            
            // Check for existing subscription
            const existingSubscription = await registration.pushManager.getSubscription();
            if (existingSubscription) {
                console.log('PWA: Unsubscribing existing push subscription');
                await existingSubscription.unsubscribe();
            }
            
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.getVAPIDPublicKey())
            });
            
            // Send subscription to server
            await fetch('/api/push-subscription', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    subscription,
                    userAgent: navigator.userAgent
                })
            });
            
            console.log('PWA: Push subscription successful');
        } catch (error) {
            console.error('PWA: Push subscription failed', error);
        }
    }

    getVAPIDPublicKey() {
        // In production, this should come from your server/environment
        return window.VAPID_PUBLIC_KEY || 'BEl62iUYgUivxIkv69yViEuiBIa40HI0DzCp4CMcpW3gBC0VjUIwxGv8YF_Rc1NJwQoFiMSGRkIYdkn5MnbKZHI';
    }

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    // Handle App Shortcuts
    handleShortcuts() {
        const urlParams = new URLSearchParams(window.location.search);
        const shortcut = urlParams.get('shortcut');
        
        if (shortcut === 'chat') {
            // Navigate to chat screen
            setTimeout(() => {
                if (typeof showScreen === 'function') {
                    showScreen('demo-chat-screen');
                }
            }, 1000);
        } else if (shortcut === 'assessment') {
            // Navigate to assessment screen
            setTimeout(() => {
                if (typeof showScreen === 'function') {
                    showScreen('assessment-screen');
                }
            }, 1000);
        }
    }

    // Update Available
    showUpdateAvailable() {
        const updateBanner = document.createElement('div');
        updateBanner.className = 'update-banner';
        updateBanner.innerHTML = `
            <div class="update-content">
                <span>A new version is available!</span>
                <button id="update-btn" class="update-btn">Update</button>
                <button id="dismiss-update" class="dismiss-btn">×</button>
            </div>
        `;
        
        document.body.appendChild(updateBanner);
        
        document.getElementById('update-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        document.getElementById('dismiss-update').addEventListener('click', () => {
            updateBanner.remove();
        });
    }

    // Utility Methods
    isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone === true;
    }

    async shareContent(data) {
        if (navigator.share) {
            try {
                await navigator.share(data);
                console.log('PWA: Content shared successfully');
            } catch (error) {
                console.error('PWA: Share failed', error);
            }
        } else {
            // Fallback to clipboard
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(data.url || data.text);
                console.log('PWA: Content copied to clipboard');
            }
        }
    }
}

// PWA manager disabled to prevent automatic notification requests
// document.addEventListener('DOMContentLoaded', () => {
//     window.pwaManager = new PWAManager();
// });

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAManager;
}