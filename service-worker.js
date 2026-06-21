// Service Worker for Pitch Trainer PWA
// バージョン更新時はキャッシュ名を変更すること
const CACHE_NAME = 'pitch-trainer-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// インストール時：必要ファイルをキャッシュ
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// アクティベート時：古いキャッシュを削除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// フェッチ時：キャッシュ優先、なければネット → 取得後キャッシュ更新
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          // 成功したらキャッシュ更新（同一オリジンのみ）
          if (response && response.status === 200 && response.type === 'basic') {
            const respClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respClone));
          }
          return response;
        })
        .catch(() => cached);  // オフライン時はキャッシュ
      return cached || networkFetch;
    })
  );
});
