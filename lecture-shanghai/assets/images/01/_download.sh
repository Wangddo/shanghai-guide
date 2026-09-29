#!/bin/bash
# Wikimedia Commons에서 이미지를 받고 credits.txt에 출처·저작자·라이선스를 기록한다.
set -e
UA="ShanghaiLectureBot/1.0 (personal study use)"
API="https://commons.wikimedia.org/w/api.php"
cd "$(dirname "$0")"
: > credits.txt

fetch() {
  local fn="$1"; local out="$2"; local w="${3:-1200}"
  echo "→ $fn → $out"
  local info=$(python3 -c "
import urllib.parse, urllib.request, json, re, time
fn = '''$fn'''
api_url = '$API?action=query&titles=File:' + urllib.parse.quote(fn) + '&prop=imageinfo&iiprop=url|extmetadata&iiextmetadatafilter=LicenseShortName|Artist&iiurlwidth=$w&format=json'
for a in range(5):
    try:
        data = json.load(urllib.request.urlopen(urllib.request.Request(api_url, headers={'User-Agent':'$UA'}), timeout=30)); break
    except Exception:
        time.sleep(10*(a+1))
p = next(iter(data['query']['pages'].values()))
if 'imageinfo' in p:
    ii = p['imageinfo'][0]; m = ii.get('extmetadata', {})
    u = (ii.get('thumburl') or ii.get('url')).split('?')[0]
    art = re.sub(r'\s+', ' ', re.sub('<[^>]+>', '', m.get('Artist', {}).get('value', 'unknown'))).strip()
    print(u + '\t' + art + '\t' + m.get('LicenseShortName', {}).get('value', '?'))
")
  if [ -z "$info" ]; then echo "  ✗ no url"; return; fi
  local url=$(echo "$info" | cut -f1)
  curl -sL --retry 4 --retry-delay 10 -A "$UA" -o "$out" "$url"
  printf '%s\n  File:%s\n  by %s · %s\n  https://commons.wikimedia.org/wiki/File:%s\n\n' "$out" "$fn" "$(echo "$info" | cut -f2)" "$(echo "$info" | cut -f3)" "$(echo "$fn" | tr ' ' '_')" >> credits.txt
  echo "  ✓ $(stat -f%z "$out" 2>/dev/null || stat -c%s "$out") bytes"
  sleep 3
}

# 오프닝 — 황푸강 양안
fetch "Pudong Shanghai November 2017 panorama.jpg" "pudong-panorama.jpg" 2000
# 좌표 — 중국 속 상하이
fetch "Shanghai-location-MAP-in-China.jpg" "shanghai-location-map.jpg" 1092
# 옛 현성 성벽 (1553 축조, 1912 철거)
fetch "Shanghai walls of the Old City.jpg" "old-city-wall.jpg"
fetch "Dismantlement of the Shanghai Old City walls.jpg" "city-wall-dismantle.jpg"
# 1842 난징조약
fetch "The Signing of the Treaty of Nanking.jpg" "treaty-nanking.jpg" 1600
# 조계 지도 (1932)
fetch "1932 Hochi Map of Shanghai, China - Geographicus - Shanghai-hochi-1932.jpg" "map-1932.jpg" 1600
# 1930년대 와이탄·난징루
fetch "Shanghai Bund seen from the French Concession.jpg" "bund-1934.jpg" 1479
fetch "Shanghai Nanjing Road 1930s.jpg" "nanjing-road-1930s.jpg" 1000
# 개혁개방과 푸동
fetch "Deng Xiaoping arrival at Dobbins Air Force Base Atlanta 1979-2.jpg" "deng-xiaoping.jpg" 800
fetch "Expo 2010 China Pavilion 12.jpg" "expo-china-pavilion.jpg"
