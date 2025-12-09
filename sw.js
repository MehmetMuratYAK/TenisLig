// --- FIREBASE IMPORT ---
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// --- FIREBASE INIT ---
firebase.initializeApp({
  apiKey: "AIzaSyCdrG3likzeKwv1YcMZe-9FAiaQxJoYMO8",
  authDomain: "tenisligi-4672a.firebaseapp.com",
  projectId: "tenisligi-4672a",
  storageBucket: "tenisligi-4672a.firebasestorage.app",
  messagingSenderId: "380772240660",
  appId: "1:380772240660:web:39186d8fee6ff35d0c8601"
});

// Arka Plan Mesajlarını Yakalama
const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[sw.js] Arka plan mesajı:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://www.pwabuilder.com/assets/icons/icon_192.png', 
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- CACHING ---
const CACHE_NAME = 'tenis-ligi-v6-github-fix'; // Versiyonu yeniledik
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Önbellek açıldı');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH (Hata Yakalamalı Versiyon)
self.addEventListener('fetch', function(event) {
  // Sadece http isteklerini ele al
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        // Fetch hatası (örneğin 404 resimler) uygulamanın çökmesine neden olmasın
        return fetch(event.request).catch(error => {
            console.log("Fetch hatası (önemsiz):", error);
            // Hata durumunda sessizce devam et
            return new Response("Network error", { status: 408 });
        });
      })
  );
});