package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalVitalSignEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalVitalSignRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.presentation.dto.request.RecordClinicalVitalsRequest;
import com.health360.clinical.presentation.dto.response.ClinicalVitalSignResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.patient.application.service.BpClassificationService;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ClinicalVitalsService {

    private final ClinicalVitalSignRepository vitalSignRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterAccessService accessService;
    private final BpClassificationService bpClassificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public ClinicalVitalSignResponse recordVitals(
            UserPrincipal principal, UUID encounterId, RecordClinicalVitalsRequest request) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteVitals(principal, encounter);
        validateAtLeastOneVital(request);

        if (request.getSystolicBp() != null && request.getDiastolicBp() != null
                && request.getSystolicBp() <= request.getDiastolicBp()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Systolic blood pressure must be greater than diastolic");
        }

        ClinicalVitalSignEntity entity = new ClinicalVitalSignEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setEncounterId(encounterId);
        entity.setSystolicBp(request.getSystolicBp());
        entity.setDiastolicBp(request.getDiastolicBp());
        entity.setHeartRate(request.getHeartRate());
        entity.setTemperature(request.getTemperature());
        entity.setRespiratoryRate(request.getRespiratoryRate());
        entity.setSpo2(request.getSpo2());
        entity.setBloodGlucose(request.getBloodGlucose());
        entity.setGlucoseReadingType(trimToNull(request.getGlucoseReadingType()));
        entity.setNotes(trimToNull(request.getNotes()));
        entity.setRecordedAt(request.getRecordedAt());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        ClinicalVitalSignEntity saved = vitalSignRepository.saveAndFlush(entity);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "VITALS_RECORDED", "ClinicalVitalSign", saved.getId(),
                Map.of(
                        "encounterId", encounterId.toString(),
                        "recordedAt", request.getRecordedAt().toString()));

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClinicalVitalSignResponse> listVitals(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadVitals(principal, encounter);
        return vitalSignRepository.findByEncounterIdAndDeletedAtIsNullOrderByRecordedAtDesc(encounterId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private EncounterEntity requireEncounter(UUID tenantId, UUID encounterId) {
        return encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
    }

    private void validateAtLeastOneVital(RecordClinicalVitalsRequest request) {
        boolean hasValue = request.getSystolicBp() != null || request.getDiastolicBp() != null
                || request.getHeartRate() != null || request.getTemperature() != null
                || request.getRespiratoryRate() != null || request.getSpo2() != null
                || request.getBloodGlucose() != null;
        if (!hasValue) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "At least one vital sign value is required");
        }
    }

    private ClinicalVitalSignResponse toResponse(ClinicalVitalSignEntity entity) {
        BpClassificationService.BpClassification bp = bpClassificationService.classify(
                entity.getSystolicBp(), entity.getDiastolicBp());
        return ClinicalVitalSignResponse.builder()
                .vitalSignId(entity.getId())
                .encounterId(entity.getEncounterId())
                .systolicBp(entity.getSystolicBp())
                .diastolicBp(entity.getDiastolicBp())
                .heartRate(entity.getHeartRate())
                .temperature(entity.getTemperature())
                .respiratoryRate(entity.getRespiratoryRate())
                .spo2(entity.getSpo2())
                .bloodGlucose(entity.getBloodGlucose())
                .glucoseReadingType(entity.getGlucoseReadingType())
                .notes(entity.getNotes())
                .recordedAt(entity.getRecordedAt())
                .bpClassification(bp != null ? bp.category() : null)
                .bpInterpretation(bp != null ? bp.interpretation() : null)
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
