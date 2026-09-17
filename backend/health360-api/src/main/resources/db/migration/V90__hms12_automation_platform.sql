-- V90: HMS-12 Automation Platform — events projection, tasks, workflows, approvals
-- Beds remain in ipd.*; ADT is a service facade (no new bed tables).

CREATE SCHEMA IF NOT EXISTS automation;
CREATE SCHEMA IF NOT EXISTS tasks;
CREATE SCHEMA IF NOT EXISTS workflow;

-- =============================================================================
-- Hospital events (rich projection; outbox remains source for publish retry)
-- =============================================================================

CREATE TABLE automation.hospital_events (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id        UUID NOT NULL,
    hospital_id      UUID,
    branch_id        UUID,
    event_type       VARCHAR(100) NOT NULL,
    patient_id       UUID,
    encounter_id     UUID,
    user_id          UUID,
    entity_type      VARCHAR(100) NOT NULL,
    entity_id        UUID NOT NULL,
    correlation_id   UUID,
    source_module    VARCHAR(50) NOT NULL,
    payload          JSONB NOT NULL DEFAULT '{}'::jsonb,
    occurred_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by       UUID,
    updated_by       UUID,
    deleted_at       TIMESTAMPTZ,
    version          BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_automation_events_hospital_occurred
    ON automation.hospital_events (hospital_id, occurred_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_automation_events_type_occurred
    ON automation.hospital_events (tenant_id, event_type, occurred_at DESC)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_automation_events_correlation
    ON automation.hospital_events (correlation_id)
    WHERE correlation_id IS NOT NULL AND deleted_at IS NULL;

-- =============================================================================
-- Universal tasks (My Work)
-- =============================================================================

CREATE TABLE tasks.work_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           UUID NOT NULL,
    hospital_id         UUID NOT NULL,
    branch_id           UUID,
    department_id       UUID,
    task_type           VARCHAR(60) NOT NULL,
    title               VARCHAR(200) NOT NULL,
    description         TEXT,
    priority            VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status              VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    patient_id          UUID,
    encounter_id        UUID,
    asset_id            UUID,
    assigned_user_id    UUID,
    assigned_role       VARCHAR(50),
    created_by_user_id  UUID,
    source_event_id     UUID,
    source_event_type   VARCHAR(100),
    source_entity_type  VARCHAR(100),
    source_entity_id    UUID,
    due_at              TIMESTAMPTZ,
    started_at          TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    escalation_level    INTEGER NOT NULL DEFAULT 0,
    escalation_deadline TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by          UUID,
    updated_by          UUID,
    deleted_at          TIMESTAMPTZ,
    version             BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_tasks_priority CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    CONSTRAINT chk_tasks_status CHECK (
        status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED', 'COMPLETED', 'CANCELLED')
    )
);

CREATE INDEX idx_tasks_my_work
    ON tasks.work_items (hospital_id, assigned_user_id, status, due_at)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_role_queue
    ON tasks.work_items (hospital_id, assigned_role, status, due_at)
    WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_type_status
    ON tasks.work_items (tenant_id, task_type, status)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- Workflow definitions + instances (v1 skeleton)
-- =============================================================================

CREATE TABLE workflow.definitions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID NOT NULL,
    workflow_key    VARCHAR(100) NOT NULL,
    name            VARCHAR(200) NOT NULL,
    version_no      INTEGER NOT NULL DEFAULT 1,
    active          BOOLEAN NOT NULL DEFAULT TRUE,
    definition_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by      UUID,
    updated_by      UUID,
    deleted_at      TIMESTAMPTZ,
    version         BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX uq_workflow_def_key_ver
    ON workflow.definitions (tenant_id, workflow_key, version_no)
    WHERE deleted_at IS NULL;

CREATE TABLE workflow.instances (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    hospital_id       UUID,
    definition_id     UUID NOT NULL REFERENCES workflow.definitions (id),
    workflow_key      VARCHAR(100) NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'RUNNING',
    entity_type       VARCHAR(100) NOT NULL,
    entity_id         UUID NOT NULL,
    current_step_key  VARCHAR(100),
    context_json      JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by        UUID,
    updated_by        UUID,
    deleted_at        TIMESTAMPTZ,
    version           BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_workflow_instance_status CHECK (
        status IN ('RUNNING', 'WAITING_APPROVAL', 'COMPLETED', 'CANCELLED', 'FAILED')
    )
);

CREATE INDEX idx_workflow_instances_entity
    ON workflow.instances (entity_type, entity_id)
    WHERE deleted_at IS NULL;

-- =============================================================================
-- Approvals (v1)
-- =============================================================================

CREATE TABLE automation.approval_requests (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id         UUID NOT NULL,
    hospital_id       UUID NOT NULL,
    approval_type     VARCHAR(60) NOT NULL,
    status            VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    entity_type       VARCHAR(100) NOT NULL,
    entity_id         UUID NOT NULL,
    requested_by      UUID NOT NULL,
    decided_by        UUID,
    decided_at        TIMESTAMPTZ,
    decision_note     TEXT,
    amount_limit      NUMERIC(14, 2),
    payload           JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by        UUID,
    updated_by        UUID,
    deleted_at        TIMESTAMPTZ,
    version           BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_approval_status CHECK (
        status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')
    )
);

CREATE INDEX idx_approval_pending
    ON automation.approval_requests (hospital_id, status, created_at DESC)
    WHERE deleted_at IS NULL;

-- Seed a default discharge housekeeping workflow definition (global tenant)
INSERT INTO workflow.definitions (tenant_id, workflow_key, name, version_no, active, definition_json)
SELECT
    t.id,
    'DISCHARGE_HOUSEKEEPING',
    'Post-discharge bed cleaning',
    1,
    TRUE,
    '{"steps":[{"key":"CREATE_CLEAN_TASK","action":"CREATE_TASK","taskType":"HOUSEKEEPING_BED_CLEAN"}]}'::jsonb
FROM shared.tenants t
WHERE t.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1 FROM workflow.definitions d
      WHERE d.tenant_id = t.id AND d.workflow_key = 'DISCHARGE_HOUSEKEEPING' AND d.deleted_at IS NULL
  );

-- =============================================================================
-- Permissions + feature flag
-- =============================================================================

INSERT INTO iam.permissions (resource, action, code, description)
VALUES
    ('tasks', 'read', 'tasks:read', 'View My Work / task queues'),
    ('tasks', 'write', 'tasks:write', 'Update and complete tasks'),
    ('workflow', 'read', 'workflow:read', 'View workflow instances'),
    ('workflow', 'write', 'workflow:write', 'Manage workflow definitions'),
    ('approvals', 'read', 'approvals:read', 'View approval requests'),
    ('approvals', 'write', 'approvals:write', 'Decide approval requests'),
    ('automation', 'read', 'automation:read', 'View automation events')
ON CONFLICT (code) DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN', 'NURSE', 'ICU_NURSE', 'LAB_TECHNICIAN', 'RECEPTIONIST', 'PHARMACIST')
  AND p.code IN ('tasks:read', 'tasks:write')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('HOSPITAL_ADMIN', 'PLATFORM_ADMIN')
  AND p.code IN ('workflow:read', 'workflow:write', 'approvals:read', 'approvals:write', 'automation:read')
ON CONFLICT DO NOTHING;

INSERT INTO iam.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM iam.roles r
CROSS JOIN iam.permissions p
WHERE r.name IN ('DOCTOR')
  AND p.code IN ('tasks:read', 'tasks:write', 'approvals:read')
ON CONFLICT DO NOTHING;

INSERT INTO shared.subscription_plan_features (tenant_id, plan_id, feature_key, enabled)
SELECT p.tenant_id, p.id, 'FEATURE_AUTOMATION_PLATFORM', TRUE
FROM shared.subscription_plans p
WHERE p.deleted_at IS NULL
  AND p.status = 'ACTIVE'
  AND NOT EXISTS (
      SELECT 1
      FROM shared.subscription_plan_features f
      WHERE f.plan_id = p.id
        AND f.feature_key = 'FEATURE_AUTOMATION_PLATFORM'
        AND f.deleted_at IS NULL
  );
