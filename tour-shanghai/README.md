# Shanghai Tour

상하이 교양강의 시리즈의 모바일 동반 투어 도구. 폴란드 투어(`../tour`)의 엔진을 이어받아, 2박 3일 일정(숙소 IFC · 루자쭈이 기점)에 맞춘 토·일 동선을 폰 한 손으로 따라가는 PWA.

- 로컬: 이 폴더의 **상위 폴더**에서 `python3 -m http.server 8777` → <http://localhost:8777/tour-shanghai/course/>
- 안드로이드 Chrome / iOS Safari → "홈 화면에 추가" → PWA로 설치 (오프라인 동작)
- **출국 전 한국에서 한 번 열어둘 것.** Service Worker가 정거장 사진까지 미리 캐시한다.

## 요일별 동선

| 요일 | 시간 | 정거장 | 동선 | 강의 |
|---|---|---|---|---|
| **금 11/20** (Day 1) | 22:10– | — | 훙차오 T1 도착 → 택시·디디로 IFC. 쉬는 밤 | — |
| **토 11/21** (Day 2) | 09:00–20:00 | 19 | 오전: IFC → 난징동루 → 화평반점 → 외백도교 → 와이탄 → 옛 HSBC·세관 → 상하이 그랜드마더(上海姥姥) 점심 → 구곡교·난샹 만두 → 위위안 → 성황묘 / 오후: (10호선) 임시정부 청사 → 중공 1차 대회 기념관 → 신천지 → 푸싱공원·쓰난루 → 톈즈팡 → 很久以前 양꼬치(打浦桥日月光店) → (디디) 우캉 맨션 → 우캉루·안푸루 → (메트로) Flair 루프톱(리츠칼튼 58층) · 도보 ~9km | 1·2회차 |
| **일 11/22** (Day 3) | 08:30–13:45 | 7 | 원형 육교 → 동방명주(09:00 개장 입장) → 점도덕(点都德 正大店) 딤섬 브런치 → 강변 산책로 → 천구이춘 고택 → 세 타워(118층 선택) → IFC → 훙차오 T1 (17:00 출발 → 김포 19:50) · 도보 ~3km | 1회차 |

금요일 밤 도착(11/20 22:10 훙차오 T1 → 택시)과 귀국(11/22 17:00 훙차오 T1 → 김포 19:50)은 첫 화면과 교통 카드에 정리.

**반드시 포함**: 식당 — 상하이 그랜드마더·Flair·헌지우이치엔·점도덕 / 관광지 — 위위안·와이탄·난징동루·동방명주·임시정부 청사. 입장 마감(위위안 16:00, 임시정부 주말 16:30, 동방명주 20:30)과 식당 예약 방법은 첫 화면에 모아 두었다.

## 폴란드 엔진에서 바뀐 것

| 항목 | 폴란드 | 상하이 |
|---|---|---|
| 구글 지도 좌표 | WGS-84 그대로 | **WGS-84 → GCJ-02 변환 후 전달** (`navi-core.js`의 `toGoogle`). 중국 본토 구글 지도는 GCJ-02라 그대로 넘기면 300–500m 밀림. 중국 밖 좌표는 변환하지 않음 |
| 📍 장소 보기 | `이름 @lat,lon` 검색 | 중국어 장소명 검색 (`stop.mapQuery` → 없으면 `stop.nameLocal`) |
| 현지어 이름 필드 | `namePl` | `nameLocal` |
| 미니맵 (Leaflet + OSM) | WGS-84 | 그대로 WGS-84 (OSM 자체가 WGS-84라 변환 불필요) |
| 교통 카드 | 도시마다 `meta.ticket` | 토·일이 공유 → `course/shared-ticket.js`의 `window.SH_TICKET`을 각 `meta.ticket`이 참조 |
| SW scope | `/poland-tour/` 하드코딩 | `../` 상대 경로 (배포 경로 무관) |
| SW 캐시 | 페이지·스크립트 | + **정거장 사진 26장** (현지 회선이 느려도 뜨도록). 설치 시 HTTP 캐시를 건너뛰고(`cache: 'reload'`) 서버에서 새로 받음 |
| 레거시 저장 키 이관 | 바르샤바 전용 이관 코드 | 제거 |

> 구글 지도는 **로밍·해외 eSIM**일 때만 열린다(중국 현지 유심·와이파이는 차단). 이 경우를 대비해 각 카드에 중국어 장소명을 넣어 두었다 — 고덕지도·디디에 그대로 복사하면 된다.

## 구조

```
tour-shanghai/
├── index.html          루트 → course/ 리다이렉트
├── manifest.json       PWA 매니페스트
├── sw.js               Service Worker (토·일 공용, 사진 사전 캐시)
├── navi/assets/        공용 엔진 (폴란드 투어에서 복사 후 수정)
│   ├── css/navi.css
│   ├── js/navi-core.js   렌더링·방문상태·구글지도 딥링크(GCJ-02 보정)·헤더·티켓카드
│   ├── js/v3-flex.js     동선 편집·Pass·슬롯번호·미니맵·하단네비
│   └── icons/
└── course/
    ├── index.html        첫 화면 (금요일 도착 · 요일 카드 · 입장 시간 · 식당 예약)
    ├── shared-ticket.js  교통·결제 카드 (토·일 공용)
    ├── sat.html · sat/   토요일 — stops-data.js + images/ (19곳)
    └── sun.html · sun/   일요일 — stops-data.js + images/ (7곳)
```

외부 의존: Leaflet 1.9.4 (unpkg), Sortable.js 1.15.2 (jsDelivr). 빌드 도구 없음.

## `stops-data.js` 형식

```js
window.TOUR_DATA = {
  meta: {
    cityKey: 'shanghai-sat',   // 저장 키 네임스페이스 (필수, 페이지마다 다르게)
    title, subtitle, totalKm, totalTime, stopsCount,
    ticket: window.SH_TICKET,  // 교통 카드 (shared-ticket.js)
  },
  stops: [ { id, num, order, time, stay, nameKr, nameLocal, mapQuery, lat, lon, image, paragraphs, walkAfter, terminus? } ],
};
```

- `lat`/`lon`은 **WGS-84** (OSM Nominatim·Overpass로 검증, 2026-09-30). 구글용 변환은 엔진이 한다.
- `mapQuery` — 📍 버튼이 구글 지도에서 검색할 중국어 문자열. 동명 장소가 많은 곳은 주소를 덧붙였다.

## 이미지

모두 Wikimedia Commons. 요일별 `images/_download.sh`로 다시 받을 수 있고, 저작자·라이선스는 같은 폴더의 `credits.txt`.

## 저장 상태 (localStorage)

| 키 | 내용 |
|---|---|
| `tourOrder_v3_shanghai-{sat,sun}` | 사용자가 바꾼 정거장 순서 |
| `tourPassed_v3_shanghai-{sat,sun}` | Pass한 정거장 id |
| `tourVisited_v1_shanghai-{sat,sun}` | 방문 체크한 정거장 id |

## 실제 여행 시 유의

여행 날짜는 **2026. 11. 20(금) – 22(일)**. 11월 하순 기준으로 맞춘 것: 일몰 16:53(토요일 오후의 우캉 맨션·우캉루는 해 진 뒤), 겨울철 와이탄 조명 21–22시 소등(→ 토요일 19:55 Flair 58층에서 야경, 소등 전 1시간 확보), 기온 8–15°C·비, 털게 제철, 플라타너스 단풍 절정.

입장료·운영시간·조명 시간·페리 운항·환율은 2026년 9월 기준으로 확인했다. 출발 직전 재확인 권장.

## 라이선스

- 코드: MIT
- 이미지: Wikimedia Commons (CC BY-SA / CC BY / CC0 / Public Domain) — 각 `credits.txt`
