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

# 도착·출발 — 훙차오 T1
fetch "Shanghai Hongqiao International Airport Terminal 1 building May 2026.jpg" "hongqiao-t1.jpg"
# 결제·교통
fetch "QR codes for mobile pay in China.jpg" "qr-pay.jpg"
fetch "First carriage train of Shanghai Metro Line 2.jpg" "metro-line2.jpg"
fetch "Shanghai Ferry @ Huangpu River 2011.jpg" "huangpu-ferry.jpg"
# 음식
fetch "Xiaolongbao-breakfast.jpg" "xiaolongbao.jpg"
fetch "Shengjian Mantou on a Pan.jpg" "shengjian.jpg" 1024
fetch "Red braised pork (20141106191221).JPG" "hongshaorou.jpg"
fetch "Shanghai oil noodle.jpg" "scallion-noodles.jpg" 500
fetch "Roe inside steamed female hairy crab.jpg" "hairy-crab.jpg"
