package com.health360.patient.application.service;

import com.health360.patient.domain.HealthTimelineEventType;
import com.health360.patient.infrastructure.persistence.entity.LabValueRecordEntity;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.repository.LabValueRecordRepository;
import com.health360.patient.presentation.dto.request.RecordLabValuesRequest;
import com.health360.patient.presentation.dto.response.LabValueResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LabValueService {

    private final LabValueRecordRepository labValueRecordRepository;
    private final PatientProfileService patientProfileService;
    private final HealthTimelineService healthTimelineService;
    private final AuditLogService auditLogService;

    @Transactional
    public LabValueResponse recordLabValues(UUID userId, UUID tenantId, RecordLabValuesRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        validateAtLeastOneValue(request);

        LabValueRecordEntity record = new LabValueRecordEntity();
        record.setTenantId(tenantId);
        record.setPatientId(profile.getId());
        record.setHba1c(request.getHba1c());
        record.setTotalCholesterol(request.getTotalCholesterol());
        record.setHdl(request.getHdl());
        record.setLdl(request.getLdl());
        record.setTriglycerides(request.getTriglycerides());
        record.setHemoglobin(request.getHemoglobin());
        record.setVitaminD(request.getVitaminD());
        record.setTsh(request.getTsh());
        record.setCreatinine(request.getCreatinine());
        record.setRecordedAt(request.getRecordedAt());
        record.setCreatedBy(userId);

        record = labValueRecordRepository.saveAndFlush(record);
        patientProfileService.recalculateCompletionForProfile(profile);

        healthTimelineService.recordEvent(
                tenantId,
                profile.getId(),
                HealthTimelineEventType.LAB_VALUES_RECORDED,
                "Lab values recorded",
                "LabValueRecord",
                record.getId(),
                request.getRecordedAt(),
                Map.of("recordedAt", request.getRecordedAt().toString()));

        auditLogService.record(tenantId, userId, "LAB_VALUES_RECORDED", "LabValueRecord",
                record.getId(), Map.of("recordedAt", request.getRecordedAt().toString()));

        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public Page<LabValueResponse> getLabHistory(UUID userId, UUID tenantId, Pageable pageable) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        return labValueRecordRepository.findByPatientIdOrderByRecordedAtDesc(profile.getId(), pageable)
                .map(this::toResponse);
    }

    /**
     * Ingests structured values from a released hospital lab report into patient analytics history.
     * Does not require the patient user to be the actor (lab staff release).
     */
    @Transactional
    public void ingestFromLabReport(
            UUID tenantId,
            UUID patientId,
            UUID actorUserId,
            Instant recordedAt,
            RecordLabValuesRequest request) {
        if (request == null || !hasAnyValue(request)) {
            return;
        }
        LabValueRecordEntity record = new LabValueRecordEntity();
        record.setTenantId(tenantId);
        record.setPatientId(patientId);
        record.setHba1c(request.getHba1c());
        record.setTotalCholesterol(request.getTotalCholesterol());
        record.setHdl(request.getHdl());
        record.setLdl(request.getLdl());
        record.setTriglycerides(request.getTriglycerides());
        record.setHemoglobin(request.getHemoglobin());
        record.setVitaminD(request.getVitaminD());
        record.setTsh(request.getTsh());
        record.setCreatinine(request.getCreatinine());
        record.setRecordedAt(recordedAt != null ? recordedAt : Instant.now());
        record.setCreatedBy(actorUserId);

        record = labValueRecordRepository.saveAndFlush(record);

        healthTimelineService.recordEvent(
                tenantId,
                patientId,
                HealthTimelineEventType.LAB_VALUES_RECORDED,
                "Lab values from hospital report",
                "LabValueRecord",
                record.getId(),
                record.getRecordedAt(),
                Map.of("source", "LAB_REPORT"));

        auditLogService.record(tenantId, actorUserId, "LAB_VALUES_INGESTED_FROM_REPORT", "LabValueRecord",
                record.getId(), Map.of("patientId", patientId.toString()));
    }

    private boolean hasAnyValue(RecordLabValuesRequest request) {
        return request.getHba1c() != null || request.getTotalCholesterol() != null
                || request.getHdl() != null || request.getLdl() != null
                || request.getTriglycerides() != null || request.getHemoglobin() != null
                || request.getVitaminD() != null || request.getTsh() != null
                || request.getCreatinine() != null;
    }

    private void validateAtLeastOneValue(RecordLabValuesRequest request) {
        if (!hasAnyValue(request)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "At least one lab value is required");
        }
    }

    LabValueResponse toResponse(LabValueRecordEntity record) {
        return LabValueResponse.builder()
                .id(record.getId())
                .hba1c(record.getHba1c())
                .totalCholesterol(record.getTotalCholesterol())
                .hdl(record.getHdl())
                .ldl(record.getLdl())
                .triglycerides(record.getTriglycerides())
                .hemoglobin(record.getHemoglobin())
                .vitaminD(record.getVitaminD())
                .tsh(record.getTsh())
                .creatinine(record.getCreatinine())
                .recordedAt(record.getRecordedAt())
                .build();
    }
}
