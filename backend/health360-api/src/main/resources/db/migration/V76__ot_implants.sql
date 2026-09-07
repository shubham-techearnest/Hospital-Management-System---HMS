-- G7: OT implant tracking
CREATE TABLE IF NOT EXISTS ot.ot_implants (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    procedure_id    UUID NOT NULL REFERENCES ot.ot_procedures (id),
    implant_name    VARCHAR(200) NOT NULL,
    implant_type    VARCHAR(100),
    manufacturer    VARCHAR(200),
    lot_number      VARCHAR(100),
    serial_number   VARCHAR(100),
    quantity        INTEGER NOT NULL DEFAULT 1,
    implanted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_ot_implant_qty CHECK (quantity > 0)
);

CREATE INDEX IF NOT EXISTS idx_ot_implants_procedure
    ON ot.ot_implants (procedure_id)
    WHERE deleted_at IS NULL;
