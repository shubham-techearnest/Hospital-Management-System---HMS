-- V50: Portal activation invites for desk-registered patients (SMS deferred; log link for now)

CREATE TABLE patient.portal_invite_tokens (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL REFERENCES shared.tenants (id),
    patient_id      UUID NOT NULL REFERENCES patient.patient_profiles (id),
    user_id         UUID NOT NULL REFERENCES iam.users (id),
    token_hash      VARCHAR(64) NOT NULL,
    expires_at      TIMESTAMPTZ NOT NULL,
    used_at         TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    CONSTRAINT uq_portal_invite_token_hash UNIQUE (token_hash)
);

CREATE INDEX idx_portal_invite_patient
    ON patient.portal_invite_tokens (patient_id, created_at DESC)
    WHERE used_at IS NULL;
