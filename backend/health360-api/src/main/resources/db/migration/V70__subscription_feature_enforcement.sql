-- V70: Enable billing on all active plans so OPD checkout stays available when FEATURE_BILLING is enforced.

UPDATE shared.subscription_plan_features f
SET enabled = TRUE,
    updated_at = NOW()
WHERE f.feature_key = 'FEATURE_BILLING'
  AND f.deleted_at IS NULL
  AND f.enabled = FALSE;
