# 第三方资料

## 地震数据

USGS Earthquake Hazards Program，GeoJSON Summary Feed：
https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php

运行时请求：https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson

隐私政策：https://www.usgs.gov/office-of-the-director/privacy-policies

本项目并非 USGS 官方产品，不暗示其背书。

## Leaflet 1.9.4

https://leafletjs.com/

下载来源：https://unpkg.com/leaflet@1.9.4/dist/leaflet.js 和相同目录下的 leaflet.css。

许可：BSD-2-Clause。完整声明保存在 `vendor/LICENSE-Leaflet.txt`。网站不使用图片 Marker 或图层切换控件，因此无需下载 Leaflet 默认图标文件。

## Natural Earth

Made with Natural Earth. https://www.naturalearthdata.com/

公共领域许可：https://www.naturalearthdata.com/about/terms-of-use/

原始文件（本项目下载时的快照）：
- https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson
- https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_populated_places_simple.geojson

`build-map.cjs` 移除国家属性，只保留几何；城市保留名字、国家、人口与坐标，并增加少量中文别名及公共城市 Pittsburgh 的近似中心坐标。底图为概览级数据，边界表达沿用原始资料，不用于法律或导航用途。
