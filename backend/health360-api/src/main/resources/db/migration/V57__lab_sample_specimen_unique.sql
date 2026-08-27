-- ECO-P3: unique specimen IDs per tenant so collected samples stay linked to one order.

CREATE UNIQUE INDEX uq_lab_samples_specimen
    ON laboratory.lab_samples (tenant_id, specimen_id)
    WHERE deleted_at IS NULL AND specimen_id IS NOT NULL;
