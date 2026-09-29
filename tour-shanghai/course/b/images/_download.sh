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

fetch "Entrance of Provisional Government of ROK in Shanghai.JPG" "01-provisional-government.jpg"
fetch "Site of the First National Congress of the Communist Party of China DSC5397 (15581791143).jpg" "02-first-congress.jpg"
fetch "Xintiandi6.jpg" "03-xintiandi.jpg"
fetch "Former Residence of Sun Yat-sen, Shanghai.JPG" "04-sinan-road.jpg"
fetch "Tianzifang, Shanghai.jpg" "05-tianzifang.jpg"
fetch "Wukang Mansion (20191114161507).jpg" "06-wukang-mansion.jpg"
fetch "Street View of Wukang Road.JPG" "07-wukang-road.jpg"
fetch "Jumbo kebab at Xinjiang Restaurant (20141121184744).JPG" "08-longtimeago.jpg"
fetch "Bund at night Shanghai.jpg" "09-bund-night.jpg" 1600
