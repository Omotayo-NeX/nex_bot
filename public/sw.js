// Minimal service worker to prevent 404 errors
// This prevents the "Fetch event handler is recognized as no-op" warning

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Empty fetch handler to satisfy browser expectations
self.addEventListener('fetch', () => {
  // Intentionally empty - let browser handle all requests normally
});