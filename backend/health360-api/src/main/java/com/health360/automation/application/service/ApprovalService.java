package com.health360.automation.application.service;

import com.health360.automation.infrastructure.persistence.entity.ApprovalRequestEntity;
import com.health360.automation.infrastructure.persistence.repository.ApprovalRequestRepository;
import com.health360.automation.presentation.dto.request.DecideApprovalRequest;
import com.health360.automation.presentation.dto.response.ApprovalRequestResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import com.health360.subscription.application.service.FeatureAccessService;
import com.health360.subscription.domain.PlanFeatureKeys;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApprovalService {

    private final ApprovalRequestRepository approvalRequestRepository;
    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;

    @Transactional
    public ApprovalRequestEntity create(
            UUID tenantId,
            UUID hospitalId,
            String approvalType,
            String entityType,
            UUID entityId,
            UUID requestedBy,
            Map<String, Object> payload) {
        ApprovalRequestEntity entity = new ApprovalRequestEntity();
        entity.setTenantId(tenantId);
        entity.setHospitalId(hospitalId);
        entity.setApprovalType(approvalType);
        entity.setStatus("PENDING");
        entity.setEntityType(entityType);
        entity.setEntityId(entityId);
        entity.setRequestedBy(requestedBy);
        entity.setPayload(payload != null ? new HashMap<>(payload) : new HashMap<>());
        entity.setCreatedBy(requestedBy);
        entity.setUpdatedBy(requestedBy);
        return approvalRequestRepository.save(entity);
    }

    /**
     * Sync pending automation approvals when the domain already decided (e.g. IPD admit-request approve/reject).
     */
    @Transactional
    public int syncPendingDecision(
            UUID tenantId,
            String entityType,
            UUID entityId,
            String decision,
            UUID decidedBy,
            String note) {
        String normalized = decision == null ? "" : decision.trim().toUpperCase();
        if (!"APPROVED".equals(normalized) && !"REJECTED".equals(normalized) && !"CANCELLED".equals(normalized)) {
            return 0;
        }
        List<ApprovalRequestEntity> pending = approvalRequestRepository
                .findByTenantIdAndEntityTypeAndEntityIdAndStatusAndDeletedAtIsNull(
                        tenantId, entityType, entityId, "PENDING");
        Instant now = Instant.now();
        for (ApprovalRequestEntity entity : pending) {
            entity.setStatus("CANCELLED".equals(normalized) ? "CANCELLED" : normalized);
            entity.setDecidedBy(decidedBy);
            entity.setDecidedAt(now);
            entity.setDecisionNote(note);
            entity.setUpdatedBy(decidedBy);
            approvalRequestRepository.save(entity);
        }
        return pending.size();
    }

    @Transactional(readOnly = true)
    public Page<ApprovalRequestResponse> list(
            UserPrincipal principal, UUID hospitalId, String status, Pageable pageable) {
        assertCanRead(principal);
        assertScopeAndFeature(principal, hospitalId);
        String statusFilter = status != null && !status.isBlank() ? status.trim().toUpperCase() : null;
        Page<ApprovalRequestEntity> page = statusFilter == null
                ? approvalRequestRepository.findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, pageable)
                : approvalRequestRepository.findByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, statusFilter, pageable);
        return page.map(this::toResponse);
    }

    @Transactional
    public ApprovalRequestResponse decide(
            UserPrincipal principal, UUID approvalId, DecideApprovalRequest request) {
        assertCanWrite(principal);
        ApprovalRequestEntity entity = approvalRequestRepository.findById(approvalId)
                .filter(a -> a.getTenantId().equals(principal.getTenantId()) && a.getDeletedAt() == null)
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Approval request not found"));
        assertScopeAndFeature(principal, entity.getHospitalId());

        if (!"PENDING".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "Approval already decided");
        }

        String decision = request.getDecision().trim().toUpperCase();
        if (!"APPROVED".equals(decision) && !"REJECTED".equals(decision)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Decision must be APPROVED or REJECTED");
        }

        entity.setStatus(decision);
        entity.setDecidedBy(principal.getUserId());
        entity.setDecidedAt(Instant.now());
        entity.setDecisionNote(request.getNote());
        entity.setUpdatedBy(principal.getUserId());
        return toResponse(approvalRequestRepository.save(entity));
    }

    private void assertCanRead(UserPrincipal principal) {
        if (!principal.hasPermission("approvals:read")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void assertCanWrite(UserPrincipal principal) {
        if (!principal.hasPermission("approvals:write")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
    }

    private void assertScopeAndFeature(UserPrincipal principal, UUID hospitalId) {
        hospitalScopeService.assertHospitalScope(principal, hospitalId);
        featureAccessService.assertHasFeature(
                hospitalId,
                principal.getTenantId(),
                PlanFeatureKeys.FEATURE_AUTOMATION_PLATFORM,
                "Automation platform is not included in this hospital's subscription plan");
    }

    private ApprovalRequestResponse toResponse(ApprovalRequestEntity e) {
        ApprovalRequestResponse r = new ApprovalRequestResponse();
        r.setId(e.getId());
        r.setHospitalId(e.getHospitalId());
        r.setApprovalType(e.getApprovalType());
        r.setStatus(e.getStatus());
        r.setEntityType(e.getEntityType());
        r.setEntityId(e.getEntityId());
        r.setRequestedBy(e.getRequestedBy());
        r.setDecidedBy(e.getDecidedBy());
        r.setDecidedAt(e.getDecidedAt());
        r.setDecisionNote(e.getDecisionNote());
        r.setCreatedAt(e.getCreatedAt());
        return r;
    }
}
