// Forum.js - Initialize forum system after user login
console.log('Forum.js loaded - bridging to forum-client.js');

// Wait for DOM and forum-client.js to load
function waitForForumSystem() {
    if (typeof window.initializeForum === 'function') {
        console.log('Forum system ready');
        return true;
    } else {
        console.log('Waiting for forum-client.js to load...');
        return false;
    }
}

// Initialize forum when user logs in
function initializeForumAfterLogin(username) {
    if (waitForForumSystem()) {
        console.log('Initializing forum for user:', username);
        return window.initializeForum(username, 'depression', null, window.showScreen);
    } else {
        // Retry after a short delay
        setTimeout(() => initializeForumAfterLogin(username), 100);
        return null;
    }
}

// Make initialization function globally available
window.initializeForumAfterLogin = initializeForumAfterLogin;
window.waitForForumSystem = waitForForumSystem;