-- V89: Hospital letterhead / stationery branding for clinical documents

ALTER TABLE hospital.hospitals
    ADD COLUMN IF NOT EXISTS letterhead_logo_storage_key VARCHAR(500),
    ADD COLUMN IF NOT EXISTS letterhead_logo_mime_type VARCHAR(100),
    ADD COLUMN IF NOT EXISTS letterhead_tagline VARCHAR(200),
    ADD COLUMN IF NOT EXISTS letterhead_footer_text VARCHAR(500);
