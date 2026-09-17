package com.health360.commandcenter.application.service;

import com.health360.automation.infrastructure.persistence.repository.ApprovalRequestRepository;
import com.health360.blood.infrastructure.persistence.repository.BloodRequestRepository;
import com.health360.commandcenter.presentation.dto.response.CommandCenterSnapshotResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.emergency.infrastructure.persistence.repository.EdVisitRepository;
import com.health360.facility.infrastructure.persistence.repository.FacilityWorkOrderRepository;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.inventory.infrastructure.persistence.repository.InventoryStockBalanceRepository;
import com.health360.ipd.infrastructure.persistence.repository.IpdBedRepository;
import com.health360.predictive.application.service.PredictiveInsightService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.staffops.infrastructure.persistence.repository.StaffLeaveRequestRepository;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import com.health360.tasks.infrastructure.persistence.repository.WorkItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CommandCenterService {

    private static final Set<String> OPEN_TASK_STATUSES = Set.of("PENDING", "ASSIGNED", "IN_PROGRESS", "BLOCKED");
    private static final Set<String> ED_ACTIVE = Set.of("ARRIVED", "TRIAGED", "IN_TREATMENT");
    private static final Set<String> FACILITY_OPEN = Set.of("OPEN", "IN_PROGRESS");
    private static final Set<String> BLOOD_OPEN = Set.of("REQUESTED", "APPROVED", "ISSUED");

    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;
    private final IpdBedRepository bedRepository;
    private final EdVisitRepository edVisitRepository;
    private final WorkItemRepository workItemRepository;
    private final ApprovalRequestRepository approvalRequestRepository;
    private final FacilityWorkOrderRepository facilityWorkOrderRepository;
    private final BloodRequestRepository bloodRequestRepository;
    private final StaffLeaveRequestRepository leaveRequestRepository;
    private final InventoryStockBalanceRepository stockBalanceRepository;
    private final PredictiveInsightService predictiveInsightService;

    @Transactional(readOnly = true)
    public CommandCenterSnapshotResponse snapshot(UserPrincipal principal, UUID hospitalId, UUID branchId) {
        if (!principal.hasPermission("commandcenter:read") && !principal.hasPermission("tasks:read")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        hospitalScopeService.assertHospitalScope(principal, hospitalId, branchId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_COMMAND_CENTER,
                "Command Center is not included in this hospital's subscription plan");

        UUID tenantId = principal.getTenantId();
        Instant now = Instant.now();

        long lowStock = stockBalanceRepository
                .findBoard(tenantId, hospitalId, branchId, null, true, PageRequest.of(0, 1))
                .getTotalElements();

        long activeInsights = 0;
        long criticalInsights = 0;
        if (featureAccessService.hasFeature(hospitalId, tenantId, PlanFeatureKeys.FEATURE_PREDICTIVE_OPS)) {
            activeInsights = predictiveInsightService.countActive(tenantId, hospitalId, branchId);
            criticalInsights = predictiveInsightService.countCritical(tenantId, hospitalId, branchId);
        }

        return CommandCenterSnapshotResponse.builder()
                .bedsAvailable(bedRepository.countByHospitalBranch(tenantId, hospitalId, branchId, "AVAILABLE"))
                .bedsOccupied(bedRepository.countByHospitalBranch(tenantId, hospitalId, branchId, "OCCUPIED"))
                .bedsCleaning(bedRepository.countByHospitalBranch(tenantId, hospitalId, branchId, "CLEANING"))
                .edActiveVisits(edVisitRepository.countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
                        tenantId, hospitalId, branchId, ED_ACTIVE))
                .openTasks(workItemRepository.countByTenantIdAndHospitalIdAndStatusInAndDeletedAtIsNull(
                        tenantId, hospitalId, OPEN_TASK_STATUSES))
                .overdueTasks(workItemRepository.countOverdueOpen(
                        tenantId, hospitalId, OPEN_TASK_STATUSES, now))
                .pendingApprovals(approvalRequestRepository.countByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNull(
                        tenantId, hospitalId, "PENDING"))
                .openFacilityWorkOrders(facilityWorkOrderRepository
                        .countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
                                tenantId, hospitalId, branchId, FACILITY_OPEN))
                .openBloodRequests(bloodRequestRepository
                        .countByTenantIdAndHospitalIdAndBranchIdAndStatusInAndDeletedAtIsNull(
                                tenantId, hospitalId, branchId, BLOOD_OPEN))
                .pendingLeaveRequests(leaveRequestRepository
                        .countByTenantIdAndHospitalIdAndBranchIdAndStatusAndDeletedAtIsNull(
                                tenantId, hospitalId, branchId, "REQUESTED"))
                .lowStockItems(lowStock)
                .activePredictiveInsights(activeInsights)
                .criticalPredictiveInsights(criticalInsights)
                .build();
    }
}
