-- ECO-P5: follow-up reminder dispatch tracking + approaching type reserved in app enum.

ALTER TABLE clinical.followups
    ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_followups_pending_date
    ON clinical.followups (follow_up_date)
    WHERE deleted_at IS NULL AND status = 'PENDING' AND reminder_sent_at IS NULL;
