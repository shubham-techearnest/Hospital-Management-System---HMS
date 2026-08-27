package com.health360.laboratory.application.service;

import com.health360.laboratory.infrastructure.persistence.entity.LabResultEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabTestParameterEntity;
import com.health360.patient.presentation.dto.request.RecordLabValuesRequest;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LabResultMetricsMapperTest {

    @Test
    void mapsHemoglobinAndLipidsByParameterCode() {
        UUID hbParam = UUID.fromString("00000000-0000-0000-0000-000000000001");
        UUID ldlParam = UUID.fromString("00000000-0000-0000-0000-000000000002");

        LabTestParameterEntity hb = new LabTestParameterEntity();
        hb.setId(hbParam);
        hb.setCode("HB");
        hb.setName("Hemoglobin");

        LabTestParameterEntity ldl = new LabTestParameterEntity();
        ldl.setId(ldlParam);
        ldl.setCode("LDL");
        ldl.setName("LDL Cholesterol");

        LabResultEntity hbResult = new LabResultEntity();
        hbResult.setParameterId(hbParam);
        hbResult.setValueNumeric(new BigDecimal("13.2"));

        LabResultEntity ldlResult = new LabResultEntity();
        ldlResult.setParameterId(ldlParam);
        ldlResult.setValueNumeric(new BigDecimal("98"));

        RecordLabValuesRequest request = LabResultMetricsMapper.toRecordRequest(
                Instant.parse("2026-08-25T10:00:00Z"),
                List.of(hbResult, ldlResult),
                List.of(hb, ldl));

        assertTrue(LabResultMetricsMapper.hasAnyValue(request));
        assertEquals(new BigDecimal("13.2"), request.getHemoglobin());
        assertEquals(new BigDecimal("98"), request.getLdl());
    }
}
