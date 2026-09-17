-- V103: HMS-24 production hardening
-- Overdue-task escalation index, charge encounter lookup, RX_DISPENSE catalog seed.

CREATE INDEX IF NOT EXISTS idx_work_items_overdue_escalation
    ON tasks.work_items (due_at, escalation_deadline)
    WHERE deleted_at IS NULL
      AND status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'BLOCKED')
      AND due_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_charge_postings_encounter
    ON billing.charge_postings (encounter_id, created_at DESC)
    WHERE deleted_at IS NULL AND encounter_id IS NOT NULL;

INSERT INTO billing.service_catalog_items (tenant_id, code, name, category, trigger_event_type, active)
SELECT DISTINCT h.tenant_id, v.code, v.name, v.category, v.trigger_event_type, TRUE
FROM hospital.hospitals h
CROSS JOIN (VALUES
    ('RX_DISPENSE', 'Pharmacy dispense fee', 'PHARMACY', 'MEDICATION_DISPENSED')
) AS v(code, name, category, trigger_event_type)
WHERE h.deleted_at IS NULL
  AND NOT EXISTS (
      SELECT 1 FROM billing.service_catalog_items c
      WHERE c.tenant_id = h.tenant_id AND c.code = v.code AND c.deleted_at IS NULL
  );

INSERT INTO billing.price_list_items (tenant_id, hospital_id, catalog_item_id, currency, unit_price, active)
SELECT c.tenant_id, h.id, c.id, 'INR', 150.00, TRUE
FROM hospital.hospitals h
JOIN billing.service_catalog_items c ON c.tenant_id = h.tenant_id AND c.deleted_at IS NULL
WHERE h.deleted_at IS NULL
  AND c.code = 'RX_DISPENSE'
  AND NOT EXISTS (
      SELECT 1 FROM billing.price_list_items p
      WHERE p.hospital_id = h.id AND p.catalog_item_id = c.id AND p.deleted_at IS NULL
  );
