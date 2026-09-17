package com.health360.billing.application.service;

import com.health360.billing.infrastructure.persistence.entity.ChargeExceptionEntity;
import com.health360.billing.infrastructure.persistence.entity.ChargePostingEntity;
import com.health360.billing.infrastructure.persistence.repository.ChargeExceptionRepository;
import com.health360.billing.infrastructure.persistence.repository.ChargePostingRepository;
import com.health360.billing.presentation.dto.request.ResolveChargeExceptionRequest;
import com.health360.billing.presentation.dto.response.ChargeExceptionResponse;
import com.health360.billing.presentation.dto.response.ChargePostingResponse;
import com.health360.config.security.UserPrincipal;
import com.health360.hospital.application.service.HospitalScopeService;
import com.health360.shared.application.AuditLogService;
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
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChargeQueryService {

    private final ChargePostingRepository postingRepository;
    private final ChargeExceptionRepository exceptionRepository;
    private final HospitalScopeService hospitalScopeService;
    private final FeatureAccessService featureAccessService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<ChargePostingResponse> listPostings(
            UserPrincipal principal, UUID hospitalId, Pageable pageable) {
        assertCanRead(principal, hospitalId);
        return postingRepository
                .findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, pageable)
                .map(this::toPosting);
    }

    @Transactional(readOnly = true)
    public Page<ChargeExceptionResponse> listExceptions(
            UserPrincipal principal, UUID hospitalId, String status, Pageable pageable) {
        assertCanReadExceptions(principal, hospitalId);
        Page<ChargeExceptionEntity> page = status != null && !status.isBlank()
                ? exceptionRepository.findByTenantIdAndHospitalIdAndStatusAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, status.trim().toUpperCase(), pageable)
                : exceptionRepository.findByTenantIdAndHospitalIdAndDeletedAtIsNullOrderByCreatedAtDesc(
                        principal.getTenantId(), hospitalId, pageable);
        return page.map(this::toException);
    }

    @Transactional
    public ChargeExceptionResponse resolveException(
            UserPrincipal principal, UUID exceptionId, ResolveChargeExceptionRequest request) {
        if (!principal.hasPermission("billing:charge:exceptions")
                && !principal.hasPermission("billing:charge:write")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        ChargeExceptionEntity entity = exceptionRepository
                .findByIdAndTenantIdAndDeletedAtIsNull(exceptionId, principal.getTenantId())
                .orElseThrow(() -> new BusinessException(
                        ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND, "Charge exception not found"));
        hospitalScopeService.assertHospitalScope(principal, entity.getHospitalId(), null);
        featureAccessService.assertHasFeature(
                entity.getHospitalId(), principal.getTenantId(), PlanFeatureKeys.FEATURE_CHARGE_ENGINE,
                "Charge engine is not enabled for this hospital");

        if (!"OPEN".equals(entity.getStatus())) {
            throw new BusinessException(ErrorCode.INVALID_STATUS_TRANSITION, HttpStatus.CONFLICT,
                    "Charge exception is already " + entity.getStatus());
        }

        String decision = request.getDecision().trim().toUpperCase(Locale.ROOT);
        if (!"RESOLVED".equals(decision) && !"IGNORED".equals(decision)) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "decision must be RESOLVED or IGNORED");
        }

        Instant now = Instant.now();
        entity.setStatus(decision);
        entity.setResolvedAt(now);
        entity.setResolvedBy(principal.getUserId());
        if (request.getNote() != null && !request.getNote().isBlank()) {
            String note = request.getNote().trim();
            String msg = entity.getMessage() == null ? "" : entity.getMessage();
            String appended = msg + (msg.isBlank() ? "" : " | ") + "Note: " + note;
            entity.setMessage(appended.length() > 1000 ? appended.substring(0, 1000) : appended);
        }
        entity.setUpdatedBy(principal.getUserId());
        ChargeExceptionEntity saved = exceptionRepository.save(entity);

        auditLogService.record(
                principal.getTenantId(),
                principal.getUserId(),
                "CHARGE_EXCEPTION_" + decision,
                "ChargeException",
                saved.getId(),
                Map.of(
                        "reasonCode", saved.getReasonCode(),
                        "sourceEventType", saved.getSourceEventType(),
                        "hospitalId", saved.getHospitalId().toString()));

        return toException(saved);
    }

    private void assertCanRead(UserPrincipal principal, UUID hospitalId) {
        if (!principal.hasPermission("billing:charge:read")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        hospitalScopeService.assertHospitalScope(principal, hospitalId, null);
        featureAccessService.assertHasFeature(
                hospitalId, principal.getTenantId(), PlanFeatureKeys.FEATURE_CHARGE_ENGINE,
                "Charge engine is not enabled for this hospital");
    }

    private void assertCanReadExceptions(UserPrincipal principal, UUID hospitalId) {
        if (!principal.hasPermission("billing:charge:exceptions")
                && !principal.hasPermission("billing:charge:read")) {
            throw new BusinessException(ErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN, "Access denied");
        }
        hospitalScopeService.assertHospitalScope(principal, hospitalId, null);
        featureAccessService.assertHasFeature(
                hospitalId, principal.getTenantId(), PlanFeatureKeys.FEATURE_CHARGE_ENGINE,
                "Charge engine is not enabled for this hospital");
    }

    private ChargePostingResponse toPosting(ChargePostingEntity e) {
        return ChargePostingResponse.builder()
                .id(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .patientId(e.getPatientId())
                .encounterId(e.getEncounterId())
                .catalogCode(e.getCatalogCode())
                .description(e.getDescription())
                .quantity(e.getQuantity())
                .unitPrice(e.getUnitPrice())
                .lineTotal(e.getLineTotal())
                .currency(e.getCurrency())
                .status(e.getStatus())
                .mode(e.getMode())
                .sourceEventType(e.getSourceEventType())
                .sourceEventId(e.getSourceEventId())
                .createdAt(e.getCreatedAt())
                .build();
    }

    private ChargeExceptionResponse toException(ChargeExceptionEntity e) {
        return ChargeExceptionResponse.builder()
                .id(e.getId())
                .hospitalId(e.getHospitalId())
                .branchId(e.getBranchId())
                .patientId(e.getPatientId())
                .encounterId(e.getEncounterId())
                .sourceEventType(e.getSourceEventType())
                .sourceEventId(e.getSourceEventId())
                .reasonCode(e.getReasonCode())
                .message(e.getMessage())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .resolvedAt(e.getResolvedAt())
                .resolvedBy(e.getResolvedBy())
                .build();
    }
}
