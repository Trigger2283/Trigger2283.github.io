// Optional development utility. Runtime uses only the bundled map-data.js.
const fs = require('node:fs');
const path = require('node:path');
const at = name => path.join(__dirname, 'assets', name);
const countries = JSON.parse(fs.readFileSync(at('countries.geojson'), 'utf8'));
countries.features = countries.features.map(f => ({ type: 'Feature', properties: {}, geometry: f.geometry }));
const aliases = {
  Tokyo: '东京 東京', Beijing: '北京', Shanghai: '上海', Taipei: '台北 臺北', Osaka: '大阪', Seoul: '首尔 首爾', Singapore: '新加坡', London: '伦敦', Paris: '巴黎', Berlin: '柏林', Rome: '罗马', Sydney: '悉尼', Melbourne: '墨尔本', Wellington: '惠灵顿', Auckland: '奥克兰', Jakarta: '雅加达', Manila: '马尼拉', Bangkok: '曼谷', Delhi: '德里', Mumbai: '孟买', Kathmandu: '加德满都', Istanbul: '伊斯坦布尔', Tehran: '德黑兰', Cairo: '开罗', Nairobi: '内罗毕', Santiago: '圣地亚哥', Lima: '利马', Quito: '基多', Vancouver: '温哥华', Toronto: '多伦多', Seattle: '西雅图', 'San Francisco': '旧金山', 'Los Angeles': '洛杉矶', 'New York': '纽约', 'Mexico City': '墨西哥城', 'Hong Kong': '香港', Chengdu: '成都', Chongqing: '重庆', Guangzhou: '广州', Shenzhen: '深圳', Wuhan: '武汉', Lhasa: '拉萨', Urumqi: '乌鲁木齐', Anchorage: '安克雷奇', Honolulu: '檀香山', Reykjavik: '雷克雅未克', 'Washington, D.C.': '华盛顿'
};
const cities = JSON.parse(fs.readFileSync(at('cities.geojson'), 'utf8')).features.map(f => {
  const p = f.properties;
  return { name: p.name, label: aliases[p.name]?.split(' ')[0] || p.name, alias: aliases[p.name] || '', country: p.adm0name, lat: f.geometry.coordinates[1], lon: f.geometry.coordinates[0], pop: p.pop_max || 0 };
});
if (!cities.some(c => c.name === 'Pittsburgh')) cities.push({ name: 'Pittsburgh', label: '匹兹堡', alias: '匹茲堡', country: 'United States of America', lat: 40.4406, lon: -79.9959, pop: 300000 });
fs.writeFileSync(at('map-data.js'), '/* Natural Earth public-domain data; see THIRD_PARTY.md. */\nconst MAP_DATA = ' + JSON.stringify({ countries, cities }) + ';\n');
console.log(`Bundled ${countries.features.length} country geometries and ${cities.length} cities.`);
