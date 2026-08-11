package com.health360.subscription.application.service;

import com.health360.doctor.infrastructure.persistence.repository.HospitalAssociationRepository;
import com.health360.hospital.infrastructure.persistence.repository.BranchRepository;
import com.health360.hospital.infrastructure.persistence.repository.DepartmentRepository;
import com.health360.scheduling.infrastructure.persistence.repository.AppointmentRepository;
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

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlanLimitService {

    private final HospitalSubscriptionService hospitalSubscriptionService;
    private final SubscriptionPlanLimitRepository planLimitRepository;
    private final HospitalAssociationRepository associationRepository;
    private final DepartmentRepository departmentRepository;
    private final BranchRepository branchRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional(readOnly = true)
    public LimitCheckResult checkDoctorLimit(UUID hospitalId, UUID tenantId) {
        return checkLimit(hospitalId, tenantId, PlanLimitKeys.MAX_DOCTORS,
                countActiveDoctors(hospitalId),
                "Your current plan supports up to %d doctor(s). Please upgrade your plan to add another doctor.");
    }

    @Transactional(readOnly = true)
    public void assertCanAddDoctor(UUID hospitalId, UUID tenantId) {
        assertAllowed(checkDoctorLimit(hospitalId, tenantId), ErrorCode.DOCTOR_LIMIT_REACHED);
    }

    @Transactional(readOnly = true)
    public LimitCheckResult checkBranchLimit(UUID hospitalId, UUID tenantId) {
        return checkLimit(hospitalId, tenantId, PlanLimitKeys.MAX_BRANCHES,
                countBranches(hospitalId),
                "Your current plan supports up to %d branch(es). Please upgrade your plan to add another branch.");
    }

    @Transactional(readOnly = true)
    public void assertCanAddBranch(UUID hospitalId, UUID tenantId) {
        assertAllowed(checkBranchLimit(hospitalId, tenantId), ErrorCode.BRANCH_LIMIT_REACHED);
    }

    @Transactional(readOnly = true)
    public LimitCheckResult checkDepartmentLimit(UUID hospitalId, UUID tenantId) {
        return checkLimit(hospitalId, tenantId, PlanLimitKeys.MAX_DEPARTMENTS,
                countDepartments(hospitalId),
                "Your current plan supports up to %d department(s). Please upgrade your plan to add another department.");
    }

    @Transactional(readOnly = true)
    public void assertCanAddDepartment(UUID hospitalId, UUID tenantId) {
        assertAllowed(checkDepartmentLimit(hospitalId, tenantId), ErrorCode.DEPARTMENT_LIMIT_REACHED);
    }

    @Transactional(readOnly = true)
    public LimitCheckResult checkAppointmentLimit(UUID hospitalId, UUID tenantId) {
        return checkLimit(hospitalId, tenantId, PlanLimitKeys.MAX_APPOINTMENTS_PER_MONTH,
                countAppointmentsThisMonth(hospitalId),
                "Your hospital has reached the monthly appointment limit of %d for your current plan. Please upgrade to continue booking.");
    }

    @Transactional(readOnly = true)
    public void assertCanBookAppointment(UUID hospitalId, UUID tenantId) {
        assertAllowed(checkAppointmentLimit(hospitalId, tenantId), ErrorCode.APPOINTMENT_LIMIT_REACHED);
    }

    @Transactional(readOnly = true)
    public void validatePlanDowngrade(UUID hospitalId, UUID tenantId, UUID newPlanId) {
        List<SubscriptionPlanLimitEntity> newLimits = planLimitRepository.findByPlanIdAndDeletedAtIsNull(newPlanId);
        List<String> violations = new ArrayList<>();

        for (SubscriptionPlanLimitEntity limit : newLimits) {
            long used = resolveUsage(hospitalId, limit.getLimitKey());
            if (used > limit.getLimitValue()) {
                violations.add(formatLimitKey(limit.getLimitKey()) + ": " + used + " in use, new limit " + limit.getLimitValue());
            }
        }

        if (!violations.isEmpty()) {
            throw new BusinessException(
                    ErrorCode.PLAN_DOWNGRADE_NOT_ALLOWED,
                    HttpStatus.CONFLICT,
                    "Cannot change to this plan because current usage exceeds its limits: " + String.join("; ", violations));
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

    @Transactional(readOnly = true)
    public long countDepartments(UUID hospitalId) {
        return departmentRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId).size();
    }

    @Transactional(readOnly = true)
    public long countBranches(UUID hospitalId) {
        return branchRepository.findByHospitalIdAndDeletedAtIsNullOrderByNameAsc(hospitalId).size();
    }

    @Transactional(readOnly = true)
    public long countAppointmentsThisMonth(UUID hospitalId) {
        YearMonth month = YearMonth.now(ZoneOffset.UTC);
        Instant from = month.atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = month.plusMonths(1).atDay(1).atStartOfDay().toInstant(ZoneOffset.UTC);
        return appointmentRepository.countByHospitalIdAndCreatedAtBetweenExcludingCancelled(hospitalId, from, to);
    }

    @Transactional(readOnly = true)
    public long resolveUsage(UUID hospitalId, String limitKey) {
        return switch (limitKey) {
            case PlanLimitKeys.MAX_DOCTORS -> countActiveDoctors(hospitalId);
            case PlanLimitKeys.MAX_DEPARTMENTS -> countDepartments(hospitalId);
            case PlanLimitKeys.MAX_BRANCHES -> countBranches(hospitalId);
            case PlanLimitKeys.MAX_APPOINTMENTS_PER_MONTH -> countAppointmentsThisMonth(hospitalId);
            default -> 0L;
        };
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

    private void assertAllowed(LimitCheckResult result, ErrorCode errorCode) {
        if (!result.isAllowed()) {
            throw new BusinessException(errorCode, HttpStatus.CONFLICT, result.getMessage());
        }
    }

    private long countActiveDoctors(UUID hospitalId) {
        return associationRepository.findByHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(hospitalId)
                .stream()
                .filter(a -> "ACTIVE".equals(a.getStatus()))
                .map(a -> a.getDoctorId())
                .distinct()
                .count();
    }

    private static String formatLimitKey(String limitKey) {
        return limitKey.toLowerCase().replace("max_", "").replace("_", " ");
    }
}
