-- V93: Allow CHARGE_ENGINE invoice line source for HMS-14 attach

ALTER TABLE billing.invoice_line_items
    DROP CONSTRAINT IF EXISTS chk_invoice_line_source_type;
ALTER TABLE billing.invoice_line_items
    ADD CONSTRAINT chk_invoice_line_source_type CHECK (
        source_type IN (
            'ENCOUNTER', 'LAB_ORDER', 'MEDICATION_ORDER', 'MANUAL',
            'IPD_CHARGE', 'BED_DAY', 'NURSING', 'PROCEDURE', 'DEPOSIT',
            'CHARGE_ENGINE'
        )
    );
