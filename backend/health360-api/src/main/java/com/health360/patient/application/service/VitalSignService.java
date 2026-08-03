package com.health360.patient.application.service;

import com.health360.patient.domain.HealthTimelineEventType;
import com.health360.patient.infrastructure.persistence.entity.PatientProfileEntity;
import com.health360.patient.infrastructure.persistence.entity.VitalSignRecordEntity;
import com.health360.patient.infrastructure.persistence.repository.PatientProfileRepository;
import com.health360.patient.infrastructure.persistence.repository.VitalSignRecordRepository;
import com.health360.patient.presentation.dto.request.RecordVitalSignsRequest;
import com.health360.patient.presentation.dto.response.VitalSignResponse;
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
public class VitalSignService {

    private final VitalSignRecordRepository vitalSignRecordRepository;
    private final BpClassificationService bpClassificationService;
    private final PatientProfileService patientProfileService;
    private final HealthTimelineService healthTimelineService;
    private final AuditLogService auditLogService;

    @Transactional
    public VitalSignResponse recordVitals(UUID userId, UUID tenantId, RecordVitalSignsRequest request) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        validateAtLeastOneVital(request);

        if (request.getSystolicBp() != null && request.getDiastolicBp() != null
                && request.getSystolicBp() <= request.getDiastolicBp()) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Systolic blood pressure must be greater than diastolic");
        }

        VitalSignRecordEntity record = new VitalSignRecordEntity();
        record.setTenantId(tenantId);
        record.setPatientId(profile.getId());
        record.setSystolicBp(request.getSystolicBp());
        record.setDiastolicBp(request.getDiastolicBp());
        record.setHeartRate(request.getHeartRate());
        record.setTemperature(request.getTemperature());
        record.setRespiratoryRate(request.getRespiratoryRate());
        record.setSpo2(request.getSpo2());
        record.setBloodGlucose(request.getBloodGlucose());
        record.setGlucoseReadingType(request.getGlucoseReadingType());
        record.setRecordedAt(request.getRecordedAt());
        record.setCreatedBy(userId);

        record = vitalSignRecordRepository.saveAndFlush(record);
        patientProfileService.recalculateCompletionForProfile(profile);

        healthTimelineService.recordEvent(
                tenantId,
                profile.getId(),
                HealthTimelineEventType.VITALS_RECORDED,
                "Vital signs recorded",
                "VitalSignRecord",
                record.getId(),
                request.getRecordedAt(),
                Map.of("recordedAt", request.getRecordedAt().toString()));

        auditLogService.record(tenantId, userId, "VITALS_RECORDED", "VitalSignRecord",
                record.getId(), Map.of("recordedAt", request.getRecordedAt().toString()));

        return toResponse(record);
    }

    @Transactional(readOnly = true)
    public Page<VitalSignResponse> getVitalsHistory(
            UUID userId, UUID tenantId, Instant fromDate, Instant toDate, Pageable pageable) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        Page<VitalSignRecordEntity> page;
        if (fromDate != null && toDate != null) {
            page = vitalSignRecordRepository.findByPatientIdAndRecordedAtBetweenOrderByRecordedAtDesc(
                    profile.getId(), fromDate, toDate, pageable);
        } else {
            page = vitalSignRecordRepository.findByPatientIdOrderByRecordedAtDesc(profile.getId(), pageable);
        }
        return page.map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public VitalSignResponse getLatestVitals(UUID userId, UUID tenantId) {
        PatientProfileEntity profile = patientProfileService.requireConsentedProfile(userId, tenantId);
        return vitalSignRecordRepository.findFirstByPatientIdOrderByRecordedAtDesc(profile.getId())
                .map(this::toResponse)
                .orElse(null);
    }

    private void validateAtLeastOneVital(RecordVitalSignsRequest request) {
        boolean hasValue = request.getSystolicBp() != null || request.getDiastolicBp() != null
                || request.getHeartRate() != null || request.getTemperature() != null
                || request.getRespiratoryRate() != null || request.getSpo2() != null
                || request.getBloodGlucose() != null;
        if (!hasValue) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "At least one vital sign value is required");
        }
    }

    VitalSignResponse toResponse(VitalSignRecordEntity record) {
        BpClassificationService.BpClassification bp = bpClassificationService.classify(
                record.getSystolicBp(), record.getDiastolicBp());
        return VitalSignResponse.builder()
                .id(record.getId())
                .systolicBp(record.getSystolicBp())
                .diastolicBp(record.getDiastolicBp())
                .heartRate(record.getHeartRate())
                .temperature(record.getTemperature())
                .respiratoryRate(record.getRespiratoryRate())
                .spo2(record.getSpo2())
                .bloodGlucose(record.getBloodGlucose())
                .glucoseReadingType(record.getGlucoseReadingType())
                .recordedAt(record.getRecordedAt())
                .bpClassification(bp != null ? bp.category() : null)
                .bpInterpretation(bp != null ? bp.interpretation() : null)
                .build();
    }
}
