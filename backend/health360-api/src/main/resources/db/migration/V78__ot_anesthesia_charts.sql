-- G7: OT anesthesia chart MVP
CREATE TABLE IF NOT EXISTS ot.ot_anesthesia_charts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL REFERENCES shared.tenants (id),
    procedure_id        UUID NOT NULL REFERENCES ot.ot_procedures (id),
    asa_class           VARCHAR(10),
    anesthesia_type     VARCHAR(30) NOT NULL,
    induction_agent     VARCHAR(200),
    airway_device       VARCHAR(100),
    started_at          TIMESTAMPTZ,
    ended_at            TIMESTAMPTZ,
    complications       TEXT,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_anesthesia_type CHECK (
        anesthesia_type IN ('GENERAL', 'REGIONAL', 'LOCAL', 'SEDATION', 'COMBINED')
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_ot_anesthesia_chart_procedure
    ON ot.ot_anesthesia_charts (procedure_id)
    WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS ot.ot_anesthesia_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    procedure_id    UUID NOT NULL REFERENCES ot.ot_procedures (id),
    chart_id        UUID NOT NULL REFERENCES ot.ot_anesthesia_charts (id),
    event_type      VARCHAR(40) NOT NULL,
    recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    systolic_bp     INTEGER,
    diastolic_bp    INTEGER,
    pulse           INTEGER,
    spo2            INTEGER,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_anesthesia_event_type CHECK (
        event_type IN ('VITALS', 'INDUCTION', 'INTUBATION', 'EXTUBATION', 'DRUG', 'OTHER')
    )
);

CREATE INDEX IF NOT EXISTS idx_ot_anesthesia_events_procedure
    ON ot.ot_anesthesia_events (procedure_id, recorded_at)
    WHERE deleted_at IS NULL;
