/* Dependency-free integration test using Chrome DevTools Protocol. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const { spawn } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'test-output');
fs.mkdirSync(output, { recursive: true });
const chromePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const fixture = {
  type: 'FeatureCollection', metadata: { generated: Date.now() },
  features: [
    ['japan', 139.8, 35.7, 5.2, 'Near Tokyo, Japan', 1],
    ['california', -118.3, 34.1, 3.4, 'Southern California', 2],
    ['chile', -72, -33, 4.8, 'Coquimbo, Chile', 3],
    ['alaska', -150, 61, 1.5, 'Southern Alaska', 4],
    ['nz', 175, -40, 4.2, 'North Island of New Zealand', 5],
    ['old', 130, 32, 6, 'Japan — older event', 100],
    ['unknown', 80, 20, null, '<img src=x onerror=alert(1)>', 2]
  ].map(([id, lon, lat, mag, place, age]) => ({ id, properties: { mag, place, type: 'earthquake', time: Date.now() - age * 3600000 }, geometry: { type: 'Point', coordinates: [lon, lat, 15] } }))
};
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };
const server = http.createServer((req, res) => {
  const relative = new URL(req.url, 'http://localhost').pathname;
  const file = path.resolve(root, '.' + (relative === '/' ? '/index.html' : relative));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (e, data) => { if (e) res.writeHead(404).end(); else { res.setHeader('Content-Type', mime[path.extname(file)] || 'text/plain'); res.end(data); } });
});
const sleep = ms => new Promise(r => setTimeout(r, ms));
let chrome, ws;
(async () => {
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const url = `http://127.0.0.1:${server.address().port}`;
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'quake-browser-test-'));
  chrome = spawn(chromePath, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-background-networking', '--disable-extensions', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
  const endpoint = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Chrome did not start within 20s')), 20000);
    chrome.on('error', e => { clearTimeout(timer); reject(e); });
    chrome.stderr.on('data', data => { const m = String(data).match(/DevTools listening on (ws:\/\/[^\s]+)/); if (m) { clearTimeout(timer); resolve(m[1]); } });
  });
  const targets = await (await fetch(`http://${new URL(endpoint).host}/json/list`)).json();
  ws = new WebSocket(targets.find(t => t.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let serial = 0;
  const pending = new Map(), requests = [], errors = [];
  ws.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const p = pending.get(message.id); if (!p) return; clearTimeout(p.timer); pending.delete(message.id);
      if (message.error) p.reject(new Error(JSON.stringify(message.error))); else p.resolve(message.result);
    } else if (message.method === 'Network.requestWillBeSent') requests.push(message.params.request);
    else if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.text);
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++serial; const timer = setTimeout(() => { pending.delete(id); reject(new Error('CDP timeout: ' + method)); }, 15000); pending.set(id, { resolve, reject, timer }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error(JSON.stringify(r.exceptionDetails)); return r.result.value; };
  const waitFor = async expression => { for (let i = 0; i < 100; i++) { if (await evaluate(expression)) return; await sleep(100); } throw new Error('Timed out: ' + expression); };
  console.log('Chrome connected; starting browser checks.');
  await send('Page.enable'); await send('Runtime.enable'); await send('Network.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1120, deviceScaleFactor: 1, mobile: false });
  const inject = await send('Page.addScriptToEvaluateOnNewDocument', { source: `window.testCalls = []; window.testFail = false; window.fetch = async function(url, options) { window.testCalls.push({url, credentials:options.credentials, referrerPolicy:options.referrerPolicy}); if(window.testFail) throw new Error('test offline'); return new Response(JSON.stringify(${JSON.stringify(fixture)}), {status:200,headers:{'Content-Type':'application/json'}}); };` });
  await send('Page.navigate', { url });
  await waitFor("document.getElementById('stat-count')?.textContent === '6'");
  assert.equal(await evaluate("document.querySelectorAll('#event-list img').length"), 0, 'feed text is not HTML');
  await evaluate("document.getElementById('period').value='168'; document.getElementById('period').dispatchEvent(new Event('change'))");
  assert.equal(await evaluate("document.getElementById('stat-count').textContent"), '7');
  await evaluate("document.getElementById('magnitude').value='5'; document.getElementById('magnitude').dispatchEvent(new Event('input'))");
  assert.equal(await evaluate("document.getElementById('stat-count').textContent"), '2');
  await evaluate("document.getElementById('reset').click()");
  const requestsBefore = requests.length;
  await evaluate("document.getElementById('city-search').value='东京'; document.getElementById('city-search').dispatchEvent(new Event('input'))");
  assert.ok(await evaluate("document.querySelectorAll('#city-results button').length > 0"));
  await evaluate("document.querySelector('#city-results button').click(); document.getElementById('radius').value='100'; document.getElementById('radius').dispatchEvent(new Event('change'))");
  assert.equal(await evaluate("document.getElementById('stat-count').textContent"), '1');
  assert.equal(await evaluate("document.getElementById('radius').disabled"), false);
  await evaluate("document.getElementById('latitude').value='91'; document.getElementById('longitude').value='0'; document.getElementById('use-coordinates').click()");
  assert.ok(await evaluate("document.getElementById('coordinate-error').textContent.length > 0"));
  await evaluate("document.getElementById('latitude').value='0'; document.getElementById('longitude').value='0'; document.getElementById('use-coordinates').click()");
  assert.equal(await evaluate("document.getElementById('stat-count').textContent"), '0');
  assert.ok(await evaluate("document.getElementById('reference').textContent.includes('0.0000')"));
  await evaluate("document.getElementById('clear-location').click(); document.getElementById('pick').click()");
  const rect = await evaluate("(()=>{const r=document.getElementById('map').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()");
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', ...rect, button: 'left', clickCount: 1 });
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', ...rect, button: 'left', clickCount: 1 });
  assert.ok(await evaluate("document.getElementById('reference').textContent.includes('地图选点')"));
  assert.equal(await evaluate("document.getElementById('pick').getAttribute('aria-pressed')"), 'false');
  assert.equal(await evaluate('window.testCalls.length'), 1, 'user inputs cause no API requests');
  assert.equal(requests.length, requestsBefore, 'user inputs cause no additional network requests');
  assert.equal(await evaluate('localStorage.length + sessionStorage.length'), 0);
  const beforeLanguage = await evaluate("JSON.stringify({count:document.getElementById('stat-count').textContent,period:document.getElementById('period').value,radius:document.getElementById('radius').value})");
  await evaluate("document.getElementById('language').value='en'; document.getElementById('language').dispatchEvent(new Event('change'))");
  assert.equal(await evaluate('document.documentElement.lang'), 'en');
  assert.equal(await evaluate("document.querySelector('label[for=period]').textContent"), 'Time range');
  assert.ok(await evaluate("document.getElementById('reference').textContent.includes('Map point')"));
  assert.ok(await evaluate("document.getElementById('status').textContent.includes('earthquakes found')"));
  assert.equal(await evaluate("document.getElementById('privacy-title').textContent"), 'Your location stays with you.');
  assert.equal(await evaluate("document.getElementById('city-search').placeholder"), 'Find a city, e.g. Tokyo / 东京');
  assert.equal(await evaluate("JSON.stringify({count:document.getElementById('stat-count').textContent,period:document.getElementById('period').value,radius:document.getElementById('radius').value})"), beforeLanguage);
  assert.equal(await evaluate('window.testCalls.length'), 1, 'language switching does not fetch data');
  assert.equal(requests.length, requestsBefore, 'language switching makes no network requests');
  await evaluate("document.getElementById('city-search').value='东京'; document.getElementById('city-search').dispatchEvent(new Event('input'))");
  assert.ok(await evaluate("document.querySelector('#city-results button').textContent.includes('Tokyo')"));
  await evaluate("document.getElementById('language').value='zh-CN'; document.getElementById('language').dispatchEvent(new Event('change'))");
  assert.equal(await evaluate("document.querySelector('label[for=period]').textContent"), '时间范围');
  assert.ok(await evaluate("document.getElementById('reference').textContent.includes('地图选点')"));
  await evaluate("document.getElementById('privacy-footer').click()");
  assert.equal(await evaluate("document.getElementById('privacy-dialog').open"), true);
  await evaluate("document.getElementById('privacy-close').click(); window.testFail=true; document.getElementById('refresh').click()");
  await waitFor("document.getElementById('status').textContent.includes('更新失败')");
  assert.equal(await evaluate("document.getElementById('stat-count').textContent"), '6', 'failed refresh retains data');
  await evaluate("window.testFail=false; document.getElementById('refresh').click()");
  await waitFor("!document.getElementById('refresh').disabled");
  assert.equal(await evaluate("document.getElementById('status').classList.contains('failed')"), false);
  await evaluate("document.getElementById('reset').click()");
  await sleep(300);
  let shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(output, 'desktop.png'), Buffer.from(shot.data, 'base64'));
  await evaluate("document.getElementById('language').value='en'; document.getElementById('language').dispatchEvent(new Event('change'))");
  shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  fs.writeFileSync(path.join(output, 'desktop-en.png'), Buffer.from(shot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await sleep(300);
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 390'), 'no mobile horizontal page overflow');
  const mobileHeight = await evaluate('document.documentElement.scrollHeight');
  shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: 390, height: mobileHeight, scale: 1 } });
  fs.writeFileSync(path.join(output, 'mobile.png'), Buffer.from(shot.data, 'base64'));
  await send('Emulation.setDeviceMetricsOverride', { width: 320, height: 740, deviceScaleFactor: 1, mobile: true });
  await sleep(200);
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 320'), 'English layout fits small phones');
  await evaluate("document.getElementById('language').value='zh-CN'; document.getElementById('language').dispatchEvent(new Event('change'))");
  assert.ok(await evaluate('document.documentElement.scrollWidth <= 320'), 'Chinese language setting fits small phones');
  assert.equal(errors.length, 0, 'no JS exceptions');
  assert.ok(requests.every(r => r.url.startsWith(url)), 'all mock-test resources are local');
  // Real API check, separate from deterministic interaction tests.
  await send('Page.removeScriptToEvaluateOnNewDocument', { identifier: inject.identifier });
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1120, deviceScaleFactor: 1, mobile: false });
  await send('Page.reload', { ignoreCache: true });
  await waitFor("typeof window.testCalls === 'undefined' && !!document.getElementById('status')");
  for (let i = 0; i < 240; i++) {
    if (await evaluate("document.getElementById('status')?.textContent.includes('找到') || document.getElementById('status')?.textContent.includes('无法连接')")) break;
    await sleep(100);
  }
  const liveStatus = await evaluate("document.getElementById('status').textContent");
  assert.ok(liveStatus.includes('找到') || liveStatus.includes('无法连接'), 'live request reached success or explicit failure');
  const external = requests.filter(r => !r.url.startsWith(url));
  assert.ok(external.length >= 1);
  assert.ok(external.every(r => r.url === 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson'), 'only the fixed USGS feed leaves origin');
  assert.ok(external.every(r => !Object.entries(r.headers).some(([k,v]) => /^(cookie|referer)$/i.test(k) && v)), 'no nonempty Cookie or Referer sent to USGS');
  const liveSucceeded = !(await evaluate("document.getElementById('status').classList.contains('failed')"));
  if (liveSucceeded) {
    shot = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
    fs.writeFileSync(path.join(output, 'live-desktop.png'), Buffer.from(shot.data, 'base64'));
  }
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ integration: 'passed', liveSucceeded, liveStatus, externalRequests: external.map(r => r.url), exceptions: errors }, null, 2));
  console.log('PASS: bilingual UI and state preservation, filters, city search, coordinate validation, map picking, request isolation, no storage, error recovery, 320px mobile layout, CSP resource origins.');
  console.log('Live USGS: ' + liveStatus);
  await send('Page.navigate', { url: require('node:url').pathToFileURL(path.join(root, 'index.html')).href });
  await waitFor("location.protocol === 'file:' && !!document.querySelector('#map .leaflet-pane')");
  for (let i = 0; i < 240; i++) {
    if (await evaluate("document.getElementById('status')?.textContent.includes('找到') || document.getElementById('status')?.textContent.includes('无法连接')")) break;
    await sleep(100);
  }
  assert.ok(await evaluate("document.getElementById('status').textContent.includes('找到')"), 'double-click file launch loads real USGS data');
  console.log('PASS: direct file launch loads local map and real USGS feed.');
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(() => { ws?.close(); chrome?.kill(); server.close(); });
