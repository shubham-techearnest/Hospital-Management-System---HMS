package com.health360.ipd;

import com.health360.ipd.domain.IpdServiceKeys;
import com.health360.ipd.domain.IpdServicePresets;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class IpdServicePresetsTest {

    @Test
    void nursingHomePresetKeepsCoreAndOmitsIcu() {
        Map<String, Boolean> services = IpdServicePresets.forPreset(IpdServicePresets.NURSING_HOME);
        assertTrue(services.get(IpdServiceKeys.IPD_CORE));
        assertTrue(services.get(IpdServiceKeys.IPD_DIET));
        assertFalse(services.get(IpdServiceKeys.IPD_ICU_ESCALATION));
        assertFalse(services.get(IpdServiceKeys.IPD_OT_INTEGRATION));
    }

    @Test
    void tertiaryEnablesAllKnownKeys() {
        Map<String, Boolean> services = IpdServicePresets.forPreset(IpdServicePresets.TERTIARY);
        for (String key : IpdServiceKeys.ALL) {
            assertTrue(services.get(key), key);
        }
    }

    @Test
    void hospitalTypeHintsMaternityPreset() {
        assertEquals(IpdServicePresets.MATERNITY, IpdServicePresets.defaultPresetForHospitalType("MATERNITY"));
        assertEquals(IpdServicePresets.NURSING_HOME, IpdServicePresets.defaultPresetForHospitalType("NURSING_HOME"));
        assertEquals(IpdServicePresets.MULTI_SPECIALTY, IpdServicePresets.defaultPresetForHospitalType("GENERAL"));
    }
}
