/* Pure calculations. No network, location APIs, DOM, or persistence. */
(function (root) {
  'use strict';
  const rad = n => n * Math.PI / 180;
  function distance(a, b) {
    const dLat = rad(b.lat - a.lat), dLon = rad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 6371.0088 * 2 * Math.asin(Math.sqrt(Math.max(0, Math.min(1, h))));
  }
  function parseFeed(data) {
    if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('Invalid feed');
    return data.features.flatMap(f => {
      const p = f.properties, c = f.geometry && f.geometry.coordinates;
      if (!p || !c || !Number.isFinite(c[0]) || !Number.isFinite(c[1]) || Math.abs(c[0]) > 180 || Math.abs(c[1]) > 90 || !Number.isFinite(p.time)) return [];
      return [{ id: String(f.id || ''), lon: c[0], lat: c[1], depth: Number.isFinite(c[2]) ? c[2] : null, mag: Number.isFinite(p.mag) ? p.mag : null, time: p.time, place: typeof p.place === 'string' ? p.place : '未命名地区', type: typeof p.type === 'string' ? p.type : 'unknown' }];
    }).filter(e => e.type === 'earthquake');
  }
  function filterEvents(events, options) {
    const cutoff = options.now - options.hours * 3600000;
    const result = events.filter(e => e.time >= cutoff && e.time <= options.now && (options.mag === -1 || (e.mag !== null && e.mag >= options.mag)))
      .map(e => ({ ...e, distance: options.reference ? distance(options.reference, e) : null }))
      .filter(e => !options.reference || options.radius === Infinity || e.distance <= options.radius);
    return result.sort((a, b) => options.sort === 'magnitude' ? (b.mag ?? -Infinity) - (a.mag ?? -Infinity) || b.time - a.time : options.sort === 'distance' && options.reference ? a.distance - b.distance || b.time - a.time : b.time - a.time);
  }
  const core = { distance, parseFeed, filterEvents };
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  else root.QuakeCore = core;
})(typeof window !== 'undefined' ? window : globalThis);
