// 상하이 교통·결제 카드 — 세 코스 공용
// stops-data.js보다 먼저 로드한다. 각 코스의 meta.ticket이 이 객체를 가리킨다.
window.SH_TICKET = {
  summary: '🎫 교통·결제 가이드 (탭하여 펼치기)',
  html: `
    <p><strong>상하이 메트로 + 황푸강 페리 + 디디(DiDi)</strong>. 이 세 가지면 2박 3일 동선이 전부 해결된다. 숙소(IFC)가 <strong>2호선 루자쭈이역</strong>과 지하로 바로 이어져 있다는 게 가장 큰 무기다.</p>
    <h4>메트로 요금과 타는 법</h4>
    <table>
      <thead><tr><th>구간</th><th>요금</th><th>언제</th></tr></thead>
      <tbody>
        <tr><td>6km 이내</td><td class="price">3元</td><td>루자쭈이 ↔ 난징동루 · 위위안 ↔ 신천지</td></tr>
        <tr><td>6–16km</td><td class="price">4元</td><td>우캉루(상하이도서관역) → 난징동루</td></tr>
        <tr><td>이후 10km마다</td><td class="price">+1元</td><td>루자쭈이 → 훙차오 T1 ≈ 6–7元</td></tr>
      </tbody>
    </table>
    <ul>
      <li><strong>해외 신용카드 태그</strong> ⭐ — 2025년 6월부터 전 노선 개찰구에서 Visa·Mastercard·AMEX·JCB 컨택트리스 카드를 그대로 찍고 탄다. 들어갈 때 한 번, 나올 때 한 번. 출국 전 카드사에 <em>해외 비접촉 결제</em>가 켜져 있는지 확인.</li>
      <li><strong>알리페이 교통 QR</strong> — 알리페이 앱 → 교통(出行) → 상하이 메트로 승차 코드. 해외 카드를 연동해 두었다면 가장 무난하다.</li>
      <li><strong>1회권 자판기</strong> — 역마다 있다. 영어 지원. 현금·QR 결제.</li>
    </ul>
    <h4>이 여행의 핵심 노선</h4>
    <ul>
      <li><strong>2호선</strong> — 루자쭈이(숙소) ↔ 난징동루. 딱 한 정거장, 3분.</li>
      <li><strong>10호선</strong> — 난징동루 · 위위안 · 신천지 · 상하이도서관(우캉루) · <strong>훙차오 1터미널</strong>까지 한 줄로 꿴다. 이번 여행의 척추 노선.</li>
    </ul>
    <h4>그 밖의 교통</h4>
    <ul>
      <li><strong>황푸강 페리(东金线)</strong> — 둥창루(东昌路, 푸동) ↔ 진링둥루(金陵东路, 와이탄 남단). 편도 <strong>2元</strong>, 약 5분. 강 위에서 양안을 한 번에 본다. 운항 시간은 시기마다 달라 현장 확인.</li>
      <li><strong>디디(DiDi)</strong> — 알리페이 안의 디디 미니프로그램으로 부른다(별도 앱 설치 불필요). 영어 UI, 해외 카드 결제. 기본요금 약 14–16元.</li>
      <li><strong>택시</strong> — 공항 택시 승강장은 줄만 서면 된다. 목적지는 <em>중국어 주소 화면</em>을 보여주는 게 가장 확실하다.</li>
    </ul>
    <div class="warning">
      ⚠️ <strong>구글 지도는 로밍·해외 eSIM일 때만 열린다.</strong> 중국 현지 유심이나 호텔 와이파이로는 막혀 있다(VPN 필요). 이 앱의 길찾기 버튼은 구글 지도의 중국 좌표계(GCJ-02)에 맞춰 보정해 두었다. 구글이 안 열리면 각 카드의 <strong>중국어 장소명</strong>을 고덕지도(高德)나 디디에 그대로 복사해 넣으면 된다.
    </div>
    <h4>금요일 밤 도착 · 일요일 출국</h4>
    <ul>
      <li><strong>금 22:10 훙차오 T1 도착</strong> → 입국·짐 찾기 후 약 23시. 메트로는 막차 시간대라 <strong>택시·디디 권장</strong>. IFC까지 약 40–50분, 약 100–130元.</li>
      <li><strong>일 17:00 훙차오 T1 출발</strong> → 국제선이라 15:00까지 도착. IFC에서 <strong>13:45 전후 출발</strong>. 메트로: 2호선 루자쭈이 → 난징동루 환승 → 10호선 훙차오 1터미널, 약 55분. 택시는 주말 정체에 따라 45–70분.</li>
    </ul>
    <p style="font-size: 11px; color: var(--ink-mute); margin-top: 10px;">출처: 상하이시 정부 영문 포털(english.shanghai.gov.cn) · Shanghai Metro · 2026년 9월 확인. 요금·운항 시간은 출발 직전 재확인 권장.</p>`,
};
