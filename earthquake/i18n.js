/* Local translations only. No storage, network requests, or location data. */
(function () {
  'use strict';
  const english = {
    '震迹 · Earthquake Atlas': 'Earthquake Atlas · 震迹',
    '震迹首页': 'Earthquake Atlas home',
    '位置留在此设备': 'Your location stays here',
    '看见地球的每一次脉动': 'Feel the pulse of our planet',
    '。': '.',
    '探索近期地震，找到与你相关的那一处。你的位置，只属于你。': 'Explore recent earthquakes and discover what is nearby. Your location stays yours.',
    '尚未获取数据': 'Data not loaded yet',
    '↻ 更新地震数据': '↻ Refresh earthquakes',
    '筛选结果概览': 'Filtered results overview',
    '当前结果': 'Matching events',
    '次地震': 'earthquakes',
    '最大震级': 'Largest magnitude',
    '最近距离': 'Nearest event',
    '选择参考地点后显示': 'Choose a reference location',
    '筛选与距离计算': 'Filters and distances',
    '全部在浏览器内完成': 'Calculated in your browser',
    '地震筛选与参考地点': 'Earthquake filters and reference location',
    '探索条件': 'Explore & filter',
    '重置': 'Reset',
    '时间范围': 'Time range',
    '过去 1 小时': 'Past hour',
    '过去 24 小时': 'Past 24 hours',
    '过去 3 天': 'Past 3 days',
    '过去 7 天': 'Past 7 days',
    '最低震级': 'Minimum magnitude',
    '全部': 'All',
    '我的参考地点': 'Reference location',
    '仅本地': 'Local only',
    '搜索城市，或开启选点后点击地图。无需输入家庭地址。': 'Search for a city or enable point selection, then click the map. No home address needed.',
    '搜索内置城市（中文或英文）': 'Search bundled cities in Chinese or English',
    '搜索城市，如 东京 / Tokyo': 'Find a city, e.g. Tokyo / 东京',
    '城市搜索结果': 'City search results',
    '⌖ 在地图上选择地点': '⌖ Choose a point on the map',
    '尚未选择参考地点': 'No reference location selected',
    '清除地点': 'Clear location',
    '输入精确经纬度': 'Enter exact coordinates',
    '仅本地使用，不执行在线地址查询。': 'Used locally. No online address lookup.',
    '纬度': 'Latitude',
    '经度': 'Longitude',
    '-90 至 90': '-90 to 90',
    '-180 至 180': '-180 to 180',
    '使用坐标': 'Use coordinates',
    '距离范围': 'Distance range',
    '· 相对参考地点': '· From reference location',
    '不限距离': 'Any distance',
    '100 公里以内': 'Within 100 km',
    '300 公里以内': 'Within 300 km',
    '500 公里以内': 'Within 500 km',
    '1,000 公里以内': 'Within 1,000 km',
    '3,000 公里以内': 'Within 3,000 km',
    '◇ 不读取 GPS · 不保存选点 · 无追踪': '◇ No GPS · No saved locations · No tracking',
    '交互式地震地图': 'Interactive earthquake map',
    '地震分布': 'Earthquake map',
    '本地矢量底图': 'Local vector map',
    '↗ 全球视图': '↗ World view',
    '可缩放地图；也可使用城市搜索或经纬度输入选择地点': 'Zoomable map; you can also select a location using city search or coordinates',
    '拖动探索 · 滚轮缩放 · 点击地震查看详情': 'Drag to explore · Scroll to zoom · Click an event for details',
    '震级未知': 'Unknown magnitude',
    '参考地点': 'Reference point',
    'Natural Earth · 非街道级地图': 'Natural Earth · Not a street-level map',
    '地震列表': 'Earthquake list',
    '地震记录': 'Earthquake records',
    '排序': 'Sort by',
    '最新发生': 'Most recent',
    '震级从高到低': 'Largest magnitude',
    '距离从近到远': 'Nearest first',
    '正在连接 USGS…': 'Connecting to USGS…',
    '震级': 'Magnitude',
    '发生地点': 'Location',
    '时间': 'Time',
    '（本地时区）': '(local time)',
    '深度': 'Depth',
    '距离': 'Distance',
    '操作': 'Actions',
    '每页显示 30 条': '30 events per page',
    '显示更多': 'Show more',
    '数据来自 USGS · 用于探索与学习，不是地震预警服务。': 'Data from USGS · For exploration and learning, not an early warning service.',
    '数据与隐私说明 ↗': 'Data & privacy ↗',
    '关闭隐私说明': 'Close privacy information',
    '你的位置，留在你这里。': 'Your location stays with you.',
    '参考地点、输入的坐标、搜索文字和距离筛选仅在本页内存中使用。它们不进入请求、URL、日志或本地持久化存储；刷新或关闭页面后不再保留。': 'Your reference location, coordinates, searches and distance filters are used only in this page’s memory. They are not included in requests, URLs, logs or persistent storage, and are cleared when you reload or close the page.',
    '不读取 GPS，不使用账户、Cookie、广告、分析或会话回放 SDK。': 'No GPS access, accounts, cookies, advertising, analytics or session replay SDKs.',
    '地图、城市和字体均为本地资源，没有第三方地图瓦片或在线地址查询。底图适合区域定位；精确地点请直接输入经纬度。': 'Map data, cities and fonts are local resources. There are no third-party map tiles or online address lookups. The map is for regional exploration; enter coordinates for an exact location.',
    '唯一的应用外部数据请求是 USGS 固定的最近 7 天全球地震 Feed。所有筛选均在下载后进行，请求不携带你的选点。': 'The only external data request is the fixed USGS global earthquake feed for the past seven days. All filtering happens after download. Requests never include your selected location.',
    '联网并不等于匿名：USGS 和网站托管方仍可能获得 IP、访问时间等网络信息。HTTPS 不能向接收服务器隐藏 IP。': 'An internet connection is not anonymous: USGS and the hosting provider may still receive your IP address, access times and other network metadata. HTTPS does not hide your IP from the receiving server.',
    '本地处理是应用的数据流设计，不是操作系统级安全隔离；浏览器扩展、设备和托管平台仍在你的信任边界内。': 'Local processing describes this app’s data flow, not operating-system security isolation. You still rely on your browser extensions, device and hosting platform.',
    '地图：Natural Earth（公共领域）；渲染：Leaflet（BSD-2-Clause）。地震资料可能修订，最近一周数据不代表所有地区的完整记录。距离为地表大圆距离，不是风险或震感预测。': 'Map data: Natural Earth (public domain). Renderer: Leaflet (BSD-2-Clause). Earthquake data may be revised; the past week’s feed is not a complete record for every region. Distances are great-circle surface distances, not predictions of risk or shaking.',
    'USGS 数据文档 ↗': 'USGS data documentation ↗',
    'USGS 隐私政策 ↗': 'USGS privacy policy ↗',
    '点击外部链接后，将访问对应网站。': 'Following an external link takes you to that website.',
    '请启用 JavaScript 以显示地图和地震数据。位置计算在浏览器本地进行。': 'Enable JavaScript to display maps and earthquake data. Location calculations run locally in your browser.',
    '✓ 选点中 · 点击取消': '✓ Selecting · Click to cancel',
    '点击地图设置参考地点 · 不上传坐标': 'Click to set a reference point · Coordinates stay local',
    '地图选点': 'Map point',
    '自定义地点': 'Custom location',
    '你的参考地点 · 仅保存在本页内存': 'Your reference point · Kept only in this page’s memory',
    '内置列表未找到。试试英文城市名，或在地图上选点 / 输入经纬度。': 'No match in the bundled list. Try an English city name, select a map point or enter coordinates.',
    '请输入有效坐标：纬度 -90～90，经度 -180～180。': 'Enter valid coordinates: latitude -90 to 90, longitude -180 to 180.',
    '未知': 'Unknown',
    '未命名地区': 'Unnamed region',
    '深度 {value}': 'Depth {value}',
    '距参考地点 {value} km': '{value} km from reference point',
    '地图定位 ↗': 'View on map ↗',
    '在地图上查看 {place} 地震': 'View the earthquake at {place} on the map',
    '当前条件下没有地震记录。试试扩大时间或距离范围、降低震级。': 'No matching events. Try a longer time range, a larger distance or a lower magnitude.',
    '暂时无法获取地震数据。请检查网络后点击更新重试。': 'Earthquake data is unavailable. Check your connection and select Refresh to try again.',
    '正在加载公共地震数据…': 'Loading public earthquake data…',
    '已显示 {shown} / {total} 条 · 地图展示全部筛选结果': 'Showing {shown} of {total} · All matching events appear on the map',
    '正在更新…当前仍展示上一次成功获取的数据。': 'Refreshing… Showing the last successfully downloaded data.',
    '正在连接 USGS，获取最近 7 天的公共地震数据…': 'Connecting to USGS for public earthquake data from the past seven days…',
    '更新失败，保留上一次获取的数据。请留意数据更新时间，点击“更新地震数据”重试。': 'Refresh failed. Showing previously downloaded data. Check the timestamp and select Refresh earthquakes to retry.',
    '无法连接 USGS。地图和选点仍可使用，点击“更新地震数据”重试。': 'Cannot connect to USGS. Maps and location selection still work. Select Refresh earthquakes to retry.',
    '注意：数据已超过 30 分钟未更新。': 'Note: this data is more than 30 minutes old. ',
    '找到 {count} 次地震 · 时间、震级和距离均为本地筛选。数据可能由 USGS 后续修订。': '{count} earthquakes found · Time, magnitude and distance are filtered locally. USGS may revise these records.',
    'km · 地表距离': 'km · Surface distance',
    '数据更新于 {time}': 'Data updated {time}',
    '获取于 {time}': 'Retrieved {time}',
    '放大': 'Zoom in',
    '缩小': 'Zoom out'
  };
  let language = 'zh-CN';
  const records = [];
  // Capture original static nodes once, preserving nested markup and controls.
  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const textNode = walker.currentNode;
    if (textNode.parentElement.closest('script, style, #language')) continue;
    const original = textNode.textContent, key = original.trim();
    if (Object.hasOwn(english, key)) records.push({ node: textNode, original, key });
  }
  const attributes = [];
  document.querySelectorAll('[aria-label], [placeholder]').forEach(el => {
    ['aria-label', 'placeholder'].forEach(attribute => {
      const key = el.getAttribute(attribute);
      if (Object.hasOwn(english, key)) attributes.push({ el, attribute, key });
    });
  });
  function t(key, values = {}) {
    const text = language === 'en' ? english[key] ?? key : key;
    return text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  }
  function setLanguage(value) {
    language = value === 'en' ? 'en' : 'zh-CN';
    document.documentElement.lang = language;
    records.forEach(r => { r.node.textContent = language === 'en' ? r.original.replace(r.key, english[r.key]) : r.original; });
    attributes.forEach(r => r.el.setAttribute(r.attribute, t(r.key)));
  }
  window.AtlasI18n = { t, setLanguage, get language() { return language; } };
})();
