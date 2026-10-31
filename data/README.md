# Authoritative Baguio zoning data (not bundled)

**No government zoning polygon dataset or rule matrix is bundled.** The UI will say NOT VERIFIED unless you install trustworthy, current datasets. A marker on OpenStreetMap or an OpenAI response alone does not establish a zoning designation.

To activate deterministic zoning checks, obtain a georeferenced **EPSG:4326 GeoJSON** zone polygon layer and business permitted-use matrix directly from Baguio CPDSO or a clearly authorized public data service. Validate currency and permissions with the source agency. The 2016 ordinance exists but an updated plan/ordinance was being discussed in October 2026.

Save the two files under `data/`:

- `baguio-zoning.geojson`: GeoJSON FeatureCollection with non-overlapping Polygon/MultiPolygon zone features. `features[].properties.zone` must contain an exact uppercase zone code such as `R-1`; polygons use `[longitude, latitude]`. Metadata must have **authority**, **sourceUrl** and **verifiedAt**. Only use boundaries from a reliable current source.
- `zoning-rules.json`: JSON object `{ "metadata": { "sourceUrl": "https://...", "verifiedAt": "YYYY-MM-DD", "ordinance": "..." }, "zones": { "R-1": { "label": "Low Density Residential", "businesses": { "sari_sari": { "status": "CONDITIONAL", "reason": "Accurate cited rule ...", "conditions": ["..."], "reference": "Section X of ..." } } } } }`. Only include decisions supported by cited regulations; unknown businesses/conditions remain NOT VERIFIED.

Business category IDs are declared in `src/lib/zoning-engine.ts`. Zoning codes in the two files must match. Provide rules **per business category and zone**. Reassess each rule after ordinance changes.

Do not put arbitrary polygons/rules in production just to produce a green status. The engine detects absent data, ambiguous polygons and uncatalogued uses and fails closed as NOT VERIFIED. A positive preliminary check is never a permit.

The five-step wizard can instead consume an existing **BiZ Checker official-source PDF result**, as a user-reviewed way to display an ALLOWED/CONDITIONAL/NOT ALLOWED report without making up an automatic result. The user must confirm its business/location match, and the report must be valid; a third-party uploaded PDF is not automatically authenticated by Negosyo Ready.
