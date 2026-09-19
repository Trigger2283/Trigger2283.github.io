(function () {
  'use strict';
  const $ = id => document.getElementById(id);
  const { t } = AtlasI18n;
  const cityName = c => AtlasI18n.language === 'en' ? c.name : c.label || c.name;
  const placeName = e => e.place === '未命名地区' ? t(e.place) : e.place;
  const FEED = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
  const { parseFeed, filterEvents } = QuakeCore;
  let events = [], filtered = [], reference = null, picking = false, shown = 30;
  let loaded = false, failure = false, busy = false, generated = null, lastFetch = 0;
  const map = L.map('map', { minZoom: 1, maxZoom: 12, zoomControl: true, attributionControl: true, maxBounds: [[-85, -240], [85, 240]], maxBoundsViscosity: 0.8 }).setView([20, 15], 2);
  map.attributionControl.setPrefix('Leaflet');
  map.attributionControl.addAttribution('Made with Natural Earth');
  L.geoJSON(MAP_DATA.countries, { interactive: false, style: { color: '#b8c8ba', weight: 0.7, fillColor: '#f5f6ec', fillOpacity: 1 } }).addTo(map);
  const graticule = L.layerGroup().addTo(map);
  for (let lat = -60; lat <= 60; lat += 30) L.polyline([[lat, -180], [lat, 180]], { color: '#c6d6cc', weight: 0.5, opacity: 0.6, interactive: false }).addTo(graticule);
  for (let lon = -180; lon <= 180; lon += 30) L.polyline([[-85, lon], [85, lon]], { color: '#c6d6cc', weight: 0.5, opacity: 0.6, interactive: false }).addTo(graticule);
  const citiesLayer = L.layerGroup().addTo(map), eventLayer = L.layerGroup().addTo(map);
  let referenceMarker = null;
  const markerById = new Map();
  let fmt = new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  const number = n => Math.round(n).toLocaleString(AtlasI18n.language);
  const coords = (lat, lon) => `${Math.abs(lat).toFixed(4)}°${lat >= 0 ? 'N' : 'S'}, ${Math.abs(lon).toFixed(4)}°${lon >= 0 ? 'E' : 'W'}`;
  const category = e => e.mag === null ? 'unknown' : e.mag >= 5 ? 'high' : e.mag >= 3 ? 'medium' : 'low';
  const colors = { low: '#c4a758', medium: '#d6814d', high: '#b7473e', unknown: '#858b86' };
  function node(tag, text, className) {
    const el = document.createElement(tag);
    if (text !== undefined) el.textContent = text;
    if (className) el.className = className;
    return el;
  }
  function renderCities() {
    citiesLayer.clearLayers();
    const zoom = map.getZoom();
    if (zoom < 3) return;
    MAP_DATA.cities.filter(c => zoom >= 5 || c.pop > 5000000).forEach(c => {
      const label = node('span', cityName(c));
      L.circleMarker([c.lat, c.lon], { radius: 2, color: '#7f9587', weight: 1, fillOpacity: 1, interactive: false })
        .bindTooltip(label, { permanent: true, direction: 'right', className: 'city-label', offset: [5, 0] }).addTo(citiesLayer);
    });
  }
  map.on('zoomend', renderCities);
  function setPicking(value) {
    picking = value;
    $('pick').setAttribute('aria-pressed', String(value));
    $('pick').textContent = t(value ? '✓ 选点中 · 点击取消' : '⌖ 在地图上选择地点');
    $('map').classList.toggle('picking', value);
    $('map-hint').textContent = t(value ? '点击地图设置参考地点 · 不上传坐标' : '拖动探索 · 滚轮缩放 · 点击地震查看详情');
  }
  function setReference(lat, lon, label, fly = true) {
    reference = { lat, lon, label };
    renderReference();
    $('reference').classList.add('active');
    $('radius').disabled = false;
    $('sort').querySelector('[value="distance"]').disabled = false;
    $('clear-location').hidden = false;
    if (referenceMarker) map.removeLayer(referenceMarker);
    referenceMarker = L.circleMarker([lat, lon], { radius: 8, color: '#fff', weight: 3, fillColor: '#287563', fillOpacity: 1, bubblingMouseEvents: false }).addTo(map);
    referenceMarker.bindTooltip(node('span', t('你的参考地点 · 仅保存在本页内存')));
    if (fly) map.setView([Math.max(-85, Math.min(85, lat)), lon], 5, { animate: false });
    setPicking(false);
    $('city-search').value = '';
    $('city-results').replaceChildren();
    $('latitude').value = '';
    $('longitude').value = '';
    $('coordinate-error').textContent = '';
    update();
  }
  function clearReference() {
    reference = null;
    if (referenceMarker) map.removeLayer(referenceMarker);
    referenceMarker = null;
    $('reference').textContent = t('尚未选择参考地点');
    $('reference').classList.remove('active');
    $('radius').value = 'all';
    $('radius').disabled = true;
    if ($('sort').value === 'distance') $('sort').value = 'time';
    $('sort').querySelector('[value="distance"]').disabled = true;
    $('clear-location').hidden = true;
    $('city-search').value = '';
    $('city-results').replaceChildren();
    $('latitude').value = '';
    $('longitude').value = '';
    $('coordinate-error').textContent = '';
    setPicking(false);
    update();
  }
  $('pick').addEventListener('click', () => setPicking(!picking));
  map.on('click', e => { if (picking) setReference(e.latlng.lat, ((e.latlng.lng + 180) % 360 + 360) % 360 - 180, '地图选点', false); });
  $('clear-location').addEventListener('click', clearReference);
  $('world').addEventListener('click', () => map.setView([20, 15], 2, { animate: false }));
  function renderSearch() {
    const query = $('city-search').value.trim().toLocaleLowerCase();
    $('city-results').replaceChildren();
    if (!query) return;
    const matches = MAP_DATA.cities.filter(c => `${c.name} ${c.label || ''} ${c.country} ${c.alias || ''}`.toLocaleLowerCase().includes(query)).slice(0, 8);
    for (const c of matches) {
      const button = node('button', `${cityName(c)} · ${c.country}`);
      button.type = 'button';
      button.addEventListener('click', () => setReference(c.lat, c.lon, c));
      $('city-results').append(button);
    }
    if (!matches.length) $('city-results').append(node('p', t('内置列表未找到。试试英文城市名，或在地图上选点 / 输入经纬度。')));
  }
  $('city-search').addEventListener('input', renderSearch);
  $('city-search').addEventListener('keydown', e => { if (e.key === 'Escape') { $('city-search').value = ''; $('city-results').replaceChildren(); } });
  $('use-coordinates').addEventListener('click', () => {
    const lat = Number($('latitude').value), lon = Number($('longitude').value);
    if (!$('latitude').value.trim() || !$('longitude').value.trim() || !Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      $('coordinate-error').textContent = t('请输入有效坐标：纬度 -90～90，经度 -180～180。');
      return;
    }
    setReference(lat, lon, '自定义地点');
  });
  function popup(e) {
    const box = node('div');
    box.append(node('h3', `M ${e.mag === null ? t('未知') : e.mag.toFixed(1)} · ${placeName(e)}`), node('p', fmt.format(e.time)), node('p', t('深度 {value}', { value: e.depth === null ? t('未知') : e.depth.toFixed(1) + ' km' })), node('p', coords(e.lat, e.lon)));
    if (e.distance !== null) box.append(node('p', t('距参考地点 {value} km', { value: number(e.distance) })));
    return box;
  }
  function renderMarkers() {
    eventLayer.clearLayers();
    markerById.clear();
    filtered.forEach(e => {
      const color = colors[category(e)];
      const marker = L.circleMarker([e.lat, e.lon], { radius: Math.max(3, Math.min(15, (e.mag ?? 1) * 1.7 + 2)), color, weight: 1, fillColor: color, fillOpacity: 0.55, bubblingMouseEvents: false }).addTo(eventLayer);
      marker.bindPopup(() => popup(e));
      marker.on('click', () => { if (picking) { marker.closePopup(); setReference(e.lat, e.lon, '地图选点', false); } });
      markerById.set(e.id, marker);
    });
    if (referenceMarker) referenceMarker.bringToFront();
  }
  function renderRows() {
    const body = $('event-list');
    body.replaceChildren();
    filtered.slice(0, shown).forEach(e => {
      const row = node('tr');
      const mag = node('td'); mag.append(node('span', e.mag === null ? t('未知') : e.mag.toFixed(1), `mag-badge ${category(e)}`));
      const place = node('td'); place.append(node('span', placeName(e), 'place-name'), node('span', coords(e.lat, e.lon), 'place-coord'));
      const action = node('td'), button = node('button', t('地图定位 ↗'), 'text-button');
      button.setAttribute('aria-label', t('在地图上查看 {place} 地震', { place: placeName(e) }));
      button.addEventListener('click', () => {
        setPicking(false);
        map.setView([e.lat, e.lon], Math.max(map.getZoom(), 5), { animate: false });
        markerById.get(e.id)?.openPopup();
        $('map').scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      action.append(button);
      row.append(mag, place, node('td', fmt.format(e.time)), node('td', e.depth === null ? t('未知') : `${e.depth.toFixed(1)} km`), node('td', e.distance === null ? '—' : `${number(e.distance)} km`), action);
      body.append(row);
    });
    if (!filtered.length) {
      const row = node('tr'), cell = node('td', t(loaded ? '当前条件下没有地震记录。试试扩大时间或距离范围、降低震级。' : failure ? '暂时无法获取地震数据。请检查网络后点击更新重试。' : '正在加载公共地震数据…'), 'empty-cell');
      cell.colSpan = 6; row.append(cell); body.append(row);
    }
    $('more').hidden = filtered.length <= shown;
    $('list-note').textContent = t('已显示 {shown} / {total} 条 · 地图展示全部筛选结果', { shown: Math.min(shown, filtered.length), total: filtered.length });
  }
  function renderStatus() {
    $('status').classList.toggle('failed', failure);
    if (busy) $('status').textContent = t(loaded ? '正在更新…当前仍展示上一次成功获取的数据。' : '正在连接 USGS，获取最近 7 天的公共地震数据…');
    else if (failure) $('status').textContent = t(loaded ? '更新失败，保留上一次获取的数据。请留意数据更新时间，点击“更新地震数据”重试。' : '无法连接 USGS。地图和选点仍可使用，点击“更新地震数据”重试。');
    else if (loaded) {
      const stale = generated && Date.now() - generated > 30 * 60000;
      $('status').textContent = (stale ? t('注意：数据已超过 30 分钟未更新。') : '') + t('找到 {count} 次地震 · 时间、震级和距离均为本地筛选。数据可能由 USGS 后续修订。', { count: number(filtered.length) });
    }
  }
  function update() {
    shown = 30;
    const mag = Number($('magnitude').value);
    $('mag-label').textContent = mag === -1 ? t('全部') : `M ${mag.toFixed(1)}+`;
    filtered = filterEvents(events, { now: Date.now(), hours: Number($('period').value), mag, reference, radius: $('radius').value === 'all' ? Infinity : Number($('radius').value), sort: $('sort').value });
    $('stat-count').textContent = loaded ? number(filtered.length) : '—';
    const mags = filtered.map(e => e.mag).filter(m => m !== null);
    $('stat-mag').textContent = mags.length ? Math.max(...mags).toFixed(1) : '—';
    $('stat-distance').textContent = reference && filtered.length ? number(Math.min(...filtered.map(e => e.distance))) : '—';
    $('distance-unit').textContent = t(reference ? 'km · 地表距离' : '选择参考地点后显示');
    $('result-count').textContent = String(filtered.length);
    renderMarkers(); renderRows(); renderStatus();
  }
  // Only this function accesses the network. Its URL and options never depend on user input.
  async function loadFeed() {
    if (busy) return;
    busy = true; failure = false; $('refresh').disabled = true; renderStatus();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);
    try {
      const response = await fetch(FEED, { credentials: 'omit', referrerPolicy: 'no-referrer', cache: 'no-store', redirect: 'error', signal: controller.signal });
      if (!response.ok) throw new Error('HTTP error');
      const data = await response.json();
      const parsed = parseFeed(data);
      events = parsed; loaded = true; lastFetch = Date.now();
      generated = Number.isFinite(data.metadata?.generated) ? data.metadata.generated : null;
      renderTimestamp();
    } catch (_) {
      // Never log user state or error payloads.
      failure = true;
    } finally {
      clearTimeout(timeout); busy = false; $('refresh').disabled = false; update();
    }
  }
  $('refresh').addEventListener('click', loadFeed);
  ['period', 'radius', 'sort'].forEach(id => $(id).addEventListener('change', update));
  $('magnitude').addEventListener('input', update);
  $('more').addEventListener('click', () => { shown += 30; renderRows(); });
  $('reset').addEventListener('click', () => { $('period').value = '24'; $('magnitude').value = '-1'; $('sort').value = 'time'; clearReference(); map.setView([20, 15], 2, { animate: false }); });
  const dialog = $('privacy-dialog');
  function renderReference() {
    $('reference').textContent = reference ? `${typeof reference.label === 'object' ? cityName(reference.label) : t(reference.label)} · ${coords(reference.lat, reference.lon)}` : t('尚未选择参考地点');
    if (referenceMarker) referenceMarker.setTooltipContent(node('span', t('你的参考地点 · 仅保存在本页内存')));
  }
  function renderTimestamp() {
    $('updated').textContent = loaded ? t(generated ? '数据更新于 {time}' : '获取于 {time}', { time: fmt.format(generated || lastFetch) }) : t('尚未获取数据');
  }
  function changeLanguage() {
    const openEvent = [...markerById].find(([, marker]) => marker.isPopupOpen())?.[0];
    const previousShown = shown;
    AtlasI18n.setLanguage($('language').value);
    fmt = new Intl.DateTimeFormat(AtlasI18n.language, { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
    setPicking(picking); renderReference(); renderTimestamp(); renderSearch(); renderCities();
    if ($('coordinate-error').textContent) $('coordinate-error').textContent = t('请输入有效坐标：纬度 -90～90，经度 -180～180。');
    document.querySelectorAll('.leaflet-control-zoom-in, .leaflet-control-zoom-out').forEach(button => {
      const label = t(button.classList.contains('leaflet-control-zoom-in') ? '放大' : '缩小');
      button.title = label; button.setAttribute('aria-label', label);
    });
    update(); shown = previousShown; renderRows();
    if (openEvent) markerById.get(openEvent)?.openPopup();
  }
  $('language').value = 'zh-CN';
  $('language').addEventListener('change', changeLanguage);
  $('privacy-footer').addEventListener('click', () => dialog.showModal());
  $('privacy-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const b = dialog.getBoundingClientRect(); if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) dialog.close(); } });
  // Clear on back/forward cache restoration, too; browsers may otherwise restore form values.
  window.addEventListener('pageshow', e => {
    if (e.persisted) { clearReference(); if (Date.now() - lastFetch > 5 * 60000) loadFeed(); }
  });
  clearReference();
  changeLanguage();
  loadFeed();
  setInterval(() => { if (!document.hidden) update(); }, 60000);
  setInterval(() => { if (!document.hidden) loadFeed(); }, 5 * 60000);
})();
