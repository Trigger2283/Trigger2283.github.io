# 震迹 · Earthquake Atlas 


This is an earthquake information search website integrated with the USGS Earthquake API. Users can search for earthquake data based on their needs, using filters such as time, location, and earthquake magnitude.

API Usage
The website uses the browser’s native fetch API to send HTTPS GET requests to the fixed USGS endpoint https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson. No API key or authentication is required.
No user query parameters are included in the request. The all_week feed contains all recorded global events from the past seven days across all magnitudes. The application only displays records where properties.type === "earthquake".
The response is returned as a GeoJSON FeatureCollection. Earthquake magnitude, location description, and timestamp in milliseconds are read from properties.mag, properties.place, and properties.time. Location data is read from geometry.coordinates in the order of longitude, latitude, and depth in kilometers.
Time, magnitude, and distance filtering are performed entirely in the browser. Distance is calculated using the Haversine formula to determine the great-circle distance along the Earth’s surface. The user’s coordinates are never included in any network request.
The same endpoint is requested when the page is opened, when the user manually refreshes the data, and every five minutes while the page remains visible. Requests omit credentials and the Referer header and use a 20-second timeout. If a request fails, the application retains the most recently downloaded successful dataset and clearly indicates that the refresh has failed.

Official documentation:
https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php
