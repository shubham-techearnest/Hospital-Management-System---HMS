package com.health360.doctor.application.service;

import com.health360.doctor.infrastructure.persistence.entity.DoctorProfileEntity;
import com.health360.doctor.infrastructure.persistence.repository.DoctorProfileRepository;
import com.health360.shared.application.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

/**
 * Creates doctor profile rows in an isolated write transaction so callers
 * (including read-only services) never hit "INSERT in a read-only transaction".
 */
@Service
@RequiredArgsConstructor
public class DoctorProfileProvisioningService {

    private final DoctorProfileRepository profileRepository;
    private final AuditLogService auditLogService;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public DoctorProfileEntity ensureProfileEntity(UUID userId, UUID tenantId) {
        return profileRepository.findByTenantIdAndUserIdAndDeletedAtIsNull(tenantId, userId)
                .orElseGet(() -> createDraftProfile(userId, tenantId));
    }

    private DoctorProfileEntity createDraftProfile(UUID userId, UUID tenantId) {
        DoctorProfileEntity profile = new DoctorProfileEntity();
        profile.setTenantId(tenantId);
        profile.setUserId(userId);
        profile.setTitle("DR");
        profile.setVerificationStatus("DRAFT");
        profile.setCreatedBy(userId);
        profile.setUpdatedBy(userId);
        profile = profileRepository.saveAndFlush(profile);

        auditLogService.record(tenantId, userId, "DOCTOR_PROFILE_CREATED",
                "DoctorProfile", profile.getId(), Map.of("status", "DRAFT"));

        return profile;
    }
}
