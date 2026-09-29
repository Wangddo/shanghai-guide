// Shanghai Tour 통합 Service Worker (모든 코스 공용)
// scope: sw.js가 놓인 폴더 (배포 경로에 무관)
const CACHE_VERSION = 'shanghai-tour-v5';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './course/',
  './course/index.html',
  './course/a.html',
  './course/b.html',
  './course/c.html',
  './course/shared-ticket.js',
  './course/a/stops-data.js',
  './course/b/stops-data.js',
  './course/c/stops-data.js',
  // 정거장 사진 — 현지 회선이 느려도 뜨도록 설치 시점에 미리 받아 둔다
  './course/a/images/01-lujiazui-station.jpg',
  './course/a/images/02-nanjing-road.jpg',
  './course/a/images/03-peace-hotel.jpg',
  './course/a/images/04-waibaidu-bridge.jpg',
  './course/a/images/05-bund-promenade.jpg',
  './course/a/images/06-hsbc-customs.jpg',
  './course/a/images/07-grandmother.jpg',
  './course/a/images/08-huxinting.jpg',
  './course/a/images/09-yu-garden.jpg',
  './course/a/images/10-city-god-temple.jpg',
  './course/b/images/01-provisional-government.jpg',
  './course/b/images/02-first-congress.jpg',
  './course/b/images/03-xintiandi.jpg',
  './course/b/images/04-sinan-road.jpg',
  './course/b/images/05-tianzifang.jpg',
  './course/b/images/06-longtimeago.jpg',
  './course/b/images/07-wukang-mansion.jpg',
  './course/b/images/08-wukang-road.jpg',
  './course/b/images/09-bund-night.jpg',
  './course/c/images/01-ring-bridge.jpg',
  './course/c/images/02-oriental-pearl.jpg',
  './course/c/images/03-binjiang.jpg',
  './course/c/images/04-chen-guichun.jpg',
  './course/c/images/05-shanghai-tower.jpg',
  './course/c/images/06-hongqiao-t1.jpg',
  './navi/assets/css/navi.css',
  './navi/assets/js/navi-core.js',
  './navi/assets/js/v3-flex.js',
  './navi/assets/icons/icon-192.png',
  './navi/assets/icons/icon-512.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',
  'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js',
];

self.addEventListener('install', (event) => {
  // cache: 'reload' — 브라우저 HTTP 캐시(GitHub Pages는 max-age=600)를 건너뛰고 서버에서 새로 받는다.
  // 이게 없으면 버전을 올려도 새 캐시가 10분 전의 옛 파일로 채워질 수 있다.
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) =>
      Promise.all(CORE_ASSETS.map((url) => cache.add(new Request(url, { cache: 'reload' })).catch(() => null)))
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.includes('google.com') || url.hostname.includes('googleapis.com')) return;
  if (url.hostname.includes('tile.openstreetmap')) {
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE_VERSION + '-tiles').then((c) => c.put(req, copy));
        return res;
      }).catch(() => caches.match('./course/')))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match('./course/'));
    })
  );
});
