const CACHE_NAME = 'sarom-realestate-v1';
const STATIC_ASSETS = [
  '/realestate84/',
  '/realestate84/index.html',
  '/realestate84/manifest.json'
];

// 설치: 정적 파일 캐시
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 활성화: 오래된 캐시 삭제
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// 네트워크 우선, 실패 시 캐시 사용 (항상 최신 코드 반영)
self.addEventListener('fetch', function(event) {
  // Firebase, 카카오맵 등 외부 요청은 캐시 안 함
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // 성공하면 캐시에도 저장
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(function() {
        // 오프라인이면 캐시에서 반환
        return caches.match(event.request);
      })
  );
});
