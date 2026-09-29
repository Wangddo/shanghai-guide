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

# 와이탄 — 1920년대와 오늘
fetch "Shanghai of Today, Plate 1 - Bund looking north.jpg" "bund-1920s.jpg" 1200
fetch "Shanghai-Bund-50-Chinabank-Seezollamt-HSBC-Zentrale-2012-gje.jpg" "bund-customs-hsbc.jpg"
# 석고문·룽탕
fetch "Entrance of a Shikumen Lilong on Shanhaiguan Rd..JPG" "shikumen.jpg"
fetch "A Lane in Zhenxingli.jpg" "lilong-lane.jpg"
# 대한민국 임시정부
fetch "After First New-year Commemoration of Provisional Government of the Republic of Korea (1st January 1920).jpg" "kpg-1920.jpg" 1600
fetch "Entrance of Provisional Government of ROK in Shanghai.JPG" "kpg-madang-road.jpg"
fetch "Kim Gu in 1949.jpg" "kim-gu.jpg" 800
fetch "사진1(윤봉길 선서장면).jpg" "yun-bonggil-oath.jpg" 800
fetch "Yoon Bong-Gil in Lu Xun Park 01.JPG" "meiheon-luxun-park.jpg"
# 모던 상하이의 사람들
fetch "Ruan Lingyu (阮玲玉), Liangyou 1928-07-30.jpg" "ruan-lingyu.jpg" 800
fetch "1944年的张爱玲.jpg" "eileen-chang.jpg" 800
fetch "LuXun1930.jpg" "lu-xun.jpg" 800
fetch "Shanghai Jewish Refugees Museum, Refurbished 2020.jpg" "jewish-refugees-museum.jpg"
fetch "Wukang Mansion (20191114161507).jpg" "wukang-mansion.jpg"
