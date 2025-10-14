class PushNotificationManager {
  constructor() {
    this.vapidPublicKey = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.isSubscribed = false;
    this.subscription = null;
    this.userId = null;
    this.notificationPermission = Notification.permission;
    
    this.init();
  }

  async init() {
    if (!this.isSupported) {
      console.log('Push notifications not supported');
      return;
    }

    try {
      // Get VAPID public key from server
      const response = await fetch('/api/push/vapid-key');
      if (!response.ok) {
        throw new Error(`Failed to get VAPID key: ${response.status}`);
      }
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      console.log('✅ VAPID public key loaded');

      // Register service worker
      await this.registerServiceWorker();
      
      // Check existing subscription
      await this.checkSubscription();
    } catch (error) {
      console.error('Push notification init error:', error);
    }
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  async checkSubscription() {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        this.subscription = subscription;
        this.isSubscribed = true;
        console.log('Existing push subscription found');
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  }

  async requestPermission() {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    if (this.notificationPermission === 'granted') {
      return true;
    }

    const permission = await Notification.requestPermission();
    this.notificationPermission = permission;
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      return true;
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
      throw new Error('Notification permission denied');
    } else {
      console.log('Notification permission dismissed');
      throw new Error('Notification permission not granted');
    }
  }

  async subscribe(userId) {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    this.userId = userId;

    try {
      // Request permission first
      await this.requestPermission();

      const registration = await navigator.serviceWorker.ready;
      
      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      this.subscription = subscription;
      this.isSubscribed = true;

      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      // Update notification settings
      await this.updateNotificationSettings(true);

      console.log('Push notification subscription successful');
      return subscription;
    } catch (error) {
      console.error('Push subscription error:', error);
      throw error;
    }
  }

  async unsubscribe() {
    if (!this.subscription) {
      return;
    }

    try {
      await this.subscription.unsubscribe();
      
      // Remove from server
      await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.userId })
      });

      // Update notification settings
      await this.updateNotificationSettings(false);

      this.subscription = null;
      this.isSubscribed = false;
      
      console.log('Push notification unsubscribed');
    } catch (error) {
      console.error('Unsubscribe error:', error);
      throw error;
    }
  }

  async sendSubscriptionToServer(subscription) {
    const response = await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.userId,
        subscription: subscription.toJSON()
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send subscription to server: ${response.status} - ${errorText}`);
    }
    console.log('✅ Push subscription saved to server');
  }

  async updateNotificationSettings(enabled) {
    try {
      await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          notificationsEnabled: enabled
        })
      });
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  async getNotificationSettings() {
    if (!this.userId) {
      console.log('No userId available for notification settings');
      return { notifications_enabled: false };
    }
    
    try {
      const response = await fetch(`/api/notifications/settings?userId=${this.userId}`);
      const data = await response.json();
      return data.success ? data.settings : { notifications_enabled: false };
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return { notifications_enabled: false };
    }
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

  // Show local notification (fallback)
  showLocalNotification(title, options = {}) {
    if (this.notificationPermission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192x192.svg',
        badge: '/badge-72x72.svg',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }

  // Check if it's close to deadline (after 9 PM)
  isCloseToDeadline() {
    const now = new Date();
    const hour = now.getHours();
    return hour >= 21; // After 9 PM
  }

  // Get time until deadline
  getTimeUntilDeadline() {
    const now = new Date();
    const deadline = new Date();
    deadline.setHours(23, 59, 59, 999); // 11:59:59 PM
    
    const diff = deadline - now;
    if (diff <= 0) return null;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, totalMinutes: Math.floor(diff / (1000 * 60)) };
  }

  // Show deadline warning
  showDeadlineWarning(currentStreak = 0) {
    const timeLeft = this.getTimeUntilDeadline();
    if (!timeLeft) return;

    let title, message;
    
    if (timeLeft.totalMinutes <= 45) {
      title = '🚨 FINAL WARNING - 45 Minutes Left!';
      message = `Complete your assessment NOW or lose your ${currentStreak > 0 ? currentStreak + '-day ' : ''}streak! Only ${timeLeft.minutes} minutes until midnight!`;
    } else if (timeLeft.totalMinutes <= 90) {
      title = '⚠️ URGENT - 90 Minutes Left!';
      message = `Only ${Math.floor(timeLeft.totalMinutes)} minutes until midnight deadline! Don't lose your streak!`;
    } else if (timeLeft.hours <= 3) {
      title = '⏰ Deadline Approaching';
      message = `${timeLeft.hours} hours and ${timeLeft.minutes} minutes left to complete today's assessment!`;
    }

    if (title && message) {
      this.showLocalNotification(title, {
        body: message,
        requireInteraction: timeLeft.totalMinutes <= 90,
        tag: 'deadline-warning'
      });
    }
  }
}

// Global instance
window.pushNotificationManager = new PushNotificationManager();