// --- FIREBASE IMPORT (ÖNEMLİ: En üstte olmalı) ---
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
  console.log('[firebase-messaging-sw.js] Arka plan mesajı alındı: ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://www.pwabuilder.com/assets/icons/icon_192.png', // Sabit icon veya payload'dan gelen
    vibrate: [200, 100, 200]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// --- CACHING (Eski Kodlar) ---
const CACHE_NAME = 'tenis-ligi-v7'; // Versiyonu artırdık
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
});

self.addEventListener('fetch', function(event) {
  // Firebase isteklerini cachelememesi için kontrol eklenebilir ama basitlik için bırakıyoruz
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});