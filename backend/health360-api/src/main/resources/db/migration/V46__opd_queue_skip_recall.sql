-- V46: P2-F2 — OPD queue SKIPPED status + skip/recall timestamps

ALTER TABLE opd.queue_entries DROP CONSTRAINT IF EXISTS chk_opd_queue_status;
ALTER TABLE opd.queue_entries ADD CONSTRAINT chk_opd_queue_status
    CHECK (status IN (
        'WAITING', 'CALLED', 'IN_SERVICE', 'COMPLETED',
        'CANCELLED', 'NO_SHOW', 'SKIPPED'
    ));

ALTER TABLE opd.queue_entries
    ADD COLUMN IF NOT EXISTS skipped_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS skip_reason VARCHAR(500),
    ADD COLUMN IF NOT EXISTS recalled_at TIMESTAMPTZ;
