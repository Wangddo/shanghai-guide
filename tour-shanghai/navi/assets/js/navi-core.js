// navi-core.js — 공통 기능: 렌더링, 방문 체크, 하단 네비, 진행도
(function () {
  'use strict';

  const data = window.TOUR_DATA;
  if (!data) throw new Error('stops-data.js must load before navi-core.js');
  // v3-flex.js와 동일한 도시별 방문 키 규칙 (정거장 id가 도시 간에 겹침)
  const CITY = (data.meta && data.meta.cityKey) || 'default';
  const STORAGE_KEY = `tourVisited_v1_${CITY}`;

  // ====== 방문 상태 ======
  function loadVisited() {
    try {
      return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
    } catch (e) {
      return new Set();
    }
  }
  function saveVisited(set) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
  }
  const visited = loadVisited();

  // ====== 좌표계 보정 (WGS-84 → GCJ-02) ======
  // 중국 본토의 구글 지도(일반 지도)는 GCJ-02 좌표계를 쓴다. stops-data.js의 좌표는
  // OSM 기준 WGS-84라서 그대로 넘기면 핀이 300–500m 밀린다. 구글로 넘기는 좌표만 변환하고,
  // Leaflet+OSM 미니맵은 WGS-84 그대로 쓴다. 중국 밖 좌표는 변환하지 않는다.
  const GCJ_A = 6378245.0;
  const GCJ_EE = 0.00669342162296594323;
  function outOfChina(lat, lon) {
    return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
  }
  function gcjLat(x, y) {
    let r = -100 + 2 * x + 3 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(y * Math.PI) + 40 * Math.sin(y / 3 * Math.PI)) * 2 / 3;
    r += (160 * Math.sin(y / 12 * Math.PI) + 320 * Math.sin(y * Math.PI / 30)) * 2 / 3;
    return r;
  }
  function gcjLon(x, y) {
    let r = 300 + x + 2 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
    r += (20 * Math.sin(6 * x * Math.PI) + 20 * Math.sin(2 * x * Math.PI)) * 2 / 3;
    r += (20 * Math.sin(x * Math.PI) + 40 * Math.sin(x / 3 * Math.PI)) * 2 / 3;
    r += (150 * Math.sin(x / 12 * Math.PI) + 300 * Math.sin(x / 30 * Math.PI)) * 2 / 3;
    return r;
  }
  function toGoogle(lat, lon) {
    if (outOfChina(lat, lon)) return `${lat},${lon}`;
    let dLat = gcjLat(lon - 105, lat - 35);
    let dLon = gcjLon(lon - 105, lat - 35);
    const radLat = lat / 180 * Math.PI;
    const magic = 1 - GCJ_EE * Math.sin(radLat) ** 2;
    const sqrtMagic = Math.sqrt(magic);
    dLat = (dLat * 180) / ((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic) * Math.PI);
    dLon = (dLon * 180) / (GCJ_A / sqrtMagic * Math.cos(radLat) * Math.PI);
    return `${(lat + dLat).toFixed(6)},${(lon + dLon).toFixed(6)}`;
  }

  // ====== 구글지도 딥링크 ======
  // origin이 있으면 길찾기, 없으면 현재 위치에서 출발
  function googleMapsDirections(fromLat, fromLon, toLat, toLon) {
    const params = new URLSearchParams({
      api: '1',
      destination: toGoogle(toLat, toLon),
      travelmode: 'walking',
    });
    if (fromLat && fromLon) params.set('origin', toGoogle(fromLat, fromLon));
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }
  // 장소 보기는 좌표 대신 현지어 장소명으로 검색한다 (구글이 자기 좌표계의 POI를 찾아줌)
  function googleMapsPlace(stop) {
    const q = stop.mapQuery || stop.nameLocal;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
  }
  function googleMapsEmbed(fromStop, toStop, transit) {
    return `https://maps.google.com/maps?saddr=${toGoogle(fromStop.lat, fromStop.lon)}&daddr=${toGoogle(toStop.lat, toStop.lon)}&dirflg=${transit ? 'r' : 'w'}&t=m&output=embed`;
  }

  // ====== 정거장 카드 렌더링 ======
  function renderStop(stop, idx, prevStop) {
    const article = document.createElement('article');
    article.className = 'stop';
    if (stop.terminus) article.classList.add('terminus');
    if (stop.extension) article.classList.add('extension');
    if (visited.has(stop.id)) article.classList.add('visited');
    article.id = stop.id;
    article.dataset.idx = idx;

    const fromLat = prevStop ? prevStop.lat : null;
    const fromLon = prevStop ? prevStop.lon : null;
    const dirUrl = googleMapsDirections(fromLat, fromLon, stop.lat, stop.lon);
    const placeUrl = googleMapsPlace(stop);

    const stayLabel = stop.stay ? ` · 머무는 시간 ${stop.stay}` : '';
    const paragraphsHtml = stop.paragraphs.map(p => `<p>${p}</p>`).join('');

    article.innerHTML = `
      <figure class="stop-photo">
        <span class="stop-num">${stop.num}${stop.terminus ? ' · 종착' : ''}</span>
        <img src="${stop.image}" alt="${stop.nameKr}" loading="lazy">
      </figure>
      <div class="stop-body">
        <div class="stop-time">${stop.time}${stayLabel}</div>
        <h2>${stop.nameKr}</h2>
        <div class="stop-pl">${stop.nameLocal}</div>
        ${paragraphsHtml}
        <div class="stop-actions">
          <a class="btn-directions" href="${dirUrl}" target="_blank" rel="noopener">
            🗺️ 구글 지도 길찾기
          </a>
          <a class="btn-place" href="${placeUrl}" target="_blank" rel="noopener" title="장소만 보기">
            📍
          </a>
          <button class="btn-visit ${visited.has(stop.id) ? 'checked' : ''}" data-stop-id="${stop.id}">
            ${visited.has(stop.id) ? '✓ 방문함' : '☐ 방문'}
          </button>
        </div>
      </div>
    `;
    return article;
  }

  // ====== 도보 구간 렌더링 ======
  function renderWalk(walk, fromStop, toStop, withEmbed) {
    const div = document.createElement('div');
    div.className = 'walk' + (walk.tram ? ' tram' : '');
    let embedHtml = '';
    if (withEmbed && fromStop && toStop) {
      const fallbackSrc = googleMapsEmbed(fromStop, toStop, walk.tram);
      embedHtml = `
        <div class="walk-map">
          <iframe src="${fallbackSrc}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
        </div>`;
    }
    div.innerHTML = `
      <span class="arrow">↓</span>
      <div class="walk-content">
        <span class="walk-mode">${walk.mode}</span>
        <div class="walk-text">${walk.text}</div>
        ${embedHtml}
      </div>
    `;
    return div;
  }

  // ====== 메인 렌더 ======
  function render({ container, withEmbed = false }) {
    const stops = data.stops;
    const frag = document.createDocumentFragment();
    stops.forEach((stop, idx) => {
      const prev = idx > 0 ? stops[idx - 1] : null;
      frag.appendChild(renderStop(stop, idx, prev));
      if (stop.walkAfter && idx < stops.length - 1) {
        const next = stops[idx + 1];
        frag.appendChild(renderWalk(stop.walkAfter, stop, next, withEmbed));
      }
    });
    container.appendChild(frag);
    bindEvents();
    updateProgress();
  }

  // ====== 이벤트 바인딩 ======
  function bindEvents() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-visit');
      if (!btn) return;
      const id = btn.dataset.stopId;
      const article = document.getElementById(id);
      if (visited.has(id)) {
        visited.delete(id);
        article.classList.remove('visited');
        btn.classList.remove('checked');
        btn.textContent = '☐ 방문';
      } else {
        visited.add(id);
        article.classList.add('visited');
        btn.classList.add('checked');
        btn.textContent = '✓ 방문함';
      }
      saveVisited(visited);
      updateProgress();
    });
  }

  // ====== 진행도 ======
  function updateProgress() {
    const total = data.stops.filter(s => !s.extension).length;
    const done = data.stops.filter(s => !s.extension && visited.has(s.id)).length;
    const pct = total ? Math.round(done / total * 100) : 0;
    const fillEl = document.querySelector('.progress-bar .fill');
    const countEl = document.querySelector('.progress-bar .count');
    if (fillEl) fillEl.style.width = pct + '%';
    if (countEl) countEl.textContent = `${done} / ${total}`;
  }

  // ====== 하단 네비: 현재 보이는 정거장 추적 ======
  let currentIdx = 0;
  function setupBottomNav() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;
    const prevBtn = nav.querySelector('.prev');
    const nextBtn = nav.querySelector('.next');
    const centerCurrent = nav.querySelector('.center .current');
    const centerTotal = nav.querySelector('.center .total');
    centerTotal.textContent = data.stops.length;

    function updateNav() {
      const stop = data.stops[currentIdx];
      const prev = currentIdx > 0 ? data.stops[currentIdx - 1] : null;
      const next = currentIdx < data.stops.length - 1 ? data.stops[currentIdx + 1] : null;
      centerCurrent.textContent = stop.num;
      prevBtn.disabled = !prev;
      nextBtn.disabled = !next;
      prevBtn.querySelector('.target').textContent = prev ? `${prev.num} ${prev.nameKr}` : '—';
      nextBtn.querySelector('.target').textContent = next ? `${next.num} ${next.nameKr}` : '—';
    }

    prevBtn.addEventListener('click', () => {
      if (currentIdx > 0) {
        currentIdx--;
        document.getElementById(data.stops[currentIdx].id).scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateNav();
      }
    });
    nextBtn.addEventListener('click', () => {
      if (currentIdx < data.stops.length - 1) {
        currentIdx++;
        document.getElementById(data.stops[currentIdx].id).scrollIntoView({ behavior: 'smooth', block: 'start' });
        updateNav();
      }
    });

    // 스크롤 위치에 따라 currentIdx 갱신 (viewport 중앙에 가장 가까운 정거장)
    const stopEls = Array.from(document.querySelectorAll('.stop'));
    let raf = null;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const viewCenter = window.scrollY + window.innerHeight / 2;
        let bestIdx = 0, bestDist = Infinity;
        stopEls.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          const top = rect.top + window.scrollY;
          const center = top + rect.height / 2;
          const dist = Math.abs(center - viewCenter);
          if (dist < bestDist) { bestDist = dist; bestIdx = i; }
        });
        if (bestIdx !== currentIdx) {
          currentIdx = bestIdx;
          updateNav();
        }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    updateNav();
  }

  // ====== 헤더 메타 채우기 ======
  function fillHeader() {
    const titleEl = document.querySelector('.tour-header h1');
    const subEl = document.querySelector('.tour-header .subtitle');
    const totalKmEl = document.querySelector('.tour-meta .total-km .val');
    const totalTimeEl = document.querySelector('.tour-meta .total-time .val');
    const stopsCountEl = document.querySelector('.tour-meta .stops-count .val');
    if (titleEl) titleEl.textContent = data.meta.title;
    if (subEl) subEl.textContent = data.meta.subtitle;
    if (totalKmEl) totalKmEl.textContent = data.meta.totalKm;
    if (totalTimeEl) totalTimeEl.textContent = data.meta.totalTime;
    if (stopsCountEl) stopsCountEl.textContent = data.meta.stopsCount;
  }

  // ====== 티켓 가이드 (펼침 카드) ======
  // 내용은 도시마다 다르다 (요금 체계·교통수단 자체가 다름) → stops-data.js의
  // meta.ticket = { summary, html } 에서 읽는다. 없으면 카드를 아예 렌더하지 않는다.
  function injectTicketCard(target) {
    if (!target) return;
    const ticket = data.meta && data.meta.ticket;
    if (!ticket || !ticket.html) return;
    const el = document.createElement('details');
    el.className = 'ticket-card';
    el.innerHTML = `
      <summary>${ticket.summary || '🎫 교통 안내 (탭하여 펼치기)'}</summary>
      <div class="ticket-body">${ticket.html}</div>
    `;
    target.appendChild(el);
  }

  // ====== 외부 API ======
  window.NaviCore = {
    render,
    setupBottomNav,
    fillHeader,
    injectTicketCard,
    data,
    visited,
    googleMapsDirections,
    googleMapsPlace,
    googleMapsEmbed,
  };
})();
