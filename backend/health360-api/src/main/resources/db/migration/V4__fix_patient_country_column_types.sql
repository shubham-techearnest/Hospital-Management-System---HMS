-- Align country/nationality columns with JPA VARCHAR mapping (Hibernate schema validation)
ALTER TABLE patient.patient_profiles
    ALTER COLUMN nationality TYPE VARCHAR(2) USING nationality::VARCHAR(2),
    ALTER COLUMN permanent_country TYPE VARCHAR(2) USING permanent_country::VARCHAR(2),
    ALTER COLUMN current_country TYPE VARCHAR(2) USING current_country::VARCHAR(2);
