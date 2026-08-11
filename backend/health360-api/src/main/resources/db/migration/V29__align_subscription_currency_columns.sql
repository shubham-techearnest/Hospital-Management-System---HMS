-- V29: Align subscription currency columns with JPA (VARCHAR) for Hibernate schema validation

ALTER TABLE shared.subscription_plans
    ALTER COLUMN currency TYPE VARCHAR(3);

ALTER TABLE hospital.hospital_subscriptions
    ALTER COLUMN currency TYPE VARCHAR(3);
