// 4회차 정거장 본문을 투어 앱 데이터에서 다시 생성한다.
//   node lecture-shanghai/_sync-04.js
// 04-shanghai-tour.html 안의 @generated 마커 사이만 바꾼다. 마커 밖(개관·금요일·대안·클로징)은 손으로 쓴 부분.
// 정거장 내용은 ../tour-shanghai/course/{sat,sun}/stops-data.js 에서 고치고 이 스크립트를 돌릴 것.
// 사진은 images/04/<요일>-<파일명> 으로 복사해 둔 것을 가리킨다 (사진이 바뀌면 함께 복사).
const fs = require('fs');
const path = require('path');

const here = __dirname;
const tourDir = path.join(here, '..', 'tour-shanghai', 'course');
const target = path.join(here, '04-shanghai-tour.html');

// 요일별 페이지(투어 앱의 sat / sun). 토요일은 한 페이지지만 강의에서는 오전·오후 두 절로 나눠 보여준다.
// from/to = 그 절에 들어가는 정거장 번호(1부터). 배지는 요일 + 하루 안의 번호(토1…토19, 일1…일7).
const days = [
  { key: 'sat', K: '토', sections: [
    { id: 'sat-am', title: '토요일 오전 — 와이탄과 위위안', time: '토 09:00–14:15', from: 1, to: 10,
      lead: '강 밑 3분, 70년 전으로. 오전의 순광 아래 조계의 은행 거리를 걷고, 옛 성 안에서 점심을 먹는다. 위위안은 16:00 입장 마감이라 12:55 도착. 도보 약 4km.' },
    { id: 'sat-pm', title: '토요일 오후·밤 — 옛 프랑스 조계', time: '토 14:30–20:00', from: 11, to: 19,
      lead: '망명객들의 동네. 주말 16:30 입장 마감인 임시정부 청사부터 들르고, 톈즈팡에서 해를 보낸 뒤 양꼬치 한 상과 밤의 플라타너스 길을 지나 숙소 건물 58층에서 강 건너 불빛으로 하루를 닫는다. 도보 약 5km + 디디 1회 + 메트로 1회.' },
  ] },
  { key: 'sun', K: '일', sections: [
    { id: 'sun', title: '일요일 — 루자쭈이, 그리고 귀국', time: '일 08:30–13:45', from: 1, to: 7,
      lead: '숙소 문 앞의 35년. 09:00 개장에 맞춰 동방명주에 오르고, 10시 개점 직후의 점도덕에서 딤섬 브런치. 어제 걸은 강 건너를 이쪽에서 본 뒤 짐을 찾아 공항으로 — 17:00 훙차오 T1 출발, 19:50 김포 도착. 도보 약 3km.' },
  ] },
];

function loadStops(key) {
  global.window = { SH_TICKET: {} };
  const file = path.join(tourDir, key, 'stops-data.js');
  delete require.cache[require.resolve(file)];
  require(file);
  return window.TOUR_DATA.stops;
}

let toc = '';
let body = '';
for (const day of days) {
  const stops = loadStops(day.key);
  for (const sec of day.sections) {
    toc += `      <li><a href="#${sec.id}"><span class="num">${day.K}</span><strong>${sec.title.split(' — ')[0]}</strong></a></li>\n`;
    body += `    <!-- ===================== ${sec.title.split(' — ')[0]} ===================== -->
    <section class="beat" id="${sec.id}">
      <div class="beat-header">
        <span class="beat-num">${day.K}</span>
        <h2>${sec.title}</h2>
        <span class="beat-time">${sec.time}</span>
      </div>
      <p class="lead-in">${sec.lead}</p>
    </section>

`;
    stops.slice(sec.from - 1, sec.to).forEach((s, k) => {
      const i = sec.from - 1 + k;
      const id = `${day.key}-${s.id}`;
      const n = `${day.K}${i + 1}`;
      toc += `      <li><a href="#${id}"><span class="num">${n}</span>${s.nameKr}</a></li>\n`;
      const img = `assets/images/04/${day.key}-${path.basename(s.image)}`;
      // <ul>이 든 문단은 <p> 안에 넣을 수 없어 <div>로 감싼다
      const paras = s.paragraphs
        .map((p) => (p.includes('<ul>') ? `          <div>${p}</div>` : `          <p>${p}</p>`))
        .join('\n');
      body += `    <!-- ===== ${n} ===== -->
    <section id="${id}">
      <article class="stop">
        <figure class="stop-photo">
          <span class="stop-num">${n}${s.terminus ? ' · 종착' : ''}</span>
          <img src="${img}" alt="${s.nameKr}">
        </figure>
        <div class="stop-body">
          <div class="stop-time">${s.time}${s.stay ? ' · 머무는 시간 ' + s.stay : ''}</div>
          <h3>${s.nameKr}</h3>
          <div class="stop-pl">${s.nameLocal}</div>
${paras}
        </div>
      </article>
    </section>

`;
      if (s.walkAfter) {
        body += `    <div class="walk">
      <span class="arrow">↓</span>
      <span class="walk-mode${s.walkAfter.tram ? ' tram' : ''}">${s.walkAfter.mode}</span>
      <span class="walk-text">${s.walkAfter.text}</span>
    </div>

`;
      }
    });
    body += '    <hr>\n\n';
  }
}

function replaceBetween(html, name, content) {
  const re = new RegExp(`(<!-- @generated:${name}:start[^>]*-->\\n)[\\s\\S]*?(\\s*<!-- @generated:${name}:end -->)`);
  if (!re.test(html)) throw new Error(`marker @generated:${name} not found`);
  return html.replace(re, (_, a, b) => a + content.replace(/\n$/, '') + b);
}

let html = fs.readFileSync(target, 'utf8');
html = replaceBetween(html, 'toc', toc);
html = replaceBetween(html, 'courses', body);
fs.writeFileSync(target, html);
console.log(`04-shanghai-tour.html: ${(body.match(/<article class="stop">/g) || []).length} stops synced`);
