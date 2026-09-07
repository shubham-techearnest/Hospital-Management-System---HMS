-- Align saas invoice sequence table with JPA @Version on SaasInvoiceNumberSequenceEntity
ALTER TABLE billing.saas_invoice_number_sequences
    ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
