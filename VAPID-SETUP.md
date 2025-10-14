# VAPID Keys Setup for चेtanā PWA

## Quick Setup

### 1. Generate VAPID Keys
```bash
node vapid-setup.js
```

### 2. Set Environment Variables
```bash
# Copy example file
cp .env.example .env

# Edit .env with your generated keys
VAPID_PUBLIC_KEY=your_generated_public_key
VAPID_PRIVATE_KEY=your_generated_private_key
```

### 3. Install Dependencies
```bash
npm install web-push dotenv
```

### 4. Update Client
Add to your HTML head:
```html
<script>
window.VAPID_PUBLIC_KEY = 'your_public_key_here';
</script>
```

### 5. Test Push Notifications
```bash
node push-server.js
```

## Production Deployment
- Store keys securely in environment variables
- Use database for subscription storage
- Implement proper error handling
- Set up monitoring for push delivery