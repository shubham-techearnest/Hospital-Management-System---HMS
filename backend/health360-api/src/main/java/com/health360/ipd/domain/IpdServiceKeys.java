package com.health360.ipd.domain;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Hospital-selectable IPD capabilities (Phase I0).
 * Plan entitlement {@code FEATURE_IPD} gates the module; these keys gate workflows inside IPD.
 */
public final class IpdServiceKeys {

    private IpdServiceKeys() {}

    public static final String IPD_CORE = "IPD_CORE";
    public static final String IPD_PRE_ADMISSION = "IPD_PRE_ADMISSION";
    public static final String IPD_EMERGENCY_ADMIT = "IPD_EMERGENCY_ADMIT";
    public static final String IPD_OPD_ADMIT_REQUEST = "IPD_OPD_ADMIT_REQUEST";
    public static final String IPD_DAY_CARE = "IPD_DAY_CARE";
    public static final String IPD_ICU_ESCALATION = "IPD_ICU_ESCALATION";
    public static final String IPD_OT_INTEGRATION = "IPD_OT_INTEGRATION";
    public static final String IPD_MATERNITY = "IPD_MATERNITY";
    public static final String IPD_PEDIATRIC = "IPD_PEDIATRIC";
    public static final String IPD_ONCOLOGY = "IPD_ONCOLOGY";
    public static final String IPD_ISOLATION = "IPD_ISOLATION";
    public static final String IPD_BLOOD_BANK = "IPD_BLOOD_BANK";
    public static final String IPD_PHYSIO = "IPD_PHYSIO";
    public static final String IPD_DIET = "IPD_DIET";
    public static final String IPD_INSURANCE_TPA = "IPD_INSURANCE_TPA";
    public static final String IPD_DEPOSIT = "IPD_DEPOSIT";
    public static final String IPD_INTERIM_BILLING = "IPD_INTERIM_BILLING";
    public static final String IPD_LAMA_DAMA = "IPD_LAMA_DAMA";
    public static final String IPD_DEATH_WORKFLOW = "IPD_DEATH_WORKFLOW";
    public static final String IPD_READMISSION_TRACKING = "IPD_READMISSION_TRACKING";
    public static final String IPD_PATIENT_PORTAL = "IPD_PATIENT_PORTAL";
    public static final String IPD_MOBILE_NURSING = "IPD_MOBILE_NURSING";

    public static final List<String> ALL = List.of(
            IPD_CORE,
            IPD_PRE_ADMISSION,
            IPD_EMERGENCY_ADMIT,
            IPD_OPD_ADMIT_REQUEST,
            IPD_DAY_CARE,
            IPD_ICU_ESCALATION,
            IPD_OT_INTEGRATION,
            IPD_MATERNITY,
            IPD_PEDIATRIC,
            IPD_ONCOLOGY,
            IPD_ISOLATION,
            IPD_BLOOD_BANK,
            IPD_PHYSIO,
            IPD_DIET,
            IPD_INSURANCE_TPA,
            IPD_DEPOSIT,
            IPD_INTERIM_BILLING,
            IPD_LAMA_DAMA,
            IPD_DEATH_WORKFLOW,
            IPD_READMISSION_TRACKING,
            IPD_PATIENT_PORTAL,
            IPD_MOBILE_NURSING
    );

    public static final Map<String, String> LABELS = Map.ofEntries(
            Map.entry(IPD_CORE, "Inpatient core (admit / beds / discharge)"),
            Map.entry(IPD_PRE_ADMISSION, "Pre-admission & scheduling"),
            Map.entry(IPD_EMERGENCY_ADMIT, "Emergency admission source"),
            Map.entry(IPD_OPD_ADMIT_REQUEST, "OPD → IPD admission request"),
            Map.entry(IPD_DAY_CARE, "Day-care / observation"),
            Map.entry(IPD_ICU_ESCALATION, "ICU / HDU escalation"),
            Map.entry(IPD_OT_INTEGRATION, "OT / planned surgery link"),
            Map.entry(IPD_MATERNITY, "Maternity pathways"),
            Map.entry(IPD_PEDIATRIC, "Pediatric pathways"),
            Map.entry(IPD_ONCOLOGY, "Oncology pathways"),
            Map.entry(IPD_ISOLATION, "Isolation / infection control"),
            Map.entry(IPD_BLOOD_BANK, "Blood / transfusion"),
            Map.entry(IPD_PHYSIO, "Physiotherapy orders"),
            Map.entry(IPD_DIET, "Diet orders"),
            Map.entry(IPD_INSURANCE_TPA, "Insurance / TPA / cashless"),
            Map.entry(IPD_DEPOSIT, "Admission deposit"),
            Map.entry(IPD_INTERIM_BILLING, "Interim / daily charges"),
            Map.entry(IPD_LAMA_DAMA, "LAMA / DAMA workflow"),
            Map.entry(IPD_DEATH_WORKFLOW, "Death / mortuary workflow"),
            Map.entry(IPD_READMISSION_TRACKING, "Readmission tracking"),
            Map.entry(IPD_PATIENT_PORTAL, "Patient portal IPD views"),
            Map.entry(IPD_MOBILE_NURSING, "Mobile nursing charting")
    );

    public static Map<String, Boolean> emptyCatalog() {
        Map<String, Boolean> map = new LinkedHashMap<>();
        for (String key : ALL) {
            map.put(key, false);
        }
        return map;
    }
}
