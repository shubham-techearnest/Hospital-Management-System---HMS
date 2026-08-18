-- V32: HMS-1 completion — concurrency-safe encounter number sequences

CREATE TABLE clinical.encounter_number_sequences (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    sequence_year   INTEGER NOT NULL,
    last_value      BIGINT NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_encounter_number_sequences_hospital_year
        UNIQUE (hospital_id, sequence_year)
);

CREATE INDEX idx_encounter_number_sequences_hospital
    ON clinical.encounter_number_sequences (hospital_id, sequence_year);
