package com.health360.clinical.application.service;

import com.health360.clinical.infrastructure.persistence.entity.ClinicalFollowupEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterEntity;
import com.health360.clinical.infrastructure.persistence.entity.EncounterWellnessPlanEntity;
import com.health360.clinical.infrastructure.persistence.repository.ClinicalFollowupRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterRepository;
import com.health360.clinical.infrastructure.persistence.repository.EncounterWellnessPlanRepository;
import com.health360.clinical.presentation.dto.request.UpsertWellnessPlanRequest;
import com.health360.clinical.presentation.dto.response.WellnessPlanResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WellnessPlanService {

    private final EncounterWellnessPlanRepository wellnessPlanRepository;
    private final ClinicalFollowupRepository followupRepository;
    private final EncounterRepository encounterRepository;
    private final EncounterAccessService accessService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public WellnessPlanResponse getWellnessPlan(UserPrincipal principal, UUID encounterId) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanReadEncounter(principal, encounter);
        return wellnessPlanRepository.findByEncounterIdAndDeletedAtIsNull(encounterId)
                .map(plan -> toResponse(plan, followupRepository
                        .findFirstByEncounterIdAndDeletedAtIsNullOrderByCreatedAtDesc(encounterId)
                        .orElse(null)))
                .orElse(emptyResponse(encounterId, encounter.getPatientId()));
    }

    @Transactional
    public WellnessPlanResponse upsertWellnessPlan(
            UserPrincipal principal, UUID encounterId, UpsertWellnessPlanRequest request) {
        EncounterEntity encounter = requireEncounter(principal.getTenantId(), encounterId);
        accessService.assertCanWriteEncounter(principal, encounter);

        EncounterWellnessPlanEntity plan = wellnessPlanRepository
                .findByEncounterIdAndDeletedAtIsNull(encounterId)
                .orElseGet(() -> {
                    EncounterWellnessPlanEntity created = new EncounterWellnessPlanEntity();
                    created.setTenantId(principal.getTenantId());
                    created.setEncounterId(encounterId);
                    created.setPatientId(encounter.getPatientId());
                    created.setHospitalId(encounter.getHospitalId());
                    created.setBranchId(encounter.getBranchId());
                    created.setCreatedBy(principal.getUserId());
                    return created;
                });

        plan.setDiet(trimToNull(request.getDiet()));
        plan.setRestGuidance(trimToNull(request.getRestGuidance()));
        plan.setExercise(trimToNull(request.getExercise()));
        plan.setLifestyle(trimToNull(request.getLifestyle()));
        plan.setNotes(trimToNull(request.getNotes()));
        plan.setFollowUpDate(request.getFollowUpDate());
        plan.setUpdatedBy(principal.getUserId());

        EncounterWellnessPlanEntity saved = wellnessPlanRepository.save(plan);

        ClinicalFollowupEntity followup = syncFollowup(principal, encounter, request);

        auditLogService.record(principal.getTenantId(), principal.getUserId(),
                "WELLNESS_PLAN_UPSERTED", "EncounterWellnessPlan", saved.getId(),
                Map.of("encounterId", encounterId.toString()));

        return toResponse(saved, followup);
    }

    private ClinicalFollowupEntity syncFollowup(
            UserPrincipal principal, EncounterEntity encounter, UpsertWellnessPlanRequest request) {
        ClinicalFollowupEntity existing = followupRepository
                .findFirstByEncounterIdAndDeletedAtIsNullOrderByCreatedAtDesc(encounter.getId())
                .orElse(null);

        if (request.getFollowUpDate() == null) {
            if (existing != null && !"CANCELLED".equals(existing.getStatus())) {
                existing.setStatus("CANCELLED");
                existing.setUpdatedBy(principal.getUserId());
                return followupRepository.save(existing);
            }
            return existing;
        }

        ClinicalFollowupEntity followup = existing != null ? existing : new ClinicalFollowupEntity();
        if (existing == null) {
            followup.setTenantId(principal.getTenantId());
            followup.setEncounterId(encounter.getId());
            followup.setPatientId(encounter.getPatientId());
            followup.setDoctorId(encounter.getPrimaryDoctorId());
            followup.setDepartmentId(encounter.getDepartmentId());
            followup.setAppointmentId(encounter.getAppointmentId());
            followup.setCreatedBy(principal.getUserId());
        }
        followup.setFollowUpDate(request.getFollowUpDate());
        followup.setReason(trimToNull(request.getFollowUpReason()));
        followup.setStatus("PENDING");
        followup.setUpdatedBy(principal.getUserId());
        return followupRepository.save(followup);
    }

    private EncounterEntity requireEncounter(UUID tenantId, UUID encounterId) {
        return encounterRepository.findByIdAndTenantIdAndDeletedAtIsNull(encounterId, tenantId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Encounter not found"));
    }

    private WellnessPlanResponse emptyResponse(UUID encounterId, UUID patientId) {
        return WellnessPlanResponse.builder()
                .encounterId(encounterId)
                .patientId(patientId)
                .build();
    }

    private WellnessPlanResponse toResponse(EncounterWellnessPlanEntity plan, ClinicalFollowupEntity followup) {
        return WellnessPlanResponse.builder()
                .wellnessPlanId(plan.getId())
                .encounterId(plan.getEncounterId())
                .patientId(plan.getPatientId())
                .diet(plan.getDiet())
                .restGuidance(plan.getRestGuidance())
                .exercise(plan.getExercise())
                .lifestyle(plan.getLifestyle())
                .notes(plan.getNotes())
                .followUpDate(plan.getFollowUpDate() != null
                        ? plan.getFollowUpDate()
                        : (followup != null ? followup.getFollowUpDate() : null))
                .followUpReason(followup != null ? followup.getReason() : null)
                .followUpStatus(followup != null ? followup.getStatus() : null)
                .followUpId(followup != null ? followup.getId() : null)
                .updatedAt(plan.getUpdatedAt())
                .build();
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
