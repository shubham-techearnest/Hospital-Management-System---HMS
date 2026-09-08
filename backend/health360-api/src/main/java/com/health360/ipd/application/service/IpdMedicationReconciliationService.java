package com.health360.ipd.application.service;

import com.health360.config.security.UserPrincipal;
import com.health360.ipd.infrastructure.persistence.entity.IpdAdmissionEntity;
import com.health360.ipd.infrastructure.persistence.entity.IpdMedicationReconciliationEntity;
import com.health360.ipd.infrastructure.persistence.repository.IpdAdmissionRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdMedicationReconciliationRepository;
import com.health360.ipd.presentation.dto.request.CreateMedicationReconciliationRequest;
import com.health360.ipd.presentation.dto.response.MedicationReconciliationResponse;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class IpdMedicationReconciliationService {

    private static final Set<String> TYPES = Set.of("ADMIT", "DISCHARGE");
    private static final Set<String> ACTIONS = Set.of("CONTINUE", "STOP", "CHANGE", "START", "UNKNOWN");

    private final IpdMedicationReconciliationRepository repository;
    private final IpdAdmissionRepository admissionRepository;
    private final IpdAccessService accessService;
    private final AuditLogService auditLogService;

    @Transactional
    public MedicationReconciliationResponse create(
            UserPrincipal principal, UUID admissionId, CreateMedicationReconciliationRequest request) {
        accessService.assertCanManageAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());

        String reconType = request.getReconType().trim().toUpperCase(Locale.ROOT);
        if (!TYPES.contains(reconType)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "reconType must be ADMIT or DISCHARGE");
        }

        List<Map<String, Object>> decisions = request.getDecisions().stream()
                .map(this::normalizeDecision)
                .toList();

        IpdMedicationReconciliationEntity entity = new IpdMedicationReconciliationEntity();
        entity.setTenantId(principal.getTenantId());
        entity.setHospitalId(admission.getHospitalId());
        entity.setAdmissionId(admission.getId());
        entity.setEncounterId(admission.getEncounterId());
        entity.setPatientId(admission.getPatientId());
        entity.setReconType(reconType);
        entity.setStatus("COMPLETED");
        entity.setSummaryText(trimToNull(request.getSummaryText()));
        entity.setDecisionsJson(decisions);
        entity.setCompletedAt(Instant.now());
        entity.setCompletedBy(principal.getUserId());
        entity.setCreatedBy(principal.getUserId());
        entity.setUpdatedBy(principal.getUserId());

        IpdMedicationReconciliationEntity saved = repository.save(entity);
        auditLogService.record(principal.getTenantId(), principal.getUserId(), "IPD_MED_RECON_COMPLETED",
                "IpdMedicationReconciliation", saved.getId(),
                Map.of("admissionId", admissionId.toString(), "reconType", reconType));
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<MedicationReconciliationResponse> list(UserPrincipal principal, UUID admissionId) {
        accessService.assertCanReadAdmissions(principal);
        IpdAdmissionEntity admission = requireAdmission(principal.getTenantId(), admissionId);
        accessService.assertIpdModuleEnabled(principal, admission.getHospitalId());
        return repository
                .findByTenantIdAndAdmissionIdAndDeletedAtIsNullOrderByCompletedAtDesc(
                        principal.getTenantId(), admissionId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private IpdAdmissionEntity requireAdmission(UUID tenantId, UUID admissionId) {
        return admissionRepository.findByIdAndTenantIdAndDeletedAtIsNull(admissionId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Admission not found"));
    }

    private Map<String, Object> normalizeDecision(Map<String, Object> raw) {
        if (raw == null || raw.get("medicationName") == null) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Each decision requires medicationName");
        }
        String action = String.valueOf(raw.getOrDefault("action", "UNKNOWN")).trim().toUpperCase(Locale.ROOT);
        if (!ACTIONS.contains(action)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Invalid recon action: " + action);
        }
        return Map.of(
                "medicationName", String.valueOf(raw.get("medicationName")).trim(),
                "action", action,
                "notes", raw.get("notes") != null ? String.valueOf(raw.get("notes")).trim() : "",
                "dose", raw.get("dose") != null ? String.valueOf(raw.get("dose")).trim() : "",
                "frequency", raw.get("frequency") != null ? String.valueOf(raw.get("frequency")).trim() : ""
        );
    }

    private MedicationReconciliationResponse toResponse(IpdMedicationReconciliationEntity entity) {
        return MedicationReconciliationResponse.builder()
                .reconciliationId(entity.getId())
                .admissionId(entity.getAdmissionId())
                .encounterId(entity.getEncounterId())
                .reconType(entity.getReconType())
                .status(entity.getStatus())
                .summaryText(entity.getSummaryText())
                .decisions(entity.getDecisionsJson())
                .completedAt(entity.getCompletedAt())
                .completedBy(entity.getCompletedBy())
                .build();
    }

    private static String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
