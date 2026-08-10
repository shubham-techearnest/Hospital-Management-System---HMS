package com.health360.subscription.application.service;

import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.dto.LimitCheckResult;
import com.health360.subscription.domain.PlanLimitKeys;
import com.health360.subscription.infrastructure.persistence.entity.HospitalSubscriptionEntity;
import com.health360.subscription.infrastructure.persistence.entity.SubscriptionPlanLimitEntity;
import com.health360.subscription.infrastructure.persistence.repository.SubscriptionPlanLimitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlanLimitService {

    private static final Set<String> ACTIVE_SUBSCRIPTION_STATUSES = Set.of("ACTIVE", "TRIAL");

    private final HospitalSubscriptionService hospitalSubscriptionService;
    private final SubscriptionPlanLimitRepository planLimitRepository;
    private final HospitalAssociationRepository associationRepository;
    private final DepartmentRepository departmentRepository;
    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    public LimitCheckResult checkDoctorLimit(UUID hospitalId, UUID tenantId) {
        return checkLimit(hospitalId, tenantId, PlanLimitKeys.MAX_DOCTORS,
                countActiveDoctors(hospitalId),
                "Your current plan supports up to %d doctor(s). Please upgrade your plan to add another doctor.");
    }

    @Transactional(readOnly = true)
    public void assertCanAddDoctor(UUID hospitalId, UUID tenantId) {
        LimitCheckResult result = checkDoctorLimit(hospitalId, tenantId);
        if (!result.isAllowed()) {
            throw new BusinessException(ErrorCode.DOCTOR_LIMIT_REACHED, HttpStatus.CONFLICT, result.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public long getDoctorUsage(UUID hospitalId) {
        return countActiveDoctors(hospitalId);
    }

    @Transactional(readOnly = true)
    public LimitCheckResult getDoctorUsageWithLimit(UUID hospitalId, UUID tenantId) {
        return checkDoctorLimit(hospitalId, tenantId);
    }

    private LimitCheckResult checkLimit(
            UUID hospitalId,
            UUID tenantId,
            String limitKey,
            long used,
            String deniedMessageTemplate) {
        HospitalSubscriptionEntity subscription = hospitalSubscriptionService
                .requireActiveSubscription(hospitalId, tenantId);
        SubscriptionPlanLimitEntity limit = planLimitRepository
                .findByPlanIdAndLimitKeyAndDeletedAtIsNull(subscription.getPlanId(), limitKey)
                .orElse(null);

        if (limit == null) {
            return LimitCheckResult.allowed(limitKey, used, Long.MAX_VALUE);
        }

        long max = limit.getLimitValue();
        if (used >= max) {
            return LimitCheckResult.denied(limitKey, used, max, deniedMessageTemplate.formatted(max));
        }
        return LimitCheckResult.allowed(limitKey, used, max);
    }

    private long countActiveDoctors(UUID hospitalId) {
        return associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospitalId)
                .stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .map(a -> a.getDoctorId())
                .distinct()
                .count();
    }

    @Transactional(readOnly = true)
    public long countDepartments(UUID hospitalId) {
        return departmentRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId).size();
    }

    @Transactional(readOnly = true)
    public long countBranches(UUID hospitalId) {
        return branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId).size();
    }
}
