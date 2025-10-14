class PushNotificationManager {
  constructor() {
    this.vapidPublicKey = null;
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    this.isSubscribed = false;
    this.subscription = null;
    this.userId = null;
    this.notificationPermission = Notification.permission;
    
    // Don't auto-initialize - wait for user login
  }

  async init() {
    console.log('Push notifications disabled');
    return; // Early return to disable all push notification functionality
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

    // Only request permission if not already decided
    if (this.notificationPermission === 'default') {
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
    } else {
      // Permission already denied
      throw new Error('Notification permission denied');
    }
  }

  async subscribe(userId) {
    if (!this.isSupported) {
      throw new Error('Push notifications not supported');
    }

    // Check if permission is already granted
    if (this.notificationPermission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    this.userId = userId;

    try {
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
      
      // Mock unsubscribe from server
      console.log('✅ Push unsubscribed from server (mock)');

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
    // Mock implementation - just log success
    console.log('✅ Push subscription saved (mock)');
    return Promise.resolve();
  }

  async updateNotificationSettings(enabled) {
    // Mock implementation - just log
    console.log('✅ Notification settings updated (mock):', enabled);
    return Promise.resolve();
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

// Global instance (but don't auto-init)
window.pushNotificationManager = new PushNotificationManager();

// Initialize only after user login
window.initializePushNotifications = async function(userId) {
  if (userId && window.pushNotificationManager) {
    window.pushNotificationManager.userId = userId;
    await window.pushNotificationManager.init();
  }
};