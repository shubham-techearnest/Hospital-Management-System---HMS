package com.health360.iam.application.service;

import com.health360.config.Health360Properties;
import com.health360.iam.domain.OnboardingRequestStatus;
import com.health360.iam.domain.OnboardingRequestType;
import com.health360.iam.infrastructure.persistence.entity.OnboardingRequestEntity;
import com.health360.iam.infrastructure.persistence.repository.OnboardingRequestRepository;
import com.health360.iam.presentation.dto.request.CreateOnboardingRequestRequest;
import com.health360.iam.presentation.dto.request.UpdateOnboardingRequestStatusRequest;
import com.health360.iam.presentation.dto.response.OnboardingRequestResponse;
import com.health360.patient.application.util.PhoneNormalizer;
import com.health360.shared.application.AuditLogService;
import com.health360.shared.domain.ErrorCode;
import com.health360.shared.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OnboardingRequestService {

    private final OnboardingRequestRepository onboardingRequestRepository;
    private final Health360Properties properties;
    private final AuditLogService auditLogService;

    @Transactional
    public OnboardingRequestResponse submit(CreateOnboardingRequestRequest request) {
        UUID tenantId = properties.getDefaultTenantId();
        OnboardingRequestType type = request.getRequestType();

        if (type == OnboardingRequestType.HOSPITAL && !StringUtils.hasText(request.getOrganizationName())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Hospital name is required for hospital onboarding requests");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (onboardingRequestRepository.existsByTenantIdAndEmailIgnoreCaseAndRequestTypeAndStatus(
                tenantId, email, type.name(), OnboardingRequestStatus.PENDING.name())) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.CONFLICT,
                    "A pending request already exists for this email. Our team will contact you.");
        }

        OnboardingRequestEntity entity = new OnboardingRequestEntity();
        entity.setTenantId(tenantId);
        entity.setRequestType(type.name());
        entity.setStatus(OnboardingRequestStatus.PENDING.name());
        entity.setOrganizationName(trimToNull(request.getOrganizationName()));
        entity.setContactName(request.getContactName().trim());
        entity.setEmail(email);
        entity.setPhone(PhoneNormalizer.toStorageFormat(request.getPhone()));
        entity.setCity(trimToNull(request.getCity()));
        entity.setSpecialty(trimToNull(request.getSpecialty()));
        entity.setMessage(trimToNull(request.getMessage()));

        OnboardingRequestEntity saved = onboardingRequestRepository.saveAndFlush(entity);

        auditLogService.record(tenantId, null, "ONBOARDING_REQUEST_SUBMITTED", "OnboardingRequest", saved.getId(),
                Map.of("type", type.name(), "email", email));

        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<OnboardingRequestResponse> list(UUID tenantId, String status, String requestType, Pageable pageable) {
        String statusFilter = StringUtils.hasText(status) ? status.trim().toUpperCase() : null;
        String typeFilter = StringUtils.hasText(requestType) ? requestType.trim().toUpperCase() : null;
        Pageable sorted = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                pageable.getSort().isSorted() ? pageable.getSort() : Sort.by(Sort.Direction.DESC, "createdAt"));
        return onboardingRequestRepository.search(tenantId, statusFilter, typeFilter, sorted).map(this::toResponse);
    }

    @Transactional
    public OnboardingRequestResponse updateStatus(
            UUID tenantId, UUID adminUserId, UUID requestId, UpdateOnboardingRequestStatusRequest request) {
        OnboardingRequestEntity entity = onboardingRequestRepository.findById(requestId)
                .filter(r -> r.getTenantId().equals(tenantId))
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, HttpStatus.NOT_FOUND,
                        "Onboarding request not found"));

        if (request.getStatus() == OnboardingRequestStatus.PENDING) {
            throw new BusinessException(ErrorCode.VALIDATION_ERROR, HttpStatus.BAD_REQUEST,
                    "Cannot set status back to PENDING");
        }

        entity.setStatus(request.getStatus().name());
        entity.setAdminNotes(trimToNull(request.getAdminNotes()));
        entity.setReviewedBy(adminUserId);
        entity.setReviewedAt(Instant.now());
        entity.setUpdatedBy(adminUserId);
        entity.touch();

        OnboardingRequestEntity saved = onboardingRequestRepository.save(entity);

        auditLogService.record(tenantId, adminUserId, "ONBOARDING_REQUEST_UPDATED", "OnboardingRequest", saved.getId(),
                Map.of("status", saved.getStatus()));

        return toResponse(saved);
    }

    private OnboardingRequestResponse toResponse(OnboardingRequestEntity entity) {
        return OnboardingRequestResponse.builder()
                .id(entity.getId())
                .requestType(entity.getRequestType())
                .status(entity.getStatus())
                .organizationName(entity.getOrganizationName())
                .contactName(entity.getContactName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .city(entity.getCity())
                .specialty(entity.getSpecialty())
                .message(entity.getMessage())
                .adminNotes(entity.getAdminNotes())
                .createdAt(entity.getCreatedAt())
                .reviewedAt(entity.getReviewedAt())
                .build();
    }

    private static String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
