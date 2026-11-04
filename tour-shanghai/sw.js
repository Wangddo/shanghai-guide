// Shanghai Tour 통합 Service Worker (토·일 공용)
// scope: sw.js가 놓인 폴더 (배포 경로에 무관)
const CACHE_VERSION = 'shanghai-tour-v7';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './course/',
  './course/index.html',
  './course/sat.html',
  './course/sun.html',
  './course/shared-ticket.js',
  './course/sat/stops-data.js',
  './course/sun/stops-data.js',
  // 정거장 사진 — 현지 회선이 느려도 뜨도록 설치 시점에 미리 받아 둔다
  './course/sat/images/01-lujiazui-station.jpg',
  './course/sat/images/02-nanjing-road.jpg',
  './course/sat/images/03-peace-hotel.jpg',
  './course/sat/images/04-waibaidu-bridge.jpg',
  './course/sat/images/05-bund-promenade.jpg',
  './course/sat/images/06-hsbc-customs.jpg',
  './course/sat/images/07-grandmother.jpg',
  './course/sat/images/08-huxinting.jpg',
  './course/sat/images/09-yu-garden.jpg',
  './course/sat/images/10-city-god-temple.jpg',
  './course/sat/images/11-provisional-government.jpg',
  './course/sat/images/12-first-congress.jpg',
  './course/sat/images/13-xintiandi.jpg',
  './course/sat/images/14-sinan-road.jpg',
  './course/sat/images/15-tianzifang.jpg',
  './course/sat/images/16-longtimeago.jpg',
  './course/sat/images/17-wukang-mansion.jpg',
  './course/sat/images/18-wukang-road.jpg',
  './course/sat/images/19-bund-night.jpg',
  './course/sun/images/01-ring-bridge.jpg',
  './course/sun/images/02-oriental-pearl.jpg',
  './course/sun/images/03-dimsum.jpg',
  './course/sun/images/04-binjiang.jpg',
  './course/sun/images/05-chen-guichun.jpg',
  './course/sun/images/06-shanghai-tower.jpg',
  './course/sun/images/07-hongqiao-t1.jpg',
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
