-- ECO-P2: encounter wellness plans (diet/rest/exercise/lifestyle) linked to clinical.encounters.
-- clinical.followups already exists (V30); Java wiring only for follow-up dates.

CREATE TABLE clinical.encounter_wellness_plans (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    encounter_id    UUID NOT NULL REFERENCES clinical.encounters (id),
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    hospital_id     UUID NOT NULL REFERENCES hospital.hospitals (id),
    branch_id       UUID NOT NULL REFERENCES hospital.branches (id),
    diet            TEXT,
    rest_guidance   TEXT,
    exercise        TEXT,
    lifestyle       TEXT,
    notes           TEXT,
    follow_up_date  DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT uq_encounter_wellness_plan UNIQUE (encounter_id)
);

CREATE INDEX idx_wellness_plans_patient
    ON clinical.encounter_wellness_plans (patient_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_wellness_plans_follow_up
    ON clinical.encounter_wellness_plans (follow_up_date)
    WHERE deleted_at IS NULL AND follow_up_date IS NOT NULL;
