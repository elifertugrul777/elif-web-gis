# Elif Ertuğrul — Personal Atlas

A local-first personal website for GMT458 Web GIS. Home: Istanbul, Türkiye. University: Hacettepe University, Ankara. Field: Geomatics Engineering.

## Open the website

Extract the ZIP. Open `index.html` in a browser. Leaflet, OpenLayers, fonts and a Natural Earth vector world map are bundled locally, so the two world maps work without internet. OpenStreetMap street tiles require internet and HTTP hosting. Double-click BASLAT.bat on Windows to open the bundled local server, or use VS Code Go Live. The server binds only 127.0.0.1 and stops when its window closes. No npm or Python installation is required. The PowerShell launcher was statically reviewed but not executed on Windows in the creation environment.

## Pages

- `index.html`: personal introduction and a real HTML technology table with local SVG images.
- `travel.html`: Leaflet atlas. Filter cities, restaurants and museums by visited/wishlist, search, click a list entry to navigate, add places, export and import JSON.
- `map2.html`: OpenLayers world map. Its personal theme has not been selected by Elif. Click to read coordinates; reset to world view.

## Personal data

No travel history is invented. `js/places.js` starts with an empty `ELIF_PLACES` array. The “Try example places” button enables explicitly labelled design examples. These are not the student's travel history.

Place additions from the UI are saved only in the current browser's local storage, not in the source files or a server. Export them regularly. To publish the same confirmed places for all visitors, put exported place records into the `window.ELIF_PLACES` array in `js/places.js`. Do not put duplicate records in both the source array and this browser's saved additions. Export before moving/renaming the folder: file:// local storage behaviour is browser dependent.

Each record: `{id, name, region, lat, lng, category, status, note}`. Latitude/longitude are decimal geographic degrees, not projected metres. Category is city/restaurant/museum/other. Status is visited/wishlist. A coordinate can be chosen by clicking the map. No geocoding/search service is used.

## Coursework features

- Three separate HTML files.
- CSS float/entrance animation; reduced-motion preference respected.
- Tabular information with local SVG images.
- Leaflet 1.9.4 and OpenLayers 10.11.0.
- Leaflet detail markers are drawn only at view zoom > 4 (zoomend updates the layer). Filtering does not bypass this rule.
- Earth repetition disabled: Leaflet tile noWrap with map bounds; OpenLayers OSM wrapX:false with projection extent and multiWorld:false. Blank margins at world scale are intentional, rather than repeating the world.
- Standard OpenStreetMap tiles used with visible attribution when opened over HTTP. On file://, no OSM tile requests are made: the local public-domain Natural Earth vector map is displayed. This is country geography, not offline street detail. When tile errors occur over HTTP, a fallback notice is shown and the local vector layer remains. No OSM tiles were downloaded into the archive. CSS colours only the raster tile layer for the dark visual theme.
- Git history must be maintained by the student: at least three commits on different actual days. This archive includes no fabricated Git history.

## Assets

Local SVG globe and technology symbols are original illustrative artwork created for this website. They are not official technology logos. The simple text “e.” header/fav icon is a temporary typographic mark; final personal logo is deferred. No personal portrait is included because none was supplied for this project.

## Research / design references

Reviewed 11 October 2026. Original composition, not a copy of another portfolio.
- https://brittanychiang.com/ — personal content structure and readable portfolio navigation.
- https://sortino.co/design — concise introduction and project-led storytelling.
- https://lusion.co/ — exploration through visual storytelling and interaction.
- https://bruno-simon.com/ — a portfolio explored as a personal world.
- https://www.awwwards.com/websites/black/ — black website inspiration collection.

Technical references:
- https://leafletjs.com/reference-1.9.4
- https://openlayers.org/en/latest/apidoc/module-ol_source_OSM-OSM.html
- https://openlayers.org/en/latest/apidoc/module-ol_View-View.html
- https://www.openstreetmap.org/copyright
- https://operations.osmfoundation.org/policies/tiles/

## AI usage disclosure — complete before submission

This version was researched and generated with ChatGPT assistance, including HTML/CSS layout, JavaScript map behaviour, browser-local place storage, example data, and original SVG artwork. AI-generated code must not be described as solely student-written.

Specific things explained by AI: HTML/CSS linking; multi-page structure; Git/GitHub/commit concepts; Leaflet and OpenLayers integration; marker zoom thresholds; disabling repeated world tiles; category filtering; latitude/longitude selection and browser-local data export.

Student: replace this paragraph with the specific features you actually learned and can explain. Record independent research/problem-solving actually performed; do not claim research steps you did not perform.

Total AI time: TO BE COMPLETED HONESTLY by the student using actual time spent across the sessions. The assistant cannot verify the total. This is a draft disclosure, not a final time estimate.

## Validation

Source links/assets, formatted markup, JavaScript syntax, ZIP integrity and OpenLayers map setup in file/HTTP mode checked before packaging. Coordinate display and reset were exercised with a mocked API; 177 bundled polygon features were validated. Leaflet initialization was also exercised with a mocked API in file/HTTP modes: local geography, example labels, filters, place saving, and hiding markers at zoom <= 4 passed. These tests do not substitute for a live browser render. A live browser render and network tile loading were not verified in the creation environment; test all three pages on your computer and phone before submission. This is a first design draft, pending confirmed travel data, second map theme, portrait and final logo.

## Version 2 corrections

- Readable formatted HTML, CSS and application JavaScript, plus editor word wrap.
- Entire “Places & possibilities.” heading uses the same italic serif style.
- Locally bundled Leaflet/OpenLayers, DM Sans/Instrument Serif fonts and 177 Natural Earth country polygons.
- Offline world map avoids file-protocol OpenStreetMap access errors; HTTP mode requests standard OSM street tiles.
- BASLAT.bat / start-site.ps1 provide a loopback-only Windows HTTP launcher; optional VS Code Go Live remains supported.

Data source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson
Natural Earth terms: https://www.naturalearthdata.com/about/terms-of-use/
Country boundaries are generalized at 1:110m. They are not suitable for street navigation. They reflect the source dataset's boundary representation.
Bundled library licenses: vendor/LEAFLET-LICENSE.txt, vendor/OPENLAYERS-LICENSE.txt.
Bundled font licenses: assets/fonts/DM-Sans-OFL.txt, assets/fonts/Instrument-Serif-OFL.txt.


## Version 3
Light neutral theme with lavender accents. Unfiltered standard OpenStreetMap tiles on both maps when served over HTTP. Confirmed visited cities: Barcelona, Sevilla, Amsterdam, Eindhoven, Paris. Homepage globe uses a rotating 3D orthographic sphere rendered with Canvas and bundled Natural Earth boundaries; no remote assets required for the globe. Reduced-motion settings stop automatic rotation.


## Version 4
Charcoal hero and navigation, green accents and map cards, spacious ivory content and atlas panels. Headings now use the bundled DM Sans in a regular upright style. Original OSM colours, rotating globe and the five confirmed cities are preserved.


## Version 5
Leaflet fallback geography now uses a pane below OSM tiles. Tile failures no longer remove or hide the whole OSM layer in either map. About section heading simplified.


## Version 6 — Ways of Living
The second OpenLayers map now contains 32 source-backed words, proverbs and literary or philosophical quotations. Search, theme/language/format filters and clickable clustered locations are available. Markers appear above zoom level 4; selecting an idea from the list moves to its location. Each card includes Turkish and English editorial translations, context, purpose, date evidence, the precise kind of geographic association, and a source link. Unknown origin dates remain unknown: publication and dictionary dates are explicitly distinguished from invention dates. Representative city pins are disclosed. No personal travel memories are invented.

The first Leaflet atlas and the rotating homepage globe are retained. Bundled map libraries and country geometry work offline; standard OSM street tiles require serving the site with Live Server and an internet connection.

Validation: JavaScript syntax, local links/assets, and simulated search, filtering, cluster selection, empty results, reset and tile-error persistence. Live browser rendering and network tile availability could not be verified in this environment.


## Version 7 — One collection, two journeys
`atlas.html` is the My Atlas introduction and map chooser. All top-level navigation routes My Atlas there. Both map pages include a sticky switcher linking to the collection and the other map. Homepage presents the collection as one portal. Editorial copy introduces Places & Feelings and Ways of Living.

The idea collection now has 40 entries, including Arabic patience, an Egyptian Arabic fate expression, the ancient Egyptian concept Ma’at and a transliterated Ptahhotep excerpt, Japanese Wabi-sabi and Kintsugi, Southern African Ubuntu and a Māori whakataukī. Source links, limits on dates and representative locations remain explicit. RTL text is displayed with automatic direction. No existing personal travel entries or browser-local atlas storage were replaced.

Validation: 40-entry simulated search/filter/cluster/empty-state checks, map-error persistence, local assets and hub/cross-map links. Actual browser layout and live map tile requests could not be verified.


## Version 8 — Wishlist destinations
Removed İyi ki from the idea atlas (39 entries remain). Added 19 wishlist destinations across Italy/Sicily, Norway, Portugal, Switzerland and the USA, preserving the five confirmed visits. Virginia is represented by Richmond and Shenandoah National Park; region and nature pins disclose representative locations in their notes. Added a Nature category/filter, region-appropriate focus zoom and destination source links in popups and exported records. Northern-light notes do not guarantee sightings. No personal photographs have been substituted or invented.

Checks: 24 curated records, 19 wishlist / 5 visited / 7 nature filters, local place saving, marker zoom threshold, 39-entry idea interactions and local links. Live browser rendering was not available.
