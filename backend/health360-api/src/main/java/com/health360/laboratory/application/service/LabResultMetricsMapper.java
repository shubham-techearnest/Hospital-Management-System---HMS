package com.health360.laboratory.application.service;

import com.health360.laboratory.infrastructure.persistence.entity.LabResultEntity;
import com.health360.laboratory.infrastructure.persistence.entity.LabTestParameterEntity;
import com.health360.patient.presentation.dto.request.RecordLabValuesRequest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Locale;

/**
 * Maps verified lab result rows onto the patient analytics snapshot (hemoglobin, HbA1c, lipids, …).
 */
final class LabResultMetricsMapper {

    private LabResultMetricsMapper() {
    }

    static RecordLabValuesRequest toRecordRequest(
            Instant recordedAt,
            List<LabResultEntity> results,
            List<LabTestParameterEntity> parameters) {
        RecordLabValuesRequest request = new RecordLabValuesRequest();
        request.setRecordedAt(recordedAt);

        for (LabResultEntity result : results) {
            if (result.getValueNumeric() == null) {
                continue;
            }
            LabTestParameterEntity parameter = parameters.stream()
                    .filter(p -> p.getId().equals(result.getParameterId()))
                    .findFirst()
                    .orElse(null);
            if (parameter == null) {
                continue;
            }
            apply(request, token(parameter.getCode()), token(parameter.getName()), result.getValueNumeric());
        }
        return request;
    }

    static boolean hasAnyValue(RecordLabValuesRequest request) {
        return request.getHba1c() != null
                || request.getTotalCholesterol() != null
                || request.getHdl() != null
                || request.getLdl() != null
                || request.getTriglycerides() != null
                || request.getHemoglobin() != null
                || request.getVitaminD() != null
                || request.getTsh() != null
                || request.getCreatinine() != null;
    }

    static void apply(RecordLabValuesRequest request, String codeToken, String nameToken, BigDecimal value) {
        String token = codeToken != null && !codeToken.isBlank() ? codeToken : nameToken;
        if (token == null || token.isBlank()) {
            return;
        }
        if (matches(token, "HBA1C", "A1C", "GLYCOHEMOGLOBIN")) {
            request.setHba1c(value);
        } else if (matches(token, "HEMOGLOBIN", "HAEMOGLOBIN", "HGB", "HB")) {
            request.setHemoglobin(value);
        } else if (matches(token, "HDLC", "HDL")) {
            request.setHdl(value);
        } else if (matches(token, "LDLC", "LDL")) {
            request.setLdl(value);
        } else if (matches(token, "TOTALCHOLESTEROL", "TCHOL", "CHOLESTEROL", "CHOL", "TC")) {
            request.setTotalCholesterol(value);
        } else if (matches(token, "TRIGLYCERIDES", "TRIG", "TG")) {
            request.setTriglycerides(value);
        } else if (matches(token, "TSH")) {
            request.setTsh(value);
        } else if (matches(token, "VITAMIND", "VITD3", "25OHD", "VITD")) {
            request.setVitaminD(value);
        } else if (matches(token, "CREATININE", "CREAT", "CR")) {
            request.setCreatinine(value);
        }
    }

    static String token(String raw) {
        if (raw == null) {
            return "";
        }
        return raw.replaceAll("[^A-Za-z0-9]", "").toUpperCase(Locale.ROOT);
    }

    private static boolean matches(String token, String... keys) {
        for (String key : keys) {
            if (token.equals(key) || token.contains(key)) {
                return true;
            }
        }
        return false;
    }
}
