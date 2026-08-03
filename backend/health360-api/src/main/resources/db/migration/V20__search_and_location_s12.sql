-- V20: Search + location (S12) — geocode cache, permissions, branch geo backfill

CREATE SCHEMA IF NOT EXISTS location;

CREATE TABLE IF NOT EXISTS location.geocode_cache (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    normalized_address  VARCHAR(500) NOT NULL,
    latitude            DECIMAL(10, 7) NOT NULL,
    longitude           DECIMAL(10, 7) NOT NULL,
    formatted_address   VARCHAR(500),
    source              VARCHAR(30) NOT NULL DEFAULT 'DEV',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '30 days'
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_geocode_cache_address
    ON location.geocode_cache (lower(normalized_address));

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('search', 'read', 'search:read', 'Search doctors and hospitals'),
    ('location', 'read', 'location:read', 'Location-based discovery')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name = 'PATIENT'
  AND p.code IN ('search:read', 'location:read')
ON CONFLICT DO NOTHING;

-- Ensure branches have coordinates (dev geocoding fallback by city)
UPDATE hospital.branches
SET
    latitude = CASE lower(city)
        WHEN 'mumbai' THEN 19.0760900
        WHEN 'pune' THEN 18.5204300
        WHEN 'delhi' THEN 28.6139390
        WHEN 'bangalore' THEN 12.9715990
        WHEN 'bengaluru' THEN 12.9715990
        WHEN 'hyderabad' THEN 17.3850440
        WHEN 'chennai' THEN 13.0826800
        ELSE 19.0760900
    END,
    longitude = CASE lower(city)
        WHEN 'mumbai' THEN 72.8774260
        WHEN 'pune' THEN 73.8567430
        WHEN 'delhi' THEN 77.2090230
        WHEN 'bangalore' THEN 77.5945660
        WHEN 'bengaluru' THEN 77.5945660
        WHEN 'hyderabad' THEN 78.4866710
        WHEN 'chennai' THEN 80.2707210
        ELSE 72.8774260
    END,
    updated_at = NOW()
WHERE deleted_at IS NULL
  AND (latitude IS NULL OR longitude IS NULL OR latitude = 0 OR longitude = 0);
