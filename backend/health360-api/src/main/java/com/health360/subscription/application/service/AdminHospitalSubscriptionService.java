package com.health360.subscription.application.service;

import com.health360.hospital.application.service.AdminHospitalService;
import com.health360.shared.application.AuditLogService;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionHistoryEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanEntity;
import com.health360.subscription.infrastructure.persistence.repository.HospitalSubscriptionHistoryRepository;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanRepository;
import com.health360.subscription.presentation.dto.request.ChangeHospitalPlanRequest;
import com.health360.subscription.presentation.dto.response.HospitalSubscriptionResponse;
import com.health360.subscription.presentation.dto.response.SubscriptionHistoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminHospitalSubscriptionService {

    private final AdminHospitalService adminHospitalService;
    private final HospitalSubscriptionService hospitalSubscriptionService;
    private final HospitalSubscriptionQueryService hospitalSubscriptionQueryService;
    private final HospitalSubscriptionHistoryRepository historyRepository;
    private final SubscriptionPlanRepository planRepository;
    private final AuditLogService auditLogService;
    private final PlanLimitService planLimitService;

    @Transactional(readOnly = true)
    public HospitalSubscriptionResponse getSubscription(UUID tenantId, UUID hospitalId) {
        adminHospitalService.requireHospital(tenantId, hospitalId);
        return hospitalSubscriptionQueryService.getHospitalSubscriptionSummary(hospitalId, tenantId);
    }

    @Transactional
    public HospitalSubscriptionResponse changePlan(
            UUID tenantId, UUID actorId, UUID hospitalId, ChangeHospitalPlanRequest request) {
        adminHospitalService.requireHospital(tenantId, hospitalId);
        String notes = request.getNotes() != null ? request.getNotes().trim() : "Changed by platform admin";
        SubscriptionPlanEntity newPlan = hospitalSubscriptionService.requirePlanByCode(
                request.getPlanCode().trim(), tenantId);
        planLimitService.validatePlanDowngrade(hospitalId, tenantId, newPlan.getId());
        hospitalSubscriptionService.changePlan(hospitalId, tenantId, request.getPlanCode().trim(), actorId, notes);
        auditLogService.record(tenantId, actorId, "ADMIN_HOSPITAL_PLAN_CHANGED", "Hospital", hospitalId,
                Map.of("planCode", request.getPlanCode()));
        return hospitalSubscriptionQueryService.getHospitalSubscriptionSummary(hospitalId, tenantId);
    }

    @Transactional(readOnly = true)
    public List<SubscriptionHistoryResponse> getHistory(UUID tenantId, UUID hospitalId) {
        adminHospitalService.requireHospital(tenantId, hospitalId);
        return historyRepository.findByHospitalIdAndTenantIdOrderByEffectiveAtDesc(hospitalId, tenantId).stream()
                .map(this::toHistoryResponse)
                .toList();
    }

    private SubscriptionHistoryResponse toHistoryResponse(HospitalSubscriptionHistoryEntity history) {
        SubscriptionPlanEntity plan = planRepository.findById(history.getPlanId()).orElse(null);
        SubscriptionPlanEntity previousPlan = history.getPreviousPlanId() != null
                ? planRepository.findById(history.getPreviousPlanId()).orElse(null)
                : null;

        return SubscriptionHistoryResponse.builder()
                .id(history.getId())
                .subscriptionId(history.getSubscriptionId())
                .planCode(plan != null ? plan.getCode() : null)
                .planName(plan != null ? plan.getName() : null)
                .previousPlanCode(previousPlan != null ? previousPlan.getCode() : null)
                .previousPlanName(previousPlan != null ? previousPlan.getName() : null)
                .eventType(history.getEventType())
                .status(history.getStatus())
                .notes(history.getNotes())
                .effectiveAt(history.getEffectiveAt())
                .createdBy(history.getCreatedBy())
                .build();
    }
}
