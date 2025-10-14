import webpush from 'web-push';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

// Configure VAPID keys
webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:admin@chetana.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

// Store subscriptions (use database in production)
const subscriptions = new Set();

// API endpoints
const app = express();
app.use(express.json());

// Subscribe endpoint
app.post('/api/push-subscription', (req, res) => {
    const { subscription } = req.body;
    subscriptions.add(subscription);
    console.log('New push subscription:', subscription.endpoint);
    res.json({ success: true });
});

// Send notification
async function sendNotification(payload) {
    const promises = Array.from(subscriptions).map(subscription => 
        webpush.sendNotification(subscription, JSON.stringify(payload))
            .catch(err => {
                console.error('Push failed:', err);
                if (err.statusCode === 410) {
                    subscriptions.delete(subscription);
                }
            })
    );
    await Promise.all(promises);
}

// Daily reminder
function scheduleDailyReminder() {
    const now = new Date();
    const reminder = new Date();
    reminder.setHours(9, 0, 0, 0); // 9 AM
    
    if (reminder <= now) {
        reminder.setDate(reminder.getDate() + 1);
    }
    
    const timeout = reminder.getTime() - now.getTime();
    setTimeout(() => {
        sendNotification({
            title: 'चेtanā Daily Check-in',
            body: 'How are you feeling today? Take a moment to check in with yourself.',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-72x72.png'
        });
        scheduleDailyReminder(); // Schedule next day
    }, timeout);
}

scheduleDailyReminder();

export { sendNotification, app };