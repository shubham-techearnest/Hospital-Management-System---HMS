-- Align fixed-length CHAR columns with JPA VARCHAR mapping (Hibernate ddl-auto=validate).
-- Follows the same approach as V4 for patient country/nationality columns.

ALTER TABLE doctor.consultation_defaults
    ALTER COLUMN currency TYPE VARCHAR(3) USING TRIM(currency)::VARCHAR(3);

ALTER TABLE doctor.qualifications
    ALTER COLUMN country TYPE VARCHAR(2) USING TRIM(country)::VARCHAR(2);

ALTER TABLE doctor.doctor_languages
    ALTER COLUMN language_code TYPE VARCHAR(2) USING TRIM(language_code)::VARCHAR(2);

ALTER TABLE hospital.branches
    ALTER COLUMN country TYPE VARCHAR(2) USING TRIM(country)::VARCHAR(2);
