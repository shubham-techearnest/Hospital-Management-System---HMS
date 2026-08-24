-- V53: Add optimistic-lock version columns for hospital clinical catalogs
-- (required by BaseAuditableEntity; omitted from V52)

ALTER TABLE hospital.symptom_catalog
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

ALTER TABLE hospital.dosage_templates
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
