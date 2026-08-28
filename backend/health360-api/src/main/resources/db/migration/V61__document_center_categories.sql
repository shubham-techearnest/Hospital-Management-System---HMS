-- ECO-P6: expand health document taxonomy for document center.

ALTER TABLE patient.health_documents
    DROP CONSTRAINT IF EXISTS chk_health_docs_category;

ALTER TABLE patient.health_documents
    ADD CONSTRAINT chk_health_docs_category
        CHECK (category IN (
            'LAB_REPORT', 'PRESCRIPTION', 'SCAN',
            'INVOICE', 'CERTIFICATE', 'OTHER'
        ));
