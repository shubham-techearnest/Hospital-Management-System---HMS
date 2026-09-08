package com.health360.ipd.domain;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public final class IpdServicePresets {

    private IpdServicePresets() {}

    public static final String NURSING_HOME = "NURSING_HOME";
    public static final String CLINIC_BEDS = "CLINIC_BEDS";
    public static final String MULTI_SPECIALTY = "MULTI_SPECIALTY";
    public static final String MATERNITY = "MATERNITY";
    public static final String TERTIARY = "TERTIARY";

    public static final List<String> ALL = List.of(
            NURSING_HOME, CLINIC_BEDS, MULTI_SPECIALTY, MATERNITY, TERTIARY);

    public static final Map<String, String> LABELS = Map.of(
            NURSING_HOME, "Nursing home / step-down",
            CLINIC_BEDS, "Clinic with inpatient beds",
            MULTI_SPECIALTY, "Multi-specialty hospital",
            MATERNITY, "Maternity hospital",
            TERTIARY, "Tertiary / hospital chain"
    );

    private static final Set<String> NURSING_HOME_ON = Set.of(
            IpdServiceKeys.IPD_CORE,
            IpdServiceKeys.IPD_PRE_ADMISSION,
            IpdServiceKeys.IPD_DIET,
            IpdServiceKeys.IPD_PHYSIO,
            IpdServiceKeys.IPD_PATIENT_PORTAL,
            IpdServiceKeys.IPD_READMISSION_TRACKING
    );

    private static final Set<String> CLINIC_BEDS_ON = Set.of(
            IpdServiceKeys.IPD_CORE,
            IpdServiceKeys.IPD_PRE_ADMISSION,
            IpdServiceKeys.IPD_OPD_ADMIT_REQUEST,
            IpdServiceKeys.IPD_DAY_CARE,
            IpdServiceKeys.IPD_INTERIM_BILLING,
            IpdServiceKeys.IPD_DEPOSIT,
            IpdServiceKeys.IPD_PATIENT_PORTAL
    );

    private static final Set<String> MATERNITY_ON = Set.of(
            IpdServiceKeys.IPD_CORE,
            IpdServiceKeys.IPD_PRE_ADMISSION,
            IpdServiceKeys.IPD_OPD_ADMIT_REQUEST,
            IpdServiceKeys.IPD_EMERGENCY_ADMIT,
            IpdServiceKeys.IPD_MATERNITY,
            IpdServiceKeys.IPD_OT_INTEGRATION,
            IpdServiceKeys.IPD_BLOOD_BANK,
            IpdServiceKeys.IPD_DIET,
            IpdServiceKeys.IPD_DEPOSIT,
            IpdServiceKeys.IPD_INTERIM_BILLING,
            IpdServiceKeys.IPD_INSURANCE_TPA,
            IpdServiceKeys.IPD_LAMA_DAMA,
            IpdServiceKeys.IPD_PATIENT_PORTAL
    );

    private static final Set<String> MULTI_SPECIALTY_ON = Set.of(
            IpdServiceKeys.IPD_CORE,
            IpdServiceKeys.IPD_PRE_ADMISSION,
            IpdServiceKeys.IPD_EMERGENCY_ADMIT,
            IpdServiceKeys.IPD_OPD_ADMIT_REQUEST,
            IpdServiceKeys.IPD_DAY_CARE,
            IpdServiceKeys.IPD_ICU_ESCALATION,
            IpdServiceKeys.IPD_OT_INTEGRATION,
            IpdServiceKeys.IPD_MATERNITY,
            IpdServiceKeys.IPD_PEDIATRIC,
            IpdServiceKeys.IPD_ISOLATION,
            IpdServiceKeys.IPD_BLOOD_BANK,
            IpdServiceKeys.IPD_PHYSIO,
            IpdServiceKeys.IPD_DIET,
            IpdServiceKeys.IPD_INSURANCE_TPA,
            IpdServiceKeys.IPD_DEPOSIT,
            IpdServiceKeys.IPD_INTERIM_BILLING,
            IpdServiceKeys.IPD_LAMA_DAMA,
            IpdServiceKeys.IPD_DEATH_WORKFLOW,
            IpdServiceKeys.IPD_READMISSION_TRACKING,
            IpdServiceKeys.IPD_PATIENT_PORTAL,
            IpdServiceKeys.IPD_MOBILE_NURSING
    );

    public static Map<String, Boolean> forPreset(String presetCode) {
        String code = normalize(presetCode);
        Set<String> enabled = switch (code) {
            case NURSING_HOME -> NURSING_HOME_ON;
            case CLINIC_BEDS -> CLINIC_BEDS_ON;
            case MATERNITY -> MATERNITY_ON;
            case TERTIARY -> Set.copyOf(IpdServiceKeys.ALL);
            default -> MULTI_SPECIALTY_ON;
        };
        Map<String, Boolean> map = IpdServiceKeys.emptyCatalog();
        for (String key : enabled) {
            map.put(key, true);
        }
        map.put(IpdServiceKeys.IPD_CORE, true);
        return map;
    }

    public static String normalize(String presetCode) {
        if (presetCode == null || presetCode.isBlank()) {
            return MULTI_SPECIALTY;
        }
        String code = presetCode.trim().toUpperCase(Locale.ROOT);
        return ALL.contains(code) ? code : MULTI_SPECIALTY;
    }

    public static String defaultPresetForHospitalType(String hospitalType) {
        if (hospitalType == null || hospitalType.isBlank()) {
            return MULTI_SPECIALTY;
        }
        String type = hospitalType.trim().toUpperCase(Locale.ROOT);
        if (type.contains("MATERN") || type.contains("WOMEN")) {
            return MATERNITY;
        }
        if (type.contains("NURS") || type.contains("CARE_HOME") || type.contains("STEP")) {
            return NURSING_HOME;
        }
        if (type.contains("CLINIC") || type.contains("DAY")) {
            return CLINIC_BEDS;
        }
        if (type.contains("TERTIARY") || type.contains("TEACH") || type.contains("CHAIN")) {
            return TERTIARY;
        }
        return MULTI_SPECIALTY;
    }

    public static Map<String, Object> defaultIndiaCountryConfig() {
        Map<String, Object> cfg = new LinkedHashMap<>();
        cfg.put("payerModes", List.of("SELF_PAY", "INSURANCE", "TPA", "CORPORATE", "GOVERNMENT"));
        cfg.put("claimModes", List.of("CASHLESS", "REIMBURSEMENT", "CO_PAY", "PACKAGE"));
        cfg.put("cashlessSupported", true);
        cfg.put("reimbursementSupported", true);
        cfg.put("coPaySupported", true);
        cfg.put("packageBillingSupported", true);
        cfg.put("requireDischargeSummary", true);
        cfg.put("requireFinancialClearanceBeforeDischarge", false);
        cfg.put("requirePreAuthWhenInsurance", false);
        cfg.put("requireDepositBeforeAdmit", false);
        cfg.put("requireDischargeMedRecon", false);
        cfg.put("requireDischargeOrderBeforeComplete", false);
        cfg.put("requireMultiDeptClearanceBeforeDischarge", false);
        cfg.put("readmissionWindowDays", 30);
        return cfg;
    }
}
