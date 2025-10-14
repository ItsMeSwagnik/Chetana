// Service Worker for चेtanā PWA
const CACHE_NAME = 'chetana-v1.0.0';
const STATIC_CACHE = 'chetana-static-v1.0.0';
const DYNAMIC_CACHE = 'chetana-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/translations.js',
  '/manifest.json'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Service Worker: Static files cached');
        return self.skipWaiting();
      })
      .catch(err => {
        console.error('Service Worker: Error caching static files', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then(networkResponse => {
            // Don't cache API responses or non-successful responses
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clone the response
            const responseToCache = networkResponse.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                console.log('Service Worker: Caching dynamic content', request.url);
                cache.put(request, responseToCache);
              });

            return networkResponse;
          })
          .catch(err => {
            console.error('Service Worker: Fetch failed', err);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
            
            // Return cached version or error
            return caches.match(request);
          });
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync', event.tag);
  
  if (event.tag === 'background-sync-assessment') {
    event.waitUntil(syncAssessmentData());
  }
  
  if (event.tag === 'background-sync-mood') {
    event.waitUntil(syncMoodData());
  }
});

// Push notifications - DISABLED
self.addEventListener('push', event => {
  console.log('Service Worker: Push notifications disabled');
  return; // Early return to disable push notifications
});

// Notification click handling - DISABLED
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification click handling disabled');
  return; // Early return to disable notification click handling
});

// Helper functions for background sync
async function syncAssessmentData() {
  try {
    const assessmentData = await getStoredAssessmentData();
    if (assessmentData.length > 0) {
      for (const data of assessmentData) {
        await fetch('/api/assessments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
      await clearStoredAssessmentData();
      console.log('Service Worker: Assessment data synced');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync assessment data', error);
  }
}

async function syncMoodData() {
  try {
    const moodData = await getStoredMoodData();
    if (moodData.length > 0) {
      for (const data of moodData) {
        await fetch('/api/mood', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
      }
      await clearStoredMoodData();
      console.log('Service Worker: Mood data synced');
    }
  } catch (error) {
    console.error('Service Worker: Failed to sync mood data', error);
  }
}

// IndexedDB helpers for offline storage
async function getStoredAssessmentData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChetanaDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['assessments'], 'readonly');
      const store = transaction.objectStore('assessments');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function getStoredMoodData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChetanaDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['moods'], 'readonly');
      const store = transaction.objectStore('moods');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => {
        reject(getAllRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function clearStoredAssessmentData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChetanaDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['assessments'], 'readwrite');
      const store = transaction.objectStore('assessments');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        resolve();
      };
      
      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}

async function clearStoredMoodData() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ChetanaDB', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['moods'], 'readwrite');
      const store = transaction.objectStore('moods');
      const clearRequest = store.clear();
      
      clearRequest.onsuccess = () => {
        resolve();
      };
      
      clearRequest.onerror = () => {
        reject(clearRequest.error);
      };
    };
    
    request.onerror = () => {
      reject(request.error);
    };
  });
}