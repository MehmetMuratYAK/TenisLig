/* sw.js */

// 1. OneSignal Kütüphanesini İçe Aktar (BU SATIR EN ÜSTTE OLMALI)
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

// --- CACHING (Senin Mevcut Kodların) ---
const CACHE_NAME = 'tenis-ligi-v32-push'; // Versiyonu güncelledik
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './logo.png',
  './logo-192.png',
  './logo-512.png'
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
  // 2. ÖNEMLİ EKLEME: OneSignal'ın sayfayı hemen kontrol etmesi için gerekli
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