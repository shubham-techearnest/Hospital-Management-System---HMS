-- V85: Phase I7 — Discharge planning, order, clearances, LAMA/death/transfer-out, bed turnaround

-- Discharge planning (EDD / readiness) while still ADMITTED
CREATE TABLE ipd.discharge_plans (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id            UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id            UUID NOT NULL REFERENCES clinical.encounters (id),
    expected_discharge_at   TIMESTAMPTZ,
    readiness               VARCHAR(30) NOT NULL DEFAULT 'NOT_READY',
    pending_results_json    TEXT,
    barriers                TEXT,
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_ipd_discharge_plan_admission UNIQUE (admission_id),
    CONSTRAINT chk_ipd_discharge_readiness CHECK (
        readiness IN ('NOT_READY', 'CONDITIONALLY_READY', 'READY')
    )
);

-- Discharge order (clinical intent) — does NOT flip admission status
CREATE TABLE ipd.discharge_orders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    ordered_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ordered_by      UUID NOT NULL,
    notes           TEXT,
    status          VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ipd_discharge_order_status CHECK (
        status IN ('ACTIVE', 'CANCELLED', 'COMPLETED')
    )
);

CREATE INDEX idx_ipd_discharge_orders_admission
    ON ipd.discharge_orders (admission_id, ordered_at DESC)
    WHERE deleted_at IS NULL;

-- Versioned / typed discharge summaries
ALTER TABLE ipd.discharge_summaries
    ADD COLUMN IF NOT EXISTS discharge_type VARCHAR(30) NOT NULL DEFAULT 'ROUTINE',
    ADD COLUMN IF NOT EXISTS version_no INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN IF NOT EXISTS summary_status VARCHAR(20) NOT NULL DEFAULT 'FINAL',
    ADD COLUMN IF NOT EXISTS diagnosis_text TEXT,
    ADD COLUMN IF NOT EXISTS medications_text TEXT,
    ADD COLUMN IF NOT EXISTS advice_text TEXT,
    ADD COLUMN IF NOT EXISTS structured_json TEXT;

DROP INDEX IF EXISTS ipd.uq_ipd_discharge_admission;

CREATE UNIQUE INDEX uq_ipd_discharge_admission_version
    ON ipd.discharge_summaries (admission_id, version_no)
    WHERE deleted_at IS NULL;

ALTER TABLE ipd.discharge_summaries
    DROP CONSTRAINT IF EXISTS chk_ipd_discharge_type;
ALTER TABLE ipd.discharge_summaries
    ADD CONSTRAINT chk_ipd_discharge_type CHECK (
        discharge_type IN (
            'ROUTINE', 'LAMA', 'DAMA', 'DEATH', 'TRANSFER_OUT', 'ABSCONDED'
        )
    );

ALTER TABLE ipd.discharge_summaries
    DROP CONSTRAINT IF EXISTS chk_ipd_discharge_summary_status;
ALTER TABLE ipd.discharge_summaries
    ADD CONSTRAINT chk_ipd_discharge_summary_status CHECK (
        summary_status IN ('DRAFT', 'FINAL')
    );

-- Multi-dept clearance checklist
CREATE TABLE ipd.discharge_clearances (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id    UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    clearance_type  VARCHAR(30) NOT NULL,
    status          VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    cleared_at      TIMESTAMPTZ,
    cleared_by      UUID,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_ipd_discharge_clearance UNIQUE (admission_id, clearance_type),
    CONSTRAINT chk_ipd_clearance_type CHECK (
        clearance_type IN ('CLINICAL', 'NURSING', 'PHARMACY', 'LAB', 'BILLING', 'PAYER')
    ),
    CONSTRAINT chk_ipd_clearance_status CHECK (
        status IN ('PENDING', 'CLEARED', 'WAIVED', 'BLOCKED')
    )
);

CREATE INDEX idx_ipd_discharge_clearances_admission
    ON ipd.discharge_clearances (admission_id)
    WHERE deleted_at IS NULL;

-- Death workflow (country-pack fields)
CREATE TABLE ipd.death_records (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id         UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id        UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id        UUID NOT NULL REFERENCES clinical.encounters (id),
    pronounced_at       TIMESTAMPTZ NOT NULL,
    cause_of_death      TEXT,
    certified_by_name   VARCHAR(200),
    certified_by_id     UUID,
    place_of_death      VARCHAR(100),
    mortuary_notes      TEXT,
    country_fields_json TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_ipd_death_admission UNIQUE (admission_id)
);

-- Transfer-out to another hospital
CREATE TABLE ipd.transfer_out_records (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               UUID NOT NULL REFERENCES shared.tenants (id),
    hospital_id             UUID NOT NULL REFERENCES hospital.hospitals (id),
    admission_id            UUID NOT NULL REFERENCES ipd.admissions (id),
    encounter_id            UUID NOT NULL REFERENCES clinical.encounters (id),
    destination_name        VARCHAR(300) NOT NULL,
    destination_hospital_id UUID,
    reason                  TEXT,
    accepting_physician     VARCHAR(200),
    transferred_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    transport_mode          VARCHAR(50),
    notes                   TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by              UUID,
    updated_by              UUID,
    deleted_at              TIMESTAMPTZ,
    version                 BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_ipd_transfer_out_admission UNIQUE (admission_id)
);

-- Bed turnaround metadata (I7.9)
ALTER TABLE ipd.beds
    ADD COLUMN IF NOT EXISTS cleaning_started_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cleaned_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS cleaned_by UUID;
