class NotificationSystem {
  constructor() {
    this.userId = null;
    this.notificationsEnabled = false;
    this.pushSubscription = null;
    this.vapidPublicKey = null;
    this.deadlineWarningShown = false;
    // Don't auto-initialize - wait for user login
  }

  async init() {
    // Load VAPID public key from meta tag
    const vapidMeta = document.querySelector('meta[name="vapid-public-key"]');
    if (vapidMeta) {
      this.vapidPublicKey = vapidMeta.getAttribute('content');
      console.log('VAPID public key loaded:', this.vapidPublicKey ? 'Yes' : 'No');
    }
  }

  // New method to initialize after login
  async initializeForUser(userId) {
    this.userId = userId;
    await this.loadNotificationSettings();
    await this.loadStreak();
    
    // Only start deadline monitoring if notifications are already enabled
    if (this.notificationsEnabled) {
      this.startDeadlineMonitoring();
    }
  }



  async requestPermission() {
    if (!('Notification' in window)) {
      this.showInAppNotification('Browser Not Supported', 'This browser does not support notifications');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      this.showInAppNotification('Service Workers Not Supported', 'This browser does not support push notifications');
      return false;
    }

    try {
      // Only request permission if not already granted or denied
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          await this.enableNotifications();
          document.querySelector('.notification-permission-prompt')?.remove();
          this.showNotification('Notifications Enabled! 🎉', 'You\'ll receive daily reminders and deadline warnings to maintain your wellness streak.');
          return true;
        } else if (permission === 'denied') {
          this.showInAppNotification('Notifications Blocked', 'Please enable notifications in your browser settings to receive reminders.');
          return false;
        } else {
          this.showInAppNotification('Notifications Dismissed', 'You can enable notifications later in your profile settings.');
          return false;
        }
      } else if (Notification.permission === 'granted') {
        // Permission already granted, just enable notifications
        await this.enableNotifications();
        return true;
      } else {
        // Permission denied
        this.showInAppNotification('Notifications Blocked', 'Please enable notifications in your browser settings to receive reminders.');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      this.showInAppNotification('Permission Error', 'Failed to request notification permission. Please try again.');
      return false;
    }
  }

  async enableNotifications() {
    try {
      if (!this.vapidPublicKey) {
        console.log('VAPID public key not available, skipping push notifications');
        this.notificationsEnabled = true;
        this.updateUI();
        return;
      }

      // Register service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      console.log('✅ Service worker registered and ready');

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });
      console.log('✅ Push subscription created successfully');

      // Save subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: this.userId,
          subscription: subscription.toJSON()
        })
      });

      // Update notification settings
      await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: this.userId,
          notificationsEnabled: true
        })
      });

      this.notificationsEnabled = true;
      this.pushSubscription = subscription;
      this.updateUI();
      
      // Start deadline monitoring now that notifications are enabled
      this.startDeadlineMonitoring();

    } catch (error) {
      console.error('Error enabling notifications:', error);
      throw error;
    }
  }

  async disableNotifications() {
    try {
      // Unsubscribe from push notifications
      if (this.pushSubscription) {
        await this.pushSubscription.unsubscribe();
      }

      // Remove subscription from server
      await fetch('/api/push/unsubscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: this.userId
        })
      });

      // Update notification settings
      await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: this.userId,
          notificationsEnabled: false
        })
      });

      this.notificationsEnabled = false;
      this.pushSubscription = null;
      this.updateUI();

    } catch (error) {
      console.error('Error disabling notifications:', error);
      throw error;
    }
  }

  async loadNotificationSettings() {
    try {
      const response = await fetch(`/api/notifications/settings?userId=${this.userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        this.notificationsEnabled = data.settings.notifications_enabled;
        this.updateUI();
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  async loadStreak() {
    try {
      const response = await fetch(`/api/streaks?userId=${this.userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        this.updateStreakDisplay(data.streak);
      }
    } catch (error) {
      console.error('Error loading streak:', error);
    }
  }

  async updateStreak() {
    try {
      const response = await fetch('/api/streaks/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: this.userId
        })
      });
      const data = await response.json();
      
      if (data.success) {
        this.updateStreakDisplay(data.streak);
        
        // Show streak milestone notifications (only for new streaks, not same-day assessments)
        if (!data.same_day && data.streak.current_streak > 0) {
          if (data.streak.current_streak % 7 === 0) {
            this.showNotification(
              `🔥 ${data.streak.current_streak} Day Streak!`,
              `Incredible! You've maintained your wellness routine for ${data.streak.current_streak} days straight!`
            );
          } else if (data.streak.current_streak === 3) {
            this.showNotification(
              '🎆 3-Day Streak!',
              'Great start! Keep the momentum going!'
            );
          } else if (data.streak.current_streak === 1) {
            this.showNotification(
              '🌟 Streak Started!',
              'Perfect! Come back tomorrow to build your streak!'
            );
          }
        }
      } else if (data.deadline_passed) {
        this.showNotification(
          '⏰ Deadline Passed',
          `Assessment completed at ${data.current_time}. Must complete before 11:59 PM for streak credit.`,
          { requireInteraction: true }
        );
      }
    } catch (error) {
      console.error('Error updating streak:', error);
      this.showInAppNotification('Streak Update Failed', 'Could not update your streak. Please try again.');
    }
  }

  updateStreakDisplay(streak) {
    const streakElement = document.getElementById('streak-indicator');
    if (streakElement) {
      const streakCount = streak.current_streak || 0;
      const isActive = streakCount > 0;
      
      streakElement.innerHTML = `
        <span class="streak-fire ${isActive ? 'active' : ''}">🔥</span>
        <span class="streak-count">${streakCount}</span>
      `;
      
      if (isActive) {
        streakElement.classList.add('active');
      } else {
        streakElement.classList.remove('active');
      }
    }
  }

  updateUI() {
    // Update notification toggle in settings
    const notificationToggle = document.getElementById('notification-toggle');
    if (notificationToggle) {
      notificationToggle.checked = this.notificationsEnabled;
    }

    // Update notification status text
    const statusText = document.getElementById('notification-status');
    if (statusText) {
      if (this.notificationsEnabled) {
        statusText.innerHTML = '✅ Notifications enabled - You\'ll receive daily reminders and deadline warnings';
        statusText.className = 'status-enabled';
      } else {
        statusText.innerHTML = '❌ Notifications disabled - Enable to receive assessment reminders';
        statusText.className = 'status-disabled';
      }
    }

    // Update any notification permission prompts
    const permissionSection = document.getElementById('notification-permission-section');
    if (permissionSection) {
      permissionSection.style.display = this.notificationsEnabled ? 'none' : 'block';
    }
  }

  showNotification(title, message, options = {}) {
    // Only show browser notification if permission is granted and notifications are enabled
    if ('Notification' in window && Notification.permission === 'granted' && this.notificationsEnabled) {
      new Notification(title, {
        body: message,
        tag: options.tag || 'chetana-notification',
        requireInteraction: options.requireInteraction || false,
        silent: options.silent || false,
        ...options
      });
    }

    // Always show in-app notification as fallback
    this.showInAppNotification(title, message, options.requireInteraction);
  }

  showInAppNotification(title, message, requireInteraction = false) {
    // Remove any existing notifications of the same type
    const existing = document.querySelectorAll('.notification-popup');
    existing.forEach(notif => notif.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification-popup show ${requireInteraction ? 'urgent' : ''}`;
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-header">
          <h4>${title}</h4>
          <button onclick="this.parentElement.parentElement.parentElement.remove()" class="notification-close">×</button>
        </div>
        <p>${message}</p>
        ${requireInteraction ? '<div class="notification-actions"><button onclick="this.parentElement.parentElement.parentElement.remove()" class="btn-primary btn-small">Got it!</button></div>' : ''}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after longer time for urgent notifications
    const autoRemoveTime = requireInteraction ? 10000 : 5000;
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, autoRemoveTime);
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

  // Check if it's before 11:59 PM deadline
  isBeforeDeadline() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    return currentHour < 23 || (currentHour === 23 && currentMinute <= 59);
  }

  // Send daily assessment reminder
  sendAssessmentReminder() {
    if (!this.notificationsEnabled || !this.userId) return;
    
    const messages = [
      "Time for your daily mental health check-in! 🧠",
      "Your wellbeing matters - take a moment for yourself 💚",
      "Keep your streak alive! Complete today's assessment 🔥",
      "Don't break the chain! Your streak is waiting 🔗",
      "Stay consistent with your wellness routine 💪"
    ];
    
    const message = messages[Math.floor(Math.random() * messages.length)];
    this.showNotification('Daily Assessment Reminder 📋', message);
  }

  // Send streak reminder
  sendStreakReminder(streak) {
    if (!this.notificationsEnabled || !this.userId) return;
    
    const timeLeft = this.getTimeUntilDeadline();
    if (timeLeft && timeLeft.totalMinutes <= 180) { // 3 hours left
      const title = timeLeft.totalMinutes <= 60 ? '🚨 URGENT: Streak Deadline!' : '⏰ Streak Reminder';
      const message = `Don't lose your ${streak}-day streak! Complete your assessment before 11:59 PM.`;
      this.showNotification(title, message, { requireInteraction: timeLeft.totalMinutes <= 60 });
    }
  }

  // Send motivational quote
  sendMotivationalQuote() {
    if (!this.notificationsEnabled || !this.userId) return;
    
    const quotes = [
      "You're stronger than you think! 💪",
      "Every small step counts in your wellness journey 🌟",
      "Your mental health is a priority, not a luxury 💎",
      "Progress, not perfection - you're doing great! 🎯",
      "Consistency is the key to lasting change 🔑",
      "Your future self will thank you for this habit 🙏",
      "Mental wellness is a daily practice - keep going! 🌱",
      "Self-care isn't selfish - it's essential 💚",
      "One assessment at a time, one day at a time 🌅",
      "Believe in yourself - you've got this! ✨"
    ];
    
    const quote = quotes[Math.floor(Math.random() * quotes.length)];
    this.showNotification('Daily Motivation ✨', quote);
  }

  // Get time until 11:59 PM deadline
  getTimeUntilDeadline() {
    const now = new Date();
    const deadline = new Date(now);
    deadline.setHours(23, 59, 59, 999);
    
    const diff = deadline - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { hours, minutes, totalMinutes: Math.floor(diff / (1000 * 60)) };
  }

  // Start monitoring deadline and show warnings
  startDeadlineMonitoring() {
    // Check every 5 minutes
    setInterval(() => {
      this.checkDeadlineWarnings();
    }, 5 * 60 * 1000);
    
    // Daily reminders at specific times
    setInterval(() => {
      const now = new Date();
      const time = now.toTimeString().slice(0, 5);
      
      if (time === '10:00') this.sendAssessmentReminder();
      if (time === '14:00') this.sendMotivationalQuote();
      if (time === '18:00') this.sendAssessmentReminder();
      if (time === '21:00') this.checkStreakDeadline();
    }, 60000);
    
    // Initial check
    setTimeout(() => this.checkDeadlineWarnings(), 1000);
  }

  // Check streak deadline and send reminder
  async checkStreakDeadline() {
    if (!this.notificationsEnabled || !this.userId) return;
    
    try {
      const response = await fetch(`/api/streaks?userId=${this.userId}`);
      const data = await response.json();
      
      if (data.success && data.streak.current_streak > 0) {
        this.sendStreakReminder(data.streak.current_streak);
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  }

  async checkDeadlineWarnings() {
    if (!this.notificationsEnabled || !this.userId) return;
    
    const timeLeft = this.getTimeUntilDeadline();
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    // Check if user has completed today's assessment
    try {
      const response = await fetch(`/api/assessments?userId=${this.userId}`);
      const data = await response.json();
      
      if (data.success && data.assessments.length > 0) {
        const todayAssessment = data.assessments.find(a => a.assessment_date === today);
        if (todayAssessment) {
          return; // Assessment already completed today
        }
      }
    } catch (error) {
      console.error('Error checking assessments:', error);
      return;
    }
    
    // Show warnings at specific time thresholds
    if (timeLeft.totalMinutes <= 30 && timeLeft.totalMinutes > 0 && !this.deadlineWarningShown) {
      this.deadlineWarningShown = true;
      this.showNotification(
        '🚨 URGENT: 30 Minutes Left!',
        `Complete your assessment NOW or lose your streak! Deadline: 11:59 PM`,
        { requireInteraction: true, tag: 'deadline-warning' }
      );
    } else if (timeLeft.totalMinutes <= 60 && timeLeft.totalMinutes > 30) {
      this.showNotification(
        '⏰ 1 Hour Remaining',
        `Don't forget to complete today's assessment before 11:59 PM!`,
        { tag: 'deadline-reminder' }
      );
    } else if (timeLeft.totalMinutes <= 120 && timeLeft.totalMinutes > 60) {
      this.showNotification(
        '⏰ 2 Hours Left',
        `Complete your daily assessment before the 11:59 PM deadline.`,
        { tag: 'deadline-reminder' }
      );
    }
  }

  // Reset deadline warning flag at midnight
  resetDeadlineWarning() {
    this.deadlineWarningShown = false;
  }
}

// Initialize notification system (but don't auto-init)
const notificationSystem = new NotificationSystem();
window.notificationSystem = notificationSystem;

// Initialize only after user login
window.initializeNotificationSystem = async function(userId) {
  if (userId && notificationSystem) {
    await notificationSystem.init();
    await notificationSystem.initializeForUser(userId);
  }
};

// Reset deadline warning at midnight
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    notificationSystem.resetDeadlineWarning();
  }
}, 60000);

// Export for global access
window.notificationSystem = notificationSystem;

// Handle page visibility change to check for missed deadlines
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && notificationSystem.userId) {
    // User returned to page, check if they need to complete assessment
    setTimeout(() => notificationSystem.checkDeadlineWarnings(), 1000);
  }
});